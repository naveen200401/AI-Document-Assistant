// src/pages/Projects.jsx
import React, { useEffect, useState } from 'react';
import { getProjects, createProject } from '../services/api';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState(null);

  async function fetchProjects() {
    try {
      const res = await getProjects();
      setProjects(Array.isArray(res) ? res : res.projects || []);
    } catch (err) {
      setError(err?.body?.detail || err.message);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await createProject(name);
      setName('');
      fetchProjects();
    } catch (err) {
      setError(err?.body?.detail || err.message);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Projects</h1>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New project name" className="border p-2 rounded flex-1" />
        <button type="submit" className="bg-blue-600 text-white px-4 rounded">Create Project</button>
      </form>
      {error && <div className="text-red-600 mb-2">{String(error)}</div>}
      <div className="grid grid-cols-3 gap-4">
        {projects.length === 0 && <div>No projects yet</div>}
        {projects.map(p => (
          <div key={p.id} className="p-4 bg-white rounded shadow">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-500">{p.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
