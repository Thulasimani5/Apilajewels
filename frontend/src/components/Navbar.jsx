import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ApilaLogo01 from '../assets/Apila Logo01.svg';
import SearchOverlay from './SearchOverlay';

/* ── Apila Jewels Logo (inline SVG matching provided image) ── */
const ApilaLogo = ({ height = 48 }) => {
  const scale = height / 56;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 280 56"
      height={height}
      width={280 * scale}
      fill="none"
      aria-label="Apila Jewels"
    >
      {/* ── Decorative asterisk / snowflake icon ── */}
      <g transform="translate(2,4)">
        {/* Vertical arms */}
        <rect x="22" y="3"  width="4" height="18" rx="2" fill="#111"/>
        <rect x="22" y="27" width="4" height="18" rx="2" fill="#111"/>
        {/* Horizontal arms */}
        <rect x="3"  y="22" width="18" height="4" rx="2" fill="#111"/>
        <rect x="27" y="22" width="18" height="4" rx="2" fill="#111"/>
        {/* Diagonal arms */}
        <rect x="10" y="7"  width="4" height="16" rx="2" fill="#111" transform="rotate(-45 12 15)"/>
        <rect x="30" y="25" width="4" height="16" rx="2" fill="#111" transform="rotate(-45 32 33)"/>
        <rect x="34" y="7"  width="4" height="16" rx="2" fill="#111" transform="rotate(45 36 15)"/>
        <rect x="10" y="25" width="4" height="16" rx="2" fill="#111" transform="rotate(45 12 33)"/>
        {/* Centre dot */}
        <circle cx="24" cy="24" r="3.5" fill="#111"/>
      </g>
      {/* ── Wordmark ── */}
      <g transform="translate(58, 0)">
        {/* Small 4-pointed star above the 'i' */}
        <path d="M75 5 L75.9 7.6 L78.5 8 L75.9 8.4 L75 11 L74.1 8.4 L71.5 8 L74.1 7.6 Z" fill="#111"/>
        {/* "Apila" */}
        <text
          x="0" y="44"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="46" fontWeight="700" letterSpacing="-1"
          fill="#111111"
        >Apila</text>
        {/* "JEWELS" */}
        <text
          x="22" y="55"
          fontFamily="'Inter', Helvetica, sans-serif"
          fontSize="9.5" fontWeight="400" letterSpacing="6.5"
          fill="#111111"
        >JEWELS</text>
      </g>
    </svg>
  );
};

/* ───────────────────────────────────────────── */

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-luxury border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

           {/* Logo (hidden on category pages) */}
           { !location.search.includes('type=') && (
             <Link to="/" className="flex-shrink-0 flex items-center">
               <img src={ApilaLogo01} alt="Apila Jewels" className="hidden sm:block h-11" />
               <img src={ApilaLogo01} alt="Apila Jewels" className="sm:hidden h-9" />
             </Link>
           ) }

          {/* Action Icons */}
          <div className="flex items-center gap-4 text-black">
            <button 
              aria-label="Search" 
              onClick={() => setIsSearchOpen(true)}
              className="hover:text-brand-black transition-colors duration-200"
            >
              <Search size={20} strokeWidth={2} />
            </button>
            <Link to="/wishlist" aria-label="Wishlist" className="hover:text-brand-black transition-colors duration-200">
              <Heart size={20} strokeWidth={2} />
            </Link>
            <Link to="/cart" aria-label="Cart" className="hover:text-brand-black transition-colors duration-200">
              <ShoppingCart size={20} strokeWidth={2} />
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4" ref={dropdownRef}>
                {/* User dropdown */}
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="hover:text-brand-black transition-colors duration-200 flex items-center gap-1.5 focus:outline-none"
                  aria-label="Account Menu"
                >
                  <User size={20} strokeWidth={2} />
                  <span className="text-[12px] font-medium text-gray-700 hidden sm:inline-block max-w-[80px] truncate">
                    {user.name || 'Customer'}
                  </span>
                </button>
                {/* Visible Logout button */}
                <button 
                  onClick={logout}
                  className="hover:text-red-600 transition-colors duration-200"
                  aria-label="Logout"
                >
                  <LogOut size={20} strokeWidth={2} />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-[13px] font-bold text-gray-800 truncate">{user.name || 'Customer'}</p>
                    </div>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setDropdownOpen(false)}
                        className="block w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-[#FFF8F3] hover:text-[#B07A85] transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" aria-label="Account" className="hover:text-brand-black transition-colors duration-200">
                <User size={20} strokeWidth={2} />
              </Link>
            )
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;
