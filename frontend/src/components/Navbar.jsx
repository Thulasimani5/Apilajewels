import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchOverlay from "./SearchOverlay";
import logoImage from "../assets/Apila Logo01.svg";
import iconHeart from "../assets/icons/heart.svg";
import iconCart from "../assets/icons/cart.svg";
import iconPerson from "../assets/icons/person.svg";

/* ───────────────────────────────────────────── */

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const location = useLocation();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);
  const lastScrollY = useRef(0);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 15);

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Dynamic styling classes
  const navBgClass = isHomePage
    ? scrolled
      ? "bg-white/95 backdrop-blur-md shadow-luxury border-b border-gray-100"
      : "bg-transparent border-none"
    : "bg-white/95 backdrop-blur-md shadow-luxury border-b border-gray-100";

  const textColorClass = isHomePage
    ? scrolled
      ? "text-gray-800"
      : "text-white"
    : "text-gray-800";

  const logoFilterClass =
    isHomePage && !scrolled ? "brightness(0) invert(1)" : "none";

  // Custom icons are white by default; invert to dark when navbar is solid
  const iconFilterClass = isHomePage && !scrolled ? "none" : "brightness(0)";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${navBgClass} ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div
          className={`mx-auto px-4 sm:px-6 lg:px-8 ${isHomePage ? "md:max-w-none md:px-12 lg:px-20" : "max-w-7xl"
            }`}
        >
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Left Section: Hamburger Menu · Search */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className={`p-1 -ml-1 transition-colors duration-200 focus:outline-none hover:opacity-85 ${textColorClass}`}
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={2.2} />
              </button>

              {/* Dot separator — mobile only */}
              <span className={`text-[10px] opacity-50 select-none md:hidden ${textColorClass}`}>
                ·
              </span>

              {/* Mobile search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex md:hidden items-center gap-1.5 bg-transparent focus:outline-none transition-opacity duration-200 hover:opacity-70 ${textColorClass}`}
                aria-label="Search"
              >
                <Search size={15} strokeWidth={2} />
                <span className="text-[13px] font-light select-none tracking-wide hidden sm:inline">
                  Search
                </span>
              </button>

              {/* Desktop homepage — Figma pill search */}
              {isHomePage && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`hidden md:flex items-center gap-2.5 pl-4 focus:outline-none transition-all duration-200 hover:opacity-90 ${scrolled
                    ? "border-gray-200 text-gray-600"
                    : "text-white backdrop-blur-sm"
                    }`}
                  style={{
                    width: "264px",
                    height: "37px",
                    borderRadius: "18.5px",
                    border: scrolled ? "1px solid #e5e7eb" : "1px solid rgba(255, 255, 255, 0.1)",
                    backgroundColor: "transparent",
                  }}
                  aria-label="Search"
                >
                  <Search 
                    color={scrolled ? "currentColor" : "white"} 
                    strokeWidth={2} 
                    style={{ width: "17.943px", height: "18px", flexShrink: 0 }} 
                  />
                  <span className="text-[13px] font-light select-none tracking-wide">
                    Search
                  </span>
                </button>
              )}

              {/* Desktop non-homepage search */}
              {!isHomePage && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className={`hidden md:flex items-center gap-1.5 bg-transparent focus:outline-none transition-opacity duration-200 hover:opacity-70 ${textColorClass}`}
                  aria-label="Search"
                >
                  <Search size={15} strokeWidth={2} />
                  <span className="text-[13px] font-light select-none tracking-wide">
                    Search
                  </span>
                </button>
              )}
            </div>

            {/* Center Section: Actual Brand Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src={logoImage}
                  alt="Apila Jewels"
                  className="object-contain"
                  style={{
                    width: "auto",
                    height: "140px",
                    filter: logoFilterClass,
                    transition: "filter 0.3s ease",
                  }}
                />
              </Link>
            </div>

            {/* Right Section: Custom Icon Images */}
            <div className="flex items-center gap-4 md:gap-6">
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hover:opacity-70 transition-opacity"
              >
                <img
                  src={iconHeart}
                  alt="Wishlist"
                  style={{
                    width: "18px",
                    height: "16px",
                    filter: iconFilterClass,
                    transition: "filter 0.3s ease",
                  }}
                />
              </Link>
              <Link
                to="/cart"
                aria-label="Cart"
                className="hover:opacity-70 transition-opacity"
              >
                <img
                  src={iconCart}
                  alt="Cart"
                  style={{
                    width: "15px",
                    height: "17px",
                    filter: iconFilterClass,
                    transition: "filter 0.3s ease",
                  }}
                />
              </Link>

              {user ? (
                <div className="flex items-center relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="hover:opacity-70 transition-opacity focus:outline-none"
                    aria-label="Account Menu"
                  >
                    <img
                      src={iconPerson}
                      alt="Account"
                      style={{
                        width: "13px",
                        height: "15px",
                        filter: iconFilterClass,
                        transition: "filter 0.3s ease",
                      }}
                    />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] py-2 z-50 text-black">
                      <div className="px-4 py-2 border-b border-gray-50">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-[13px] font-bold text-gray-800 truncate">
                          {user.name || "Customer"}
                        </p>
                      </div>
                      {user.role === "admin" && (
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
                <Link
                  to="/login"
                  aria-label="Account"
                  className="hover:opacity-70 transition-opacity"
                >
                  <img
                    src={iconPerson}
                    alt="Account"
                    style={{
                      width: "13px",
                      height: "15px",
                      filter: iconFilterClass,
                      transition: "filter 0.3s ease",
                    }}
                  />
                </Link>
              )}
            </div>
          </div>
        </div>

        <SearchOverlay
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </nav>

      {/* ── Slide-out Menu Drawer ── */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 w-[78%] max-w-[280px] h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <img
              src={logoImage}
              alt="Apila Jewels"
              style={{ height: "32px", width: "auto" }}
            />
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-gray-500 hover:text-black p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Shop Collections
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/shop"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-semibold text-gray-800 hover:text-[#B07A85] transition-colors"
                >
                  All Jewellery
                </Link>
                <Link
                  to="/shop?category=bridal-set"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-600 hover:text-[#B07A85] transition-colors"
                >
                  Bridal Set
                </Link>
                <Link
                  to="/shop?category=bridal-maid"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-600 hover:text-[#B07A85] transition-colors"
                >
                  Bridal Maid
                </Link>
                <Link
                  to="/shop?category=designer"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-600 hover:text-[#B07A85] transition-colors"
                >
                  Designer Collections
                </Link>
                <Link
                  to="/shop?category=reception"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-600 hover:text-[#B07A85] transition-colors"
                >
                  Reception Wear
                </Link>
                <Link
                  to="/shop?category=party-wear"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-600 hover:text-[#B07A85] transition-colors"
                >
                  Party Wear
                </Link>
                <Link
                  to="/shop?category=small-jewel"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-600 hover:text-[#B07A85] transition-colors"
                >
                  Small Jewels
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Pages
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-700 hover:text-[#B07A85] transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-700 hover:text-[#B07A85] transition-colors"
                >
                  Wishlist
                </Link>
                <Link
                  to="/cart"
                  onClick={() => setIsDrawerOpen(false)}
                  className="text-[14px] font-medium text-gray-700 hover:text-[#B07A85] transition-colors"
                >
                  Shopping Cart
                </Link>
                {user?.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setIsDrawerOpen(false)}
                    className="text-[14px] font-medium text-gray-700 hover:text-[#B07A85] transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>

          {user ? (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs text-gray-400">Logged in as</p>
                <p className="text-[13px] font-bold text-gray-800 truncate">
                  {user.name || "Customer"}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  setIsDrawerOpen(false);
                }}
                className="text-xs font-semibold text-red-600 hover:underline flex-shrink-0"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-100">
              <Link
                to="/login"
                onClick={() => setIsDrawerOpen(false)}
                className="block w-full text-center py-2.5 bg-[#B07A85] hover:bg-[#9E6A75] text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
