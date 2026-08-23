import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Package, Calendar, Users, LogOut, Plus, ArrowLeft, Save, X, List, Search, Upload, Film, Image, Check, Pencil, Trash2, Eye, Tag, Edit, FileText, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CategoryContext from '../context/CategoryContext';
import { useContext } from 'react';
import API_BASE_URL from '../config/api';

const AdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const { categories, refreshCategories, addCategory, deleteCategory, updateCategory } = useContext(CategoryContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserCart, setSelectedUserCart] = useState(null);
  
  const [guestCarts, setGuestCarts] = useState([]);
  const [guestCartsLoading, setGuestCartsLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);
  const [guestCartFilter, setGuestCartFilter] = useState('active');

  const [showAddBookingModal, setShowAddBookingModal] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [newBookingData, setNewBookingData] = useState({
    bookingCustomId: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    bookingPlace: '',
    bookingDate: new Date().toISOString().split('T')[0],
    eventDate: '',
    pickupDate: '',
    returnDate: '',
    discountPercent: 0,
    discountAmount: 0,
    advancePaid: 0,
    depositAmount: 0,
    paymentStatus: 'Pending',
    status: 'pending',
    notes: '',
    jewelleryIds: [],
    tempJewelleries: []
  });
  const [tempJewelInput, setTempJewelInput] = useState({
    name: '',
    code: '',
    rentalPrice: '',
    deposit: '',
    image: ''
  });
  const [jewelCodeSearch, setJewelCodeSearch] = useState('');
  const [addBookingLoading, setAddBookingLoading] = useState(false);
  const [showAddTempJewelModal, setShowAddTempJewelModal] = useState(false);
  const [showInvoiceBooking, setShowInvoiceBooking] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);

  const handleOpenInvoice = (b) => {
    const customId = b.bookingCustomId || `BK-${String(b._id || '').slice(-4)}`;
    const regularItems = Array.isArray(b.jewelleryIds) ? b.jewelleryIds : [];
    const tempItems = Array.isArray(b.tempJewelleries) ? b.tempJewelleries : [];
    const combined = [
      ...regularItems.map(item => ({ ...item, isTemp: false })),
      ...tempItems.map(item => ({ ...item, isTemp: true }))
    ];
    setInvoiceItems(combined);
    setShowInvoiceBooking({ ...b, customId });
  };

  const handleMoveInvoiceItemUp = (idx) => {
    if (idx <= 0) return;
    setInvoiceItems(prev => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx - 1];
      copy[idx - 1] = temp;
      return copy;
    });
  };

  const handleMoveInvoiceItemDown = (idx) => {
    setInvoiceItems(prev => {
      if (idx >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[idx + 1];
      copy[idx + 1] = temp;
      return copy;
    });
  };

  const [selectedAdminCategory, setSelectedAdminCategory] = useState(null);
  const [selectedAdminAccessorySubtype, setSelectedAdminAccessorySubtype] = useState(null);
  const [adminJewelleries, setAdminJewelleries] = useState([]);
  const [adminJewelleriesLoading, setAdminJewelleriesLoading] = useState(false);
  const [adminJewellerySearch, setAdminJewellerySearch] = useState('');
  const [viewingJewel, setViewingJewel] = useState(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const fetchAllJewelleries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=1000`);
      const result = await res.json();
      if (result.success) {
        setAdminJewelleries(result.data);
      }
    } catch (e) {
      console.error("Error fetching all jewelleries for selection:", e);
    }
  };

  const handleOpenEditBooking = (b) => {
    setEditingBookingId(b._id);

    const bItems = Array.isArray(b.jewelleryIds) ? b.jewelleryIds : [];
    const bTempItems = Array.isArray(b.tempJewelleries) ? b.tempJewelleries : [];
    const subtotal = bItems.reduce((sum, j) => sum + (j.rentalPrice || j.price || 0), 0) +
                     bTempItems.reduce((sum, j) => sum + (j.rentalPrice || 0), 0);
    const dPercent = b.discountPercent ?? (b.discountAmount && subtotal ? Math.round((b.discountAmount / subtotal) * 100) : 0);

    setNewBookingData({
      bookingCustomId: b.bookingCustomId || `BK-${String(b._id || '').slice(-4)}`,
      customerName: b.userId?.name || b.customerDetails?.name || '',
      customerPhone: b.userId?.phone || b.customerDetails?.phone || '',
      customerAddress: b.customerDetails?.address || '',
      bookingPlace: b.bookingPlace || '',
      bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      eventDate: b.eventDate ? new Date(b.eventDate).toISOString().split('T')[0] : '',
      pickupDate: b.pickupDate ? new Date(b.pickupDate).toISOString().split('T')[0] : '',
      returnDate: b.returnDate ? new Date(b.returnDate).toISOString().split('T')[0] : '',
      discountPercent: dPercent,
      discountAmount: b.discountAmount || 0,
      advancePaid: b.advancePaid || 0,
      depositAmount: b.depositAmount || 0,
      paymentStatus: b.paymentStatus || 'Pending',
      status: b.status || 'pending',
      notes: b.notes || '',
      jewelleryIds: bItems.map(item => item._id || item),
      tempJewelleries: bTempItems
    });
    if (!adminJewelleries.length) fetchAllJewelleries();
    setShowAddBookingModal(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking entry?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await res.json();
      if (result.success) {
        setBookings(prev => prev.filter(b => b._id !== bookingId));
        alert('Booking entry deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete booking.');
      }
    } catch (e) {
      console.error('Error deleting booking:', e);
      alert('Failed to delete booking. Please try again.');
    }
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    if (!newBookingData.jewelleryIds.length && (!newBookingData.tempJewelleries || !newBookingData.tempJewelleries.length)) {
      alert('Please select at least one jewellery item by Jewel Code or add a temporary item.');
      return;
    }
    if (!newBookingData.customerName) {
      alert('Please enter customer name.');
      return;
    }

    setAddBookingLoading(true);

    const selectedJewels = adminJewelleries.filter(j => newBookingData.jewelleryIds.includes(j._id));
    const regularRentalAmount = selectedJewels.reduce((sum, j) => sum + (j.rentalPrice || j.price || 0), 0);
    const tempRentalAmount = (newBookingData.tempJewelleries || []).reduce((sum, j) => sum + (parseFloat(j.rentalPrice) || 0), 0);
    const rentalAmount = regularRentalAmount + tempRentalAmount;

    const dPercent = parseFloat(newBookingData.discountPercent) || 0;
    const discountAmount = (rentalAmount * dPercent) / 100;
    const netAmount = Math.max(0, rentalAmount - discountAmount);
    const advancePaid = parseFloat(newBookingData.advancePaid) || 0;
    const balanceAmount = Math.max(0, netAmount - advancePaid);
    const depositAmount = parseFloat(newBookingData.depositAmount) || 0;

    const url = editingBookingId 
      ? `${API_BASE_URL}/api/bookings/${editingBookingId}`
      : `${API_BASE_URL}/api/bookings`;
    const method = editingBookingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingCustomId: newBookingData.bookingCustomId || `BK-${String(bookings.length + 1).padStart(3, '0')}`,
          jewelleryIds: newBookingData.jewelleryIds,
          tempJewelleries: newBookingData.tempJewelleries || [],
          bookingDate: newBookingData.bookingDate,
          eventDate: newBookingData.eventDate || null,
          pickupDate: newBookingData.pickupDate || null,
          returnDate: newBookingData.returnDate || null,
          bookingPlace: newBookingData.bookingPlace,
          status: newBookingData.status,
          paymentStatus: newBookingData.paymentStatus,
          rentalAmount,
          discountPercent: dPercent,
          discountAmount,
          totalAmount: netAmount,
          advancePaid,
          balanceAmount,
          depositAmount,
          notes: newBookingData.notes,
          customerDetails: {
            name: newBookingData.customerName,
            phone: newBookingData.customerPhone,
            address: newBookingData.customerAddress
          }
        })
      });

      const result = await res.json();
      if (result.success) {
        setShowAddBookingModal(false);
        setEditingBookingId(null);
        setNewBookingData({
          bookingCustomId: '',
          customerName: '',
          customerPhone: '',
          customerAddress: '',
          bookingPlace: '',
          bookingDate: new Date().toISOString().split('T')[0],
          eventDate: '',
          pickupDate: '',
          returnDate: '',
          discountPercent: 0,
          discountAmount: 0,
          advancePaid: 0,
          depositAmount: 0,
          paymentStatus: 'Pending',
          status: 'pending',
          notes: '',
          jewelleryIds: [],
          tempJewelleries: []
        });
        setJewelCodeSearch('');

        // Refresh bookings list
        const bRes = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bResult = await bRes.json();
        if (bResult.success) setBookings(bResult.data);
        alert(editingBookingId ? 'Booking updated successfully!' : 'New booking created successfully!');
      } else {
        alert(result.error || 'Failed to save booking.');
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Failed to save booking. Please try again.');
    } finally {
      setAddBookingLoading(false);
    }
  };

  useEffect(() => {
    // Reset search query and sub-type when changing categories
    setAdminJewellerySearch('');
    setSelectedAdminAccessorySubtype(null);
  }, [selectedAdminCategory]);

  useEffect(() => {
    if (activeTab === 'jewellery' && selectedAdminCategory && !showAddForm) {
      if (selectedAdminCategory.toLowerCase() === 'accessories' && !selectedAdminAccessorySubtype) {
        setAdminJewelleries([]);
        return;
      }
      const fetchJewels = async () => {
        setAdminJewelleriesLoading(true);
        try {
          const isType = categories.find(c => c.name === selectedAdminCategory)?.showInSection === 'type';
          const queryParam = isType ? 'type' : 'category';
          let url = `${API_BASE_URL}/api/jewellery?${queryParam}=${encodeURIComponent(selectedAdminCategory)}&limit=500`;
          if (selectedAdminCategory.toLowerCase() === 'accessories' && selectedAdminAccessorySubtype) {
            url += `&accessoryType=${encodeURIComponent(selectedAdminAccessorySubtype)}`;
          }
          const res = await fetch(url);
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
  }, [activeTab, selectedAdminCategory, selectedAdminAccessorySubtype, showAddForm, categories]);

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
    const fetchDashboardData = async () => {
      // Fetch bookings
      setBookingsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setBookings(result.data);
      } catch (e) {
        console.error("Error fetching bookings:", e);
      } finally {
        setBookingsLoading(false);
      }

      // Fetch users
      setUsersLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setUsers(result.data);
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setUsersLoading(false);
      }

      // Fetch guest carts
      setGuestCartsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/cart/all-guests`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) setGuestCarts(result.data);
      } catch (e) {
        console.error("Error fetching guest carts:", e);
      } finally {
        setGuestCartsLoading(false);
      }

      // Fetch all jewelleries
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=1000`);
        const result = await res.json();
        if (result.success) {
          setAdminJewelleries(result.data);
        }
      } catch (e) {
        console.error("Error fetching all jewelleries for selection:", e);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [activeTab, token]);

  const occasions = ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"];
  const categoryNames = categories.filter(c => c.showInSection !== 'type').map(c => c.name);
  const typeNames = categories.filter(c => c.showInSection === 'type').map(c => c.name);
  const colours = ["Gold", "Silver", "Rose Gold", "Emerald Green", "Ruby Red", "Mehndi Polish"];

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubtext, setNewCategorySubtext] = useState('');
  const [newCategoryShowInSection, setNewCategoryShowInSection] = useState('category');
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
      formData.append('showInSection', newCategoryShowInSection);
      if (newCategoryImage) {
        formData.append('image', newCategoryImage);
      }
      await addCategory(formData, token);
      setNewCategoryName('');
      setNewCategorySubtext('');
      setNewCategoryShowInSection('category');
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
  const [editCategoryShowInSection, setEditCategoryShowInSection] = useState('category');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setEditCategoryName(cat.name);
    setEditCategorySubtext(cat.subtext || '');
    setEditCategoryShowInSection(cat.showInSection || 'category');
    setEditCategoryImage(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setIsSavingCategory(true);
    try {
      const formData = new FormData();
      formData.append('name', editCategoryName);
      formData.append('subtext', editCategorySubtext);
      formData.append('showInSection', editCategoryShowInSection);
      if (editCategoryImage) formData.append('image', editCategoryImage);
      await updateCategory(editingCategory._id, formData, token);
      setEditingCategory(null);
    } catch (err) {
      alert(err?.response?.data?.error || 'Error updating category');
    } finally {
      setIsSavingCategory(false);
    }
  };

  useEffect(() => {
    if (refreshCategories) {
      refreshCategories();
    }
  }, [activeTab]);

  // ── Jewellery Types state (reuses CategoryContext with showInSection='type') ──
  const defaultTypeNames = [
    "Semi Bridal & Combo Sets",
    "Full Bridal Set",
    "Choker & Necklace",
    "Long Haram",
    "Bangles & Bracelets",
    "Accessories"
  ];
  const typesList = categories.filter(c => c.showInSection === 'type' || defaultTypeNames.includes(c.name));
  const [typesLoading] = useState(false);
  const [typeError, setTypeError] = useState('');
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [isSavingType, setIsSavingType] = useState(false);

  const handleSaveType = async () => {
    if (!newTypeName.trim()) { setTypeError('Please enter a type name.'); return; }
    setTypeError('');
    setIsSavingType(true);
    try {
      const formDataType = new FormData();
      formDataType.append('name', newTypeName.trim());
      formDataType.append('showInSection', 'type');
      if (editingTypeId) {
        await updateCategory(editingTypeId, formDataType, token);
      } else {
        await addCategory(formDataType, token);
      }
      setShowTypeForm(false);
      setNewTypeName('');
      setEditingTypeId(null);
    } catch (err) {
      setTypeError('Error saving type. Please try again.');
    } finally {
      setIsSavingType(false);
    }
  };

  const handleDeleteType = async (id) => {
    if (!window.confirm('Delete this jewellery type?')) return;
    try {
      await deleteCategory(id, token);
    } catch (err) {
      alert('Error deleting type.');
    }
  };

  const [formData, setFormData] = useState({
    jewelId: '',
    name: '',
    description: '',
    price: '',
    deposit: '',
    category: ['victorian-moissinate'],
    accessoryType: '',
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
          category: ['victorian-moissinate'], type: [], accessoryType: '', occasion: [], colour: 'Gold',
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
          <button 
            onClick={() => { setActiveTab('types'); setShowAddForm(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'types' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Tag size={20} /> Jewellery Types
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
          {activeTab === 'dashboard' && (() => {
            const totalJewelleries = adminJewelleries.length;
            const totalBookings = bookings.length;
            const pendingBookings = bookings.filter(b => (b.status || 'pending').toLowerCase() === 'pending').length;
            const confirmedBookings = bookings.filter(b => ['confirmed', 'approved'].includes((b.status || '').toLowerCase())).length;
            const ineventBookings = bookings.filter(b => (b.status || '').toLowerCase() === 'inevent').length;
            const completedBookings = bookings.filter(b => (b.status || '').toLowerCase() === 'completed').length;
            const totalRevenue = bookings
              .filter(b => (b.status || '').toLowerCase() !== 'rejected')
              .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

            return (
              <div className="space-y-8 font-sans">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#B07A85] flex-shrink-0">
                      <Package size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Jewellery</div>
                      <div className="text-2xl font-bold text-gray-900 mt-0.5">{totalJewelleries}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</div>
                      <div className="text-2xl font-bold text-gray-900 mt-0.5">{totalBookings}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <span className="text-xl font-bold">₹</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Revenue</div>
                      <div className="text-2xl font-bold text-emerald-600 mt-0.5">₹{totalRevenue.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600 flex-shrink-0">
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Bookings</div>
                      <div className="text-2xl font-bold text-rose-600 mt-0.5">{pendingBookings}</div>
                    </div>
                  </div>
                </div>

                {/* Booking Status Sub-analysis */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div className="text-center p-2">
                    <span className="text-xs text-gray-500 font-medium">Pending Requests</span>
                    <strong className="block text-lg text-blue-700 mt-0.5">{pendingBookings}</strong>
                  </div>
                  <div className="text-center p-2 border-l border-gray-200">
                    <span className="text-xs text-gray-500 font-medium">Confirmed / Approved</span>
                    <strong className="block text-lg text-emerald-700 mt-0.5">{confirmedBookings}</strong>
                  </div>
                  <div className="text-center p-2 border-l border-gray-200">
                    <span className="text-xs text-gray-500 font-medium">In Event (Rented Out)</span>
                    <strong className="block text-lg text-amber-800 mt-0.5">{ineventBookings}</strong>
                  </div>
                  <div className="text-center p-2 border-l border-gray-200">
                    <span className="text-xs text-gray-500 font-medium">Completed Bookings</span>
                    <strong className="block text-lg text-indigo-700 mt-0.5">{completedBookings}</strong>
                  </div>
                </div>

                {/* Bottom section: Recent Bookings & Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Bookings List */}
                  <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                      <h3 className="font-semibold text-gray-800 text-sm">Recent Booking Entries</h3>
                      <button 
                        onClick={() => setActiveTab('bookings')} 
                        className="text-xs text-[#B07A85] font-bold hover:underline"
                      >
                        View All Bookings
                      </button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {bookings.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400">No booking entries recorded yet.</div>
                      ) : (
                        bookings.slice(0, 5).map((b, idx) => {
                          const customId = b.bookingCustomId || `BK-${String(idx + 1).padStart(3, '0')}`;
                          return (
                            <div key={b._id} className="p-4 flex items-center justify-between hover:bg-gray-50/40 transition-colors">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-gray-900">{customId}</span>
                                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium">
                                    {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-gray-800 mt-1">
                                  {b.userId?.name || b.customerDetails?.name || 'Guest Customer'} 
                                  <span className="text-gray-400 font-normal ml-1.5">({b.userId?.phone || b.customerDetails?.phone || 'No phone'})</span>
                                </p>
                                <p className="text-[11px] text-[#B07A85] font-medium mt-0.5 truncate max-w-xs">
                                  {Array.isArray(b.jewelleryIds) ? b.jewelleryIds.map(item => item.name).join(', ') : 'No items'}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-gray-900">₹{(b.totalAmount || 0).toLocaleString()}</div>
                                <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 ${
                                  ['confirmed', 'approved'].includes((b.status || '').toLowerCase()) ? 'bg-green-50 text-green-700' :
                                  (b.status || 'pending').toLowerCase() === 'pending' ? 'bg-blue-50 text-blue-700' :
                                  'bg-amber-50 text-amber-800'
                                }`}>
                                  {b.status || 'Pending'}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right side: Quick Action Links & Guest Carts summary */}
                  <div className="space-y-6">
                    {/* Quick Access links */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                      <h3 className="font-semibold text-gray-800 text-sm">Quick Administrative Tasks</h3>
                      <div className="grid grid-cols-2 gap-3 text-center text-xs">
                        <button 
                          onClick={() => {
                            if (!adminJewelleries.length) fetchAllJewelleries();
                            setShowAddBookingModal(true);
                          }}
                          className="p-3 bg-amber-50/50 hover:bg-amber-50 text-amber-900 border border-amber-100 rounded-xl transition-all font-semibold"
                        >
                          + New Booking
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedAdminCategory(null);
                            setActiveTab('jewellery');
                          }}
                          className="p-3 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-xl transition-all font-semibold"
                        >
                          Manage Jewels
                        </button>
                        <button 
                          onClick={() => setActiveTab('categories')}
                          className="p-3 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-xl transition-all font-semibold"
                        >
                          Categories
                        </button>
                        <button 
                          onClick={() => setActiveTab('users')}
                          className="p-3 bg-purple-50/50 hover:bg-purple-50 text-purple-900 border border-purple-100 rounded-xl transition-all font-semibold"
                        >
                          User Inquiries
                        </button>
                      </div>
                    </div>

                    {/* Guest Inquiries activity box */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                      <h3 className="font-semibold text-gray-800 text-sm mb-3">Live Inquiries Summary</h3>
                      <div className="space-y-3.5 text-xs">
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                          <span className="text-gray-500">Registered Users</span>
                          <span className="font-bold text-gray-800">{users.length} users</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-50">
                          <span className="text-gray-500">Guest Visitor Sessions</span>
                          <span className="font-bold text-gray-800">{guestCarts.length} sessions</span>
                        </div>
                        <div className="flex justify-between items-center py-1.5">
                          <span className="text-gray-500">Average Booking Value</span>
                          <span className="font-bold text-gray-800">
                            ₹{totalBookings ? Math.round(totalRevenue / totalBookings).toLocaleString() : '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          
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
                          category: ['victorian-moissinate'], type: [], accessoryType: '', occasion: [], colour: 'Gold',
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
              ) : selectedAdminCategory.toLowerCase() === 'accessories' && !selectedAdminAccessorySubtype ? (
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
                        <h2 className="font-bold text-gray-900 text-lg">Accessories Sub-Types</h2>
                        <p className="text-xs text-gray-500 font-medium">Select a sub-type to view its items</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories'].map(sub => (
                      <div 
                        key={sub} 
                        onClick={() => setSelectedAdminAccessorySubtype(sub)} 
                        className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-[#B07A85] hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group relative"
                      >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mt-2">
                          <Package className="text-[#B07A85]" size={28} />
                        </div>
                        <span className="font-bold text-gray-800 text-lg text-center">{sub.toUpperCase()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          if (selectedAdminCategory.toLowerCase() === 'accessories' && selectedAdminAccessorySubtype) {
                            setSelectedAdminAccessorySubtype(null);
                          } else {
                            setSelectedAdminCategory(null);
                          }
                        }}
                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <div>
                        <h2 className="font-bold text-gray-900 text-lg">
                          {selectedAdminCategory}
                          {selectedAdminAccessorySubtype && ` > ${selectedAdminAccessorySubtype}`}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                          {selectedAdminAccessorySubtype 
                            ? `Viewing all ${selectedAdminAccessorySubtype.toLowerCase()} items`
                            : 'Viewing all jewels in this category'
                          }
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          jewelId: '', name: '', description: '', price: '', deposit: '',
                          category: ['victorian-moissinate'], 
                          type: selectedAdminCategory.toLowerCase() === 'accessories' ? ['Accessories'] : [], 
                          accessoryType: selectedAdminAccessorySubtype || '', 
                          occasion: [], colour: 'Gold',
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
                                      accessoryType: jewel.accessoryType || '',
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
                      {(categories || []).filter(c => c.showInSection !== 'type').map(c => (
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
                        {typeNames.map(t => (
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
                    {formData.type?.includes('Accessories') && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm font-medium text-gray-700">Accessory Sub-Type (select one)</label>
                          <FieldUpdateBtn field="accessoryType" value={formData.accessoryType} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {['Hip Belt', 'Ear Rings', 'Matha Patti', 'Tikka', 'Ear Chain', 'Ring', 'Ring Bracelet', 'Hair Accessories'].map(sub => (
                            <label key={sub} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                name="accessoryType"
                                value={sub}
                                checked={formData.accessoryType === sub}
                                onChange={e => {
                                  const checked = e.target.checked;
                                  setFormData(prev => ({
                                    ...prev,
                                    accessoryType: checked ? sub : ''
                                  }));
                                }}
                                className="mr-2 h-4 w-4 text-[#B07A85] border-gray-300 rounded focus:ring-[#B07A85]"
                              />
                              <span className="text-sm text-gray-700">{sub}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
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
            <div className="space-y-8">
              {/* Registered Customers Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-base">Registered Customers & Order History</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Manage customer profiles, cart items & booking logs</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-[#FFF8F3] text-[#B07A85] rounded-full">
                    {users.length} Customers
                  </span>
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
                          <th className="px-6 py-4">Customer Name</th>
                          <th className="px-6 py-4">Mobile / Phone</th>
                          <th className="px-6 py-4">Email</th>
                          <th className="px-6 py-4">Role</th>
                          <th className="px-6 py-4">Active Cart</th>
                          <th className="px-6 py-4">Order History</th>
                          <th className="px-6 py-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map(u => {
                          const userOrdersList = bookings.filter(b => 
                            (b.userId?._id === u._id || b.userId === u._id || b.customerDetails?.phone === u.phone)
                          );
                          const displayUserOrders = [...userOrdersList];
                          if (displayUserOrders.length === 0 && u.cart && u.cart.length > 0) {
                            displayUserOrders.push({
                              _id: `inquiry-${u._id?.slice(-6) || 'cart'}`,
                              bookingDate: u.updatedAt || new Date(),
                              status: 'Inquiry / Saved Cart',
                              jewelleryIds: u.cart,
                              totalAmount: u.cart.reduce((sum, item) => sum + (item.rentalPrice || item.price || 0), 0)
                            });
                          }
                          return (
                            <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{u.name || 'Customer'}</td>
                              <td className="px-6 py-4 text-gray-600 font-mono text-xs">{u.phone || u.mobile || 'N/A'}</td>
                              <td className="px-6 py-4 text-gray-600">{u.email || 'N/A'}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'bg-gray-100 text-gray-600'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                <span className="px-2 py-0.5 rounded bg-gray-100 text-xs text-gray-700">
                                  {u.cart?.length || 0} items
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-600 font-medium">
                                <span className="px-2 py-0.5 rounded bg-blue-50 text-xs text-blue-700 font-semibold">
                                  {displayUserOrders.length} orders
                                </span>
                              </td>
                              <td className="px-6 py-4 flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedUserCart({ name: u.name || 'Customer', cart: u.cart || [] })}
                                  className="text-xs bg-[#B07A85]/10 text-[#B07A85] px-3 py-1.5 rounded-lg hover:bg-[#B07A85] hover:text-white transition-all font-semibold"
                                >
                                  View Cart
                                </button>
                                <button
                                  onClick={() => setSelectedUserOrders({ user: u, orders: displayUserOrders })}
                                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-semibold"
                                >
                                  View Orders
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Guest Visitors & Accepted Cookies Data Table */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                    <h2 className="font-semibold text-gray-800 text-base">Guest Visitors & Cookie Consent Data</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Tracks guest visitors who accepted cookies and added items to cart</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-green-50 text-green-700 rounded-full">
                    {guestCarts.length} Guest Sessions
                  </span>
                </div>

                {guestCartsLoading ? (
                  <div className="p-12 text-center text-gray-500">Loading guest visitor data...</div>
                ) : guestCarts.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">No guest visitor carts recorded yet.</div>
                ) : (
                  (() => {
                    const groupedMap = new Map();
                    guestCarts.forEach(g => {
                      const vId = g.visitorId || g._id;
                      if (!groupedMap.has(vId)) {
                        groupedMap.set(vId, {
                          _id: g._id,
                          visitorId: vId,
                          cart: [...(g.cart || [])],
                          sessionCount: 1,
                          updatedAt: g.updatedAt
                        });
                      } else {
                        const existing = groupedMap.get(vId);
                        existing.sessionCount += 1;
                        const existingItemIds = new Set(existing.cart.map(item => item._id || item));
                        (g.cart || []).forEach(item => {
                          const itemId = item._id || item;
                          if (!existingItemIds.has(itemId)) {
                            existing.cart.push(item);
                            existingItemIds.add(itemId);
                          }
                        });
                        if (new Date(g.updatedAt) > new Date(existing.updatedAt)) {
                          existing.updatedAt = g.updatedAt;
                        }
                      }
                    });

                    const allGrouped = Array.from(groupedMap.values()).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                    const activeGrouped = allGrouped.filter(g => g.cart && g.cart.length > 0);
                    const displayedList = guestCartFilter === 'active' ? activeGrouped : allGrouped;

                    return (
                      <div>
                        {/* Filter Bar */}
                        <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3 bg-gray-50/30">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setGuestCartFilter('active')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                guestCartFilter === 'active'
                                  ? 'bg-[#B07A85] text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Active Carts With Items ({activeGrouped.length})
                            </button>
                            <button
                              onClick={() => setGuestCartFilter('all')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                guestCartFilter === 'all'
                                  ? 'bg-[#B07A85] text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              All Unique Visitors ({allGrouped.length})
                            </button>
                          </div>
                          <span className="text-xs text-gray-400">
                            {guestCarts.length} Total Raw Sessions Merged Into {allGrouped.length} Unique Visitors
                          </span>
                        </div>

                        {displayedList.length === 0 ? (
                          <div className="p-12 text-center text-gray-500">
                            {guestCartFilter === 'active' ? 'No active guest carts with items currently.' : 'No guest sessions found.'}
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-sm">
                              <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-semibold uppercase text-xs">
                                  <th className="px-6 py-4">Unique Visitor / Session ID</th>
                                  <th className="px-6 py-4">Cookie Consent</th>
                                  <th className="px-6 py-4">Merged Cart Items</th>
                                  <th className="px-6 py-4">Order History</th>
                                  <th className="px-6 py-4">Last Activity</th>
                                  <th className="px-6 py-4">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {displayedList.map(g => {
                                  const visitorOrdersList = bookings.filter(b => b.visitorId === g.visitorId || (b.customerDetails?.name && b.customerDetails?.name.includes(g.visitorId?.slice(0, 8))));
                                  const displayOrdersList = [...visitorOrdersList];
                                  if (displayOrdersList.length === 0 && g.cart && g.cart.length > 0) {
                                    displayOrdersList.push({
                                      _id: `inquiry-${g.visitorId?.slice(0, 8)}`,
                                      bookingDate: g.updatedAt || new Date(),
                                      status: 'Inquiry / Saved Cart',
                                      jewelleryIds: g.cart,
                                      totalAmount: g.cart.reduce((sum, item) => sum + (item.rentalPrice || item.price || 0), 0)
                                    });
                                  }
                                  return (
                                    <tr key={g.visitorId || g._id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-xs text-gray-900 font-medium">
                                            Visitor #{g.visitorId ? `${g.visitorId.slice(0, 14)}...` : 'Guest'}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                          Accepted Cookies
                                        </span>
                                      </td>
                                      <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                          g.cart?.length > 0 ? 'bg-[#FFF8F3] text-[#B07A85]' : 'bg-gray-100 text-gray-500'
                                        }`}>
                                          {g.cart?.length || 0} items
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-gray-600 font-medium">
                                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-xs">
                                          {displayOrdersList.length} orders
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-xs text-gray-500">
                                        {g.updatedAt ? new Date(g.updatedAt).toLocaleDateString() : 'Recent'}
                                      </td>
                                      <td className="px-6 py-4 flex items-center gap-2">
                                        <button
                                          onClick={() => setSelectedUserCart({ name: `Visitor (${g.visitorId?.slice(0, 8)})`, cart: g.cart || [] })}
                                          className="text-xs bg-[#B07A85]/10 text-[#B07A85] px-3 py-1.5 rounded-lg hover:bg-[#B07A85] hover:text-white transition-all font-semibold"
                                        >
                                          View Cart
                                        </button>
                                        <button
                                          onClick={() => setSelectedUserOrders({ 
                                            user: { name: `Guest (${g.visitorId?.slice(0, 8)})`, phone: 'WhatsApp Guest' }, 
                                            orders: displayOrdersList 
                                          })}
                                          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all font-semibold"
                                        >
                                          View Orders
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            </div>
          )}

          {/* Bookings / All Orders Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                <div>
                  <h2 className="font-semibold text-gray-800 text-base">All Customer Bookings & WhatsApp Inquiries</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Manage customer orders, inquiry logs and add new manual bookings</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {bookings.length} Total Bookings
                  </span>
                  <button
                    onClick={() => {
                      if (!adminJewelleries.length) fetchAllJewelleries();
                      setShowAddBookingModal(true);
                    }}
                    className="px-4 py-2 bg-[#B07A85] text-white text-xs font-semibold rounded-lg hover:bg-[#9E6A75] transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Plus size={15} /> Add New Booking
                  </button>
                </div>
              </div>

              {bookingsLoading ? (
                <div className="p-12 text-center text-gray-500">Loading bookings history...</div>
              ) : bookings.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No bookings recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[11px]">
                        <th className="px-4 py-3.5">Booking ID</th>
                        <th className="px-4 py-3.5">Customer & Phone</th>
                        <th className="px-4 py-3.5">Dates (Event / Pickup / Return)</th>
                        <th className="px-4 py-3.5">Jewellery Code & Name</th>
                        <th className="px-4 py-3.5">Rental ₹</th>
                        <th className="px-4 py-3.5">Advance Paid ₹</th>
                        <th className="px-4 py-3.5">Balance ₹</th>
                        <th className="px-4 py-3.5">Deposit ₹</th>
                        <th className="px-4 py-3.5">Payment Status</th>
                        <th className="px-4 py-3.5">Booking Status</th>
                        <th className="px-4 py-3.5">Notes</th>
                        <th className="px-4 py-3.5 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {bookings.map((b, index) => {
                        const customId = b.bookingCustomId || `BK-${String(index + 1).padStart(3, '0')}`;
                        const statusKey = (b.status || 'pending').toLowerCase();
                        let statusText = 'PENDING';
                        let statusClass = 'bg-blue-50 text-blue-700 border border-blue-200';

                        if (statusKey === 'confirmed' || statusKey === 'approved') {
                          statusText = 'CONFIRMED';
                          statusClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
                        } else if (statusKey === 'inevent') {
                          statusText = 'IN EVENT';
                          statusClass = 'bg-amber-50 text-amber-800 border border-amber-200';
                        } else if (statusKey === 'completed') {
                          statusText = 'COMPLETED';
                          statusClass = 'bg-indigo-50 text-indigo-700 border border-indigo-200';
                        } else if (statusKey === 'rejected') {
                          statusText = 'REJECTED';
                          statusClass = 'bg-rose-50 text-rose-700 border border-rose-200';
                        }

                        const pStatus = b.paymentStatus || 'Pending';
                        let pStatusClass = 'bg-gray-100 text-gray-700';
                        if (pStatus === 'Paid') pStatusClass = 'bg-green-100 text-green-800 font-bold';
                        else if (pStatus === 'Partial') pStatusClass = 'bg-amber-100 text-amber-800 font-bold';

                        const rentalSubtotal = b.rentalAmount || b.totalAmount || 0;
                        const discPercent = b.discountPercent || 0;
                        const discAmt = b.discountAmount || 0;
                        const advPaid = b.advancePaid || 0;
                        const balAmt = b.balanceAmount ?? Math.max(0, (rentalSubtotal - discAmt) - advPaid);
                        const depAmt = b.depositAmount || 0;

                        return (
                          <tr key={b._id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-gray-900">
                              {customId}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-semibold text-gray-900">{b.userId?.name || b.customerDetails?.name || 'Guest Customer'}</p>
                              <p className="text-[11px] text-gray-500 font-mono mt-0.5">{b.userId?.phone || b.customerDetails?.phone || 'N/A'}</p>
                            </td>
                            <td className="px-4 py-3.5 text-[11px]">
                              <p><span className="text-gray-400 font-medium">Event:</span> <strong className="text-gray-800">{b.eventDate ? new Date(b.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}</strong></p>
                              <p className="text-gray-500 mt-0.5">
                                Pickup: {b.pickupDate ? new Date(b.pickupDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'} | Return: {b.returnDate ? new Date(b.returnDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}
                              </p>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="space-y-1 max-w-xs">
                                {Array.isArray(b.jewelleryIds) && b.jewelleryIds.map((item, i) => (
                                  <div key={item._id || i} className="flex items-center gap-2">
                                    <img 
                                      src={item.images?.[0]?.url || (typeof item.images?.[0] === 'string' ? item.images[0] : '') || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'} 
                                      alt={item.name} 
                                      className="w-6 h-6 rounded object-cover flex-shrink-0"
                                    />
                                    <span className="truncate font-medium text-gray-800">{item.name}</span>
                                    {(item.code || item.jewelId) && (
                                      <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200/60 px-1.5 py-0.2 rounded font-semibold">
                                        {item.code || item.jewelId}
                                      </span>
                                    )}
                                  </div>
                                ))}
                                {Array.isArray(b.tempJewelleries) && b.tempJewelleries.map((item, i) => (
                                  <div key={`temp-${i}`} className="flex items-center gap-2 mt-1">
                                    <div className="w-6 h-6 rounded bg-amber-100 flex items-center justify-center flex-shrink-0 text-[10px] text-amber-800 font-bold font-mono">
                                      T
                                    </div>
                                    <span className="truncate font-medium text-amber-900">{item.name} (Temp)</span>
                                    {item.code && (
                                      <span className="text-[10px] font-mono bg-red-50 text-red-800 border border-red-200/60 px-1.5 py-0.2 rounded font-semibold">
                                        {item.code}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-bold text-gray-900">₹{rentalSubtotal ? rentalSubtotal.toLocaleString() : '0'}</p>
                              {discPercent > 0 && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                                  -{discPercent}% (₹{discAmt})
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-3.5 font-semibold text-gray-700">
                              {advPaid > 0 ? `₹${advPaid.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3.5 font-bold text-amber-900">
                              {balAmt > 0 ? `₹${balAmt.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3.5 text-gray-700">
                              {depAmt > 0 ? `₹${depAmt.toLocaleString()}` : '-'}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pStatusClass}`}>
                                {pStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusClass}`}>
                                {statusText}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-gray-600 max-w-[120px] truncate" title={b.notes || ''}>
                              {b.notes || '-'}
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="flex items-center justify-center gap-1.5 font-sans">
                                <button
                                  onClick={() => handleOpenEditBooking(b)}
                                  className="text-[11px] bg-[#B07A85]/10 text-[#B07A85] px-2.5 py-1 rounded-md hover:bg-[#B07A85] hover:text-white transition-all font-semibold flex items-center gap-1"
                                >
                                  <Pencil size={12} /> Edit
                                </button>
                                <button
                                  onClick={() => handleOpenInvoice(b)}
                                  className="text-[11px] bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-all font-semibold flex items-center gap-1"
                                >
                                  <FileText size={12} /> Invoice
                                </button>
                                <button
                                  onClick={() => handleDeleteBooking(b._id)}
                                  className="text-[11px] bg-red-50 text-red-600 px-2.5 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all font-semibold flex items-center gap-1"
                                >
                                  <Trash2 size={12} /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-semibold text-gray-800">Manage Categories & Types</h2>
              </div>
              <div className="p-6 border-b border-gray-100">
                <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Display in Filter Section <span className="text-red-500">*</span></label>
                    <select 
                      value={newCategoryShowInSection} 
                      onChange={(e) => setNewCategoryShowInSection(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm bg-white" 
                      required
                    >
                      <option value="category">Category Filter</option>
                      <option value="type">Jewellery Type Filter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtext (Optional)</label>
                    <input 
                      type="text" 
                      value={newCategorySubtext} 
                      onChange={(e) => setNewCategorySubtext(e.target.value)} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm" 
                      placeholder="e.g. Timeless Elegance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image (Optional)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setNewCategoryImage(e.target.files[0])}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none text-sm bg-white file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#FFF8F3] file:text-[#B07A85]" 
                    />
                  </div>
                  <div className="flex items-end md:col-span-2">
                    <button 
                      type="submit" 
                      disabled={isAddingCategory}
                      className="flex items-center gap-2 bg-[#B07A85] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm disabled:opacity-50 h-[38px]"
                    >
                      <Plus size={16} /> {isAddingCategory ? 'Adding...' : 'Add Item'}
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
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Display in Filter Section *</label>
                              <select 
                                value={editCategoryShowInSection} 
                                onChange={(e) => setEditCategoryShowInSection(e.target.value)} 
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] bg-white" 
                                required
                              >
                                <option value="category">Category Filter</option>
                                <option value="type">Jewellery Type Filter</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 mb-1">Subtext (Optional)</label>
                              <input type="text" value={editCategorySubtext} onChange={e => setEditCategorySubtext(e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85]" />
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
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-[#B07A85]">
                                  {cat.showInSection === 'type' ? <Tag size={20} /> : <Package size={20} />}
                                </div>
                              )}
                              <div>
                                <span className="font-semibold text-gray-800 block text-sm">{cat.name}</span>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  {cat.subtext && <span className="text-[11px] text-gray-400">{cat.subtext}</span>}
                                  <span className={`text-[9px] font-bold uppercase tracking-wider self-start px-1.5 py-0.5 rounded-full ${
                                    cat.showInSection === 'type' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {cat.showInSection === 'type' ? 'Jewellery Type' : 'Category'}
                                  </span>
                                </div>
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

          {/* Jewellery Types Management */}
          {activeTab === 'types' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="font-semibold text-gray-800">Jewellery Types</h2>
                  <p className="text-xs text-gray-400 mt-0.5">These appear in the Jewellery Type filter section</p>
                </div>
                <button
                  onClick={() => {
                    setNewTypeName('');
                    setEditingTypeId(null);
                    setShowTypeForm(true);
                  }}
                  className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm"
                >
                  <Plus size={16} /> Add Type
                </button>
              </div>

              {showTypeForm && (
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5">Type Name</label>
                      <input
                        type="text"
                        value={newTypeName}
                        onChange={e => setNewTypeName(e.target.value)}
                        placeholder="e.g. Bangles, Bracelets..."
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveType}
                        className="flex items-center gap-1.5 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors"
                      >
                        <Save size={14} /> {editingTypeId ? 'Update' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setShowTypeForm(false); setNewTypeName(''); setEditingTypeId(null); }}
                        className="flex items-center gap-1.5 border border-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                      >
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {typeError && (
                <div className="px-6 py-3 bg-red-50 text-red-600 text-sm border-b border-red-100">
                  {typeError}
                </div>
              )}

              <div className="p-6">
                {typesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : typesList.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <List size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No jewellery types yet. Add your first one!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {typesList.map(tp => (
                      <div key={tp._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-[#B07A85]/40 hover:shadow-sm transition-all group">
                        <span className="font-medium text-gray-800 text-sm">{tp.name}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingTypeId(tp._id); setNewTypeName(tp.name); setShowTypeForm(true); }}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit Type"
                          >
                            <Save size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteType(tp._id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <X size={13} />
                          </button>
                        </div>
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

      {/* Selected User Order History Modal */}
      {selectedUserOrders && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{selectedUserOrders.user.name}'s Order History</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Mobile: {selectedUserOrders.user.phone || selectedUserOrders.user.mobile || 'N/A'} • {selectedUserOrders.orders.length} Total Bookings
                </p>
              </div>
              <button 
                onClick={() => setSelectedUserOrders(null)} 
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {selectedUserOrders.orders.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  No booking or order history found for this customer.
                </div>
              ) : (
                selectedUserOrders.orders.map((order, idx) => (
                  <div key={order._id || idx} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50/80 flex flex-wrap justify-between items-center gap-2 border-b border-gray-100 text-xs">
                      <div>
                        <span className="font-semibold text-gray-700">Order ID: </span>
                        <span className="font-mono text-gray-500">#{order._id?.slice(-8) || idx + 1}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Date: </span>
                        <span className="text-gray-500">{order.bookingDate ? new Date(order.bookingDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Booked Jewellery Items:</p>
                      {Array.isArray(order.jewelleryIds) && order.jewelleryIds.map((item, i) => (
                        <div key={item._id || i} className="flex gap-3 items-center text-sm">
                          <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                            <img 
                              src={item.images?.[0]?.url || item.images?.[0] || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'} 
                              alt={item.name} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">Code: {item.code || item.jewelId || 'N/A'}</p>
                          </div>
                          <div className="font-semibold text-gray-800 text-xs">
                            ₹{item.rentalPrice?.toFixed(2) || item.price?.toFixed(2) || 0}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-gray-700">
                      <span>Total Booking Value:</span>
                      <span className="text-sm font-bold text-gray-900">₹{order.totalAmount?.toFixed(2) || 0}</span>
                    </div>
                  </div>
                ))
              )}
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

      {/* Add / Edit Booking Full-Screen Page */}
      {showAddBookingModal && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto flex flex-col">
          <div className="max-w-6xl mx-auto w-full p-6 md:p-10 flex-1 flex flex-col">
            <div className="flex justify-between items-center pb-5 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBookingId ? 'Edit Customer Booking Entry' : 'Add New Customer Rental Booking'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">Record customer rental details, dates, jewel selection, advance, balance & notes</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddBookingModal(false);
                  setEditingBookingId(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <X size={18} /> Close & Exit
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="mt-5 space-y-5">
              {/* Row 1: Booking ID, Customer Name, Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Booking ID</label>
                  <input
                    type="text"
                    placeholder={`e.g. BK-${String(bookings.length + 1).padStart(3, '0')}`}
                    value={newBookingData.bookingCustomId}
                    onChange={e => setNewBookingData(prev => ({ ...prev, bookingCustomId: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Customer Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karthiga akka"
                    value={newBookingData.customerName}
                    onChange={e => setNewBookingData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Customer Mobile / Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 98765xxxxx"
                    value={newBookingData.customerPhone}
                    onChange={e => setNewBookingData(prev => ({ ...prev, customerPhone: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
              </div>

              {/* Row 2: Event Date, Pickup Date, Return Date, Booking Place */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={newBookingData.eventDate}
                    onChange={e => setNewBookingData(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Pickup Date</label>
                  <input
                    type="date"
                    value={newBookingData.pickupDate}
                    onChange={e => setNewBookingData(prev => ({ ...prev, pickupDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Return Date</label>
                  <input
                    type="date"
                    value={newBookingData.returnDate}
                    onChange={e => setNewBookingData(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Booking Place / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Chennai Hall"
                    value={newBookingData.bookingPlace}
                    onChange={e => setNewBookingData(prev => ({ ...prev, bookingPlace: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
              </div>

              {/* Row 3: Jewel Code Selection */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold uppercase text-gray-600">Select Jewellery Items by Jewel Code*</label>
                  <span className="text-xs text-[#B07A85] font-bold">
                    {newBookingData.jewelleryIds.length} Items Selected
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="Search by Jewel Code (e.g. JWL-102, PK024) or Name..."
                  value={jewelCodeSearch}
                  onChange={e => setJewelCodeSearch(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] mb-3 bg-gray-50/50"
                />

                <div className="max-h-44 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100 bg-white">
                  {adminJewelleries
                    .filter(j => {
                      if (!jewelCodeSearch.trim()) return true;
                      const q = jewelCodeSearch.toLowerCase();
                      return (
                        (j.code && j.code.toLowerCase().includes(q)) ||
                        (j.jewelId && j.jewelId.toLowerCase().includes(q)) ||
                        (j.name && j.name.toLowerCase().includes(q))
                      );
                    })
                    .map(j => {
                      const isSelected = newBookingData.jewelleryIds.includes(j._id);
                      const p = j.rentalPrice || j.price || 0;
                      return (
                        <div
                          key={j._id}
                          onClick={() => {
                            setNewBookingData(prev => ({
                              ...prev,
                              jewelleryIds: isSelected
                                ? prev.jewelleryIds.filter(id => id !== j._id)
                                : [...prev.jewelleryIds, j._id]
                            }));
                          }}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#FFF8F3]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={j.images?.[0]?.url || (typeof j.images?.[0] === 'string' ? j.images[0] : '') || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'}
                              alt={j.name}
                              className="w-9 h-9 rounded-lg object-cover"
                            />
                            <div>
                              <p className="text-xs font-semibold text-gray-900 line-clamp-1">{j.name}</p>
                              <p className="text-[11px] text-gray-500 font-mono">
                                Code: <span className="font-bold text-amber-800">{j.code || j.jewelId || 'N/A'}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-800">₹{p}</span>
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                              isSelected ? 'bg-[#B07A85] text-white' : 'border border-gray-300 text-transparent'
                            }`}>
                              ✓
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Custom / Temporary Jewellery Trigger */}
                <div className="mt-4 p-4 bg-[#FFF8F3] rounded-2xl border border-[#B07A85]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Custom / Temporary Jewellery Item</h4>
                    <p className="text-xs text-gray-500">Renting an unlisted item for this booking? Add custom details & image without cluttering main DB catalog.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTempJewelInput({ name: '', code: '', rentalPrice: '', deposit: '', image: '' });
                      setShowAddTempJewelModal(true);
                    }}
                    className="px-5 py-2.5 bg-[#B07A85] hover:bg-[#9E6A75] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap"
                  >
                    + Add Temporary Jewellery
                  </button>
                </div>

                {/* Render listed temp items */}
                {newBookingData.tempJewelleries && newBookingData.tempJewelleries.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Added Temporary Items ({newBookingData.tempJewelleries.length}):</p>
                    {newBookingData.tempJewelleries.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-amber-50/60 border border-amber-200/70 p-3 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-amber-300/80 flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-xs text-amber-800 font-bold font-mono flex-shrink-0">
                              TEMP
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-amber-950 text-sm block">{item.name}</span>
                            <span className="text-[11px] font-mono bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-bold">{item.code || 'NO-CODE'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-gray-900">Rent: ₹{item.rentalPrice}</p>
                            <p className="text-[11px] text-gray-500">Deposit: ₹{item.deposit}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewBookingData(prev => {
                                const updatedTempList = prev.tempJewelleries.filter((_, i) => i !== idx);
                                return {
                                  ...prev,
                                  tempJewelleries: updatedTempList,
                                  depositAmount: Math.max(0, (prev.depositAmount || 0) - (item.deposit || 0))
                                };
                              });
                            }}
                            className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-600 font-bold flex items-center justify-center text-xs transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Row 4: Financial Inputs (Discount %, Discount Amount ₹, Advance Paid ₹, Deposit ₹) */}
              {(() => {
                const regularSubtotal = adminJewelleries
                  .filter(j => newBookingData.jewelleryIds.includes(j._id))
                  .reduce((sum, j) => sum + (j.rentalPrice || j.price || 0), 0);
                const tempSubtotal = (newBookingData.tempJewelleries || [])
                  .reduce((sum, j) => sum + (parseFloat(j.rentalPrice) || 0), 0);
                const subtotal = regularSubtotal + tempSubtotal;
                
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Discount %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g. 10"
                        value={newBookingData.discountPercent === 0 ? '' : newBookingData.discountPercent}
                        onChange={e => {
                          const valStr = e.target.value;
                          const pct = valStr === '' ? 0 : parseFloat(valStr) || 0;
                          const amt = Math.round((subtotal * pct) / 100);
                          setNewBookingData(prev => ({
                            ...prev,
                            discountPercent: valStr === '' ? '' : pct,
                            discountAmount: valStr === '' ? '' : amt
                          }));
                        }}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Discount Amount ₹</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 500"
                        value={newBookingData.discountAmount === 0 ? '' : newBookingData.discountAmount}
                        onChange={e => {
                          const valStr = e.target.value;
                          const amt = valStr === '' ? 0 : parseFloat(valStr) || 0;
                          const pct = subtotal ? Math.round((amt / subtotal) * 100) : 0;
                          setNewBookingData(prev => ({
                            ...prev,
                            discountAmount: valStr === '' ? '' : amt,
                            discountPercent: valStr === '' ? '' : pct
                          }));
                        }}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Advance Paid ₹</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1000"
                        value={newBookingData.advancePaid === 0 ? '' : newBookingData.advancePaid}
                        onChange={e => {
                          const valStr = e.target.value;
                          setNewBookingData(prev => ({
                            ...prev,
                            advancePaid: valStr === '' ? '' : parseFloat(valStr) || 0
                          }));
                        }}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Deposit ₹</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1000"
                        value={newBookingData.depositAmount === 0 ? '' : newBookingData.depositAmount}
                        onChange={e => {
                          const valStr = e.target.value;
                          setNewBookingData(prev => ({
                            ...prev,
                            depositAmount: valStr === '' ? '' : parseFloat(valStr) || 0
                          }));
                        }}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold text-gray-800"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Row 5: Payment Status, Booking Status, Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Payment Status</label>
                  <select
                    value={newBookingData.paymentStatus}
                    onChange={e => setNewBookingData(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Booking Status</label>
                  <select
                    value={newBookingData.status}
                    onChange={e => setNewBookingData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white font-semibold"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="inevent">In Event</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Notes / Special Remarks</label>
                  <input
                    type="text"
                    placeholder="e.g. Pink set"
                    value={newBookingData.notes}
                    onChange={e => setNewBookingData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
              </div>

              {/* Total & Balance Calculation Summary Box */}
              {(() => {
                const regularRentalSubtotal = adminJewelleries
                  .filter(j => newBookingData.jewelleryIds.includes(j._id))
                  .reduce((sum, j) => sum + (j.rentalPrice || j.price || 0), 0);
                const tempRentalSubtotal = (newBookingData.tempJewelleries || [])
                  .reduce((sum, j) => sum + (parseFloat(j.rentalPrice) || 0), 0);
                const rentalSubtotal = regularRentalSubtotal + tempRentalSubtotal;
                const dPercent = parseFloat(newBookingData.discountPercent) || 0;
                const dAmount = (rentalSubtotal * dPercent) / 100;
                const netAmount = Math.max(0, rentalSubtotal - dAmount);
                const advPaid = parseFloat(newBookingData.advancePaid) || 0;
                const balAmt = Math.max(0, netAmount - advPaid);

                return (
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 border border-gray-200">
                    <div className="flex justify-between items-center text-xs text-gray-600">
                      <span>Rental Subtotal (Selected Items):</span>
                      <span className="font-semibold text-gray-800">₹{rentalSubtotal.toFixed(2)}</span>
                    </div>
                    {dPercent > 0 && (
                      <div className="flex justify-between items-center text-xs text-emerald-600 font-semibold">
                        <span>Discount ({dPercent}% OFF):</span>
                        <span>-₹{dAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-700 font-medium">
                      <span>Net Rental Total:</span>
                      <span>₹{netAmount.toFixed(2)}</span>
                    </div>
                    {advPaid > 0 && (
                      <div className="flex justify-between items-center text-xs text-blue-600 font-medium">
                        <span>Advance Paid:</span>
                        <span>-₹{advPaid.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-sm">
                      <span className="font-bold text-gray-900">Remaining Balance ₹:</span>
                      <span className="font-bold text-amber-800 text-lg">₹{balAmt.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBookingModal(false);
                    setEditingBookingId(null);
                  }}
                  className="px-5 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addBookingLoading}
                  className="px-6 py-2 bg-[#B07A85] text-white rounded-xl text-xs font-semibold hover:bg-[#9E6A75] transition-colors flex items-center gap-2"
                >
                  {addBookingLoading ? 'Saving...' : (editingBookingId ? 'Update Booking Entry' : 'Create Booking Entry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom / Temporary Jewel Overlay Modal */}
      {showAddTempJewelModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add Temporary Jewellery Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">Enter item information for custom/unlisted rental booking</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTempJewelModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* BIG JEWELLERY NAME INPUT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Jewellery Name* (Big Input)</label>
                <input
                  type="text"
                  placeholder="Enter Jewellery Name (e.g. Antique Temple Gold Haram)"
                  value={tempJewelInput.name}
                  onChange={e => setTempJewelInput(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3.5 border-2 border-[#B07A85]/30 focus:border-[#B07A85] rounded-2xl text-lg font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-[#B07A85]/10 bg-amber-50/20"
                  autoFocus
                />
              </div>

              {/* Code & Rental Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Jewel Code</label>
                  <input
                    type="text"
                    placeholder="e.g. TEMP-001"
                    value={tempJewelInput.code}
                    onChange={e => setTempJewelInput(prev => ({ ...prev, code: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Rental Price ₹</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 1500"
                    value={tempJewelInput.rentalPrice}
                    onChange={e => setTempJewelInput(prev => ({ ...prev, rentalPrice: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
              </div>

              {/* Deposit Amount & Image Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Security Deposit ₹</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={tempJewelInput.deposit}
                    onChange={e => setTempJewelInput(prev => ({ ...prev, deposit: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">Jewel Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setTempJewelInput(prev => ({ ...prev, image: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#B07A85]/10 file:text-[#B07A85] hover:file:bg-[#B07A85]/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Image Preview Box */}
              {tempJewelInput.image && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={tempJewelInput.image} alt="Jewel preview" className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    <span className="text-xs font-medium text-gray-700">Jewel photo attached</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTempJewelInput(prev => ({ ...prev, image: '' }))}
                    className="text-xs font-bold text-red-600 hover:text-red-700 underline"
                  >
                    Remove Photo
                  </button>
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddTempJewelModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!tempJewelInput.name.trim()) {
                      alert('Please enter a Jewellery Name.');
                      return;
                    }
                    const newItem = {
                      name: tempJewelInput.name,
                      code: tempJewelInput.code || 'TEMP',
                      rentalPrice: parseFloat(tempJewelInput.rentalPrice) || 0,
                      deposit: parseFloat(tempJewelInput.deposit) || 0,
                      image: tempJewelInput.image || ''
                    };
                    setNewBookingData(prev => {
                      const updatedTempList = [...(prev.tempJewelleries || []), newItem];
                      return {
                        ...prev,
                        tempJewelleries: updatedTempList,
                        depositAmount: (prev.depositAmount || 0) + (newItem.deposit || 0)
                      };
                    });
                    setTempJewelInput({ name: '', code: '', rentalPrice: '', deposit: '', image: '' });
                    setShowAddTempJewelModal(false);
                  }}
                  className="px-6 py-2.5 bg-[#B07A85] text-white rounded-xl text-xs font-bold hover:bg-[#9E6A75] transition-colors shadow-sm"
                >
                  Add to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generation Modal */}
      {showInvoiceBooking && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto no-print"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvoiceBooking(null);
            }
          }}
        >
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-gray-100 mt-4 mb-12 relative">
            
            {/* Modal Controls */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center no-print">
              <span className="text-sm font-semibold text-gray-700">Invoice Preview</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#B07A85] text-white text-xs font-semibold rounded-lg hover:bg-[#9E6A75] transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={14} /> Print / Save PDF
                </button>
                <button
                  onClick={() => setShowInvoiceBooking(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Invoice Printable Sheet */}
            <div className="p-8 sm:p-12 text-gray-800 font-sans print-area bg-white text-left" id="printable-invoice">
              
              {/* Header section */}
              <div className="flex justify-between items-start pb-6 border-b border-gray-100">
                <div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">INVOICE</h1>
                  <p className="text-sm font-mono text-gray-500 mt-1">{showInvoiceBooking.customId || `BK-${showInvoiceBooking._id?.slice(-8)}`}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-[#B07A85] tracking-wide">Apila Jewels</h2>
                  <p className="text-xs text-gray-500 mt-0.5">apila.jewels@gmail.com</p>
                </div>
              </div>

              {/* Bill To & Info section */}
              <div className="grid grid-cols-2 gap-8 py-8 text-sm">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-pink-500 mb-2">BILL TO</h3>
                  <p className="font-bold text-gray-900 text-base">{showInvoiceBooking.userId?.name || showInvoiceBooking.customerDetails?.name || 'Guest Customer'}</p>
                  <p className="text-gray-500 mt-0.5">{showInvoiceBooking.userId?.email || 'N/A'}</p>
                  <p className="text-gray-500 font-mono mt-0.5">{showInvoiceBooking.userId?.phone || showInvoiceBooking.customerDetails?.phone || 'N/A'}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Issue Date:</span> {showInvoiceBooking.bookingDate ? new Date(showInvoiceBooking.bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Due Date:</span> {showInvoiceBooking.eventDate ? new Date(showInvoiceBooking.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</p>
                  <p className="text-gray-500"><span className="font-semibold text-gray-700">Payment Method:</span> {showInvoiceBooking.paymentStatus === 'Paid' ? 'Paid' : 'Other'}</p>
                </div>
              </div>

              {/* Table section */}
              <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs">
                      <th className="px-4 py-3 w-10 text-center">#</th>
                      <th className="px-2 py-3 w-16 text-center no-print">REORDER</th>
                      <th className="px-4 py-3 w-16 text-center">IMAGE</th>
                      <th className="px-5 py-3">NAME</th>
                      <th className="px-4 py-3 text-center w-16">QTY</th>
                      <th className="px-5 py-3 text-right w-28">RATE</th>
                      <th className="px-5 py-3 text-right w-28">TOTAL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      const displayItems = invoiceItems.length > 0 ? invoiceItems : [
                        ...(Array.isArray(showInvoiceBooking.jewelleryIds) ? showInvoiceBooking.jewelleryIds : []).map(item => ({ ...item, isTemp: false })),
                        ...(Array.isArray(showInvoiceBooking.tempJewelleries) ? showInvoiceBooking.tempJewelleries : []).map(item => ({ ...item, isTemp: true }))
                      ];
                      
                      return displayItems.map((item, idx) => {
                        const rate = item.rentalPrice || item.price || 0;
                        const imgSrc = item.image || (Array.isArray(item.images) ? (item.images[0]?.url || item.images[0]) : item.images);
                        
                        return (
                          <tr key={item._id || `item-${idx}`} className="hover:bg-gray-50/30 transition-colors">
                            <td className="px-4 py-3 text-gray-400 font-mono text-center">{idx + 1}</td>
                            <td className="px-2 py-3 text-center no-print">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMoveInvoiceItemUp(idx)}
                                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-[#B07A85] hover:text-white text-gray-700 font-bold text-xs disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                  title="Move Up in Invoice"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === displayItems.length - 1}
                                  onClick={() => handleMoveInvoiceItemDown(idx)}
                                  className="w-6 h-6 rounded-md bg-gray-100 hover:bg-[#B07A85] hover:text-white text-gray-700 font-bold text-xs disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                  title="Move Down in Invoice"
                                >
                                  ▼
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {imgSrc ? (
                                <img src={imgSrc} alt={item.name} className="w-12 h-12 rounded-lg object-cover mx-auto border border-gray-200 shadow-sm" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-[9px] text-gray-400 mx-auto font-mono">
                                  NO IMG
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-3 font-medium text-gray-900">
                              {item.name}
                              {(item.code || item.jewelId) && (
                                <span className="ml-2 text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200/50 px-1.5 py-0.5 rounded font-semibold">
                                  {item.code || item.jewelId}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-500 font-medium">1</td>
                            <td className="px-5 py-3 text-right font-medium text-gray-700">₹{rate.toFixed(2)}</td>
                            <td className="px-5 py-3 text-right font-semibold text-gray-900">₹{rate.toFixed(2)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Summary section */}
              {(() => {
                const subtotal = showInvoiceBooking.rentalAmount || showInvoiceBooking.totalAmount || 0;
                const discPercent = showInvoiceBooking.discountPercent || 0;
                const discAmt = showInvoiceBooking.discountAmount || 0;
                const netTotal = Math.max(0, subtotal - discAmt);
                const advPaid = showInvoiceBooking.advancePaid || 0;
                const balAmt = showInvoiceBooking.balanceAmount ?? Math.max(0, netTotal - advPaid);

                return (
                  <div className="flex justify-end mb-8">
                    <div className="w-72 space-y-2.5 text-sm">
                      <div className="flex justify-between items-center text-gray-500">
                        <span>Subtotal</span>
                        <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
                      </div>
                      {discPercent > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-medium">
                          <span>Discount ({discPercent}% OFF)</span>
                          <span>-₹{discAmt.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100 text-gray-900 font-bold text-base">
                        <span>Total</span>
                        <span className="text-[#B07A85] text-lg">₹{netTotal.toFixed(2)}</span>
                      </div>
                      {advPaid > 0 && (
                        <div className="flex justify-between items-center text-blue-600 font-semibold pt-1">
                          <span>Advance Paid</span>
                          <span>-₹{advPaid.toFixed(2)}</span>
                        </div>
                      )}
                      {balAmt > 0 && (
                        <div className="flex justify-between items-center text-amber-800 font-bold pt-1 border-t border-dashed border-gray-200">
                          <span>Balance Due</span>
                          <span>₹{balAmt.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <hr className="border-gray-100 my-6" />

              {/* Notes & Security Deposit Section */}
              <div className="space-y-4 text-xs text-gray-500">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-500 mb-1">NOTES</h4>
                  <p>Security Deposit (Fully Refundable Upon Jewellery Return): <strong className="text-gray-800 font-bold">₹{(showInvoiceBooking.depositAmount || 0).toLocaleString()}</strong></p>
                  {showInvoiceBooking.notes && (
                    <p className="mt-1"><span className="font-semibold text-gray-600">Special Remarks:</span> {showInvoiceBooking.notes}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-pink-500 mb-1">TERMS & CONDITIONS</h4>
                  <p>Security Deposit: Fully refundable upon return of the jewellery. Damage or loss will be adjusted from the deposit.</p>
                </div>
              </div>

              {/* Footer Quote */}
              <div className="text-center pt-8 text-xs text-gray-400 font-medium mt-8 border-t border-gray-50">
                Thank you for choosing Apila Jewels.
              </div>

            </div>

          </div>
        </div>
      )}

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
            margin: 0;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
