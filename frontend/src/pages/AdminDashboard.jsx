import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Calendar, Users, LogOut, Plus, ArrowLeft, Save, X, List, Search, Upload, Film, Image, Check, Pencil, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CategoryContext from '../context/CategoryContext';
import { useContext } from 'react';
import API_BASE_URL from '../config/api';

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const { categories, addCategory, deleteCategory, updateCategory } = useContext(CategoryContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserCart, setSelectedUserCart] = useState(null);

  const [selectedAdminCategory, setSelectedAdminCategory] = useState(null);
  const [adminJewelleries, setAdminJewelleries] = useState([]);
  const [adminJewelleriesLoading, setAdminJewelleriesLoading] = useState(false);
  const [adminJewellerySearch, setAdminJewellerySearch] = useState('');
  const [viewingJewel, setViewingJewel] = useState(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    // Reset search query when changing categories
    setAdminJewellerySearch('');
  }, [selectedAdminCategory]);

  useEffect(() => {
    if (activeTab === 'jewellery' && selectedAdminCategory && !showAddForm) {
      const fetchJewels = async () => {
        setAdminJewelleriesLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/jewellery?category=${encodeURIComponent(selectedAdminCategory)}&limit=500`);
          const result = await res.json();
          if (result.success) {
            setAdminJewelleries(result.data);
          }
        } catch (e) {
          console.error("Error fetching jewels:", e);
        } finally {
          setAdminJewelleriesLoading(false);
        }
      };
      fetchJewels();
    }
  }, [activeTab, selectedAdminCategory, showAddForm]);

  const handleDeleteJewel = async (id) => {
    if (!window.confirm("Are you sure you want to delete this jewel?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/jewellery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAdminJewelleries(prev => prev.filter(j => j._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      alert("Error deleting jewel");
    }
  };

  const handleQuickEditSubmit = async (e) => {
    e.preventDefault();
    setQuickEditLoading(true);
    try {
      const payload = { ...quickEditData };
      const url = `${API_BASE_URL}/api/jewellery/${quickEditData._id}`;
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Jewel updated quickly successfully!');
        setShowQuickEditModal(false);
        setAdminJewelleries(prev => prev.map(j => j._id === quickEditData._id ? { ...j, ...payload } : j));
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      alert('Network error. Could not connect to server.');
    } finally {
      setQuickEditLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      const fetchUsers = async () => {
        setUsersLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const result = await res.json();
          if (result.success) {
            setUsers(result.data);
          }
        } catch (e) {
          console.error("Error fetching users:", e);
        } finally {
          setUsersLoading(false);
        }
      };
      fetchUsers();
    }
  }, [activeTab, token]);

  const occasions = ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"];
  const types = ["Semi Bridal & Combo Sets", "Full Bridal Set", "Choker & Necklace", "Long Haram", "Bangles & Bracelets", "Accessories"];
  const colours = ["Gold", "Silver", "Rose Gold", "Emerald Green", "Ruby Red", "Mehndi Polish"];

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubtext, setNewCategorySubtext] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      const formData = new FormData();
      formData.append('name', newCategoryName);
      formData.append('subtext', newCategorySubtext);
      if (newCategoryImage) {
        formData.append('image', newCategoryImage);
      }
      await addCategory(formData, token);
      setNewCategoryName('');
      setNewCategorySubtext('');
      setNewCategoryImage(null);
      alert("Category added successfully");
    } catch (err) {
      alert("Error adding category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id, token);
    } catch (err) {
      alert("Error deleting category");
    }
  };

  // ── Edit category state ──
  const [editingCategory, setEditingCategory] = useState(null); // holds the category object being edited
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategorySubtext, setEditCategorySubtext] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategorySubtext(cat.subtext || '');
    setEditCategoryImage(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCategoryName.trim() || !editCategorySubtext.trim()) return;
    setIsSavingCategory(true);
    try {
      const formData = new FormData();
      formData.append('name', editCategoryName);
      formData.append('subtext', editCategorySubtext);
      if (editCategoryImage) formData.append('image', editCategoryImage);
      await updateCategory(editingCategory._id, formData, token);
      setEditingCategory(null);
    } catch (err) {
      alert(err?.response?.data?.error || 'Error updating category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  const [formData, setFormData] = useState({
    jewelId: '',
    name: '',
    description: '',
    price: '',
    deposit: '',
    category: ['victorian-moissinate'],
    type: [],
    occasion: [],
    colour: 'Gold',
    material: '',
    size: '',
    finish: '',
    purchaseAmount: '',
    rentAmount: '',
    salesAmount: '',
    shopName: '',
    stoneName: [],
    stoneColour: [],
    showPrice: true
  });
  const [mediaList, setMediaList] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);

  const [loading, setLoading] = useState(false);
  const [savingField, setSavingField] = useState(null);
  const [savedField, setSavedField] = useState(null);

  const handleSaveField = async (fieldName, value) => {
    if (!editingId) return;
    setSavingField(fieldName);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jewellery/${editingId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ [fieldName]: value })
      });
      if (res.ok) {
        setSavedField(fieldName);
        setTimeout(() => setSavedField(prev => prev === fieldName ? null : prev), 2500);
      } else {
        const err = await res.json();
        alert('Error saving field: ' + err.error);
      }
    } catch (err) {
      alert('Network error while saving field.');
    } finally {
      setSavingField(null);
    }
  };

  const FieldUpdateBtn = ({ field, value }) => !editingId ? null : (
    <button
      type="button"
      onClick={() => handleSaveField(field, value)}
      disabled={savingField === field}
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex-shrink-0 flex items-center gap-1 ${
        savingField === field ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : savedField === field ? 'bg-emerald-100 text-emerald-600'
        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'
      }`}
    >
      {savingField === field ? '…' : savedField === field ? <><Check size={9} /> Saved</> : 'Update'}
    </button>
  );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Stone colour is now manually selected via checkboxes

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const addedFiles = Array.from(e.dataTransfer.files);
      addFilesToList(addedFiles);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const addedFiles = Array.from(e.target.files);
      addFilesToList(addedFiles);
    }
  };

  const addFilesToList = (files) => {
    const updatedMedia = [...mediaList];
    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (isVideo || isImage) {
        updatedMedia.push({
          type: isVideo ? 'video' : 'image',
          file: file
        });
      }
    });
    setMediaList(updatedMedia);
  };

  const handlePreviewDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handlePreviewDragOver = (e, index) => {
    e.preventDefault();
  };

  const handlePreviewDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === targetIndex) return;

    const updatedMedia = [...mediaList];
    const [movedItem] = updatedMedia.splice(draggedItemIndex, 1);
    updatedMedia.splice(targetIndex, 0, movedItem);
    
    setMediaList(updatedMedia);
    setDraggedItemIndex(null);
  };

  const removeMediaField = (index) => {
    const newList = mediaList.filter((_, i) => i !== index);
    setMediaList(newList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingId && mediaList.length > 0 && mediaList[0].type !== 'image') {
      alert("The first media item MUST be an image.");
      return;
    }
    // Only new media items need a file
    if (mediaList.length > 0 && mediaList.some(m => !m.file && !m.url)) {
      alert("Please select a file for all new media inputs.");
      return;
    }

    setLoading(true);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (Array.isArray(value)) {
          value.forEach(val => payload.append(key, val));
        } else {
          payload.append(key, value);
        }
      });
      
      // Pass the complete order of images back to server
      const existingImages = mediaList.map(m => {
        if (m.file) return { isNew: true, type: m.type };
        return { type: m.type, url: m.url };
      });
      payload.append('reorderedImages', JSON.stringify(existingImages));

      mediaList.forEach(m => {
        if (m.file) {
          payload.append('images', m.file);
        }
      });

      const url = editingId ? `${API_BASE_URL}/api/jewellery/${editingId}` : `${API_BASE_URL}/api/jewellery`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: payload
      });

      if (res.ok) {
        alert(`Jewellery ${editingId ? 'updated' : 'added'} successfully!`);
        setShowAddForm(false);
        
        if (editingId) {
          setAdminJewelleries(prev => prev.map(j => j._id === editingId ? { ...j, ...formData } : j));
        }
        
        setEditingId(null);
        setFormData({
          jewelId: '', name: '', description: '', price: '', deposit: '',
          category: ['victorian-moissinate'], type: [], occasion: [], colour: 'Gold',
          material: '', size: '', finish: '',
          purchaseAmount: '', rentAmount: '', salesAmount: '', shopName: '',
          stoneName: [], stoneColour: []
        });
        setMediaList([]);
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (err) {
      alert('Network error. Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAdminJewelleries = (adminJewelleries || []).filter(jewel => {
    const q = adminJewellerySearch.toLowerCase().trim();
    if (!q) return true;
    // jewel.type can be an array or a string — normalise to a lowercase string before searching
    const typeStr = Array.isArray(jewel.type)
      ? jewel.type.join(' ').toLowerCase()
      : (jewel.type || '').toLowerCase();
    return (
      jewel.name?.toLowerCase().includes(q) ||
      jewel.jewelId?.toLowerCase().includes(q) ||
      typeStr.includes(q) ||
      jewel.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 relative">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-serif font-bold tracking-widest text-[#B07A85]">Apila Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => { setActiveTab('dashboard'); setShowAddForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => { setActiveTab('jewellery'); setShowAddForm(false); setSelectedAdminCategory(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jewellery' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package size={20} /> Manage Jewellery
          </button>
          <button 
            onClick={() => { setActiveTab('bookings'); setShowAddForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Calendar size={20} /> Bookings
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setShowAddForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Users
          </button>
          <button 
            onClick={() => { setActiveTab('categories'); setShowAddForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <List size={20} /> Categories
          </button>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {activeTab.replace('-', ' ')}
            {showAddForm && ' > Add New'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-[#B07A85] text-white flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Jewellery</div>
                <div className="text-3xl font-bold text-gray-900">124</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Available</div>
                <div className="text-3xl font-bold text-green-600">89</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Bookings</div>
                <div className="text-3xl font-bold text-gray-900">45</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Upcoming</div>
                <div className="text-3xl font-bold text-[#B07A85]">12</div>
              </div>
            </div>
          )}
          
          {activeTab === 'jewellery' && !showAddForm && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {!selectedAdminCategory ? (
                <>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="font-semibold text-gray-800">Jewellery Categories</h2>
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          jewelId: '', name: '', description: '', price: '', deposit: '',
                          category: ['victorian-moissinate'], type: [], occasion: [], colour: 'Gold',
                          material: '', size: '', finish: '',
                          purchaseAmount: '', rentAmount: '', salesAmount: '', shopName: ''
                        });
                        setMediaList([]);
                        setShowAddForm(true);
                      }}
                      className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm"
                    >
                      <Plus size={16} /> Add New Jewel
                    </button>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {(categories || []).map(c => (
                      <div 
                        key={c._id} 
                        onClick={() => setSelectedAdminCategory(c.name)} 
                        className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-[#B07A85] hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group relative"
                      >
                        <div className="absolute top-4 right-4 bg-white text-gray-600 border border-gray-200 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                          {c.jewelCount || 0}
                        </div>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mt-2">
                          <Package className="text-[#B07A85]" size={28} />
                        </div>
                        <span className="font-bold text-gray-800 text-lg text-center">{c.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelectedAdminCategory(null)}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <h2 className="font-bold text-gray-900 text-lg">{selectedAdminCategory}</h2>
                        <p className="text-xs text-gray-500 font-medium">Viewing all jewels in this category</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          jewelId: '', name: '', description: '', price: '', deposit: '',
                          category: selectedAdminCategory ? [selectedAdminCategory] : ['victorian-moissinate'], type: [], occasion: [], colour: 'Gold',
                          material: '', size: '', finish: '',
                          purchaseAmount: '', rentAmount: '', salesAmount: '', shopName: ''
                        });
                        setMediaList([]);
                        setShowAddForm(true);
                      }}
                      className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm"
                    >
                      <Plus size={16} /> Add New Jewel
                    </button>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="px-6 py-4 bg-white border-b border-gray-100 flex gap-2">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="text" 
                        value={adminJewellerySearch}
                        onChange={(e) => setAdminJewellerySearch(e.target.value)}
                        placeholder="Search by name, code, or type..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#B07A85] focus:border-[#B07A85]"
                      />
                    </div>
                  </div>

                  {adminJewelleriesLoading ? (
                    <div className="p-16 text-center">
                      <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <span className="text-sm font-medium text-gray-400">Loading jewels...</span>
                    </div>
                  ) : filteredAdminJewelleries.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                      {adminJewellerySearch ? 'No matching jewels found.' : 'No jewels found in this category.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-white border-b border-gray-100 text-gray-400 font-semibold uppercase text-xs tracking-wider">
                            <th className="px-6 py-4 w-16">S.No</th>
                            <th className="px-6 py-4">Image & Name</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Price</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {filteredAdminJewelleries.map((jewel, index) => (
                            <tr key={jewel._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">{index + 1}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {jewel.images?.[0]?.type === 'video' ? (
                                      <video src={jewel.images[0].url} className="w-full h-full object-cover" />
                                    ) : (
                                      <img src={jewel.images?.[0]?.url || jewel.images?.[0]} alt={jewel.name} className="w-full h-full object-cover" />
                                    )}
                                  </div>
                                  <div className="font-bold text-gray-900 max-w-[200px] truncate">{jewel.name}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block mt-3">{jewel.jewelId}</td>
                              <td className="px-6 py-4 text-gray-600">{Array.isArray(jewel.type) ? jewel.type.join(', ') : jewel.type}</td>
                              <td className="px-6 py-4 font-bold text-gray-900">₹{jewel.rentalPrice || jewel.price}</td>
                              <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                                <button 
                                  onClick={() => setViewingJewel(jewel)}
                                  title="View internal details"
                                  className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Eye size={14} />
                                </button>
                                <button 
                                  onClick={() => {
                                    setEditingId(jewel._id);
                                    setFormData({
                                      jewelId: jewel.jewelId || '',
                                      name: jewel.name || '',
                                      description: jewel.description || '',
                                      price: jewel.price || jewel.rentalPrice || '',
                                      deposit: jewel.deposit || '',
                                      category: Array.isArray(jewel.category) ? jewel.category : (jewel.category ? [jewel.category] : ['victorian-moissinate']),
                                      type: Array.isArray(jewel.type) ? jewel.type : (jewel.type ? [jewel.type] : []),
                                      occasion: Array.isArray(jewel.occasion) ? jewel.occasion : (jewel.occasion ? [jewel.occasion] : []),
                                      colour: jewel.colour || 'Gold',
                                      material: jewel.material || '',
                                      size: jewel.size || '',
                                      finish: jewel.finish || '',
                                      purchaseAmount: jewel.purchaseAmount || '',
                                      rentAmount: jewel.rentAmount || '',
                                      salesAmount: jewel.salesAmount || '',
                                      shopName: jewel.shopName || '',
                                      stoneName: jewel.stoneName || [],
                                      stoneColour: Array.isArray(jewel.stoneColour) ? jewel.stoneColour : (jewel.stoneColour ? [jewel.stoneColour] : []),
                                      showPrice: jewel.showPrice !== false
                                    });
                                    setMediaList(jewel.images ? jewel.images.map(img => ({
                                      type: img.type || 'image',
                                      url: img.url || img,
                                      file: null
                                    })) : []);
                                    setShowAddForm(true);
                                  }}
                                  title="Edit jewellery"
                                  className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteJewel(jewel._id)}
                                  title="Delete jewellery"
                                  className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'jewellery' && showAddForm && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <h2 className="font-semibold text-gray-800 text-lg">{editingId ? 'Edit Jewellery' : 'Add New Jewellery'}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Jewel ID (Unique Code)*</label>
                      <FieldUpdateBtn field="jewelId" value={formData.jewelId} />
                    </div>
                    <input required type="text" name="jewelId" value={formData.jewelId} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" placeholder="e.g. JWL-12345" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Product Name*</label>
                      <FieldUpdateBtn field="name" value={formData.name} />
                    </div>
                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" placeholder="e.g. Royal Kundan Choker" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Rental Price (₹)*</label>
                      <FieldUpdateBtn field="price" value={formData.price} />
                    </div>
                    <input required type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" placeholder="e.g. 1500" />
                    <div className="flex items-center gap-2 mt-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.showPrice !== false}
                          onChange={e => setFormData(prev => ({ ...prev, showPrice: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      <div className="flex justify-between items-center flex-1">
                        <span className="text-xs text-gray-600">Show price on detail page</span>
                        <FieldUpdateBtn field="showPrice" value={formData.showPrice !== false} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Security Deposit (₹)*</label>
                      <FieldUpdateBtn field="deposit" value={formData.deposit} />
                    </div>
                    <input required type="number" name="deposit" value={formData.deposit} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" placeholder="e.g. 500" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Category* (select multiple)</label>
                      <FieldUpdateBtn field="category" value={formData.category} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {(categories || []).map(c => (
                        <label key={c._id} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="category"
                            value={c.name}
                            checked={Array.isArray(formData.category) ? formData.category.includes(c.name) : formData.category === c.name}
                            onChange={e => {
                              const checked = e.target.checked;
                              setFormData(prev => ({
                                ...prev,
                                category: checked
                                  ? [...(Array.isArray(prev.category) ? prev.category : prev.category ? [prev.category] : []), c.name]
                                  : (Array.isArray(prev.category) ? prev.category : [prev.category]).filter(x => x !== c.name)
                              }));
                            }}
                            className="mr-2 h-4 w-4 text-[#B07A85] border-gray-300 rounded focus:ring-[#B07A85]"
                          />
                          <span className="text-sm text-gray-700">{c.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Occasion Type (select multiple)</label>
                        <FieldUpdateBtn field="occasion" value={formData.occasion} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {occasions.map(o => (
                          <label key={o} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="occasion"
                              value={o}
                              checked={formData.occasion?.includes(o)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  occasion: checked
                                    ? [...(prev.occasion || []), o]
                                    : (prev.occasion || []).filter(x => x !== o)
                                }));
                              }}
                              className="mr-2 h-4 w-4 text-[#B07A85] border-gray-300 rounded focus:ring-[#B07A85]"
                            />
                            <span className="text-sm text-gray-700">{o}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Type* (select multiple)</label>
                        <FieldUpdateBtn field="type" value={formData.type} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {types.map(t => (
                          <label key={t} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="type"
                              value={t}
                              checked={formData.type?.includes(t)}
                              onChange={e => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  type: checked
                                    ? [...(prev.type || []), t]
                                    : (prev.type || []).filter(x => x !== t)
                                }));
                              }}
                              className="mr-2 h-4 w-4 text-[#B07A85] border-gray-300 rounded focus:ring-[#B07A85]"
                            />
                            <span className="text-sm text-gray-700">{t}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Stone Name (multiple) */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Stone Name(s)</label>
                        <FieldUpdateBtn field="stoneName" value={formData.stoneName} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Crystal", "Sapphire", "Pink Morganite", "Ruby", "Emerald", "Jade", "Kemp Stone", "Pearl",
                          "Moissanite Stone", "Basra Pearl", "Kundan", "Glass Beads", "AD Stone", "Cubic Zirconia", "Amethyst", "Amber", "Pink Topaz", "Navarathna", "Polki Stone", "Polki Diamond", "Rose Quartz", "Green Onyx"
                        ].map(s => (
                          <label key={s} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="stoneName"
                              value={s}
                              checked={formData.stoneName?.includes(s)}
                              onChange={e => {
                            const checked = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              stoneName: checked
                                ? [...(prev.stoneName || []), s]
                                : (prev.stoneName || []).filter(x => x !== s)
                            }));
                          }}
                              className="mr-2 h-4 w-4 text-[#B07A85] border-gray-300 rounded focus:ring-[#B07A85]"
                            />
                            <span className="text-sm text-gray-700">{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    {/* Stone Colour */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-sm font-medium text-gray-700">Stone Colour(s)</label>
                        <FieldUpdateBtn field="stoneColour" value={formData.stoneColour} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          "Clear", "Blue", "Pink", "Red", "Green", "Yellow", "White", "Gold", "Various", "Violete", "Orange", "Black", "Purple", "Silver"
                        ].map(c => (
                          <label key={c} className="inline-flex items-center">
                            <input
                              type="checkbox"
                              name="stoneColour"
                              value={c}
                              checked={Array.isArray(formData.stoneColour) ? formData.stoneColour.includes(c) : false}
                              onChange={e => {
                                const checked = e.target.checked;
                                setFormData(prev => ({
                                  ...prev,
                                  stoneColour: checked
                                    ? [...(Array.isArray(prev.stoneColour) ? prev.stoneColour : []), c]
                                    : (Array.isArray(prev.stoneColour) ? prev.stoneColour : []).filter(x => x !== c)
                                }));
                              }}
                              className="mr-2 h-4 w-4 text-[#B07A85] border-gray-300 rounded focus:ring-[#B07A85]"
                            />
                            <span className="text-sm text-gray-700">{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Colour*</label>
                      <FieldUpdateBtn field="colour" value={formData.colour} />
                    </div>
                    <select name="colour" value={formData.colour} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm bg-white">
                      {colours.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Material (Optional)</label>
                      <FieldUpdateBtn field="material" value={formData.material} />
                    </div>
<select name="material" value={formData.material || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm">
  <option value="">Select material</option>
  <option value="Alloy">Alloy</option>
  <option value="Brass">Brass</option>
  <option value="Metal">Metal</option>
  <option value="Zinc Alloy">Zinc Alloy</option>
  <option value="Copper">Copper</option>
  <option value="Stainless Steel">Stainless Steel</option>
</select>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Size (Optional)</label>
                      <FieldUpdateBtn field="size" value={formData.size} />
                    </div>
                    <input type="text" name="size" value={formData.size || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" placeholder="e.g. Adjustable" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium text-gray-700">Finish (Optional)</label>
                      <FieldUpdateBtn field="finish" value={formData.finish} />
                    </div>
                    <select name="finish" value={formData.finish || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm">
                      <option value="">Select finish</option>
                      <option value="Antique">Antique</option>
                      <option value="Silver">Silver</option>
                      <option value="Gold">Gold</option>
                      <option value="Mehandhi">Mehandhi</option>
                    </select>
                  </div>
                </div>

                {/* Internal Records Section */}
                <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/40">
                  <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                    Internal Records (Admin Only)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-600">Purchase Amount (₹)</label>
                        <FieldUpdateBtn field="purchaseAmount" value={formData.purchaseAmount} />
                      </div>
                      <input type="number" name="purchaseAmount" value={formData.purchaseAmount || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white" placeholder="Amount paid to buy" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-600">Sales Amount (₹)</label>
                        <FieldUpdateBtn field="salesAmount" value={formData.salesAmount} />
                      </div>
                      <input type="number" name="salesAmount" value={formData.salesAmount || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white" placeholder="Amount if sold" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-600">Deposit (₹)</label>
                        <FieldUpdateBtn field="deposit" value={formData.deposit} />
                      </div>
                      <input type="number" name="deposit" value={formData.deposit || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white" placeholder="Security deposit" />
                    </div>
                    <div className="col-span-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-medium text-gray-600">Shop Name (Where Purchased)</label>
                        <FieldUpdateBtn field="shopName" value={formData.shopName} />
                      </div>
                      <input type="text" name="shopName" value={formData.shopName || ''} onChange={handleInputChange} className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white" placeholder="e.g. Lalitha Jewellers, Chennai" />
                    </div>
                  </div>
                </div>

                {/* Media Fields - Modern Drag & Drop Uploader */}
                <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-800">Upload Media (Images & Videos) (Optional)</label>
                    <p className="text-xs text-gray-500 mt-1">
                      {editingId ? "Leave empty to keep existing media, or drag & drop files to append." : "If providing media, first item MUST be an image. Drag and drop multiple files to upload."}
                    </p>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('media-file-input').click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 min-h-[160px] text-center ${
                      dragActive 
                        ? 'border-[#B07A85] bg-[#FFF8F3] scale-[0.99] shadow-inner' 
                        : 'border-gray-300 bg-white hover:border-[#B07A85] hover:bg-gray-50/50 hover:shadow-sm'
                    }`}
                  >
                    <input 
                      id="media-file-input"
                      type="file" 
                      multiple 
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    
                    <div className="w-12 h-12 rounded-full bg-[#FFF8F3] flex items-center justify-center mb-3 text-[#B07A85]">
                      <Upload size={22} className="animate-bounce" style={{ animationDuration: '2s' }} />
                    </div>
                    
                    <p className="text-sm font-semibold text-gray-700">
                      Drag & drop images/videos here, or <span className="text-[#B07A85] underline">browse files</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Supports PNG, JPG, WEBP, MP4, WEBM
                    </p>

                    {dragActive && (
                      <div className="absolute inset-0 rounded-xl bg-[#B07A85]/5 flex items-center justify-center pointer-events-none">
                        <span className="text-[#B07A85] font-bold text-sm bg-white px-4 py-2 rounded-lg shadow-md border border-[#B07A85]/20 animate-pulse">
                          Drop files here!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Preview Grid */}
                  {mediaList.length > 0 && (
                    <div className="mt-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Added Media ({mediaList.length})</span>
                        <button 
                          type="button" 
                          onClick={() => setMediaList([])}
                          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {mediaList.map((media, index) => {
                          const isVideo = media.type === 'video';
                          const fileUrl = media.file ? URL.createObjectURL(media.file) : media.url;

                          return (
                             <div 
                               key={index} 
                               draggable="true"
                               onDragStart={(e) => handlePreviewDragStart(e, index)}
                               onDragOver={(e) => handlePreviewDragOver(e, index)}
                               onDrop={(e) => handlePreviewDrop(e, index)}
                               className={`relative group border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all aspect-square flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                                 draggedItemIndex === index ? 'opacity-40 border-[#B07A85]' : ''
                               }`}
                               onClick={(e) => e.stopPropagation()}
                             >
                              
                              {/* Order Badge */}
                              <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                Slot {index + 1} {index === 0 && !editingId && " (Cover)"}
                              </div>

                              {/* Remove Button */}
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeMediaField(index);
                                }}
                                className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-red-50 hover:bg-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all shadow-sm"
                              >
                                <X size={14} />
                              </button>

                              {/* Thumbnail */}
                              <div className="flex-1 w-full bg-gray-50 flex items-center justify-center overflow-hidden">
                                {isVideo ? (
                                  <div className="relative w-full h-full">
                                    <video src={fileUrl} className="w-full h-full object-cover" muted playsInline />
                                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                      <div className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                                        <Film size={16} />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                                )}
                              </div>

                              {/* Bottom label */}
                              <div className="p-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 truncate flex justify-between items-center font-medium">
                                <span className="truncate max-w-[70%]">{media.file?.name}</span>
                                <span className={`px-1.5 py-0.5 rounded font-semibold text-[8px] uppercase tracking-wider ${
                                  isVideo ? 'bg-indigo-50 text-indigo-600' : 'bg-[#FFF8F3] text-[#B07A85]'
                                }`}>
                                  {media.type}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* First item validation tip */}
                      {!editingId && mediaList.length > 0 && mediaList[0].type !== 'image' && (
                        <p className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
                          ⚠️ Warning: Slot 1 MUST be an image (currently a video). Please remove or rearrange files so the first slot is an image.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-gray-700">Description*</label>
                    <FieldUpdateBtn field="description" value={formData.description} />
                  </div>
                  <textarea required rows={4} name="description" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" placeholder="Detailed product description..."></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-6 py-2 bg-[#B07A85] text-white rounded-lg text-sm font-medium hover:bg-[#9E6A75] transition-colors flex items-center gap-2">
                    {loading ? 'Saving...' : <><Save size={16} /> {editingId ? 'Save All Changes' : 'Save Product'}</>}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">User Details & Carts</h2>
              </div>
              
              {usersLoading ? (
                <div className="p-12 text-center text-gray-500">Loading registered users...</div>
              ) : users.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No users registered yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Mobile / Phone</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Cart Items</th>
                        <th className="px-6 py-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{u.name || 'Customer'}</td>
                          <td className="px-6 py-4 text-gray-600">{u.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-gray-600">{u.email || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'bg-gray-100 text-gray-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 font-medium">{u.cart?.length || 0} items</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedUserCart({ name: u.name || 'Customer', cart: u.cart || [] })}
                              className="text-xs bg-[#B07A85]/10 text-[#B07A85] px-3.5 py-1.5 rounded-lg hover:bg-[#B07A85] hover:text-white transition-all font-semibold"
                            >
                              View Cart
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800">Manage Categories</h2>
              </div>
              <div className="p-6 border-b border-gray-100">
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newCategoryName} 
                      onChange={(e) => setNewCategoryName(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" 
                      placeholder="e.g. Diamond Collection" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtext <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={newCategorySubtext} 
                      onChange={(e) => setNewCategorySubtext(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" 
                      placeholder="e.g. Timeless Elegance"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setNewCategoryImage(e.target.files[0])}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none text-sm bg-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#FFF8F3] file:text-[#B07A85]" 
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit" 
                      disabled={isAddingCategory}
                      className="flex items-center gap-2 bg-[#B07A85] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm disabled:opacity-50 h-[38px]"
                    >
                      <Plus size={16} /> {isAddingCategory ? 'Adding...' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>
              <div className="p-6">
                {!categories || categories.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No categories found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                      <div key={cat._id} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
                        {/* Edit inline form */}
                        {editingCategory?._id === cat._id ? (
                          <form onSubmit={handleUpdateCategory} className="p-4 flex flex-col gap-3">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                              <input type="text" value={editCategoryName} onChange={e => setEditCategoryName(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85]" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Subtext *</label>
                              <input type="text" value={editCategorySubtext} onChange={e => setEditCategorySubtext(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85]" required />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Replace Image (Optional)</label>
                              <input type="file" accept="image/*" onChange={e => setEditCategoryImage(e.target.files[0])} className="w-full text-xs border border-gray-200 rounded-md py-1 px-2 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#FFF8F3] file:text-[#B07A85]" />
                            </div>
                            <div className="flex gap-2">
                              <button type="submit" disabled={isSavingCategory} className="flex-1 py-1.5 bg-[#B07A85] text-white text-xs font-semibold rounded-lg hover:bg-[#9E6A75] disabled:opacity-50 transition-colors">
                                {isSavingCategory ? 'Saving...' : 'Save Changes'}
                              </button>
                              <button type="button" onClick={() => setEditingCategory(null)} className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div className="p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              {cat.image ? (
                                <img src={cat.image} alt={cat.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-gray-400">
                                  <Package size={20} />
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-gray-800 block">{cat.name}</span>
                                {cat.subtext && <span className="text-xs text-gray-400">{cat.subtext}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openEditCategory(cat)}
                                className="text-[#B07A85] hover:text-[#9E6A75] p-2 rounded-md hover:bg-[#FFF8F3] transition-colors"
                                title="Edit Category"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                                title="Delete Category"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Selected User Cart Modal */}
      {selectedUserCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selectedUserCart.name}'s Cart</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedUserCart.cart.length} items in list</p>
              </div>
              <button 
                onClick={() => setSelectedUserCart(null)} 
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {selectedUserCart.cart.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Their cart is currently empty.</div>
              ) : (
                selectedUserCart.cart.map((item, idx) => (
                  <div key={item._id || idx} className="flex gap-4 p-3 rounded-xl border border-gray-100 items-center">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      <img 
                        src={item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{item.type || item.category}</p>
                      <h4 className="font-bold text-gray-800 text-sm truncate leading-snug mt-0.5">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Code: {item.jewelId || 'N/A'}</p>
                    </div>
                    <div className="font-bold text-sm text-gray-950">
                      ₹{item.rentalPrice?.toFixed(2) || item.price?.toFixed(2)}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-sm">
              <span className="font-semibold text-gray-500">Estimated Rental Total:</span>
              <span className="font-bold text-lg text-gray-950">
                ₹{selectedUserCart.cart.reduce((total, item) => total + (item.rentalPrice || item.price || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Jewel Details Modal (Internal) */}
      {viewingJewel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" onClick={() => setViewingJewel(null)}></div>
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            
            <button 
              onClick={() => setViewingJewel(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 text-gray-800 transition-colors"
            >
              <X size={18} />
            </button>

            {/* Left: Image/Video */}
            <div className="w-full md:w-2/5 h-64 md:h-auto bg-gray-100 flex-shrink-0 relative">
              {viewingJewel.images?.[0]?.type === 'video' ? (
                <video src={viewingJewel.images[0].url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <img src={viewingJewel.images?.[0]?.url || viewingJewel.images?.[0]} alt={viewingJewel.name} className="w-full h-full object-cover" />
              )}
            </div>

            {/* Right: Details */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="mb-6">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wider">
                  Code: {viewingJewel.jewelId}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{viewingJewel.name}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{viewingJewel.description || 'No description provided.'}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-6 border-y border-gray-100 py-6 mb-6">
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Category</h4>
                  <p className="font-medium text-gray-900">{viewingJewel.category || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Type</h4>
                  <p className="font-medium text-gray-900">{Array.isArray(viewingJewel.type) ? viewingJewel.type.join(', ') : (viewingJewel.type || 'N/A')}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Material</h4>
                  <p className="font-medium text-gray-900">{viewingJewel.material || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Finish</h4>
                  <p className="font-medium text-gray-900">{viewingJewel.finish || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Stone Name</h4>
                  <p className="font-medium text-gray-900">{Array.isArray(viewingJewel.stoneName) ? viewingJewel.stoneName.join(', ') : (viewingJewel.stoneName || 'N/A')}</p>
                </div>
                <div>
                  <h4 className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Stone Colour</h4>
                  <p className="font-medium text-gray-900">{Array.isArray(viewingJewel.stoneColour) ? viewingJewel.stoneColour.join(', ') : (viewingJewel.stoneColour || 'N/A')}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-green-500 rounded-full"></span>
                  Financial Details (Internal)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Public Price</span>
                    <span className="block font-bold text-lg text-gray-900">₹{viewingJewel.rentalPrice || viewingJewel.price || 0}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Deposit</span>
                    <span className="block font-bold text-lg text-gray-900">₹{viewingJewel.deposit || 0}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Purchase Amt</span>
                    <span className="block font-bold text-lg text-red-600">₹{viewingJewel.purchaseAmount || 0}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-gray-500 mb-1">Sales Amt</span>
                    <span className="block font-bold text-lg text-green-600">₹{viewingJewel.salesAmount || 0}</span>
                  </div>
                </div>
              </div>

              {viewingJewel.shopName && (
                <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                  <Package size={18} className="text-blue-500" />
                  <span>Sourced from: <strong className="text-gray-900">{viewingJewel.shopName}</strong></span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
