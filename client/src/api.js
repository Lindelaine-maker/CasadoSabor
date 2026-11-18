const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
let adminToken = sessionStorage.getItem('casaDoSaborAdminToken') || '';

export function setAdminToken(token) {
  adminToken = token || '';
  if (adminToken) sessionStorage.setItem('casaDoSaborAdminToken', adminToken);
  else sessionStorage.removeItem('casaDoSaborAdminToken');
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const payload = response.status === 204 ? null : await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && adminToken) setAdminToken('');
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
