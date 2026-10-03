import API_BASE_URL from '../../config/api';

/**
 * Jewellery API Services
 * ----------------------
 * Handles all API calls related to jewellery products & catalog.
 */

export const fetchAllJewelleries = async (limit = 1000) => {
  const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=${limit}`);
  return res.json();
};

export const fetchJewelleriesByCategory = async (paramKey, categoryName, accessorySubtype = null) => {
  let url = `${API_BASE_URL}/api/jewellery?${paramKey}=${encodeURIComponent(categoryName)}&limit=500`;
  if (accessorySubtype) {
    url += `&accessoryType=${encodeURIComponent(accessorySubtype)}`;
  }
  const res = await fetch(url);
  return res.json();
};

export const createJewellery = async (token, formPayload) => {
  const res = await fetch(`${API_BASE_URL}/api/jewellery`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formPayload,
  });
  return res;
};

export const updateJewellery = async (token, id, formPayload) => {
  const res = await fetch(`${API_BASE_URL}/api/jewellery/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: formPayload,
  });
  return res;
};

export const patchJewelleryField = async (token, id, fieldName, value) => {
  const res = await fetch(`${API_BASE_URL}/api/jewellery/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ [fieldName]: value }),
  });
  return res;
};

export const deleteJewellery = async (token, id) => {
  const res = await fetch(`${API_BASE_URL}/api/jewellery/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};
