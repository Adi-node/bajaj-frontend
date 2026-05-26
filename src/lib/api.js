const RAW_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_BASE.replace(/\/$/, '');

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { error: text || 'Unexpected response' };
  }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  listTickets(params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const q = qs.toString();
    return request(`/tickets${q ? `?${q}` : ''}`);
  },
  stats() {
    return request('/tickets/stats');
  },
  createTicket(body) {
    return request('/tickets', { method: 'POST', body: JSON.stringify(body) });
  },
  updateTicket(id, body) {
    return request(`/tickets/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  },
  deleteTicket(id) {
    return request(`/tickets/${id}`, { method: 'DELETE' });
  },
};

export { API_BASE };
