import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronRight, Phone, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SearchOverlay from "./SearchOverlay";
import DesktopSearchOverlay from "../pages/DesktopSearchOverlay";
import useIsDesktop from "../hooks/useIsDesktop";
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
  const isDesktop = useIsDesktop();

  const location = useLocation();
  const { user, logout, openLogin } = useAuth();
  const dropdownRef = useRef(null);
  const lastScrollY = useRef(0);

  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 15);

      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        if (window.innerWidth >= 768) {
          setIsVisible(false);
        }
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
      ? "bg-white/95 backdrop-blur-md md:shadow-luxury border-b border-gray-100"
      : "bg-transparent border-none"
    : "bg-white/95 backdrop-blur-md md:shadow-luxury border-b border-gray-100";

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
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* Left Section: Hamburger Menu · Search */}
            <div className="flex items-center gap-1.5 md:gap-2.5">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className={`p-1 -ml-1 transition-colors duration-200 focus:outline-none hover:opacity-85 ${textColorClass}`}
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={2} />
              </button>

              {/* Dot separator — mobile only */}
              <span className={`text-[10px] opacity-50 select-none md:hidden ${textColorClass}`}>
                ·
              </span>

              {/* Mobile search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`flex md:hidden items-center bg-transparent focus:outline-none transition-opacity duration-200 hover:opacity-70 ${textColorClass}`}
                aria-label="Search"
              >
                <Search size={20} strokeWidth={2} />
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
                  className="object-contain h-[31px] md:h-[45px]"
                  style={{
                    width: "auto",
                    height: "clamp(26px, 6.5vw, 40px)",
                    filter: logoFilterClass,
                    transition: "filter 0.3s ease",
                  }}
                />
              </Link>
            </div>

            {/* Right Section: Custom Icon Images */}
            <div className="flex items-center gap-5 md:gap-6">
              <Link
                to="/wishlist"
                aria-label="Wishlist"
                className="hover:opacity-70 transition-opacity"
              >
                <img
                  src={iconHeart}
                  alt="Wishlist"
                  style={{
                    width: "20px",
                    height: "20px",
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
                    width: "20px",
                    height: "20px",
                    filter: iconFilterClass,
                    transition: "filter 0.3s ease",
                  }}
                />
              </Link>

              {user ? (
                <div className={`flex items-center relative ${isHomePage ? 'hidden md:flex' : ''}`} ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="hover:opacity-70 transition-opacity focus:outline-none"
                    aria-label="Account Menu"
                  >
                    <img
                      src={iconPerson}
                      alt="Account"
                      style={{
                        width: "18px",
                        height: "18px",
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
                <button
                  onClick={openLogin}
                  aria-label="Account"
                  className="hover:opacity-70 transition-opacity hidden md:block"
                >
                  <img
                    src={iconPerson}
                    alt="Account"
                    style={{
                      width: "18px",
                      height: "18px",
                      filter: iconFilterClass,
                      transition: "filter 0.3s ease",
                    }}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Render search overlays outside nav to avoid transform containing block issues */}
      {isDesktop
        ? isSearchOpen && <DesktopSearchOverlay onClose={() => setIsSearchOpen(false)} />
        : <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      }

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
          className={`absolute top-0 left-0 w-full h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center px-6 py-5 border-b border-gray-100">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-[#111] focus:outline-none"
            >
              <X size={20} strokeWidth={1} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 pb-[40px]">
            {/* CATEGORY */}
            <div className="mt-[20px]">
              <p className="mb-[10px]" style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "10px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.77px", textTransform: "uppercase", opacity: 0.5 }}>
                CATEGORY
              </p>
              <div className="flex flex-col">
                {[
                  { label: 'VICTORIAN & MOISSINATE', url: '/shop?category=moissinate' },
                  { label: 'AD JEWELS', url: '/shop?category=ad-jewels' },
                  { label: 'GOLD ANTIQUE JEWELS', url: '/shop?category=gold-antique' },
                  { label: 'KUNDAN JEWELS', url: '/shop?category=kundan' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.url}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between py-[12px] hover:opacity-70 transition-opacity"
                    style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="text-black" strokeWidth={1.5} />
                  </Link>
                ))}
              </div>
            </div>

            {/* JEWELLERY TYPE */}
            <div className="mt-[20px]">
              <p className="mb-[10px]" style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "10px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.77px", textTransform: "uppercase", opacity: 0.5 }}>
                JEWELLERY TYPE
              </p>
              <div className="flex flex-col">
                {[
                  { label: 'CHOKER & NECKLACE', url: '/shop?type=choker' },
                  { label: 'LONG HARAM', url: '/shop?type=haram' },
                  { label: 'SEMI BRIDAL SET', url: '/shop?type=semi-bridal' },
                  { label: 'FULL BRIDAL SET', url: '/shop?type=full-bridal' },
                  { label: 'BANGLES & BRACELETS', url: '/shop?type=bangles' },
                  { label: 'ACCESSORIES', url: '/shop?category=accessories' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.url}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between py-[12px] hover:opacity-70 transition-opacity"
                    style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="text-black" strokeWidth={1.5} />
                  </Link>
                ))}
              </div>
            </div>

            {/* OCCASION */}
            <div className="mt-[20px]">
              <p className="mb-[10px]" style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "10px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.77px", textTransform: "uppercase", opacity: 0.5 }}>
                OCCASION
              </p>
              <div className="flex flex-col">
                {[
                  { label: 'BRIDAL SET', url: '/shop?occasion=bridal' },
                  { label: 'BRIDEMAID', url: '/shop?occasion=bridesmaid' },
                  { label: 'DESIGNER COLLECTION', url: '/shop?occasion=designer' },
                  { label: 'RECEPTION JEWELS', url: '/shop?occasion=reception' },
                  { label: 'PARTY WEAR', url: '/shop?occasion=party' },
                  { label: 'SMALL JEWELS', url: '/shop?occasion=small' },
                ].map((item) => (
                  <Link
                    key={item.label}
                    to={item.url}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center justify-between py-[12px] hover:opacity-70 transition-opacity"
                    style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}
                  >
                    <span>{item.label}</span>
                    <ChevronRight size={14} className="text-black" strokeWidth={1.5} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Section */}
            <div className="py-6 mt-[20px] flex flex-col gap-6 bg-white">
              {user ? (
                <div className="flex items-center gap-4 text-[#333] cursor-pointer hover:text-[#111] transition-colors" onClick={() => { logout(); setIsDrawerOpen(false); }}>
                  <User size={16} strokeWidth={1.5} />
                  <span style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "13px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}>LOGOUT</span>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-4 text-[#333] hover:text-[#111] transition-colors w-full text-left"
                >
                  <User size={16} strokeWidth={1.5} />
                  <span style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "13px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}>LOGIN</span>
                </Link>
              )}

              <div className="border-t border-[#EAEAEA] pt-6 flex items-center gap-4 text-[#333]">
                <Phone size={16} strokeWidth={1.5} />
                <span style={{ color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "13px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}>+91 73977 21101</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
