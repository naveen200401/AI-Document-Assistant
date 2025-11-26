import React, { useEffect, useState } from "react";

/**
 * RefinementEditor.jsx
 * Props:
 *   - documentId (number)
 *
 * Usage:
 *   <RefinementEditor documentId={1} />
 *
 * Tailwind classes are used; adjust to your styling system.
 */

export default function RefinementEditor({ documentId }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [localEdits, setLocalEdits] = useState({});

  useEffect(() => {
    if (!documentId) return;
    fetch(`/api/document/${documentId}`)
      .then((r) => r.json())
      .then(setDoc)
      .catch((e) => {
        console.error(e);
        setDoc({ title: "Error loading document", sections: [] });
      });
  }, [documentId]);

  function applyLocalEdit(sectionId, text) {
    setLocalEdits((p) => ({ ...p, [sectionId]: text }));
  }

  async function sendRefinement(sectionId, prompt) {
    if (!prompt) return alert("Enter a refinement prompt.");
    setLoading(true);
    try {
      const payload = { prompt, current_text: localEdits[sectionId] ?? getSectionById(sectionId).text };
      const res = await fetch(`/api/sections/${sectionId}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (res.ok) {
        // update section text and refinements
        setDoc((d) => ({
          ...d,
          sections: d.sections.map((s) => (s.id === sectionId ? { ...s, text: body.revised_text, refinements: body.refinements } : s)),
        }));
        setLocalEdits((p) => {
          const np = { ...p };
          delete np[sectionId];
          return np;
        });
      } else {
        alert(body.error || "Refinement failed");
      }
    } catch (e) {
      console.error(e);
      alert("Refinement request failed.");
    } finally {
      setLoading(false);
    }
  }

  function getSectionById(sectionId) {
    return doc.sections.find((s) => s.id === sectionId);
  }

  async function sendFeedback(sectionId, liked) {
    try {
      await fetch(`/api/sections/${sectionId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked }),
      });
      setDoc((d) => ({ ...d, sections: d.sections.map((s) => (s.id === sectionId ? { ...s, lastFeedback: liked } : s)) }));
    } catch (e) {
      console.error(e);
    }
  }

  async function sendComment(sectionId, commentText) {
    if (!commentText) return alert("Enter a comment");
    try {
      const res = await fetch(`/api/sections/${sectionId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText }),
      });
      const body = await res.json();
      if (res.ok) {
        setDoc((d) => ({
          ...d,
          sections: d.sections.map((s) => (s.id === sectionId ? { ...s, comments: [...(s.comments || []), body.comment] } : s)),
        }));
      } else {
        alert(body.error || "Comment failed");
      }
    } catch (e) {
      console.error(e);
      alert("Comment failed");
    }
  }

  if (!doc) return <div className="p-6">Loading document...</div>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Interactive Refinement — {doc.title}</h2>

      <div className="space-y-4">
        {doc.sections.map((section) => (
          <div key={section.id} className="border rounded-2xl p-4 shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{section.heading || `Section ${section.id}`}</h3>
                <div className="text-sm text-gray-500">Type: {section.type || "text"}</div>
              </div>
              <div className="flex gap-2 items-center">
                <button
                  className={`px-3 py-1 rounded ${section.lastFeedback === true ? "bg-green-100" : "bg-gray-100"}`}
                  onClick={() => sendFeedback(section.id, true)}
                >
                  👍
                </button>
                <button
                  className={`px-3 py-1 rounded ${section.lastFeedback === false ? "bg-red-100" : "bg-gray-100"}`}
                  onClick={() => sendFeedback(section.id, false)}
                >
                  👎
                </button>
              </div>
            </div>

            <div className="mt-3">
              <textarea
                value={localEdits[section.id] ?? section.text}
                onChange={(e) => applyLocalEdit(section.id, e.target.value)}
                rows={6}
                className="w-full p-3 border rounded-md resize-y"
              />
            </div>

            <div className="mt-3 flex gap-2">
              <input placeholder="Refinement prompt (e.g. 'Shorten to 50 words')" id={`prompt-${section.id}`} className="flex-1 p-2 border rounded-md" />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md"
                onClick={() => {
                  const p = document.getElementById(`prompt-${section.id}`).value.trim();
                  sendRefinement(section.id, p);
                }}
                disabled={loading}
              >
                Refine
              </button>
            </div>

            <div className="mt-3 flex gap-2 items-start">
              <textarea id={`comment-${section.id}`} placeholder="Add a comment (stored in DB)" className="flex-1 p-2 border rounded-md" rows={2} />
              <button
                className="px-4 py-2 bg-gray-800 text-white rounded-md"
                onClick={() => {
                  const c = document.getElementById(`comment-${section.id}`).value.trim();
                  sendComment(section.id, c);
                  document.getElementById(`comment-${section.id}`).value = "";
                }}
              >
                Comment
              </button>
            </div>

            <div className="mt-3 text-sm text-gray-700">
              <strong>History & Comments:</strong>
              <div className="mt-2 space-y-2">
                {(section.refinements || []).map((r) => (
                  <div key={r.id} className="p-2 border rounded bg-gray-50">
                    <div className="text-xs text-gray-500">Prompt: {r.prompt} — {new Date(r.created_at).toLocaleString()}</div>
                    <div className="mt-1">{r.revised_text}</div>
                  </div>
                ))}

                {(section.comments || []).map((c) => (
                  <div key={c.id} className="p-2 border rounded bg-white">
                    <div className="text-xs text-gray-500">{new Date(c.created_at).toLocaleString()}</div>
                    <div className="mt-1">{c.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          className="px-6 py-2 rounded bg-emerald-600 text-white"
          onClick={() => {
            alert("Export flow: call /export endpoints on backend (not implemented in this file)");
          }}
        >
          Export
        </button>
      </div>
    </div>
  );
}
