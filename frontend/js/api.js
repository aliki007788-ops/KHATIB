/* ================================================================
   خطیب — API client
   Talks to the FastAPI backend. Access token kept in memory + mirrored
   to localStorage (survives refresh); refresh token lives in an
   httpOnly cookie the browser sends automatically on same-origin
   (or CORS+credentials) requests to /api/auth/refresh.
   ================================================================ */

const API_BASE = window.KHATIB_API_BASE || '';

const Auth = {
  token: localStorage.getItem('khatib_at') || null,
  user: null,
  set(token) {
    this.token = token;
    if (token) localStorage.setItem('khatib_at', token);
    else localStorage.removeItem('khatib_at');
  },
  setUser(u) { this.user = u; },
  clear() { this.token = null; this.user = null; localStorage.removeItem('khatib_at'); },
};

let refreshPromise = null;

async function doRefresh() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST', credentials: 'include',
    }).then(async (r) => {
      if (!r.ok) throw new Error('refresh_failed');
      const data = await r.json();
      Auth.set(data.access_token);
      return data.access_token;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

class ApiError extends Error {
  constructor(status, payload) {
    super((payload && (payload.detail?.message || payload.detail)) || 'خطای ناشناخته');
    this.status = status;
    this.payload = payload;
  }
}

async function request(path, { method = 'GET', body, isForm = false, retry = true, auth = true } = {}) {
  const headers = {};
  if (!isForm) headers['Content-Type'] = 'application/json';
  if (auth && Auth.token) headers['Authorization'] = `Bearer ${Auth.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : (isForm ? body : JSON.stringify(body)),
  });

  if (res.status === 401 && auth && retry) {
    try {
      await doRefresh();
      return request(path, { method, body, isForm, retry: false, auth });
    } catch {
      Auth.clear();
      location.hash = '#/login';
      throw new ApiError(401, { detail: 'نشست شما پایان یافته؛ دوباره وارد شوید.' });
    }
  }

  if (res.status === 204) return null;

  let payload = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    payload = await res.json().catch(() => null);
  }

  if (!res.ok) throw new ApiError(res.status, payload);
  return payload;
}

const api = {
  // ---- auth ----
  register: (body) => request('/api/auth/register', { method: 'POST', body, auth: false }),
  login: (body) => request('/api/auth/login', { method: 'POST', body, auth: false }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: () => request('/api/auth/me'),

  // ---- speech ----
  speechText: (body) => request('/api/speech/text', { method: 'POST', body }),
  speechAudio: (topicLabel, file) => {
    const fd = new FormData();
    fd.append('topic_label', topicLabel);
    fd.append('file', file);
    return request('/api/speech/audio', { method: 'POST', body: fd, isForm: true });
  },
  speechList: () => request('/api/speech'),
  speechGet: (id) => request(`/api/speech/${id}`),
  speechDelete: (id) => request(`/api/speech/${id}`, { method: 'DELETE' }),

  // ---- chat ----
  convCreate: (title) => request('/api/chat/conversations', { method: 'POST', body: { title } }),
  convList: () => request('/api/chat/conversations'),
  convGet: (id) => request(`/api/chat/conversations/${id}`),
  convSend: (id, text) => request(`/api/chat/conversations/${id}/messages`, { method: 'POST', body: { text } }),
  convDelete: (id) => request(`/api/chat/conversations/${id}`, { method: 'DELETE' }),

  // ---- translate ----
  translate: (body) => request('/api/translate', { method: 'POST', body }),

  // ---- progress ----
  progressSummary: () => request('/api/progress/summary'),
  progressTrends: () => request('/api/progress/trends'),

  // ---- learning ----
  levels: () => request('/api/learning/levels'),
  scenarios: (levelId) => request(`/api/learning/levels/${levelId}/scenarios`),
  scenarioStart: (id) => request(`/api/learning/scenarios/${id}/start`, { method: 'POST' }),
  scenarioComplete: (id) => request(`/api/learning/scenarios/${id}/complete`, { method: 'POST' }),
  dailyReco: () => request('/api/learning/daily-recommendation'),

  // ---- billing ----
  checkout: (plan) => request('/api/billing/checkout', { method: 'POST', body: { plan } }),
  subscription: () => request('/api/billing/subscription'),
  history: () => request('/api/billing/history'),

  // ---- privacy ----
  exportData: () => request('/api/privacy/export'),
  deleteAccount: () => request('/api/privacy/delete-account', { method: 'POST', body: { confirmation: 'DELETE_ACCOUNT' } }),

  // ---- eitaa ----
  eitaaStatus: () => request('/api/eitaa/link-status'),

  // ---- admin ----
  adminStats: () => request('/api/admin/stats'),
  adminUsers: (search = '', limit = 50, offset = 0) => request(`/api/admin/users?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`),
  adminSetPlan: (id, plan) => request(`/api/admin/users/${id}/plan`, { method: 'PATCH', body: { plan } }),
  adminSetActive: (id, active) => request(`/api/admin/users/${id}/active`, { method: 'PATCH', body: { active } }),
};
