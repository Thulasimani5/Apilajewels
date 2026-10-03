import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DesktopSearchOverlay from './DesktopSearchOverlay';
import { useAuth } from '../context/AuthContext';
import "../styles/ApilaJewels.css";

// Assets for Navbar / Footer
import apilaLogo from '../assets/Apila Logo01.svg';
import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';

// Reusable Components
import HeroSection from '../components/HeroSection';
import CategoryGrid from '../components/CategoryGrid';
import JewelleryCarousel from '../components/JewelleryCarousel';
import OccasionGrid from '../components/OccasionGrid';
import TrendingSection from '../components/TrendingSection';
import DeliverySection from '../components/DeliverySection';
import StylingHelpSection from '../components/StylingHelpSection';
import MenuDrawer from '../components/MenuDrawer';
import DesktopFooter from '../components/DesktopFooter';

const Icon = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  heart: (
    <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
      <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor" />
    </svg>
  ),
  cart: (
    <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
      <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  account: (
    <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
      <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

export default function DesktopHome() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === 'footer-contact') {
      setTimeout(() => {
        document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.state]);

  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    let lastY = window.scrollY;
    let accDelta = 0;
    const DELTA_THRESHOLD = 6;
    const HERO_H = window.innerHeight;

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      setScrolled(y > HERO_H * 0.85);

      if (y < 80) {
        setNavHidden(false);
        accDelta = 0;
        return;
      }

      accDelta += delta;

      if (accDelta > DELTA_THRESHOLD) {
        setNavHidden(true);
        accDelta = 0;
      } else if (accDelta < -DELTA_THRESHOLD) {
        setNavHidden(false);
        accDelta = 0;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="apila">
      {/* NAVBAR */}
      <header>
        <nav className={`navbar${scrolled ? " scrolled" : ""}${navHidden ? " nav-hidden" : ""}`}>
          <div className="nav-left">
            <div className="nav-hamburger" role="button" aria-label="Menu" tabIndex={0} onClick={() => setMenuOpen(true)}>
              <span /><span /><span />
            </div>
            {!isSearchOpen && (
              <div className="nav-search" role="button" tabIndex={0} onClick={() => setIsSearchOpen(true)}>
                {Icon.search}<span>Search</span>
              </div>
            )}
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels" />
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>{Icon.heart}</button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>{Icon.cart}</button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/profile')}>{Icon.account}</button>
          </div>
        </nav>
      </header>

      {/* SEARCH OVERLAY */}
      {isSearchOpen && <DesktopSearchOverlay onClose={() => setIsSearchOpen(false)} />}

      {/* MENU DRAWER */}
      <MenuDrawer menuOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* HERO SECTION */}
      <HeroSection />

      {/* JEWELLERY TYPE GRID & CAROUSEL */}
      <section className="jewellery-type-section">
        <CategoryGrid />
        <JewelleryCarousel />
      </section>

      {/* SHOP BY OCCASION */}
      <OccasionGrid />

      {/* TRENDING COLLECTIONS */}
      <TrendingSection />

      {/* DELIVERY & PICKUP */}
      <DeliverySection />

      {/* NEED STYLING HELP */}
      <StylingHelpSection />

      {/* FOOTER */}
      <DesktopFooter id="footer-contact" />
    </div>
  );
}
