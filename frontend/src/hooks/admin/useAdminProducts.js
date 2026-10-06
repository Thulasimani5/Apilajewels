import { useState, useEffect } from 'react';
import {
  fetchAllJewelleries,
  fetchJewelleriesByCategory,
  createJewellery,
  updateJewellery,
  patchJewelleryField,
  deleteJewellery,
} from '../../services/api';

export const useAdminProducts = (token, categories, showAddForm, setShowAddForm) => {
  const [selectedAdminCategory, setSelectedAdminCategory] = useState(null);
  const [selectedAdminAccessorySubtype, setSelectedAdminAccessorySubtype] = useState(null);
  const [adminJewelleries, setAdminJewelleries] = useState([]);
  const [adminJewelleriesLoading, setAdminJewelleriesLoading] = useState(false);
  const [adminJewellerySearch, setAdminJewellerySearch] = useState('');
  const [viewingJewel, setViewingJewel] = useState(null);
  const [editingId, setEditingId] = useState(null);

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

  const fetchAllJewelleriesData = async () => {
    try {
      const result = await fetchAllJewelleries(1000);
      if (result.success) {
        setAdminJewelleries(result.data);
      }
    } catch (e) {
      console.error("Error fetching all jewelleries:", e);
    }
  };

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
      addFilesToList(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFilesToList(Array.from(e.target.files));
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

  const handlePreviewDragOver = (e) => {
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
    setMediaList(mediaList.filter((_, i) => i !== index));
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
        if (setShowAddForm) setShowAddForm(false);
        
        if (editingId) {
          setAdminJewelleries(prev => prev.map(j => j._id === editingId ? { ...j, ...formData } : j));
        }
        
        setEditingId(null);
        setFormData({
          jewelId: '', name: '', description: '', price: '', deposit: '',
          category: [], type: [], accessoryType: '', occasion: [], colour: 'Gold',
          material: '', size: '', finish: '',
          purchaseAmount: '', rentAmount: '', salesAmount: '', shopName: '',
          stoneName: [], stoneColour: [], showPrice: true
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
    selectedAdminCategory,
    setSelectedAdminCategory,
    selectedAdminAccessorySubtype,
    setSelectedAdminAccessorySubtype,
    adminJewelleries,
    setAdminJewelleries,
    adminJewelleriesLoading,
    setAdminJewelleriesLoading,
    adminJewellerySearch,
    setAdminJewellerySearch,
    viewingJewel,
    setViewingJewel,
    editingId,
    setEditingId,
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
    fetchAllJewelleriesData,
    handleDeleteJewel,
    handleSaveField,
    handleDrag,
    handleDrop,
    handleFileChange,
    handlePreviewDragStart,
    handlePreviewDragOver,
    handlePreviewDrop,
    removeMediaField,
    handleSubmit
  };
};
