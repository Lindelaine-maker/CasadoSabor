const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';

function readStoredToken() {
  try { return window.sessionStorage.getItem('casaDoSaborAdminToken') || ''; }
  catch { return ''; }
}
function writeStoredToken(token) {
  try {
    if (token) window.sessionStorage.setItem('casaDoSaborAdminToken', token);
    else window.sessionStorage.removeItem('casaDoSaborAdminToken');
  } catch { /* O cardápio público continua funcionando sem armazenamento local. */ }
}

let adminToken = readStoredToken();

export function setAdminToken(token) {
  adminToken = token || '';
  writeStoredToken(adminToken);
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && adminToken) {
      setAdminToken('');
      window.dispatchEvent(new Event('admin-session-expired'));
    }
    throw new Error(payload?.message || 'Não foi possível concluir a operação.');
  }
  return payload;
}

export const api = {
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  categories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  dishes: (categoryId) => request(`/categories/${categoryId}/dishes`),
  createDish: (categoryId, data) => request(`/categories/${categoryId}/dishes`, { method: 'POST', body: JSON.stringify(data) }),
  updateDish: (id, data) => request(`/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDish: (id) => request(`/dishes/${id}`, { method: 'DELETE' }),
};
