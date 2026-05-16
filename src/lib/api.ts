import axios from 'axios';

export { getErrorMessage } from './utils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST INTERCEPTOR — attach access token ────────────────────────────────
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('rakhwalipk-auth');
      if (stored) {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      }
    } catch {}
  }
  return config;
});

// ─── RESPONSE INTERCEPTOR — auto-refresh on 401 ──────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (v: any) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => error ? reject(error) : resolve(token));
  failedQueue = [];
};

function isAuthCredentialRequest(config: { url?: string }) {
  const u = config.url || '';
  return u.includes('/auth/login') || u.includes('/auth/register');
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Failed login/register must not trigger refresh-token flow (clears storage / hides real error).
    if (error.response?.status === 401 && isAuthCredentialRequest(originalRequest)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const stored = localStorage.getItem('rakhwalipk-auth');
        if (stored) {
          const { state } = JSON.parse(stored);
          if (state?.refreshToken) {
            const { data } = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken: state.refreshToken,
            });

            const newAccessToken = data.data.accessToken;
            const parsed = JSON.parse(stored);
            parsed.state.accessToken = newAccessToken;
            parsed.state.refreshToken = data.data.refreshToken;
            localStorage.setItem('rakhwalipk-auth', JSON.stringify(parsed));

            processQueue(null, newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('rakhwalipk-auth');
        window.location.href = '/auth/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
