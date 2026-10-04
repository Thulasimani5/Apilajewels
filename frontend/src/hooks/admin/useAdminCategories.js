import { useState } from 'react';

export const useAdminCategories = (token, categories, addCategory, deleteCategory, updateCategory) => {
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

  return {
    newCategoryName,
    setNewCategoryName,
    newCategorySubtext,
    setNewCategorySubtext,
    newCategoryShowInSection,
    setNewCategoryShowInSection,
    newCategoryImage,
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
    editCategoryImage,
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
    handleAddCategory,
    handleDeleteCategory,
    openEditCategory,
    handleUpdateCategory,
    handleSaveType,
    handleDeleteType
  };
};
