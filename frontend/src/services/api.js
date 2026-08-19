const API_BASE = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  health: () => request('/api/health'),
  dashboard: () => request('/api/dashboard'),
  developers: (q) => request(q ? `/api/developers?q=${encodeURIComponent(q)}` : '/api/developers'),
  developer: (id) => request(`/api/developers/${id}`),
  developerNetwork: (id) => request(`/api/developers/${id}/network`),
  technologies: () => request('/api/technologies'),
  technology: (id) => request(`/api/technologies/${id}`),
  technologyDevelopers: (id) => request(`/api/technologies/${id}/developers`),
  projects: () => request('/api/projects'),
  project: (id) => request(`/api/projects/${id}`),
  projectTechnologies: (id) => request(`/api/projects/${id}/technologies`),
  topProjects: () => request('/api/projects/top'),
  search: (q) => request(`/api/search?q=${encodeURIComponent(q)}`),
  collaborators: (developerId) => request(`/api/collaborators/${developerId}`),
  collaborationPath: (from, to) => request(`/api/collaboration-path?from=${from}&to=${to}`),
  graph: (id, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/graph/${id}${query ? `?${query}` : ''}`);
  },
};

export default api;
