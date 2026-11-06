import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, X, Upload, Trash2, Eye, Pencil, Save, Image, Film,
  Search, AlertCircle, CheckCircle, Package, Tag, Percent
} from 'lucide-react';
import API_BASE_URL from '../../../config/api';

const COLOUR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Antique Gold', 'Multi', 'Other'];
const MATERIAL_OPTIONS = ['Gold Plated', 'Silver Plated', 'Copper', 'Brass', 'Sterling Silver', 'Other'];
const FINISH_OPTIONS = ['Matte', 'Glossy', 'Antique', 'Polished', 'Oxidised', 'Other'];

const EMPTY_FORM = {
  jewelId: '',
  name: '',
  salesPrice: '',
  discountPercent: '',
  discountedRate: '',
  colour: '',
  material: '',
  size: '',
  finish: '',
  description: '',
  stockCount: '',
};

export default function SalesTab({ token }) {
  const [saleItems, setSaleItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaFiles, setMediaFiles] = useState([]);       // { file, preview, type }
  const [existingMedia, setExistingMedia] = useState([]); // already-saved URLs from server
  const [removedMedia, setRemovedMedia] = useState([]);   // URLs to delete
  const mediaInputRef = useRef(null);

  /* ─── fetch all sale jewels ─── */
  const fetchSaleItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/jewellery?isSale=true&limit=1000`);
      const data = await res.json();
      if (data.success) setSaleItems(data.data || []);
    } catch (e) {
      console.error('Error fetching sale items:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSaleItems(); }, [fetchSaleItems]);

  /* ─── autofill discounted rate ─── */
  useEffect(() => {
    const price = parseFloat(form.salesPrice) || 0;
    const pct = parseFloat(form.discountPercent) || 0;
    if (price > 0 && pct > 0) {
      const discounted = (price - (price * pct) / 100).toFixed(2);
      setForm(f => ({ ...f, discountedRate: discounted }));
    } else {
      setForm(f => ({ ...f, discountedRate: price > 0 ? price.toFixed(2) : '' }));
    }
  }, [form.salesPrice, form.discountPercent]);

  /* ─── field change ─── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'discountedRate') return; // read-only
    setForm(f => ({ ...f, [name]: value }));
  };

  /* ─── media ─── */
  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }));
    setMediaFiles(prev => [...prev, ...previews]);
    e.target.value = '';
  };

  const removeNewMedia = (index) => {
    setMediaFiles(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingMedia = (url) => {
    setRemovedMedia(prev => [...prev, url]);
    setExistingMedia(prev => prev.filter(m => (m.url || m) !== url));
  };

  /* ─── open add form ─── */
  const openAddForm = () => {
    setForm(EMPTY_FORM);
    setMediaFiles([]);
    setExistingMedia([]);
    setRemovedMedia([]);
    setEditingId(null);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  /* ─── open edit form ─── */
  const openEditForm = async (item) => {
    setForm({
      jewelId: item.jewelId || '',
      name: item.name || '',
      salesPrice: item.salesAmount || item.rentalPrice || '',
      discountPercent: '',
      discountedRate: item.salesAmount || item.rentalPrice || '',
      colour: Array.isArray(item.colour) ? item.colour[0] || '' : item.colour || '',
      material: item.material || '',
      size: item.size || '',
      finish: item.finish || '',
      description: item.description || '',
      stockCount: item.stockCount || '',
    });
    const imgs = Array.isArray(item.images) ? item.images : [];
    setExistingMedia(imgs);
    setMediaFiles([]);
    setRemovedMedia([]);
    setEditingId(item._id);
    setError('');
    setSuccess('');
    setShowForm(true);
  };

  /* ─── close form ─── */
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMediaFiles([]);
    setExistingMedia([]);
    setRemovedMedia([]);
    setError('');
  };

  /* ─── submit ─── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.jewelId.trim()) return setError('Jewel ID is required.');
    if (!form.name.trim()) return setError('Product Name is required.');
    if (!form.description.trim()) return setError('Description is required.');
    if (!form.colour) return setError('Colour is required.');
    if (!form.salesPrice || isNaN(parseFloat(form.salesPrice))) return setError('Valid Sales Price is required.');

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('jewelId', form.jewelId.trim().toUpperCase());
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('colour', form.colour);
      fd.append('material', form.material);
      fd.append('size', form.size);
      fd.append('finish', form.finish);
      fd.append('salesAmount', parseFloat(form.salesPrice));
      fd.append('rentalPrice', parseFloat(form.discountedRate || form.salesPrice));
      fd.append('stockCount', parseInt(form.stockCount) || 0);
      fd.append('isSale', 'true');
      fd.append('showPrice', 'true');
      if (removedMedia.length) fd.append('removedImages', JSON.stringify(removedMedia));
      mediaFiles.forEach(m => fd.append('images', m.file));

      const url = editingId
        ? `${API_BASE_URL}/api/jewellery/${editingId}`
        : `${API_BASE_URL}/api/jewellery`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(editingId ? 'Sale item updated!' : 'Sale item added!');
        closeForm();
        fetchSaleItems();
      } else {
        setError(data.error || data.message || 'Failed to save item.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── delete ─── */
  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from the Sales list? (It will be deleted from the system.)')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/jewellery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSaleItems(prev => prev.filter(i => i._id !== id));
        setSuccess('Item removed.');
      } else {
        alert(data.error || 'Failed to delete item.');
      }
    } catch {
      alert('Network error while deleting.');
    }
  };

  /* ─── toggle isSale off ─── */
  const handleRemoveFromSale = async (id) => {
    if (!window.confirm('Remove from sale (mark as not for sale)?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/jewellery/${id}/field`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fieldName: 'isSale', value: false }),
      });
      const data = await res.json();
      if (data.success) {
        setSaleItems(prev => prev.filter(i => i._id !== id));
      } else {
        alert(data.error || 'Failed to update.');
      }
    } catch {
      alert('Network error.');
    }
  };

  /* ─── filtered list ─── */
  const filtered = saleItems.filter(item => {
    const q = searchQuery.toLowerCase();
    return !q ||
      item.name?.toLowerCase().includes(q) ||
      item.jewelId?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);
  });

  /* ─── helpers ─── */
  const getImgUrl = (item) => {
    const imgs = Array.isArray(item.images) ? item.images : [];
    if (!imgs.length) return null;
    return imgs[0]?.url || imgs[0];
  };

  /* ══════════════════════════════════════════════
      RENDER
  ══════════════════════════════════════════════ */
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sales — Jewellery to Own</h2>
          <p className="text-sm text-gray-400 mt-0.5">{saleItems.length} item{saleItems.length !== 1 ? 's' : ''} listed for sale</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Sale Item
        </button>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">
          <CheckCircle size={16} /> {success}
          <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {error && !showForm && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
          <AlertCircle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, Jewel ID or description…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
          <Tag size={48} className="mb-4 opacity-25" />
          <p className="font-semibold text-sm">No sale items yet</p>
          <p className="text-xs mt-1">Click "Add Sale Item" to list a jewel for sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => {
            const img = getImgUrl(item);
            return (
              <div key={item._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                {/* image */}
                <div className="relative h-44 bg-gray-50">
                  {img ? (
                    <img src={img} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image size={36} className="text-gray-200" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 bg-[#B07A85] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    For Sale
                  </span>
                </div>

                {/* body */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                    {item.jewelId}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{item.name}</h3>

                  <div className="flex items-baseline gap-2 mt-auto pt-3">
                    <span className="text-base font-bold text-gray-900">
                      ₹{(item.salesAmount || item.rentalPrice || 0).toLocaleString('en-IN')}
                    </span>
                    {item.stockCount != null && (
                      <span className="text-xs text-gray-400">× {item.stockCount} pcs</span>
                    )}
                  </div>

                  {/* actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setViewingItem(item)}
                      title="View"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium transition-colors"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => openEditForm(item)}
                      title="Edit"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleRemoveFromSale(item._id)}
                      title="Remove from sale"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-amber-200 text-amber-600 hover:bg-amber-50 text-xs font-medium transition-colors"
                    >
                      <Tag size={13} /> Unlist
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete"
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ══ ADD / EDIT FORM MODAL ══ */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-auto">
            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingId ? 'Edit Sale Item' : 'Add Sale Item'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingId ? 'Update the details below.' : 'Fill in the details to list a jewel for sale.'}
                </p>
              </div>
              <button
                onClick={closeForm}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* form body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  <AlertCircle size={15} /> {error}
                </div>
              )}

              {/* ── Row 1: Jewel ID + Product Name ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Jewel ID (Unique Code) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jewelId"
                    value={form.jewelId}
                    onChange={handleChange}
                    placeholder="e.g. JWL-12345"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Temple Necklace Set"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
              </div>

              {/* ── Row 2: Sales Price + Discount % + Discounted Rate ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Sales Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      name="salesPrice"
                      value={form.salesPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <div className="relative">
                    <Percent size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      name="discountPercent"
                      value={form.discountPercent}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full border border-gray-200 rounded-xl px-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Discounted Rate (₹) <span className="text-xs text-gray-400 font-normal">(auto)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      name="discountedRate"
                      value={form.discountedRate}
                      readOnly
                      tabIndex={-1}
                      className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm bg-gray-50 text-gray-600 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ── Row 3: Colour + Material + Count ── */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Colour <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="colour"
                    value={form.colour}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  >
                    <option value="">Select colour</option>
                    {COLOUR_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Material <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="material"
                    value={form.material}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  >
                    <option value="">Select material</option>
                    {MATERIAL_OPTIONS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Count of Jewels
                  </label>
                  <input
                    type="number"
                    name="stockCount"
                    value={form.stockCount}
                    onChange={handleChange}
                    placeholder="e.g. 5"
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
              </div>

              {/* ── Row 4: Size + Finish ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Size <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={form.size}
                    onChange={handleChange}
                    placeholder="e.g. Adjustable, Free Size, S/M/L"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Finish <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    name="finish"
                    value={form.finish}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                  >
                    <option value="">Select finish</option>
                    {FINISH_OPTIONS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Description ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the jewel — materials, occasion, style, craftsmanship…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                />
              </div>

              {/* ── Media upload ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Media — Images &amp; Videos <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>

                {/* existing media */}
                {existingMedia.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {existingMedia.map((m, i) => {
                      const url = m.url || m;
                      const isVid = m.type === 'video' || url.match(/\.(mp4|webm|ogg|mov)$/i);
                      return (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                          {isVid ? (
                            <video src={url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} alt="" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingMedia(url)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <Trash2 size={16} className="text-white" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* new previews */}
                {mediaFiles.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {mediaFiles.map((m, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                        {m.type === 'video' ? (
                          <video src={m.preview} className="w-full h-full object-cover" />
                        ) : (
                          <img src={m.preview} alt="" className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewMedia(i)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 size={16} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => mediaInputRef.current?.click()}
                  className="flex items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl px-5 py-3 text-sm text-gray-500 hover:border-[#B07A85] hover:text-[#B07A85] transition-colors w-full justify-center"
                >
                  <Upload size={16} /> Click to upload images or videos
                </button>
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaSelect}
                />
              </div>

              {/* footer buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#B07A85] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9E6A75] transition-colors disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {submitting ? 'Saving…' : editingId ? 'Update Item' : 'Add to Sales'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ VIEW DETAIL MODAL ══ */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-1 uppercase tracking-wider">
                  {viewingItem.jewelId}
                </span>
                <h3 className="font-bold text-gray-900 text-xl">{viewingItem.name}</h3>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* image */}
              {getImgUrl(viewingItem) && (
                <div className="h-56 rounded-xl overflow-hidden bg-gray-50">
                  <img
                    src={getImgUrl(viewingItem)}
                    alt={viewingItem.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* pricing */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <span className="text-xs text-gray-400">Sales Price</span>
                  <p className="font-bold text-lg text-gray-900">₹{viewingItem.salesAmount?.toLocaleString('en-IN') || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Discounted Rate</span>
                  <p className="font-bold text-lg text-[#B07A85]">₹{viewingItem.rentalPrice?.toLocaleString('en-IN') || viewingItem.salesAmount?.toLocaleString('en-IN') || '—'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Stock</span>
                  <p className="font-bold text-lg text-gray-900">{viewingItem.stockCount ?? '—'} pcs</p>
                </div>
              </div>

              {/* specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Colour', value: Array.isArray(viewingItem.colour) ? viewingItem.colour.join(', ') : viewingItem.colour },
                  { label: 'Material', value: viewingItem.material },
                  { label: 'Size', value: viewingItem.size },
                  { label: 'Finish', value: viewingItem.finish },
                ].map(({ label, value }) => value ? (
                  <div key={label}>
                    <span className="text-xs text-gray-400">{label}</span>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ) : null)}
              </div>

              {/* description */}
              {viewingItem.description && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Description</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{viewingItem.description}</p>
                </div>
              )}

              {/* media gallery */}
              {Array.isArray(viewingItem.images) && viewingItem.images.length > 1 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Media</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingItem.images.map((m, i) => {
                      const url = m.url || m;
                      const isVid = m.type === 'video' || url.match(/\.(mp4|webm|ogg|mov)$/i);
                      return (
                        <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          {isVid
                            ? <video src={url} className="w-full h-full object-cover" />
                            : <img src={url} alt="" className="w-full h-full object-cover" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

