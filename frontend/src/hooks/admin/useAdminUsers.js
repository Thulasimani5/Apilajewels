import { useState } from 'react';
import { fetchAllUsers, fetchAllGuestCarts } from '../../services/api';

export const useAdminUsers = (token) => {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserCart, setSelectedUserCart] = useState(null);

  const [guestCarts, setGuestCarts] = useState([]);
  const [guestCartsLoading, setGuestCartsLoading] = useState(false);
  const [guestCartFilter, setGuestCartFilter] = useState('active');
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);

  const fetchUsersData = async () => {
    setUsersLoading(true);
    try {
      const result = await fetchAllUsers(token);
      if (result.success) setUsers(result.data);
    } catch (e) {
      console.error("Error fetching users:", e);
    } finally {
      setUsersLoading(false);
    }

    setGuestCartsLoading(true);
    try {
      const result = await fetchAllGuestCarts(token);
      if (result.success) setGuestCarts(result.data);
    } catch (e) {
      console.error("Error fetching guest carts:", e);
    } finally {
      setGuestCartsLoading(false);
    }
  };

  return {
    users,
    setUsers,
    usersLoading,
    selectedUserCart,
    setSelectedUserCart,
    guestCarts,
    setGuestCarts,
    guestCartsLoading,
    guestCartFilter,
    setGuestCartFilter,
    selectedUserOrders,
    setSelectedUserOrders,
    fetchUsersData
  };
};
