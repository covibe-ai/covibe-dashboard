const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/covibe_api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(path, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let data;
    try {
      data = await response.json();
    } catch {
      data = { detail: response.statusText };
    }
    throw new ApiError(
      data.detail || `Request failed with status ${response.status}`,
      response.status,
      data
    );
  }

  if (response.status === 204) return null;
  return response.json();
}

// Auth
export const auth = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  loginOIDC: (provider) => {
    window.location.href = `${API_URL}/auth/oidc/${provider}`;
  },
  me: () => request('/auth/me'),
  logout: () => {
    localStorage.removeItem('auth_token');
  },
};

// Machines
export const machines = {
  list: () => request('/machines'),
  get: (id) => request(`/machines/${id}`),
};

// Workspaces
export const workspaces = {
  list: (machineId) =>
    request(`/machines/${machineId}/workspaces`),
  get: (id) => request(`/workspaces/${id}`),
};

// Sessions
export const sessions = {
  list: (workspaceId) =>
    request(`/workspaces/${workspaceId}/sessions`),
  get: (id) => request(`/sessions/${id}`),
};

// API Keys
export const apiKeys = {
  list: () => request('/api-keys'),
  create: (name) =>
    request('/api-keys', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),
  revoke: (id) =>
    request(`/api-keys/${id}`, { method: 'DELETE' }),
};

// User profile
export const profile = {
  get: () => request('/auth/me'),
  update: (data) =>
    request('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};