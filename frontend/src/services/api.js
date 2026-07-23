/**
 * Low-level HTTP client. Single responsibility: perform requests, attach the
 * acting-user header, parse JSON, surface errors. No domain knowledge here.
 */
const BASE = '/api';

// Demo: identify the acting user so backend role checks work. In production
// this would be a real auth token. Persisted so it survives reloads.
export function getActingUserId() {
  return localStorage.getItem('actingUserId') || '';
}
export function setActingUserId(id) {
  localStorage.setItem('actingUserId', id);
}

async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(BASE + path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.pathname + url.search, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': getActingUserId(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const http = {
  get: (p, params) => request(p, { params }),
  post: (p, body) => request(p, { method: 'POST', body }),
  patch: (p, body) => request(p, { method: 'PATCH', body }),
  del: (p) => request(p, { method: 'DELETE' }),
};
