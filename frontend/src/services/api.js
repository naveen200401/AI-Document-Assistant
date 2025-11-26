// src/services/api.js
const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  // standardized error handling
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    // throw an Error-like object so UI can read `detail` or `message`
    const err = new Error(body?.detail || body?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

/* AUTH */
export async function login(email, password) {
  const res = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function register(email, password) {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

/* PROJECTS */
export async function getProjects() {
  const res = await fetch(`${baseUrl}/projects`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  return handleResponse(res);
}

export async function createProject(name) {
  const res = await fetch(`${baseUrl}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ name }),
  });
  return handleResponse(res);
}

/* PROJECT SECTIONS */
export async function getProjectSections(projectId) {
  const res = await fetch(`${baseUrl}/projects/${projectId}/sections`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  return handleResponse(res);
}

export async function patchSection(projectId, sectionId, data) {
  const res = await fetch(`${baseUrl}/projects/${projectId}/sections/${sectionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

/* More advanced operations used by premium UI */
export async function refineSection(projectId, sectionId) {
  const res = await fetch(`${baseUrl}/projects/${projectId}/sections/${sectionId}/refine`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  return handleResponse(res);
}

export async function generateProject(projectId) {
  const res = await fetch(`${baseUrl}/projects/${projectId}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  return handleResponse(res);
}

// return a url to download exported project file
export async function exportProjectUrl(projectId) {
  const res = await fetch(`${baseUrl}/projects/${projectId}/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  });
  const body = await handleResponse(res);
  // assume backend returns { url: 'http://...' } or { download_url: '...' }
  return body.url || body.download_url || body;
}

export default {
  login,
  register,
  getProjects,
  createProject,
  getProjectSections,
  patchSection,
  refineSection,
  generateProject,
  exportProjectUrl,
};
