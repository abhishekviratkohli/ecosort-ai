/**
 * EcoSort AI - API Client Service
 */

const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('ecosort_token');
export const setAuthToken = (token) => localStorage.setItem('ecosort_token', token);
export const removeAuthToken = () => localStorage.removeItem('ecosort_token');

const authHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: authHeaders()
    });
    return res.json();
  },

  async getDemoUsers() {
    const res = await fetch(`${API_BASE}/auth/demo-users`);
    return res.json();
  },

  // Prediction & Classification
  async predictWaste({ image, sampleKey, metadata }) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ image, sampleKey, metadata })
    });
    return res.json();
  },

  async confirmDisposal(predictionId) {
    const res = await fetch(`${API_BASE}/predict/confirm-disposal`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ predictionId })
    });
    return res.json();
  },

  async getHistory({ page = 1, limit = 10, category = null } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (category) params.append('category', category);
    const res = await fetch(`${API_BASE}/predict/history?${params.toString()}`, {
      headers: authHeaders()
    });
    return res.json();
  },

  async deleteHistory(id) {
    const res = await fetch(`${API_BASE}/predict/history/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.json();
  },

  async getSamples() {
    const res = await fetch(`${API_BASE}/predict/samples`);
    return res.json();
  },

  // Community & Leaderboards
  async getLeaderboard(scope = 'all') {
    const res = await fetch(`${API_BASE}/community/leaderboard?scope=${scope}`);
    return res.json();
  },

  // Recycling Centers Locator
  async getNearbyCenters({ lat, lng, category, radius } = {}) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (category) params.append('category', category);
    if (radius) params.append('radius', radius);
    const res = await fetch(`${API_BASE}/centers/nearby?${params.toString()}`);
    return res.json();
  },

  // Waste Catalog
  async getCatalog() {
    const res = await fetch(`${API_BASE}/waste-catalog`);
    return res.json();
  },

  // Admin Metrics
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: authHeaders()
    });
    return res.json();
  }
};
