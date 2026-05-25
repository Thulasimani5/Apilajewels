import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, Calendar, Users, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-serif font-bold tracking-widest text-[#B07A85]">Apila Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('jewellery')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'jewellery' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Package size={20} /> Manage Jewellery
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'bookings' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Calendar size={20} /> Bookings
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-[#FFF8F3] text-[#B07A85]' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Users size={20} /> Users
          </button>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Admin User</span>
            <div className="w-8 h-8 rounded-full bg-[#B07A85] text-white flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        
        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Jewellery</div>
                <div className="text-3xl font-bold text-gray-900">124</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Available</div>
                <div className="text-3xl font-bold text-green-600">89</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Bookings</div>
                <div className="text-3xl font-bold text-gray-900">45</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="text-sm font-medium text-gray-500 mb-1">Upcoming</div>
                <div className="text-3xl font-bold text-[#B07A85]">12</div>
              </div>
            </div>
          )}
          
          {activeTab === 'jewellery' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800">Inventory</h2>
                <button className="flex items-center gap-2 bg-[#B07A85] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#9E6A75]">
                  <Plus size={16} /> Add New
                </button>
              </div>
              <div className="p-6 text-center text-gray-500 text-sm">
                Table implementation goes here. Connects to GET /api/jewellery.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
