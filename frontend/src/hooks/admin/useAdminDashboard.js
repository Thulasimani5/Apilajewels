import { useState, useEffect, useContext } from 'react';
import { useAuth } from '../../context/AuthContext';
import CategoryContext from '../../context/CategoryContext';
import {
  fetchAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
  fetchAllUsers,
  fetchAllGuestCarts,
  fetchAllJewelleries,
  fetchJewelleriesByCategory,
  createJewellery,
  updateJewellery,
  patchJewelleryField,
  deleteJewellery,
} from '../../services/api';

/**
 * useAdminDashboard Custom Hook
 * -----------------------------
 * Encapsulates state, data fetching, booking handlers, invoice handlers,
 * category handlers, and jewellery form handlers for AdminDashboard.
 */
export const useAdminDashboard = () => {
  const { user, logout, token } = useAuth();
  const { categories, refreshCategories, addCategory, deleteCategory, updateCategory } = useContext(CategoryContext);
  
  // Navigation & Tab state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Users & Guest Carts State
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserCart, setSelectedUserCart] = useState(null);
  
  const [guestCarts, setGuestCarts] = useState([]);
  const [guestCartsLoading, setGuestCartsLoading] = useState(false);
  const [guestCartFilter, setGuestCartFilter] = useState('active');
  const [selectedUserOrders, setSelectedUserOrders] = useState(null);

  // Bookings State
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
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

  // Invoice State
  const [showInvoiceBooking, setShowInvoiceBooking] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [isReorderingInvoiceItems, setIsReorderingInvoiceItems] = useState(false);
  const [invoiceDraggedIndex, setInvoiceDraggedIndex] = useState(null);

  // Jewellery Catalog State
  const [selectedAdminCategory, setSelectedAdminCategory] = useState(null);
  const [selectedAdminAccessorySubtype, setSelectedAdminAccessorySubtype] = useState(null);
  const [adminJewelleries, setAdminJewelleries] = useState([]);
  const [adminJewelleriesLoading, setAdminJewelleriesLoading] = useState(false);
  const [adminJewellerySearch, setAdminJewellerySearch] = useState('');
  const [viewingJewel, setViewingJewel] = useState(null);

  // Form & Field Edit State
  const occasions = ["Bridal Set", "Bridal Maid", "Designer", "Reception", "Party Wear", "Small Jewel"];
  const typeNames = categories ? categories.filter(c => c.showInSection === 'type').map(c => c.name) : [];
  const colours = ["Gold", "Silver", "Rose Gold", "Emerald Green", "Ruby Red", "Mehndi Polish"];

  const [formData, setFormData] = useState({
    jewelId: '',
    name: '',
    description: '',
    price: '',
    deposit: '',
    category: [],
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

  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubtext, setNewCategorySubtext] = useState('');
  const [newCategoryShowInSection, setNewCategoryShowInSection] = useState('category');
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategorySubtext, setEditCategorySubtext] = useState('');
  const [editCategoryShowInSection, setEditCategoryShowInSection] = useState('category');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [isSavingCategory, setIsSavingCategory] = useState(false);

  // Jewellery Types State
  const defaultTypeNames = [
    "Full Bridal Set",
    "Semi Bridal & Combo Sets",
    "Long Haram",
    "Choker & Necklace",
    "Bangles",
    "Accessories"
  ];
  const typesList = categories ? categories.filter(c => c.showInSection === 'type' || defaultTypeNames.includes(c.name)) : [];
  const [typesLoading] = useState(false);
  const [typeError, setTypeError] = useState('');
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingTypeId, setEditingTypeId] = useState(null);

  // Fetching Helpers
  const fetchAllJewelleriesData = async () => {
    setAdminJewelleriesLoading(true);
    try {
      const result = await fetchAllJewelleries(1000);
      if (result.success) {
        setAdminJewelleries(result.data);
      }
    } catch (e) {
      console.error("Error fetching all jewelleries for selection:", e);
    } finally {
      setAdminJewelleriesLoading(false);
    }
  };

  const handleOpenInvoice = (b) => {
    const customId = b.bookingCustomId || `BK-${String(b._id || '').slice(-4)}`;
    const regularItems = Array.isArray(b.jewelleryIds) ? b.jewelleryIds : [];
    const tempItems = Array.isArray(b.tempJewelleries) ? b.tempJewelleries : [];
    const combined = [
      ...regularItems.map(item => ({ ...item, isTemp: false })),
      ...tempItems.map(item => ({ ...item, isTemp: true }))
    ];
    setInvoiceItems(combined);
    setIsReorderingInvoiceItems(false);
    setInvoiceDraggedIndex(null);
    setShowInvoiceBooking({ ...b, customId });
  };

  const handleInvoiceDragStart = (e, index) => {
    setInvoiceDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleInvoiceDragOver = (e, index) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleInvoiceDrop = (e, targetIndex) => {
    e.preventDefault();
    if (invoiceDraggedIndex === null || invoiceDraggedIndex === targetIndex) return;
    setInvoiceItems(prev => {
      const copy = [...prev];
      const [movedItem] = copy.splice(invoiceDraggedIndex, 1);
      copy.splice(targetIndex, 0, movedItem);
      return copy;
    });
    setInvoiceDraggedIndex(null);
  };

  const handleInvoiceDragEnd = () => {
    setInvoiceDraggedIndex(null);
  };

  const handlePrintInvoice = () => {
    if (!showInvoiceBooking) return;
    const printEl = document.getElementById('printable-invoice');
    if (!printEl) {
      window.print();
      return;
    }

    const customId = showInvoiceBooking.customId || `BK-${showInvoiceBooking._id?.slice(-8)}`;
    const invoiceHtml = printEl.innerHTML;

    const printWin = window.open('', '_blank', 'width=1150,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice_${customId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              padding: 2rem;
              background-color: #ffffff !important;
              color: #111827 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body className="bg-white">
          <div className="max-w-5xl mx-auto border border-gray-100 p-6 rounded-2xl shadow-none">
            ${invoiceHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.focus();
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  const handleOpenEditBooking = (b) => {
    setEditingBookingId(b._id);
    const bItems = Array.isArray(b.jewelleryIds) ? b.jewelleryIds : [];
    const bTempItems = Array.isArray(b.tempJewelleries) ? b.tempJewelleries : [];
    const dbPercent = parseFloat(b.discountPercent) || 0;
    const dbAmount = parseFloat(b.discountAmount) || 0;
    
    let initialPercent = 0;
    let initialAmount = 0;

    if (dbPercent > 0) {
      initialPercent = dbPercent;
      initialAmount = 0;
    } else if (dbAmount > 0) {
      initialPercent = 0;
      initialAmount = dbAmount;
    }

    setNewBookingData({
      bookingCustomId: b.bookingCustomId || `BK-${String(b._id || '').slice(-4)}`,
      customerName: b.customerDetails?.name || (b.userId?.role !== 'admin' ? b.userId?.name : '') || '',
      customerPhone: b.customerDetails?.phone || (b.userId?.role !== 'admin' ? b.userId?.phone : '') || '',
      customerAddress: b.customerDetails?.address || '',
      bookingPlace: b.bookingPlace || '',
      bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      eventDate: b.eventDate ? new Date(b.eventDate).toISOString().split('T')[0] : '',
      pickupDate: b.pickupDate ? new Date(b.pickupDate).toISOString().split('T')[0] : '',
      returnDate: b.returnDate ? new Date(b.returnDate).toISOString().split('T')[0] : '',
      discountPercent: initialPercent,
      discountAmount: initialAmount,
      advancePaid: b.advancePaid || 0,
      depositAmount: b.depositAmount || 0,
      paymentStatus: b.paymentStatus || 'Pending',
      status: b.status || 'pending',
      notes: b.notes || '',
      jewelleryIds: bItems.map(item => item._id || item),
      tempJewelleries: bTempItems
    });
    if (!adminJewelleries.length) fetchAllJewelleriesData();
    setShowAddBookingModal(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking entry?')) return;

    try {
      const result = await deleteBooking(token, bookingId);
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
    const dAmount = parseFloat(newBookingData.discountAmount) || 0;
    const discountAmount = dAmount > 0 ? dAmount : (rentalAmount * dPercent) / 100;
    const netAmount = Math.max(0, rentalAmount - discountAmount);
    const advancePaid = parseFloat(newBookingData.advancePaid) || 0;
    const balanceAmount = Math.max(0, netAmount - advancePaid);
    const depositAmount = parseFloat(newBookingData.depositAmount) || 0;

    const payload = {
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
    };

    try {
      const result = editingBookingId
        ? await updateBooking(token, editingBookingId, payload)
        : await createBooking(token, payload);

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
        const bResult = await fetchAllBookings(token);
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
    setAdminJewellerySearch('');
    setSelectedAdminAccessorySubtype(null);
  }, [selectedAdminCategory]);

  // Fetch all jewelleries when global search is used from the root (no category selected) view
  useEffect(() => {
    if (!selectedAdminCategory && adminJewellerySearch.trim() && !adminJewelleries.length) {
      fetchAllJewelleriesData();
    }
  }, [adminJewellerySearch, selectedAdminCategory]);

  useEffect(() => {
    if (activeTab === 'jewellery' && selectedAdminCategory && !showAddForm) {
      if (selectedAdminCategory.toLowerCase() === 'accessories' && !selectedAdminAccessorySubtype) {
        setAdminJewelleries([]);
        return;
      }
      const fetchJewels = async () => {
        setAdminJewelleriesLoading(true);
        try {
          const isType = categories ? categories.find(c => c.name === selectedAdminCategory)?.showInSection === 'type' : false;
          const queryParam = isType ? 'type' : 'category';
          const result = await fetchJewelleriesByCategory(queryParam, selectedAdminCategory, selectedAdminAccessorySubtype);
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
      const res = await deleteJewellery(token, id);
      if (res.ok) {
        setAdminJewelleries(prev => prev.filter(j => j._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (e) {
      alert("Error deleting jewel");
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch bookings
      setBookingsLoading(true);
      try {
        const result = await fetchAllBookings(token);
        if (result.success) setBookings(result.data);
      } catch (e) {
        console.error("Error fetching bookings:", e);
      } finally {
        setBookingsLoading(false);
      }

      // Fetch users
      setUsersLoading(true);
      try {
        const result = await fetchAllUsers(token);
        if (result.success) setUsers(result.data);
      } catch (e) {
        console.error("Error fetching users:", e);
      } finally {
        setUsersLoading(false);
      }

      // Fetch guest carts
      setGuestCartsLoading(true);
      try {
        const result = await fetchAllGuestCarts(token);
        if (result.success) setGuestCarts(result.data);
      } catch (e) {
        console.error("Error fetching guest carts:", e);
      } finally {
        setGuestCartsLoading(false);
      }

      // Fetch all jewelleries
      try {
        const result = await fetchAllJewelleries(1000);
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

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsAddingCategory(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', newCategoryName);
      formDataObj.append('subtext', newCategorySubtext);
      formDataObj.append('showInSection', newCategoryShowInSection);
      if (newCategoryImage) {
        formDataObj.append('image', newCategoryImage);
      }
      await addCategory(formDataObj, token);
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
      const formDataObj = new FormData();
      formDataObj.append('name', editCategoryName);
      formDataObj.append('subtext', editCategorySubtext);
      formDataObj.append('showInSection', editCategoryShowInSection);
      if (editCategoryImage) formDataObj.append('image', editCategoryImage);
      await updateCategory(editingCategory._id, formDataObj, token);
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

  const handleSaveType = async () => {
    if (!newTypeName.trim()) { setTypeError('Please enter a type name.'); return; }
    setTypeError('');
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

  const handleSaveField = async (fieldName, value) => {
    if (!editingId) return;
    setSavingField(fieldName);
    try {
      const res = await patchJewelleryField(token, editingId, fieldName, value);
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

      const res = editingId
        ? await updateJewellery(token, editingId, payload)
        : await createJewellery(token, payload);

      if (res.ok) {
        alert(`Jewellery ${editingId ? 'updated' : 'added'} successfully!`);
        setShowAddForm(false);
        
        if (editingId) {
          setAdminJewelleries(prev => prev.map(j => j._id === editingId ? { ...j, ...formData } : j));
        }
        
        setEditingId(null);
        setFormData({
          jewelId: '', name: '', description: '', price: '', deposit: '',
          category: [], type: [], accessoryType: '', occasion: [], colour: 'Gold',
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

  return {
    user,
    logout,
    token,
    categories,
    activeTab,
    setActiveTab,
    showAddForm,
    setShowAddForm,
    editingId,
    setEditingId,
    users,
    usersLoading,
    selectedUserCart,
    setSelectedUserCart,
    guestCarts,
    guestCartsLoading,
    guestCartFilter,
    setGuestCartFilter,
    selectedUserOrders,
    setSelectedUserOrders,
    bookings,
    bookingsLoading,
    showAddBookingModal,
    setShowAddBookingModal,
    editingBookingId,
    setEditingBookingId,
    newBookingData,
    setNewBookingData,
    tempJewelInput,
    setTempJewelInput,
    jewelCodeSearch,
    setJewelCodeSearch,
    addBookingLoading,
    showAddTempJewelModal,
    setShowAddTempJewelModal,
    showInvoiceBooking,
    setShowInvoiceBooking,
    invoiceItems,
    isReorderingInvoiceItems,
    setIsReorderingInvoiceItems,
    invoiceDraggedIndex,
    selectedAdminCategory,
    setSelectedAdminCategory,
    selectedAdminAccessorySubtype,
    setSelectedAdminAccessorySubtype,
    adminJewelleries,
    adminJewelleriesLoading,
    adminJewellerySearch,
    setAdminJewellerySearch,
    viewingJewel,
    setViewingJewel,
    occasions,
    typeNames,
    colours,
    formData,
    setFormData,
    mediaList,
    setMediaList,
    dragActive,
    draggedItemIndex,
    loading,
    savingField,
    savedField,
    newCategoryName,
    setNewCategoryName,
    newCategorySubtext,
    setNewCategorySubtext,
    newCategoryShowInSection,
    setNewCategoryShowInSection,
    setNewCategoryImage,
    isAddingCategory,
    editingCategory,
    setEditingCategory,
    editCategoryName,
    setEditCategoryName,
    editCategorySubtext,
    setEditCategorySubtext,
    editCategoryShowInSection,
    setEditCategoryShowInSection,
    setEditCategoryImage,
    isSavingCategory,
    typesList,
    typesLoading,
    typeError,
    setTypeError,
    showTypeForm,
    setShowTypeForm,
    newTypeName,
    setNewTypeName,
    editingTypeId,
    setEditingTypeId,
    fetchAllJewelleries: fetchAllJewelleriesData,
    handleOpenInvoice,
    handleInvoiceDragStart,
    handleInvoiceDragOver,
    handleInvoiceDrop,
    handleInvoiceDragEnd,
    handlePrintInvoice,
    handleOpenEditBooking,
    handleDeleteBooking,
    handleSaveBooking,
    handleDeleteJewel,
    handleAddCategory,
    handleDeleteCategory,
    openEditCategory,
    handleUpdateCategory,
    handleSaveType,
    handleDeleteType,
    handleSaveField,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeMediaField,
    handlePreviewDragStart,
    handlePreviewDragOver,
    handlePreviewDrop,
    handleSubmit,
  };
};
