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
                                    loading="lazy"
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
    </div>
  );
};

export default JewelleryTab;
