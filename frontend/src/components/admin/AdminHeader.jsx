import React from 'react';

/**
 * AdminHeader
 * -----------
 * The sticky top header bar shown above the main content area.
 */
const AdminHeader = ({ activeTab, showAddForm }) => {
  const tabLabel = activeTab.replace('-', ' ');
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-xl font-semibold text-gray-800 capitalize">
        {tabLabel}
        {showAddForm && ' > Add New'}
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-600">Admin User</span>
        <div className="w-8 h-8 rounded-full bg-[#B07A85] text-white flex items-center justify-center font-bold">
          A
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
