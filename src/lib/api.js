// ─────────────────────────────────────────────────────────────────────────
//  API CLIENT — the front-end's only door to our backend (server/).
//  Same-origin fetch with the session cookie; throws a readable Error on
//  failure so the UI can show the server's message.
// ─────────────────────────────────────────────────────────────────────────

const BASE = '/api';

const OFFLINE_MSG =
  'Can’t reach the workspace API. Make sure the backend is running — start it with `npm run dev` (it runs the web app and API together).';

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network error — the API isn't reachable at all.
    throw new Error(OFFLINE_MSG);
  }
  // Vite returns 502/503/504 when the proxy target (the API) is down.
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    throw new Error(OFFLINE_MSG);
  }
  if (res.status === 204) return null;
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new Error(payload?.error || `Request failed (${res.status})`);
  return payload;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),

  profiles: () => request('/profiles'),

  tasks: () => request('/tasks'),
  createTask: (body) => request('/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  events: () => request('/events'),
  createEvent: (body) => request('/events', { method: 'POST', body }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),
};
