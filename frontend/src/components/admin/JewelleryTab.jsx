import React from 'react';
import { Plus, ArrowLeft, Search, Package, Eye, Pencil, Trash2, Check, Upload, Film, X, Save } from 'lucide-react';

/**
 * JewelleryTab
 * ------------
 * Manages Jewellery Categories view, Accessories sub-types, Jewellery List table,
 * and the inline Add/Edit Jewellery form.
 */
const JewelleryTab = ({
  categories,
  selectedAdminCategory,
  setSelectedAdminCategory,
  selectedAdminAccessorySubtype,
  setSelectedAdminAccessorySubtype,
  adminJewelleries,
  adminJewelleriesLoading,
  adminJewellerySearch,
  setAdminJewellerySearch,
  showAddForm,
  setShowAddForm,
  editingId,
  setEditingId,
  formData,
  setFormData,
  mediaList,
  setMediaList,
  loading,
  savingField,
  savedField,
  onSaveField,
  onViewJewel,
  onDeleteJewel,
  onSubmitForm,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileChange,
  removeMediaField,
  handlePreviewDragStart,
  handlePreviewDragOver,
  handlePreviewDrop,
  draggedItemIndex,
  occasions,
  typeNames,
  colours,
}) => {
  const FieldUpdateBtn = ({ field, value }) =>
    !editingId ? null : (
      <button
        type="button"
        onClick={() => onSaveField(field, value)}
        disabled={savingField === field}
        className={`text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex-shrink-0 flex items-center gap-1 ${
          savingField === field
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : savedField === field
            ? 'bg-emerald-100 text-emerald-600'
            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white'
        }`}
      >
        {savingField === field ? (
          '…'
        ) : savedField === field ? (
          <>
            <Check size={9} /> Saved
          </>
        ) : (
          'Update'
        )}
      </button>
    );

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const filteredAdminJewelleries = (adminJewelleries || []).filter((jewel) => {
    const q = adminJewellerySearch.toLowerCase().trim();
    if (!q) return true;
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
    <div>
      {/* View 1: Category Selection Grid & Jewellery List */}
      {!showAddForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {!selectedAdminCategory ? (
            <>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Jewellery Categories</h2>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      jewelId: '',
                      name: '',
                      description: '',
                      price: '',
                      deposit: '',
                      category: ['victorian-moissinate'],
                      type: [],
                      accessoryType: '',
                      occasion: [],
                      colour: 'Gold',
                      material: '',
                      size: '',
                      finish: '',
                      purchaseAmount: '',
                      rentAmount: '',
                      salesAmount: '',
                      shopName: '',
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
                {(categories || []).map((c) => (
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
                    <span className="font-bold text-gray-800 text-lg text-center">
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : selectedAdminCategory.toLowerCase() === 'accessories' &&
            !selectedAdminAccessorySubtype ? (
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
                    <p className="text-xs text-gray-500 font-medium">
                      Select a sub-type to view its items
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  'Hip Belt',
                  'Ear Rings',
                  'Matha Patti',
                  'Tikka',
                  'Ear Chain',
                  'Ring',
                  'Ring Bracelet',
                  'Hair Accessories',
                  'Bracelet',
                  'Others',
                ].map((sub) => (
                  <div
                    key={sub}
                    onClick={() => setSelectedAdminAccessorySubtype(sub)}
                    className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-[#B07A85] hover:shadow-md cursor-pointer transition-all flex flex-col items-center justify-center gap-4 group relative"
                  >
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mt-2">
                      <Package className="text-[#B07A85]" size={28} />
                    </div>
                    <span className="font-bold text-gray-800 text-lg text-center">
                      {sub.toUpperCase()}
                    </span>
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
                      if (
                        selectedAdminCategory.toLowerCase() === 'accessories' &&
                        selectedAdminAccessorySubtype
                      ) {
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
                      {selectedAdminAccessorySubtype &&
                        ` > ${selectedAdminAccessorySubtype}`}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      {selectedAdminAccessorySubtype
                        ? `Viewing all ${selectedAdminAccessorySubtype.toLowerCase()} items`
                        : 'Viewing all jewels in this category'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      jewelId: '',
                      name: '',
                      description: '',
                      price: '',
                      deposit: '',
                      category: ['victorian-moissinate'],
                      type:
                        selectedAdminCategory.toLowerCase() === 'accessories'
                          ? ['Accessories']
                          : [],
                      accessoryType: selectedAdminAccessorySubtype || '',
                      occasion: [],
                      colour: 'Gold',
                      material: '',
                      size: '',
                      finish: '',
                      purchaseAmount: '',
                      rentAmount: '',
                      salesAmount: '',
                      shopName: '',
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
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
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
                  <span className="text-sm font-medium text-gray-400">
                    Loading jewels...
                  </span>
                </div>
              ) : filteredAdminJewelleries.length === 0 ? (
                <div className="p-16 text-center text-gray-500">
                  {adminJewellerySearch
                    ? 'No matching jewels found.'
                    : 'No jewels found in this category.'}
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
                        <tr
                          key={jewel._id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-400 text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {jewel.images?.[0]?.type === 'video' ? (
                                  <video
                                    src={jewel.images[0].url}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <img
                                    src={
                                      jewel.images?.[0]?.url || jewel.images?.[0]
                                    }
                                    alt={jewel.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="font-bold text-gray-900 max-w-[200px] truncate">
                                {jewel.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block mt-3">
                            {jewel.jewelId}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {Array.isArray(jewel.type)
                              ? jewel.type.join(', ')
                              : jewel.type}
                          </td>
                          <td className="px-6 py-4 font-bold text-gray-900">
                            ₹{jewel.rentalPrice || jewel.price}
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                            <button
                              onClick={() => onViewJewel(jewel)}
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
                                  category: Array.isArray(jewel.category)
                                    ? jewel.category
                                    : jewel.category
                                    ? [jewel.category]
                                    : ['victorian-moissinate'],
                                  type: Array.isArray(jewel.type)
                                    ? jewel.type
                                    : jewel.type
                                    ? [jewel.type]
                                    : [],
                                  accessoryType: jewel.accessoryType || '',
                                  occasion: Array.isArray(jewel.occasion)
                                    ? jewel.occasion
                                    : jewel.occasion
                                    ? [jewel.occasion]
                                    : [],
                                  colour: jewel.colour || 'Gold',
                                  material: jewel.material || '',
                                  size: jewel.size || '',
                                  finish: jewel.finish || '',
                                  purchaseAmount: jewel.purchaseAmount || '',
                                  rentAmount: jewel.rentAmount || '',
                                  salesAmount: jewel.salesAmount || '',
                                  shopName: jewel.shopName || '',
                                  stoneName: jewel.stoneName || [],
                                  stoneColour: Array.isArray(jewel.stoneColour)
                                    ? jewel.stoneColour
                                    : jewel.stoneColour
                                    ? [jewel.stoneColour]
                                    : [],
                                  showPrice: jewel.showPrice !== false,
                                });
                                setMediaList(
                                  jewel.images
                                    ? jewel.images.map((img) => ({
                                        type: img.type || 'image',
                                        url: img.url || img,
                                        file: null,
                                      }))
                                    : []
                                );
                                setShowAddForm(true);
                              }}
                              title="Edit jewellery"
                              className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => onDeleteJewel(jewel._id)}
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

      {/* View 2: Add / Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden max-w-3xl">
          <div className="p-6 border-b border-gray-100 flex items-center gap-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h2 className="font-semibold text-gray-800 text-lg">
              {editingId ? 'Edit Jewellery' : 'Add New Jewellery'}
            </h2>
          </div>

          <form onSubmit={onSubmitForm} className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Jewel ID (Unique Code)*
                  </label>
                  <FieldUpdateBtn field="jewelId" value={formData.jewelId} />
                </div>
                <input
                  required
                  type="text"
                  name="jewelId"
                  value={formData.jewelId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                  placeholder="e.g. JWL-12345"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Product Name*
                  </label>
                  <FieldUpdateBtn field="name" value={formData.name} />
                </div>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                  placeholder="e.g. Royal Kundan Choker"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Rental Price (₹)*
                  </label>
                  <FieldUpdateBtn field="price" value={formData.price} />
                </div>
                <input
                  required
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                  placeholder="e.g. 1500"
                />
                <div className="flex items-center gap-2 mt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.showPrice !== false}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          showPrice: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                  <div className="flex justify-between items-center flex-1">
                    <span className="text-xs text-gray-600">
                      Show price on detail page
                    </span>
                    <FieldUpdateBtn
                      field="showPrice"
                      value={formData.showPrice !== false}
                    />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Security Deposit (₹)*
                  </label>
                  <FieldUpdateBtn field="deposit" value={formData.deposit} />
                </div>
                <input
                  required
                  type="number"
                  name="deposit"
                  value={formData.deposit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                  placeholder="e.g. 500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Category* (select multiple)
                  </label>
                  <FieldUpdateBtn field="category" value={formData.category} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(categories || [])
                    .filter((c) => c.showInSection !== 'type')
                    .map((c) => (
                      <label key={c._id} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="category"
                          value={c.name}
                          checked={
                            Array.isArray(formData.category)
                              ? formData.category.includes(c.name)
                              : formData.category === c.name
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              category: checked
                                ? [
                                    ...(Array.isArray(prev.category)
                                      ? prev.category
                                      : prev.category
                                      ? [prev.category]
                                      : []),
                                    c.name,
                                  ]
                                : (Array.isArray(prev.category)
                                    ? prev.category
                                    : [prev.category]
                                  ).filter((x) => x !== c.name),
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
                    <label className="text-sm font-medium text-gray-700">
                      Occasion Type (select multiple)
                    </label>
                    <FieldUpdateBtn
                      field="occasion"
                      value={formData.occasion}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {occasions.map((o) => (
                      <label key={o} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="occasion"
                          value={o}
                          checked={formData.occasion?.includes(o)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              occasion: checked
                                ? [...(prev.occasion || []), o]
                                : (prev.occasion || []).filter((x) => x !== o),
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
                    <label className="text-sm font-medium text-gray-700">
                      Type* (select multiple)
                    </label>
                    <FieldUpdateBtn field="type" value={formData.type} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {typeNames.map((t) => (
                      <label key={t} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="type"
                          value={t}
                          checked={formData.type?.includes(t)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              type: checked
                                ? [...(prev.type || []), t]
                                : (prev.type || []).filter((x) => x !== t),
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
                      <label className="text-sm font-medium text-gray-700">
                        Accessory Sub-Type (select one)
                      </label>
                      <FieldUpdateBtn
                        field="accessoryType"
                        value={formData.accessoryType}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Hip Belt',
                        'Ear Rings',
                        'Matha Patti',
                        'Tikka',
                        'Ear Chain',
                        'Ring',
                        'Ring Bracelet',
                        'Hair Accessories',
                        'Bracelet',
                        'Others',
                      ].map((sub) => (
                        <label key={sub} className="inline-flex items-center">
                          <input
                            type="checkbox"
                            name="accessoryType"
                            value={sub}
                            checked={formData.accessoryType === sub}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFormData((prev) => ({
                                ...prev,
                                accessoryType: checked ? sub : '',
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
                    <label className="text-sm font-medium text-gray-700">
                      Stone Name(s)
                    </label>
                    <FieldUpdateBtn
                      field="stoneName"
                      value={formData.stoneName}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Crystal',
                      'Sapphire',
                      'Pink Morganite',
                      'Ruby',
                      'Emerald',
                      'Jade',
                      'Kemp Stone',
                      'Pearl',
                      'Moissanite Stone',
                      'Basra Pearl',
                      'Kundan',
                      'Glass Beads',
                      'AD Stone',
                      'Cubic Zirconia',
                      'Amethyst',
                      'Amber',
                      'Pink Topaz',
                      'Navarathna',
                      'Polki Stone',
                      'Polki Diamond',
                      'Rose Quartz',
                      'Green Onyx',
                    ].map((s) => (
                      <label key={s} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="stoneName"
                          value={s}
                          checked={formData.stoneName?.includes(s)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              stoneName: checked
                                ? [...(prev.stoneName || []), s]
                                : (prev.stoneName || []).filter((x) => x !== s),
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
                    <label className="text-sm font-medium text-gray-700">
                      Stone Colour(s)
                    </label>
                    <FieldUpdateBtn
                      field="stoneColour"
                      value={formData.stoneColour}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Clear',
                      'Blue',
                      'Pink',
                      'Red',
                      'Green',
                      'Yellow',
                      'White',
                      'Gold',
                      'Various',
                      'Violete',
                      'Orange',
                      'Black',
                      'Purple',
                      'Silver',
                    ].map((c) => (
                      <label key={c} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="stoneColour"
                          value={c}
                          checked={
                            Array.isArray(formData.stoneColour)
                              ? formData.stoneColour.includes(c)
                              : false
                          }
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              stoneColour: checked
                                ? [
                                    ...(Array.isArray(prev.stoneColour)
                                      ? prev.stoneColour
                                      : []),
                                    c,
                                  ]
                                : (Array.isArray(prev.stoneColour)
                                    ? prev.stoneColour
                                    : []
                                  ).filter((x) => x !== c),
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
                  <label className="text-sm font-medium text-gray-700">
                    Colour*
                  </label>
                  <FieldUpdateBtn field="colour" value={formData.colour} />
                </div>
                <select
                  name="colour"
                  value={formData.colour}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm bg-white"
                >
                  {colours.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Material (Optional)
                  </label>
                  <FieldUpdateBtn field="material" value={formData.material} />
                </div>
                <select
                  name="material"
                  value={formData.material || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                >
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
                  <label className="text-sm font-medium text-gray-700">
                    Size (Optional)
                  </label>
                  <FieldUpdateBtn field="size" value={formData.size} />
                </div>
                <input
                  type="text"
                  name="size"
                  value={formData.size || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                  placeholder="e.g. Adjustable"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Finish (Optional)
                  </label>
                  <FieldUpdateBtn field="finish" value={formData.finish} />
                </div>
                <select
                  name="finish"
                  value={formData.finish || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                >
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
                    <label className="text-xs font-medium text-gray-600">
                      Purchase Amount (₹)
                    </label>
                    <FieldUpdateBtn
                      field="purchaseAmount"
                      value={formData.purchaseAmount}
                    />
                  </div>
                  <input
                    type="number"
                    name="purchaseAmount"
                    value={formData.purchaseAmount || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white"
                    placeholder="Amount paid to buy"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-600">
                      Sales Amount (₹)
                    </label>
                    <FieldUpdateBtn
                      field="salesAmount"
                      value={formData.salesAmount}
                    />
                  </div>
                  <input
                    type="number"
                    name="salesAmount"
                    value={formData.salesAmount || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white"
                    placeholder="Amount if sold"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-600">
                      Deposit (₹)
                    </label>
                    <FieldUpdateBtn
                      field="deposit"
                      value={formData.deposit}
                    />
                  </div>
                  <input
                    type="number"
                    name="deposit"
                    value={formData.deposit || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white"
                    placeholder="Security deposit"
                  />
                </div>
                <div className="col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-600">
                      Shop Name (Where Purchased)
                    </label>
                    <FieldUpdateBtn
                      field="shopName"
                      value={formData.shopName}
                    />
                  </div>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-amber-200 rounded-md focus:outline-none focus:ring-amber-400 focus:border-amber-400 text-sm bg-white"
                    placeholder="e.g. Lalitha Jewellers, Chennai"
                  />
                </div>
              </div>
            </div>

            {/* Media Fields - Modern Drag & Drop Uploader */}
            <div className="border border-gray-200 rounded-lg p-5 bg-gray-50/50">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-800">
                  Upload Media (Images & Videos) (Optional)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {editingId
                    ? 'Leave empty to keep existing media, or drag & drop files to append.'
                    : 'If providing media, first item MUST be an image. Drag and drop multiple files to upload.'}
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById('media-file-input').click()
                }
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
                  <Upload
                    size={22}
                    className="animate-bounce"
                    style={{ animationDuration: '2s' }}
                  />
                </div>

                <p className="text-sm font-semibold text-gray-700">
                  Drag & drop images/videos here, or{' '}
                  <span className="text-[#B07A85] underline">browse files</span>
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
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Added Media ({mediaList.length})
                    </span>
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
                      const fileUrl = media.file
                        ? URL.createObjectURL(media.file)
                        : media.url;

                      return (
                        <div
                          key={index}
                          draggable="true"
                          onDragStart={(e) => handlePreviewDragStart(e, index)}
                          onDragOver={(e) => handlePreviewDragOver(e, index)}
                          onDrop={(e) => handlePreviewDrop(e, index)}
                          className={`relative group border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all aspect-square flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                            draggedItemIndex === index
                              ? 'opacity-40 border-[#B07A85]'
                              : ''
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Order Badge */}
                          <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                            Slot {index + 1}{' '}
                            {index === 0 && !editingId && ' (Cover)'}
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
                                <video
                                  src={fileUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                />
                                <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                  <div className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm">
                                    <Film size={16} />
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={fileUrl}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>

                          {/* Bottom label */}
                          <div className="p-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 truncate flex justify-between items-center font-medium">
                            <span className="truncate max-w-[70%]">
                              {media.file?.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-semibold text-[8px] uppercase tracking-wider ${
                                isVideo
                                  ? 'bg-indigo-50 text-indigo-600'
                                  : 'bg-[#FFF8F3] text-[#B07A85]'
                              }`}
                            >
                              {media.type}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* First item validation tip */}
                  {!editingId &&
                    mediaList.length > 0 &&
                    mediaList[0].type !== 'image' && (
                      <p className="text-xs font-semibold text-red-500 mt-2 flex items-center gap-1">
                        ⚠️ Warning: Slot 1 MUST be an image (currently a video).
                        Please remove or rearrange files so the first slot is an
                        image.
                      </p>
                    )}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-medium text-gray-700">
                  Description*
                </label>
                <FieldUpdateBtn field="description" value={formData.description} />
              </div>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
                placeholder="Detailed product description..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[#B07A85] text-white rounded-lg text-sm font-medium hover:bg-[#9E6A75] transition-colors flex items-center gap-2"
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={16} />{' '}
                    {editingId ? 'Save All Changes' : 'Save Product'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default JewelleryTab;
