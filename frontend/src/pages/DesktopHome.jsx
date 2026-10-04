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

  /* ---- Context & API logic ---- */
  const TRENDING_SAMPLES = [
    { id: 's1', category: 'victorian-moissinate', name: 'Moissanite Designer Polki Necklace', price: '₹1299.00', img: carouselImg1 },
    { id: 's2', category: 'AD Jewels', name: 'American Diamond Necklace Set', price: '₹1299.00', img: carouselImg2 },
    { id: 's3', category: 'Antique Jewel', name: 'Gold Antique Premium Necklace', price: '₹1299.00', img: carouselImg3 },
    { id: 's4', category: 'Kundan Jewels', name: 'Kundan Bridal Necklace Set', price: '₹1299.00', img: carouselImg4 },
    { id: 's6', category: 'AD Jewels', name: 'American Diamond Bangle Set', price: '₹1299.00', img: carouselImg6 },
    { id: 's8', category: 'victorian-moissinate', name: 'Moissanite Designer Polki Necklace', price: '₹1299.00', img: carouselImg1 },
    { id: 's9', category: 'AD Jewels', name: 'American Diamond Necklace Set', price: '₹1299.00', img: carouselImg2 },
    { id: 's10', category: 'Antique Jewel', name: 'Gold Antique Premium Necklace', price: '₹1299.00', img: carouselImg3 },
    { id: 's11', category: 'Kundan Jewels', name: 'Kundan Bridal Necklace Set', price: '₹1299.00', img: carouselImg4 },
  ];

  const [trending, setTrending] = useState([]);
  const [wishlisted, setWishlisted] = useState({});

  useEffect(() => {
    localStorage.removeItem('apila_trending_grid'); // clear old v1 cache key
    const toCard = item => {
      const rawImg = item.images?.[0];
      const imgUrl = rawImg?.url || rawImg?.secure_url
        || (typeof rawImg === 'string' && rawImg.startsWith('http') ? rawImg : '')
        || '';
      const priceVal = item.rentalPrice || item.price || 0;
      const price = (item.showPrice === false || priceVal > 1200) ? 'Price on Request' : `₹${priceVal.toFixed(2)}`;
      const category = Array.isArray(item.category) ? item.category[0] : (item.category || 'Jewels');
      return {
        id: item._id,
        category,
        name: item.name || '',
        price,
        img: imgUrl,
        showPrice: item.showPrice
      };
    };

    /* Step 1 — show cache instantly, zero loading time on revisit.
       Invalidate cache if it predates the category field (schema v2). */
    if (trendingGridMemCache && !trendingGridMemCache[0]?.category) {
      trendingGridMemCache = null;
    }
    if (trendingGridMemCache) {
      setTrending(trendingGridMemCache);
    } else {
      try {
        const stored = localStorage.getItem(TRENDING_GRID_CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          trendingGridMemCache = parsed;
          setTrending(parsed);
        }
      } catch { }
    }

    /* Step 2 — fetch fresh random 12 items in background, update cache */
    const refresh = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?random=true&limit=12`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.data || data.products || []);
        // Exclude Accessories items from trending — they should only appear when explicitly filtered
        list = list.filter(item => {
          const types = Array.isArray(item.type) ? item.type : [item.type];
          return !types.some(t => t?.toLowerCase() === 'accessories');
        });
        if (list.length > 0) {
          const cards = list.map(toCard);
          trendingGridMemCache = cards;
          try { localStorage.setItem(TRENDING_GRID_CACHE_KEY, JSON.stringify(cards)); } catch { }
          setTrending(cards);
        }
      } catch (err) {
        console.error('Failed to fetch trending items:', err);
      }
    };
    refresh();
  }, []);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* Grid — 4 static cards matching Figma design */
  const MAIN_JEWELLERY_TYPES = [
    { title: "Victorian & Moissinate", sub: "Premium Luxury Design", img: imgVictorianMoissinate, slug: "victorian-moissinate" },
    { title: "American Diamond", sub: "Modern Sparkle Collections", img: imgAmericanDiamond, slug: "american-diamond" },
    { title: "Gold Antique Jewels", sub: "Timeless Heritage Designs", img: imgGoldAntique, slug: "gold-antique-jewels" },
    { title: "Kundan Jewels", sub: "Traditional Collections", img: imgKundan, slug: "kundan-jewels" },
  ];

  /* Carousel — 6 static cards matching Figma design */
  const CAROUSEL = [
    { title: "Semi Bridal & Combo Sets", sub: "Explore Now", img: imgSemiBridal, slug: "semi-bridal" },
    { title: "Full Bridal Set", sub: "Explore Now", img: imgLongHaram, slug: "full-bridal" },
    { title: "Choker & Necklace Set", sub: "Explore Now", img: imgChokerNecklace, slug: "choker-necklace" },
    { title: "Long Haram", sub: "Explore Now", img: imgFullBridal, slug: "long-haram" },
    { title: "Bangles & Bracelets", sub: "Explore Now", img: imgBanglesBracelets, slug: "bangles-bracelets" },
    { title: "Accessories", sub: "Explore Now", img: imgAccessories, slug: "accessories" },
  ];

  /* ---- carousel logic ---- */
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  // Desktop: 100/30.73 ≈ 3.254 — matches Figma's 531px-wide cards on 1728px canvas
  // This shows 3 full cards + a ~4% peek of the 4th card on the right edge
  const visibleCount = () =>
    window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 100 / 30.73;
  const maxSlide = useCallback(
    () => Math.max(0, CAROUSEL.length - Math.floor(visibleCount())),
    [CAROUSEL.length]
  );
  const goTo = useCallback((idx) => {
    setCurrent((prev) => {
      const next = Math.max(0, Math.min(idx, maxSlide()));
      return next;
    });
  }, [maxSlide]);

  // keep position valid on resize, and recalculate pixel translation
  useEffect(() => {
    const onResize = () => {
      goTo(current);
      const wrapper = trackRef.current?.parentElement;
      const ww = wrapper ? wrapper.offsetWidth : window.innerWidth;
      const isSmall = window.innerWidth <= 640;
      const isMed = !isSmall && window.innerWidth <= 1024;
      const cardW = isSmall ? ww : isMed ? ww * 0.5 : ww * 0.3073;
      const gap = (!isSmall && !isMed) ? 16 : 0;
      setTranslatePx(current * (cardW + gap));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [current, goTo]);

  // auto-advance, pause on hover
  const pausedRef = useRef(false);
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setCurrent((c) => (c >= maxSlide() ? 0 : c + 1));
    }, 3500);
    return () => clearInterval(id);
  }, [maxSlide]);

  // Pixel-based translation accounts for the 16px column-gap between cards
  const [translatePx, setTranslatePx] = useState(0);
  useEffect(() => {
    const wrapper = trackRef.current?.parentElement;
    const ww = wrapper ? wrapper.offsetWidth : window.innerWidth;
    const isSmall = window.innerWidth <= 640;
    const isMed = !isSmall && window.innerWidth <= 1024;
    const cardW = isSmall ? ww : isMed ? ww * 0.5 : ww * 0.3073;
    const gap = (!isSmall && !isMed) ? 16 : 0;
    setTranslatePx(current * (cardW + gap));
  }, [current]);

  const dotCount = 3;
  const activeDotIndex = maxSlide() > 0 ? Math.round((current / maxSlide()) * (dotCount - 1)) : 0;

  // Row 1: Bridal Set, Bridesmaid, Designer — Row 2: Reception, Party Wear, Small Jewel
  const OCCASIONS = [
    { img: imgC1, label: "Bridal Set", sub: "Collections", slug: "bridal-set" },
    { img: imgC2, label: "Bridesmaid", sub: "Collections", slug: "bridesmaid" },
    { img: imgC3, label: "Designer", sub: "Collections", slug: "designer" },
    { img: imgC4, label: "Reception", sub: "Collections", slug: "reception" },
    { img: imgC5, label: "Party Wear", sub: "Collections", slug: "party-wear" },
    { img: imgC6, label: "Small Jewel", sub: "Collections", slug: "small-jewel" }
  ];

  const DELIVERY = [
    { icon: iconSecurePackaging, head: "Secure Packaging", desc: "Tamper proof packaging for your precious jewels." },
    { icon: iconDoorstepDelivery, head: "Doorstep Delivery", desc: "Delivered safely to your doorstep on time." },
    { icon: iconTimelyReturn, head: "Timely Return Pickup", desc: "We pick up your jewels at your convenience." },
  ];
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
