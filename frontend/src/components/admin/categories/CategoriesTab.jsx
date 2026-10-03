import React from 'react';
import { Plus, Package, Tag, X } from 'lucide-react';

/**
 * CategoriesTab
 * -------------
 * Renders Category & Type creation form and list/grid.
 */
const CategoriesTab = ({
  categories,
  newCategoryName,
  setNewCategoryName,
  newCategorySubtext,
  setNewCategorySubtext,
  newCategoryShowInSection,
  setNewCategoryShowInSection,
  setNewCategoryImage,
  isAddingCategory,
  onAddCategory,
  onDeleteCategory,
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
  onUpdateCategory,
  onOpenEditCategory,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="font-semibold text-gray-800">Manage Categories & Types</h2>
      </div>

      {/* Form: Add New Category */}
      <div className="p-6 border-b border-gray-100">
        <form
          onSubmit={onAddCategory}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display in Filter Section <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtext (Optional)
            </label>
            <input
              type="text"
              value={newCategorySubtext}
              onChange={(e) => setNewCategorySubtext(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] text-sm"
              placeholder="e.g. Timeless Elegance"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image (Optional)
            </label>
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
              <Plus size={16} />{' '}
              {isAddingCategory ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      {/* Grid: Categories List */}
      <div className="p-6">
        {!categories || categories.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat._id}
                className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* Edit inline form */}
                {editingCategory?._id === cat._id ? (
                  <form
                    onSubmit={onUpdateCategory}
                    className="p-4 flex flex-col gap-3"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Display in Filter Section *
                      </label>
                      <select
                        value={editCategoryShowInSection}
                        onChange={(e) =>
                          setEditCategoryShowInSection(e.target.value)
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85] bg-white"
                        required
                      >
                        <option value="category">Category Filter</option>
                        <option value="type">Jewellery Type Filter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Subtext (Optional)
                      </label>
                      <input
                        type="text"
                        value={editCategorySubtext}
                        onChange={(e) => setEditCategorySubtext(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#B07A85] focus:border-[#B07A85]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Replace Image (Optional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setEditCategoryImage(e.target.files[0])}
                        className="w-full text-xs border border-gray-200 rounded-md py-1 px-2 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#FFF8F3] file:text-[#B07A85]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isSavingCategory}
                        className="flex-1 py-1.5 bg-[#B07A85] text-white text-xs font-semibold rounded-lg hover:bg-[#9E6A75] disabled:opacity-50 transition-colors"
                      >
                        {isSavingCategory ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategory(null)}
                        className="flex-1 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm text-[#B07A85]">
                          {cat.showInSection === 'type' ? (
                            <Tag size={20} />
                          ) : (
                            <Package size={20} />
                          )}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-800 block text-sm">
                          {cat.name}
                        </span>
                        <div className="flex flex-col gap-0.5 mt-0.5">
                          {cat.subtext && (
                            <span className="text-[11px] text-gray-400">
                              {cat.subtext}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider self-start px-1.5 py-0.5 rounded-full ${
                              cat.showInSection === 'type'
                                ? 'bg-[#FFF8F3] text-[#B07A85]'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {cat.showInSection === 'type'
                              ? 'Jewellery Type'
                              : 'Category'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenEditCategory(cat)}
                        className="text-[#B07A85] hover:text-[#9E6A75] p-2 rounded-md hover:bg-[#FFF8F3] transition-colors"
                        title="Edit Category"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteCategory(cat._id)}
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
  );
};

export default CategoriesTab;
