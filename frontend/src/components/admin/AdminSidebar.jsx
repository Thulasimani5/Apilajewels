import React from 'react';
import { LayoutDashboard, Package, Calendar, Users, LogOut, List, Tag } from 'lucide-react';

/**
 * AdminSidebar
 * ------------
 * The persistent left navigation for the admin dashboard.
 * Receives the active tab and a tab-change callback via props.
 */
const AdminSidebar = ({ activeTab, onTabChange, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jewellery', label: 'Manage Jewellery', icon: Package },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'categories', label: 'Categories', icon: List },
    { id: 'types', label: 'Jewellery Types', icon: Tag },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 relative">
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-xl font-serif font-bold tracking-widest text-[#B07A85]">
          Apila Admin
        </span>
      </div>

      <nav className="p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-[#FFF8F3] text-[#B07A85]'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={20} />
            {label}
          </button>
        ))}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
