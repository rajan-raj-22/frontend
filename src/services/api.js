import axios from 'axios';

const api = axios.create({
    baseURL: 'https://bank-voice-agent-backend-1.onrender.com/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('bv_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 globally
api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('bv_token');
            localStorage.removeItem('bv_user');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
    login: (data) => api.post('/auth/login', data),
    me: () => api.get('/auth/me'),
    logout: () => api.post('/auth/logout'),
    seedAdmin: () => api.post('/auth/seed'),
};

// ── Banks ─────────────────────────────────────────────────────────
export const banksApi = {
    getAll: () => api.get('/banks'),
    getById: (id) => api.get(`/banks/${id}`),
    create: (data) => api.post('/banks', data),
    update: (id, d) => api.put(`/banks/${id}`, d),
    deactivate: (id) => api.delete(`/banks/${id}`),
};

// ── Campaigns ─────────────────────────────────────────────────────
export const campaignsApi = {
    getAll: (params) => api.get('/campaigns', { params }),
    getById: (id) => api.get(`/campaigns/${id}`),
    create: (data) => api.post('/campaigns', data),
    pause: (id) => api.put(`/campaigns/${id}/pause`),
    resume: (id) => api.put(`/campaigns/${id}/resume`),
    cancel: (id) => api.delete(`/campaigns/${id}`),
};

// ── Calls ─────────────────────────────────────────────────────────
export const callsApi = {
    getAll: (params) => api.get('/calls', { params }),
    getById: (id) => api.get(`/calls/${id}`),
    getAudio: (id) => api.get(`/calls/${id}/audio`),
    sync: (data) => api.post('/calls/sync', data),  // pull from ElevenLabs
};

// ── Analytics ─────────────────────────────────────────────────────
export const analyticsApi = {
    summary: (params) => api.get('/analytics/summary', { params }),
    outcomes: (params) => api.get('/analytics/outcomes', { params }),
    languages: (params) => api.get('/analytics/languages', { params }),
    satisfaction: (params) => api.get('/analytics/satisfaction', { params }),
    daily: (params) => api.get('/analytics/daily', { params }),
    banks: () => api.get('/analytics/banks'),
};

// ── Leads ─────────────────────────────────────────────────────────
export const leadsApi = {
    getAll: (params) => api.get('/leads', { params }),
    getById: (id) => api.get(`/leads/${id}`),
    update: (id, data) => api.put(`/leads/${id}`, data),
};

export default api;
