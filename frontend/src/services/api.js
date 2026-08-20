const API_BASE = import.meta.env.VITE_API_URL || '';

// detect neo4j integer JSON shape { low, high }
function isNeo4jIntObject(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, 'low') &&
    Object.prototype.hasOwnProperty.call(obj, 'high') &&
    Object.keys(obj).length === 2
  );
}

// convert neo4j int JSON ({low, high}) to a JS Number (signed)
function neo4jIntToNumber(i) {
  // Ensure numeric conversion accounts for signed 64-bit small-range numbers.
  // low is a 32-bit signed int in driver output; we'll treat it as unsigned for combination.
  const low = i.low >>> 0; // to unsigned 32-bit
  const high = i.high | 0; // signed 32-bit
  // fast path for 32-bit values
  if (high === 0) return low;
  if (high === -1) return low - 4294967296;
  // general combination (may exceed safe integer if truly 64-bit, but this matches prior app expectations)
  return high * 4294967296 + low;
}

// recursively walk and convert neo4j int objects into numbers
function convertNeo4jTypes(value) {
  if (Array.isArray(value)) {
    return value.map(convertNeo4jTypes);
  }
  if (isNeo4jIntObject(value)) {
    return neo4jIntToNumber(value);
  }
  if (value && typeof value === 'object') {
    // Create a new object with converted values
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = convertNeo4jTypes(v);
    }
    return out;
  }
  // primitive (string/number/boolean/null/undefined)
  return value;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  // parse JSON safely (fallback to {})
  let data = await response.json().catch(() => ({}));

  // Convert neo4j integer shapes into JS primitives before returning to the app
  data = convertNeo4jTypes(data);

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
