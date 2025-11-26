// frontend/app.js
const {
  useState,
  useEffect
} = React;
const API_BASE = "http://127.0.0.1:5001"; // change if backend is on another host/port

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
function Login({
  onLogin
}) {
  const [name, setName] = useState("");
  function submit() {
    if (!name.trim()) return alert("Enter name");
    const user = {
      id: "user-" + Math.random().toString(36).slice(2, 8),
      name
    };
    saveUser(user);
    onLogin(user);
  }
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-md mx-auto mt-24 card p-6 bg-white rounded-xl shadow"
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-xl font-semibold mb-4"
  }, "Sign in"), /*#__PURE__*/React.createElement("input", {
    value: name,
    onChange: e => setName(e.target.value),
    placeholder: "Your name",
    className: "w-full p-2 border rounded mb-4"
  }), /*#__PURE__*/React.createElement("button", {
    className: "w-full bg-blue-600 text-white py-2 rounded",
    onClick: submit
  }, "Sign in"));
}
function Dashboard({
  user,
  onCreate
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/documents`);
      setProjects(await res.json());
    } catch (e) {
      console.error(e);
      alert("Failed to load projects");
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-6xl mx-auto"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-2xl font-bold"
  }, "Welcome, ", user.name), /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-500"
  }, "Create new projects or open previous ones")), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 bg-emerald-600 text-white rounded",
    onClick: onCreate
  }, "Create project"), /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 bg-gray-200 rounded",
    onClick: load
  }, loading ? "Refreshing..." : "Refresh"))), /*#__PURE__*/React.createElement("div", {
    className: "grid grid-cols-2 gap-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "card p-4 bg-white rounded shadow"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold mb-3"
  }, "Previous Projects"), projects.length === 0 ? /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-500"
  }, "No projects yet") : /*#__PURE__*/React.createElement("ul", {
    className: "space-y-2"
  }, projects.map(p => /*#__PURE__*/React.createElement("li", {
    key: p.id,
    className: "p-2 border rounded flex justify-between items-center"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "font-medium"
  }, p.title), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500"
  }, p.created_at)), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("a", {
    className: "px-3 py-1 bg-blue-600 text-white rounded text-sm",
    href: `/project.html?id=${p.id}`,
    onClick: e => {
      e.preventDefault();
      window.location.href = `/project.html?id=${p.id}`;
    }
  }, "Open"), /*#__PURE__*/React.createElement("a", {
    className: "px-3 py-1 bg-gray-100 rounded text-sm",
    href: `${API_BASE}/api/documents/${p.id}/export?format=docx`
  }, "DOCX"), /*#__PURE__*/React.createElement("a", {
    className: "px-3 py-1 bg-gray-100 rounded text-sm",
    href: `${API_BASE}/api/documents/${p.id}/export?format=pdf`
  }, "PDF")))))), /*#__PURE__*/React.createElement("div", {
    className: "card p-4 bg-white rounded shadow"
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-semibold mb-3"
  }, "Create Project"), /*#__PURE__*/React.createElement(CreateProjectForm, {
    onCreated: doc => {
      setTimeout(() => load(), 400);
      onCreate && onCreate(doc);
    }
  }))));
}
function CreateProjectForm({
  onCreated
}) {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [format, setFormat] = useState("docx");
  const [theme, setTheme] = useState("formal");
  const [pages, setPages] = useState(3);
  const [loading, setLoading] = useState(false);
  async function create() {
    if (!prompt.trim()) return alert("Enter prompt");
    setLoading(true);
    try {
      // create document
      const res = await fetch(`${API_BASE}/api/documents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title || `Project - ${new Date().toLocaleString()}`
        })
      });
      const doc = await res.json();
      // generate pages
      const gen = await fetch(`${API_BASE}/api/documents/${doc.id}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          format,
          theme,
          pages
        })
      });
      const updated = await gen.json();
      onCreated && onCreated(updated);
      // open project viewer
      window.location.href = `/project.html?id=${doc.id}`;
    } catch (e) {
      console.error(e);
      alert("Create failed");
    }
    setLoading(false);
  }
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("input", {
    placeholder: "Title (optional)",
    value: title,
    onChange: e => setTitle(e.target.value),
    className: "w-full p-2 border rounded mb-2"
  }), /*#__PURE__*/React.createElement("textarea", {
    placeholder: "Describe your project (prompt)...",
    value: prompt,
    onChange: e => setPrompt(e.target.value),
    rows: 4,
    className: "w-full p-2 border rounded mb-2"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mb-2"
  }, /*#__PURE__*/React.createElement("select", {
    value: format,
    onChange: e => setFormat(e.target.value),
    className: "p-2 border rounded"
  }, /*#__PURE__*/React.createElement("option", {
    value: "docx"
  }, "DOCX"), /*#__PURE__*/React.createElement("option", {
    value: "pdf"
  }, "PDF")), /*#__PURE__*/React.createElement("select", {
    value: theme,
    onChange: e => setTheme(e.target.value),
    className: "p-2 border rounded"
  }, /*#__PURE__*/React.createElement("option", {
    value: "formal"
  }, "Formal"), /*#__PURE__*/React.createElement("option", {
    value: "casual"
  }, "Casual"), /*#__PURE__*/React.createElement("option", {
    value: "educational"
  }, "Educational")), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    max: "50",
    value: pages,
    onChange: e => setPages(e.target.value),
    className: "p-2 border rounded w-20"
  })), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-4 py-2 bg-blue-600 text-white rounded",
    onClick: create,
    disabled: loading
  }, loading ? "Creating..." : "Create & Generate")));
}

// Project viewer page
function ProjectViewer() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const [doc, setDoc] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    load();
  }, []);
  async function load() {
    try {
      const res = await fetch(`${API_BASE}/api/document/${id}`);
      setDoc(await res.json());
    } catch (e) {
      console.error(e);
      alert("Failed to load document");
    }
  }
  async function refineSection(sectionId) {
    const prompt = promptForRefine();
    if (!prompt) return;
    setLoading(true);
    try {
      const curText = editing[sectionId] !== undefined ? editing[sectionId] : doc.sections.find(s => s.id === sectionId).text || "";
      const res = await fetch(`${API_BASE}/api/sections/${sectionId}/refine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          current_text: curText
        })
      });
      const body = await res.json();
      await load();
      alert("Refined saved");
    } catch (e) {
      console.error(e);
      alert("Refine failed");
    }
    setLoading(false);
  }
  function promptForRefine() {
    return window.prompt("Refinement prompt (e.g. 'Make bullets', 'Shorten to 50 words')", "");
  }
  async function sendFeedback(sectionId, liked) {
    try {
      await fetch(`${API_BASE}/api/sections/${sectionId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          liked
        })
      });
      await load();
    } catch (e) {
      console.error(e);
      alert("Feedback failed");
    }
  }
  async function addComment(sectionId) {
    const c = window.prompt("Comment", "");
    if (!c) return;
    try {
      await fetch(`${API_BASE}/api/sections/${sectionId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          comment: c
        })
      });
      await load();
    } catch (e) {
      console.error(e);
      alert("Comment failed");
    }
  }
  if (!doc) return /*#__PURE__*/React.createElement("div", {
    className: "p-6"
  }, "Loading...");
  return /*#__PURE__*/React.createElement("div", {
    className: "max-w-4xl mx-auto p-6"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-center mb-6"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    className: "text-xl font-semibold"
  }, doc.title), /*#__PURE__*/React.createElement("div", {
    className: "text-sm text-gray-500"
  }, "Project ID: ", doc.id)), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("a", {
    className: "px-3 py-2 bg-emerald-600 text-white rounded",
    href: `${API_BASE}/api/documents/${doc.id}/export?format=docx`
  }, "Download DOCX"), /*#__PURE__*/React.createElement("a", {
    className: "px-3 py-2 bg-gray-800 text-white rounded",
    href: `${API_BASE}/api/documents/${doc.id}/export?format=pdf`
  }, "Download PDF"))), /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, doc.sections.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.id,
    className: "p-4 bg-white rounded shadow"
  }, /*#__PURE__*/React.createElement("div", {
    className: "flex justify-between items-start"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h3", {
    className: "font-medium"
  }, s.heading), /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500"
  }, "Section ID: ", s.id)), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2"
  }, /*#__PURE__*/React.createElement("button", {
    className: `px-3 py-1 rounded ${s.last_feedback === 1 ? 'bg-green-100' : 'bg-gray-100'}`,
    onClick: () => sendFeedback(s.id, true)
  }, "\uD83D\uDC4D"), /*#__PURE__*/React.createElement("button", {
    className: `px-3 py-1 rounded ${s.last_feedback === 0 ? 'bg-red-100' : 'bg-gray-100'}`,
    onClick: () => sendFeedback(s.id, false)
  }, "\uD83D\uDC4E"))), /*#__PURE__*/React.createElement("textarea", {
    rows: "6",
    value: editing[s.id] !== undefined ? editing[s.id] : s.text,
    onChange: e => {
      const t = e.target.value;
      setEditing({
        ...editing,
        [s.id]: t
      });
    },
    className: "w-full p-2 border rounded mt-3"
  }), /*#__PURE__*/React.createElement("div", {
    className: "flex gap-2 mt-3"
  }, /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 bg-blue-600 text-white rounded",
    onClick: () => refineSection(s.id)
  }, "Refine"), /*#__PURE__*/React.createElement("button", {
    className: "px-3 py-2 bg-gray-800 text-white rounded",
    onClick: () => addComment(s.id)
  }, "Comment")), /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement("strong", null, "Refinement history"), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 space-y-2"
  }, (s.refinements || []).map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    className: "p-2 border rounded bg-gray-50"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500"
  }, "Prompt: ", r.prompt, " \u2014 ", new Date(r.created_at).toLocaleString()), /*#__PURE__*/React.createElement("pre", {
    className: "mt-1 p-2 bg-white rounded text-sm overflow-x-auto"
  }, r.revised_text))))), /*#__PURE__*/React.createElement("div", {
    className: "mt-3"
  }, /*#__PURE__*/React.createElement("strong", null, "Comments"), /*#__PURE__*/React.createElement("div", {
    className: "mt-2 space-y-2"
  }, (s.comments || []).map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    className: "p-2 border rounded bg-white"
  }, /*#__PURE__*/React.createElement("div", {
    className: "text-xs text-gray-500"
  }, new Date(c.created_at).toLocaleString()), /*#__PURE__*/React.createElement("div", {
    className: "mt-1"
  }, c.comment)))))))));
}

// Router (simple)
function App() {
  const [user, setUser] = useState(loadUser());
  const path = window.location.pathname;
  if (!user) return /*#__PURE__*/React.createElement(Login, {
    onLogin: u => {
      setUser(u);
    }
  });
  if (path.startsWith("/project.html")) return /*#__PURE__*/React.createElement(ProjectViewer, null);
  return /*#__PURE__*/React.createElement(Dashboard, {
    user: user,
    onCreate: () => {/* reload on create via callback */}
  });
}
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
