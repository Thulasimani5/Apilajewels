import React from 'react';
import { Plus, Save, X, List } from 'lucide-react';

/**
 * TypesTab
 * --------
 * Renders Jewellery Types filter section management form and list.
 */
const TypesTab = ({
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
  onSaveType,
  onDeleteType,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="font-semibold text-gray-800">Jewellery Types</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            These appear in the Jewellery Type filter section
          </p>
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
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Type Name
              </label>
              <input
                type="text"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="e.g. Bangles, Bracelets..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#B07A85]/30 focus:border-[#B07A85]"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={onSaveType}
                className="flex items-center gap-1.5 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#9E6A75] transition-colors"
              >
                <Save size={14} /> {editingTypeId ? 'Update' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowTypeForm(false);
                  setNewTypeName('');
                  setEditingTypeId(null);
                }}
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
            {typesList.map((tp) => (
              <div
                key={tp._id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-[#B07A85]/40 hover:shadow-sm transition-all group"
              >
                <span className="font-medium text-gray-800 text-sm">
                  {tp.name}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingTypeId(tp._id);
                      setNewTypeName(tp.name);
                      setShowTypeForm(true);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Edit Type"
                  >
                    <Save size={13} />
                  </button>
                  <button
                    onClick={() => onDeleteType(tp._id)}
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
  );
};

export default TypesTab;
