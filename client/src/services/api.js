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
  // --- Auth ---
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

  // --- Prediction & Classification ---
  async predictWaste({ image, sampleKey, classification, metadata }) {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ image, sampleKey, classification, metadata })
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

  // --- Community & Leaderboards ---
  async getLeaderboard(scope = 'all') {
    const res = await fetch(`${API_BASE}/community/leaderboard?scope=${scope}`);
    return res.json();
  },

  // --- Recycling Centers Locator ---
  async getNearbyCenters({ lat, lng, category, radius } = {}) {
    const params = new URLSearchParams();
    if (lat) params.append('lat', lat);
    if (lng) params.append('lng', lng);
    if (category) params.append('category', category);
    if (radius) params.append('radius', radius);
    const res = await fetch(`${API_BASE}/centers/nearby?${params.toString()}`);
    return res.json();
  },

  // --- Waste Catalog ---
  async getCatalog() {
    const res = await fetch(`${API_BASE}/waste-catalog`);
    return res.json();
  },

  // --- Admin Management Console ---
  async getAdminMetrics() {
    const res = await fetch(`${API_BASE}/admin/metrics`, {
      headers: authHeaders()
    });
    return res.json();
  },

  async getAdminUsers() {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: authHeaders()
    });
    return res.json();
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async addRecyclingCenter(centerData) {
    const res = await fetch(`${API_BASE}/admin/centers`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(centerData)
    });
    return res.json();
  },

  async updateRecyclingCenter(id, centerData) {
    const res = await fetch(`${API_BASE}/admin/centers/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(centerData)
    });
    return res.json();
  },

  async deleteRecyclingCenter(id) {
    const res = await fetch(`${API_BASE}/admin/centers/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.json();
  },

  async getMunicipalAlerts() {
    const res = await fetch(`${API_BASE}/admin/alerts`);
    return res.json();
  },

  async addMunicipalAlert(alertData) {
    const res = await fetch(`${API_BASE}/admin/alerts`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(alertData)
    });
    return res.json();
  },

  async deleteMunicipalAlert(id) {
    const res = await fetch(`${API_BASE}/admin/alerts/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return res.json();
  },

  async downloadAuditCSV() {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/admin/export-csv`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `municipal_waste_segregation_audit_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }
};
