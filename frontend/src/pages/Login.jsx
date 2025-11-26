import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      // Save user details in localStorage
      const userObj = {
        name: data.name,     // display name
        email: data.email,   // stored for backend reference
        token: data.token    // if backend returns token
      };

      localStorage.setItem("ai_user", JSON.stringify(userObj));

      onLogin(userObj); // send to App.jsx

    } catch (err) {
      setError("Network error — server unreachable");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg p-8 rounded-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-700">
          AI Docs Login
        </h2>

        {error && (
          <p className="bg-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block text-sm mb-2">Email</label>
          <input
            type="email"
            className="w-full border px-3 py-2 rounded mb-4"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block text-sm mb-2">Password</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded mb-5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
