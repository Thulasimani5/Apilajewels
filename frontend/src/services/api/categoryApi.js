import API_BASE_URL from '../../config/api';

/**
 * Category API Services
 * ---------------------
 * Handles all API calls related to jewellery categories & types.
 */

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  return res.json();
};

export const createCategory = async (token, formData) => {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const updateCategory = async (token, categoryId, formData) => {
  const res = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

export const deleteCategory = async (token, categoryId) => {
  const res = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
