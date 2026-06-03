import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5001/api/categories');
      setCategories(res.data.data || []);
      setLoading(false);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Server Error');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (formData, token) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      // Axios automatically sets Content-Type to multipart/form-data when passing FormData
      const res = await axios.post('http://localhost:5001/api/categories', formData, config);
      setCategories([res.data.data, ...(categories || [])]);
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteCategory = async (id, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5001/api/categories/${id}`, config);
      setCategories((categories || []).filter(cat => cat._id !== id));
    } catch (err) {
      throw err;
    }
  };

  const updateCategory = async (id, formData, token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.put(`http://localhost:5001/api/categories/${id}`, formData, config);
      setCategories((categories || []).map(cat => cat._id === id ? res.data.data : cat));
      return res.data;
    } catch (err) {
      throw err;
    }
  };

  return (
    <CategoryContext.Provider
      value={{
        categories,
        loading,
        error,
        addCategory,
        deleteCategory,
        updateCategory,
        refreshCategories: fetchCategories
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

export default CategoryContext;
