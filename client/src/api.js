const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const payload = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(payload?.message || 'Não foi possível concluir a operação.');
  return payload;
}
export const api = {
  categories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  dishes: (categoryId) => request(`/categories/${categoryId}/dishes`),
  createDish: (categoryId, data) => request(`/categories/${categoryId}/dishes`, { method: 'POST', body: JSON.stringify(data) }),
  updateDish: (id, data) => request(`/dishes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDish: (id) => request(`/dishes/${id}`, { method: 'DELETE' }),
};
