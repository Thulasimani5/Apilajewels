import API_BASE_URL from '../../config/api';

/**
 * User & Cart API Services
 * ------------------------
 * Handles all API calls related to registered users and guest carts.
 */

export const fetchAllUsers = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const fetchAllGuestCarts = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/cart/all-guests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
