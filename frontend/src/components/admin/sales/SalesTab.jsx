import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Plus, X, Upload, Trash2, Eye, Pencil, Save, Image, Film,
  Search, AlertCircle, CheckCircle, Package, Tag, Percent, RefreshCw, LogOut
} from 'lucide-react';
import API_BASE_URL from '../../../config/api';

const COLOUR_OPTIONS = ['Gold', 'Silver', 'Rose Gold', 'Antique Gold', 'Multi', 'Other'];
const MATERIAL_OPTIONS = ['Gold Plated', 'Silver Plated', 'Copper', 'Brass', 'Sterling Silver', 'Other'];
const FINISH_OPTIONS = ['Matte', 'Glossy', 'Antique', 'Polished', 'Oxidised', 'Other'];

const EMPTY_FORM = {
  jewelId: '',
  name: '',
  purchaseAmount: '',
  salesPrice: '',
  discountPercent: '',
  discountedRate: '',
  colour: '',
  material: '',
  size: '',
  finish: '',
  description: '',
  stockCount: '1',
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
  const [serverRestartNeeded, setServerRestartNeeded] = useState(false);
  const [authExpired, setAuthExpired] = useState(false);

  const [form, setForm] = useState(EMPTY_FORM);
  const [mediaFiles, setMediaFiles] = useState([]);       // { file, preview, type }
  const [existingMedia, setExistingMedia] = useState([]); // already-saved URLs from server
  const [removedMedia, setRemovedMedia] = useState([]);   // URLs to delete
  const mediaInputRef = useRef(null);

  // Fallback to localStorage token if prop is missing
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);

  /* ─── fetch all sale jewels ─── */
  const fetchSaleItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales?all=true`);
      const contentType = res.headers.get('content-type') || '';

      if (res.status === 404 || !contentType.includes('application/json')) {
        setServerRestartNeeded(true);
        console.warn('Backend returned 404 or non-JSON for /api/sales. Backend server needs to be restarted.');
        return;
      }

      setServerRestartNeeded(false);
      const data = await res.json();
      if (data.success) {
        setSaleItems(data.data || []);
      } else {
        console.error('Failed to fetch sale items:', data.error);
      }
    } catch (e) {
      console.error('Error fetching sale items:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaleItems();
  }, [fetchSaleItems]);

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
  const openEditForm = (item) => {
    setForm({
      jewelId: item.jewelId || '',
      name: item.name || '',
      purchaseAmount: item.purchaseAmount != null ? item.purchaseAmount : '',
      salesPrice: item.salesPrice != null ? item.salesPrice : (item.salesAmount || item.rentalPrice || ''),
      discountPercent: item.discountPercent != null ? item.discountPercent : '',
      discountedRate: item.discountedRate != null ? item.discountedRate : (item.salesPrice || item.salesAmount || item.rentalPrice || ''),
      colour: Array.isArray(item.colour) ? item.colour[0] || '' : (item.colour || ''),
      material: item.material || '',
      size: item.size || '',
      finish: item.finish || '',
      description: item.description || '',
      stockCount: item.stockCount != null ? item.stockCount : 1,
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

    if (!form.jewelId.trim()) return setError('Jewel ID (Unique Code) is required.');
    if (!form.name.trim()) return setError('Product Name is required.');
    if (!form.purchaseAmount || isNaN(parseFloat(form.purchaseAmount))) return setError('Valid Purchase Amount is mandatory.');
    if (!form.salesPrice || isNaN(parseFloat(form.salesPrice))) return setError('Valid Sales Price is required.');
    if (!form.colour) return setError('Colour is required.');
    if (!form.description.trim()) return setError('Description is required.');

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('jewelId', form.jewelId.trim().toUpperCase());
      fd.append('name', form.name.trim());
      fd.append('description', form.description.trim());
      fd.append('colour', form.colour);
      if (form.material) fd.append('material', form.material);
      if (form.size) fd.append('size', form.size);
      if (form.finish) fd.append('finish', form.finish);
      fd.append('purchaseAmount', parseFloat(form.purchaseAmount));
      fd.append('salesPrice', parseFloat(form.salesPrice));
      if (form.discountPercent !== '' && !isNaN(parseFloat(form.discountPercent))) {
        fd.append('discountPercent', parseFloat(form.discountPercent));
      } else {
        fd.append('discountPercent', 0);
      }
      fd.append('discountedRate', parseFloat(form.discountedRate || form.salesPrice));
      fd.append('stockCount', parseInt(form.stockCount, 10) || 1);

      if (removedMedia.length) fd.append('removedImages', JSON.stringify(removedMedia));
      mediaFiles.forEach(m => fd.append('images', m.file));

      const url = editingId
        ? `${API_BASE_URL}/api/sales/${editingId}`
        : `${API_BASE_URL}/api/sales`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${authToken}` },
        body: fd,
      });

      const contentType = res.headers.get('content-type') || '';
      let data = {};

      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        if (res.status === 404) {
          setServerRestartNeeded(true);
          throw new Error('Backend route not found (404). Please restart your backend server (stop and re-run node server.js or npm run dev) so the new /api/sales route is loaded.');
        } else if (res.status === 401) {
          setAuthExpired(true);
          throw new Error('Unauthorized (401). Your admin session token has expired. Please log out from the sidebar and log in again.');
        } else {
          throw new Error(`Server returned error status ${res.status}. Please check backend console.`);
        }
      }

      if (res.status === 401) {
        setAuthExpired(true);
        setError('Unauthorized (401). Your admin session has expired. Please log out and log in again as admin.');
        return;
      }

      if (data.success) {
        setSuccess(editingId ? 'Sale item updated successfully!' : 'Sale item added successfully!');
        closeForm();
        fetchSaleItems();
      } else {
        setError(data.error || data.message || 'Failed to save sale item.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── delete ─── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sale jewel permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        alert(res.status === 401 ? 'Session expired (401). Please re-login.' : 'Server returned error. Please restart backend server.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSaleItems(prev => prev.filter(i => i._id !== id));
        setSuccess('Sale item deleted successfully.');
      } else {
        alert(data.error || 'Failed to delete item.');
      }
    } catch {
      alert('Network error while deleting.');
    }
  };

  /* ─── toggle active / unlist ─── */
  const handleToggleActive = async (item) => {
    const nextState = !(item.isActive !== false);
    const msg = nextState ? 'Activate and list this item for sale?' : 'Unlist this item from sale?';
    if (!window.confirm(msg)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/${item._id}/field`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fieldName: 'isActive', value: nextState }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        alert(res.status === 401 ? 'Session expired (401). Please re-login.' : 'Server returned error. Please restart backend server.');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setSaleItems(prev => prev.map(i => i._id === item._id ? { ...i, isActive: nextState } : i));
        setSuccess(nextState ? 'Item is now active and listed for sale.' : 'Item unlisted from sale.');
      } else {
        alert(data.error || 'Failed to update item.');
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
      item.description?.toLowerCase().includes(q) ||
      item.colour?.toLowerCase().includes(q);
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

      {/* Backend Server Restart Alert Banner */}
      {serverRestartNeeded && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 mb-6 text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-amber-900">Backend Server Restart Required</p>
              <p className="text-amber-700 mt-0.5">
                The server responded with 404 for <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">/api/sales</code>.
                The running backend process is still executing the old code from before the new route was added.
              </p>
              <p className="text-xs text-amber-800 font-medium mt-2">
                👉 Please switch to your terminal running the backend, press <kbd className="bg-white border px-1 rounded shadow-xs">Ctrl+C</kbd>, and run <code className="bg-amber-100 px-1.5 py-0.5 rounded">node server.js</code> or <code className="bg-amber-100 px-1.5 py-0.5 rounded">npm run dev</code>. Then click the refresh button below.
              </p>
            </div>
            <button
              onClick={fetchSaleItems}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors shadow-xs"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* Auth Expired Banner */}
      {authExpired && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 mb-6 text-red-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-bold text-red-900">Session Expired or Unauthorized (401)</p>
              <p className="text-red-700 mt-0.5">
                Your stored login token is no longer recognized by the backend. Please log out and sign in again as admin.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Sales — Jewellery to Own</h2>
          <p className="text-sm text-gray-400 mt-0.5">{saleItems.length} item{saleItems.length !== 1 ? 's' : ''} in sales inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSaleItems}
            title="Refresh"
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openAddForm}
            className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9E6A75] transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Sale Item
          </button>
        </div>
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
          placeholder="Search by name, Jewel ID, colour or description…"
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
          <p className="font-semibold text-sm">No sale items found</p>
          <p className="text-xs mt-1">Click "Add Sale Item" to list a jewel for sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(item => {
            const img = getImgUrl(item);
            const isUnlisted = item.isActive === false;
            const currentPrice = item.discountedRate != null ? item.discountedRate : (item.salesPrice || item.salesAmount || 0);
            const origPrice = item.salesPrice || item.salesAmount;

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

                  {/* Status badge */}
                  {isUnlisted ? (
                    <span className="absolute top-2 left-2 bg-gray-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Unlisted
                    </span>
                  ) : (
                    <span className="absolute top-2 left-2 bg-[#B07A85] text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                      For Sale
                    </span>
                  )}

                  {/* Discount percentage tag */}
                  {item.discountPercent > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                      -{item.discountPercent}%
                    </span>
                  )}
                </div>

                {/* body */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {item.jewelId}
                    </p>
                    {item.colour && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {item.colour}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{item.name}</h3>

                  <div className="flex items-baseline justify-between gap-2 mt-auto pt-3">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-gray-900">
                          ₹{Number(currentPrice).toLocaleString('en-IN')}
                        </span>
                        {item.discountPercent > 0 && origPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{Number(origPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {item.purchaseAmount != null && (
                        <span className="block text-[11px] text-gray-400">
                          Purchase: ₹{Number(item.purchaseAmount).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                    {item.stockCount != null && (
                      <span className="text-xs text-gray-400">× {item.stockCount} pcs</span>
                    )}
                  </div>

                  {/* actions */}
                  <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => setViewingItem(item)}
                      title="View Details"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium transition-colors"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      onClick={() => openEditForm(item)}
                      title="Edit Item"
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-medium transition-colors"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(item)}
                      title={isUnlisted ? 'List on sale' : 'Unlist from sale'}
                      className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        isUnlisted
                          ? 'border-green-200 text-green-600 hover:bg-green-50'
                          : 'border-amber-200 text-amber-600 hover:bg-amber-50'
                      }`}
                    >
                      <Tag size={13} /> {isUnlisted ? 'List' : 'Unlist'}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete Item"
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

              {/* ── Row 2: Purchase Amount + Sales Price + Discount % + Discounted Rate ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Purchase Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                    <input
                      type="number"
                      name="purchaseAmount"
                      value={form.purchaseAmount}
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white"
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white"
                  >
                    <option value="">Select material</option>
                    {MATERIAL_OPTIONS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Count of Jewels (Stock)
                  </label>
                  <input
                    type="number"
                    name="stockCount"
                    value={form.stockCount}
                    onChange={handleChange}
                    placeholder="1"
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
                    placeholder="e.g. Adjustable, 2.4, 2.6"
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
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85] bg-white"
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
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the jewel: design, craftsmanship, ideal occasions…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
                />
              </div>

              {/* ── Media Upload ── */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Upload Media (Images &amp; Videos) <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  ref={mediaInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaSelect}
                  className="hidden"
                />

                {/* Dropzone */}
                <div
                  onClick={() => mediaInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#B07A85] transition-colors bg-gray-50/50"
                >
                  <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">
                    Click to select images or videos
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    PNG, JPG, WEBP, MP4, MOV up to 20MB
                  </p>
                </div>

                {/* Previews: Existing media */}
                {existingMedia.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Existing Media:</p>
                    <div className="flex flex-wrap gap-2">
                      {existingMedia.map((m, i) => {
                        const url = m.url || m;
                        const isVid = m.type === 'video' || url.match(/\.(mp4|webm|ogg|mov)$/i);
                        return (
                          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                            {isVid ? (
                              <video src={url} className="w-full h-full object-cover" />
                            ) : (
                              <img src={url} alt="" className="w-full h-full object-cover" />
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingMedia(url)}
                              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Previews: New media */}
                {mediaFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">New Media to Upload:</p>
                    <div className="flex flex-wrap gap-2">
                      {mediaFiles.map((m, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group bg-gray-50">
                          {m.type === 'video' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white">
                              <Film size={20} />
                              <span className="text-[9px] mt-1">Video</span>
                            </div>
                          ) : (
                            <img src={m.preview} alt="" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeNewMedia(i)}
                            className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#B07A85] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9E6A75] transition-colors disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={15} /> {editingId ? 'Update Item' : 'Add Item'}
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ══ VIEW DETAILS MODAL ══ */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{viewingItem.jewelId}</p>
                <h3 className="font-bold text-gray-900 text-lg mt-0.5">{viewingItem.name}</h3>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 rounded-xl p-4">
                <div>
                  <span className="text-xs text-gray-400">Purchase Amt</span>
                  <p className="font-bold text-lg text-red-600">
                    ₹{viewingItem.purchaseAmount != null ? Number(viewingItem.purchaseAmount).toLocaleString('en-IN') : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Sales Price</span>
                  <p className="font-bold text-lg text-gray-900">
                    ₹{Number(viewingItem.salesPrice || viewingItem.salesAmount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">
                    Discounted Rate {viewingItem.discountPercent > 0 ? `(-${viewingItem.discountPercent}%)` : ''}
                  </span>
                  <p className="font-bold text-lg text-[#B07A85]">
                    ₹{Number(viewingItem.discountedRate || viewingItem.rentalPrice || viewingItem.salesAmount || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Stock</span>
                  <p className="font-bold text-lg text-gray-900">{viewingItem.stockCount ?? '—'} pcs</p>
                </div>
              </div>

              {/* specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Media Gallery</h4>
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
