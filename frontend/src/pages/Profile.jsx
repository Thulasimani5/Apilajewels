import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { User, Heart, ShoppingBag, LogOut, ShieldCheck, Phone, ArrowRight } from 'lucide-react';
import useIsDesktop from '../hooks/useIsDesktop';

const Profile = () => {
  const { user, logout, openLogin } = useAuth();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center mt-16 md:mt-24">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F4] flex items-center justify-center mb-6">
            <User size={32} className="text-[#AA6C81]" />
          </div>
          <h1 
            className="text-2xl md:text-3xl mb-3 text-[#111]"
            style={{ fontFamily: "'Bacasime Antique', serif" }}
          >
            My Profile
          </h1>
          <p 
            className="text-xs md:text-sm text-gray-600 max-w-sm mb-8 leading-relaxed"
            style={{ fontFamily: "'Gotham Book', sans-serif" }}
          >
            Please log in to view your profile details, order preferences, and saved items.
          </p>
          <button
            onClick={openLogin}
            className="px-8 py-3.5 bg-[#AA6C81] text-white text-xs font-medium tracking-[1.5px] uppercase transition-all duration-200 hover:bg-[#8e5669] shadow-sm hover:shadow-md"
            style={{ fontFamily: "'Gotham Book', sans-serif" }}
          >
            Log In / Sign Up
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 mt-16 md:mt-24">
        {/* Header Title */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <h1 
            className="text-3xl md:text-4xl text-[#111] mb-2"
            style={{ fontFamily: "'Bacasime Antique', serif" }}
          >
            My Account
          </h1>
          <p 
            className="text-xs text-gray-500 uppercase tracking-wider"
            style={{ fontFamily: "'Gotham Book', sans-serif" }}
          >
            Manage your profile & account preferences
          </p>
        </div>

        {/* User Card Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-[#AA6C81] text-white flex items-center justify-center text-2xl font-semibold shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : user.mobile ? user.mobile.slice(-2) : 'A'}
            </div>
            <div>
              <h2 
                className="text-xl sm:text-2xl font-normal text-[#111]"
                style={{ fontFamily: "'Bacasime Antique', serif" }}
              >
                {user.name || 'Valued Customer'}
              </h2>
              <p 
                className="text-xs text-gray-500 mt-1 flex items-center gap-2"
                style={{ fontFamily: "'Gotham Book', sans-serif" }}
              >
                <Phone size={13} className="text-[#AA6C81]" />
                +91 {user.mobile || 'N/A'}
              </p>
              {user.role === 'admin' && (
                <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#FFF0F4] text-[#AA6C81] border border-[#F5C2CB]">
                  <ShieldCheck size={12} /> Admin Account
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium tracking-wider uppercase rounded-xl transition-colors flex items-center justify-center gap-2"
            style={{ fontFamily: "'Gotham Book', sans-serif" }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Wishlist Box */}
          <Link 
            to="/wishlist"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8F3] text-[#AA6C81] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart size={22} />
              </div>
              <div>
                <h3 
                  className="text-base font-semibold text-[#111]"
                  style={{ fontFamily: "'Gotham Book', sans-serif" }}
                >
                  My Wishlist
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">View your saved luxury jewellery items</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#AA6C81] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Cart Box */}
          <Link 
            to="/cart"
            className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#FFF8F3] text-[#AA6C81] flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShoppingBag size={22} />
              </div>
              <div>
                <h3 
                  className="text-base font-semibold text-[#111]"
                  style={{ fontFamily: "'Gotham Book', sans-serif" }}
                >
                  My Cart
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">View items selected for rental & inquiry</p>
              </div>
            </div>
            <ArrowRight size={18} className="text-gray-400 group-hover:text-[#AA6C81] group-hover:translate-x-1 transition-all" />
          </Link>

          {/* Admin Dashboard (If Admin) */}
          {user.role === 'admin' && (
            <Link 
              to="/admin"
              className="group bg-[#FFF8F3] p-6 rounded-2xl border border-[#FADEC9] shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex items-center justify-between md:col-span-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#AA6C81] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 
                    className="text-base font-semibold text-[#111]"
                    style={{ fontFamily: "'Gotham Book', sans-serif" }}
                  >
                    Admin Dashboard
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">Manage products, categories, orders & store settings</p>
                </div>
              </div>
              <ArrowRight size={18} className="text-[#AA6C81] group-hover:translate-x-1 transition-all" />
            </Link>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="px-10 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold tracking-[1.5px] uppercase rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            style={{ fontFamily: "'Gotham Book', sans-serif" }}
          >
            <LogOut size={16} />
            Logout from Account
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
