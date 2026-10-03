import API_BASE_URL from '../../config/api';

/**
 * Booking API Services
 * --------------------
 * Handles all API calls related to customer bookings.
 */

export const fetchAllBookings = async (token) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createBooking = async (token, payload) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const updateBooking = async (token, bookingId, payload) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  return res.json();
};

export const deleteBooking = async (token, bookingId) => {
  const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
