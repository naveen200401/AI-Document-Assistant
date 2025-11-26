// src/premium/CreateProjectModal.jsx
import React, { useState } from 'react';
import { createProject } from '../services/api';

export default function CreateProjectModal({ onCreated }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createProject(name);
      setName('');
      if (onCreated) onCreated(res);
    } catch (error) {
      setErr(error?.body?.detail || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow">
      {err && <div className="text-red-600 mb-2">{err}</div>}
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" className="w-full border p-2 rounded mb-2" />
      <div className="flex gap-2">
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Creating...' : 'Create'}</button>
      </div>
    </form>
  );
}
