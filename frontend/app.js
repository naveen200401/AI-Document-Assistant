// frontend/app.js
const { useState, useEffect } = React;

// 🔧 IMPORTANT: Render backend URL (NO trailing slash)
const API_BASE = "https://ai-document-assistant-5o3z.onrender.com";

/* ---------------- LOCAL STORAGE HELPERS ---------------- */

function saveUser(user) {
  localStorage.setItem("ai_user", JSON.stringify(user));
}
function loadUser() {
  try {
    return JSON.parse(localStorage.getItem("ai_user") || "null");
  } catch (e) {
    return null;
  }
}
function clearUser() {
  localStorage.removeItem("ai_user");
}

/* ---------------- LOGIN ---------------- */

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function submit() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return alert("Please enter name, email, and password");
    }
    // Demo-only local user (no real auth)
    const user = {
      id: "user-" + Math.random().toString(36).slice(2, 8),
      name,
      email,
    };
    saveUser(user);
    onLogin(user);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2 text-center">
          AI Document Assistant
        </h1>
        <p className="text-xs text-gray-500 mb-4 text-center">
          Sign up / Sign in with a display name (stored locally for this demo)
        </p>

        <label className="block text-sm font-medium mb-1">Display name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full p-2 border rounded mb-3 text-sm"
        />

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full p-2 border rounded mb-3 text-sm"
        />

        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full p-2 border rounded mb-4 text-sm"
        />

        <button
          className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700"
          onClick={submit}
        >
          Sign up / Sign in
        </button>
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */

function Dashboard({ user, onSelectDoc, onCreateDoc, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/documents?owner_email=${encodeURIComponent(
          user.email
        )}`
      );
      const data = await res.json();
      setProjects(data);
    } catch (e) {
      console.error(e);
      alert("Failed to load projects");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function createNew() {
    const title = prompt("Project title?");
    if (!title) return;
    try {
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          owner_email: user.email, // link document to this user
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const doc = await res.json();
      onCreateDoc(doc);
    } catch (e) {
      console.error(e);
      alert("Failed to create project");
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Document Assistant</h1>
          <p className="text-sm text-gray-600">
            Welcome, <span className="font-semibold">{user.name}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={createNew}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            + Create project
          </button>
          <button
            onClick={onLogout}
            className="border border-gray-400 text-gray-700 px-3 py-2 rounded text-xs hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Previous projects</h2>
          {loading && <p className="text-sm text-gray-500">Loading…</p>}
          {!loading && projects.length === 0 && (
            <p className="text-sm text-gray-500">
              No projects yet. Create your first one!
            </p>
          )}
          <ul className="divide-y">
            {projects.map((p) => (
              <li
                key={p.id}
                className="py-2 flex justify-between items-center cursor-pointer hover:bg-gray-50 px-1 rounded"
                onClick={() => onSelectDoc(p)}
              >
                <div>
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    #{p.id} · {p.created_at}
                  </div>
                </div>
                <span className="text-xs text-blue-600">Open →</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <h2 className="text-lg font-semibold mb-2">How it works</h2>
          <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
            <li>Sign up / Sign in with a display name.</li>
            <li>Create a project and enter your prompt.</li>
            <li>Choose pages, theme, and format.</li>
            <li>Generate page-by-page using Gemini.</li>
            <li>Refine or regenerate each page.</li>
            <li>Download as DOCX, PDF, or PPTX.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

/* ---------------- PROJECT CONFIG (Generate) ---------------- */

function ProjectConfig({ doc, onUpdated }) {
  const [prompt, setPrompt] = useState(doc.prompt || "");
  const [theme, setTheme] = useState(doc.theme || "");
  const [pages, setPages] = useState(doc.pages || 2);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) {
      return alert("Enter a prompt");
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents/${doc.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          theme,
          pages: Number(pages) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        console.error("Generate error:", data);
        alert(data.error || "Generation failed");
      } else {
        onUpdated(data);
      }
    } catch (e) {
      console.error("Generate error:", e);
      alert("Generation failed");
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Configure & Generate</h2>
      <label className="text-sm font-medium block mb-1">Prompt</label>
      <textarea
        className="w-full border rounded p-2 mb-3 text-sm"
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Explain advantages of AI in education..."
      />
      <div className="grid md:grid-cols-3 gap-4 mb-3">
        <div>
          <label className="text-sm font-medium block mb-1">Theme</label>
          <input
            className="w-full border rounded p-2 text-sm"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="educational / formal / business..."
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Pages</label>
          <input
            type="number"
            min={1}
            max={20}
            className="w-full border rounded p-2 text-sm"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
          />
        </div>
      </div>
      <button
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-60"
        onClick={handleGenerate}
      >
        {loading ? "Generating..." : "Generate with Gemini"}
      </button>
    </div>
  );
}

/* ---------------- DOWNLOAD BAR (DOCX/PDF/PPTX) ---------------- */

function DownloadBar({ documentId }) {
  async function download(format) {
    try {
      const res = await fetch(
        `${API_BASE}/api/documents/${documentId}/export?format=${format}`
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Download error:", err);
        alert(err.error || `Failed to download ${format.toUpperCase()}`);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ext =
        format === "pptx"
          ? "pptx"
          : format === "pdf"
          ? "pdf"
          : "docx";
      a.href = url;
      a.download = `document-${documentId}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download error:", e);
      alert("Download failed");
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        className="px-3 py-1 rounded bg-purple-600 text-white text-sm hover:bg-purple-700"
        onClick={() => download("pptx")}
      >
        📥 Download PPTX
      </button>
      <button
        className="px-3 py-1 rounded bg-gray-800 text-white text-sm hover:bg-gray-900"
        onClick={() => download("docx")}
      >
        📥 Download DOCX
      </button>
      <button
        className="px-3 py-1 rounded bg-red-600 text-white text-sm hover:bg-red-700"
        onClick={() => download("pdf")}
      >
        📥 Download PDF
      </button>
    </div>
  );
}

/* ---------------- SECTION CARD (Refine + Regenerate + Feedback + Comments) ---------------- */

function SectionCard({ section, onUpdated }) {
  const [refinePrompt, setRefinePrompt] = useState("");
  const [loadingRefine, setLoadingRefine] = useState(false);
  const [loadingRegen, setLoadingRegen] = useState(false);
  const [comment, setComment] = useState("");

  async function refine() {
    if (!refinePrompt.trim()) {
      return alert("Enter a refinement instruction");
    }
    setLoadingRefine(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/sections/${section.id}/refine`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: refinePrompt,
            current_text: section.text,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Refine error:", data);
        alert(data.error || "Refine failed");
      } else {
        onUpdated(section.id, {
          text: data.revised_text,
          refinements: data.refinements,
        });
        setRefinePrompt("");
      }
    } catch (e) {
      console.error("Refine error:", e);
      alert("Refine failed");
    }
    setLoadingRefine(false);
  }

  async function regenerate() {
    if (
      !confirm(
        "Regenerate this page with Gemini? Current text will be replaced."
      )
    )
      return;
    setLoadingRegen(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/sections/${section.id}/regenerate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Regenerate error:", data);
        alert(data.error || "Regenerate failed");
      } else {
        onUpdated(section.id, {
          text: data.text,
          refinements: data.refinements,
        });
      }
    } catch (e) {
      console.error("Regenerate error:", e);
      alert("Regenerate failed");
    }
    setLoadingRegen(false);
  }

  async function sendFeedback(liked) {
    try {
      await fetch(`${API_BASE}/api/sections/${section.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked }),
      });
      onUpdated(section.id, { last_feedback: liked ? 1 : 0 });
    } catch (e) {
      console.error("Feedback error:", e);
      alert("Feedback failed");
    }
  }

  async function sendComment() {
    if (!comment.trim()) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/sections/${section.id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        console.error("Comment error:", data);
        alert(data.error || "Comment failed");
      } else {
        const newComments = (section.comments || []).concat(data.comment);
        onUpdated(section.id, { comments: newComments });
        setComment("");
      }
    } catch (e) {
      console.error("Comment error:", e);
      alert("Comment failed");
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{section.heading}</h3>
        <div className="flex items-center gap-2 text-sm">
          <button
            className="px-2 py-1 rounded border border-green-500 text-green-600 hover:bg-green-50"
            onClick={() => sendFeedback(true)}
          >
            👍 Like
          </button>
          <button
            className="px-2 py-1 rounded border border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => sendFeedback(false)}
          >
            👎 Dislike
          </button>
        </div>
      </div>

      <p className="text-sm whitespace-pre-line mb-3">{section.text}</p>

      <div className="mb-3">
        <label className="text-xs font-medium block mb-1">
          AI refinement prompt (only for this section)
        </label>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2 text-sm"
            placeholder='e.g. "Shorten to 120 words", "Make this more formal"'
            value={refinePrompt}
            onChange={(e) => setRefinePrompt(e.target.value)}
          />
          <button
            disabled={loadingRefine}
            className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-60"
            onClick={refine}
          >
            {loadingRefine ? "Refining..." : "Refine"}
          </button>
          <button
            disabled={loadingRegen}
            className="px-3 py-1 rounded border text-sm hover:bg-gray-50 disabled:opacity-60"
            onClick={regenerate}
          >
            {loadingRegen ? "Regenerating..." : "Regenerate page"}
          </button>
        </div>
      </div>

      <div className="mt-3 border-t pt-3">
        <label className="text-xs font-medium block mb-1">Comments</label>
        <div className="space-y-1 mb-2 max-h-32 overflow-y-auto text-xs">
          {(section.comments || []).map((c) => (
            <div key={c.id} className="text-gray-700">
              • {c.comment}
            </div>
          ))}
          {(!section.comments || section.comments.length === 0) && (
            <div className="text-gray-400 text-xs">No comments yet.</div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded p-2 text-xs"
            placeholder="Add a note for this section..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button
            className="px-3 py-1 rounded bg-gray-800 text-white text-xs hover:bg-gray-900"
            onClick={sendComment}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- DOCUMENT VIEW ---------------- */

function DocumentView({ doc, onDocUpdated }) {
  const [current, setCurrent] = useState(doc);

  useEffect(() => {
    setCurrent(doc);
  }, [doc]);

  function updateSection(sectionId, changes) {
    setCurrent((prev) => {
      const next = { ...prev };
      next.sections = (next.sections || []).map((s) =>
        s.id === sectionId ? { ...s, ...changes } : s
      );
      onDocUpdated(next);
      return next;
    });
  }

  if (!current) return null;

  return (
    <div className="max-w-6xl mx-auto mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl font-bold">{current.title}</h2>
        <span className="text-xs text-gray-500">Document #{current.id}</span>
      </div>

      <DownloadBar documentId={current.id} />

      {(current.sections || []).map((sec) => (
        <SectionCard key={sec.id} section={sec} onUpdated={updateSection} />
      ))}
    </div>
  );
}

/* ---------------- ROOT APP ---------------- */

function App() {
  const [user, setUser] = useState(loadUser());
  const [currentDoc, setCurrentDoc] = useState(null);

  function handleLogin(u) {
    setUser(u);
  }

  function handleLogout() {
    clearUser();
    setUser(null);
    setCurrentDoc(null);
  }

  function handleSelectDoc(docMeta) {
    fetch(
      `${API_BASE}/api/document/${docMeta.id}?owner_email=${encodeURIComponent(
        user.email
      )}`
    )
      .then((r) => r.json())
      .then((d) => setCurrentDoc(d))
      .catch((e) => {
        console.error(e);
        alert("Failed to load document");
      });
  }

  function handleCreatedDoc(doc) {
    setCurrentDoc({ ...doc, sections: [] });
  }

  function handleDocUpdated(updated) {
    setCurrentDoc(updated);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {!currentDoc ? (
        <Dashboard
          user={user}
          onSelectDoc={handleSelectDoc}
          onCreateDoc={handleCreatedDoc}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <button
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setCurrentDoc(null)}
            >
              ← Back to projects
            </button>
            <button
              className="text-xs text-gray-600 underline"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <ProjectConfig doc={currentDoc} onUpdated={handleDocUpdated} />
          <DocumentView doc={currentDoc} onDocUpdated={handleDocUpdated} />
        </>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
