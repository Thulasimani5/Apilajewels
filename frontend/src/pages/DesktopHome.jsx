import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import DesktopSearchOverlay from './DesktopSearchOverlay';
import { useAuth } from '../context/AuthContext';
import "../styles/ApilaJewels.css";
import API_BASE_URL from '../config/api';

// Existing local images for occasions
import imgC1 from '../assets/images/c1.jpg';
import imgC2 from '../assets/images/c2.jpg';
import imgC3 from '../assets/images/c3.jpg';
import imgC4 from '../assets/images/c4.jpg';
import imgC5 from '../assets/images/c5.jpg';
import imgC6 from '../assets/images/c6.jpg';
import heroBanner from '../assets/images/Header-image01.jpg';
import apilaLogo from '../assets/Apila Logo01.svg';

// Delivery icons
import iconSecurePackaging from '../assets/icons/Secure.svg';
import iconDoorstepDelivery from '../assets/icons/Doorstepdelivery.svg';
import iconTimelyReturn from '../assets/icons/TimelyReturn.svg';
import iconHassleFree from '../assets/icons/HassleFree.svg';

// Footer icons
import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';

// Carousel images (from Figma design — all 7 cards)
import carouselImg1 from '../assets/images/carousel1.jpg';
import carouselImg2 from '../assets/images/carousel2.jpg';
import carouselImg3 from '../assets/images/carousel3.jpg';
import carouselImg4 from '../assets/images/carousel4.jpg';
import carouselImg5 from '../assets/images/carousel5.jpg';
import carouselImg6 from '../assets/images/carousel6.jpg';
import carouselImg7 from '../assets/images/carousel7.jpg';

import imgVictorianMoissinate from '../assets/images/jtype-victorian-moissinate.jpg';
import imgAmericanDiamond from '../assets/images/jtype-american-diamond.jpg';
import imgGoldAntique from '../assets/images/jtype-gold-antique.jpg';
import imgKundan from '../assets/images/jtype-kundan.jpg';

import imgAccessories from '../assets/images/jtype-accessories.jpg';
import imgBanglesBracelets from '../assets/images/jtype-bangles-bracelets.jpg';
import imgLongHaram from '../assets/images/E10.jpg';
import imgChokerNecklace from '../assets/images/E9.jpg';
import imgSemiBridal from '../assets/images/E5.jpg';
import imgFullBridal from '../assets/images/E8.jpg';

/* Module-level cache for Trending grid — persists across re-renders & overlay toggles */
let trendingGridMemCache = null;
const TRENDING_GRID_CACHE_KEY = 'apila_trending_grid_v2';

/* small inline-SVG helpers */
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
  ),
  arrow: (
    <svg width="8.403" height="16.807" viewBox="80 0 11 17" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
      <path d="M82.1462 15.6236L81.7927 15.9772L82.4998 16.6843L82.8533 16.3307L82.4998 15.9772L82.1462 15.6236ZM90.1348 8.34218L90.4883 8.69574C90.6836 8.50047 90.6836 8.18389 90.4883 7.98863L90.1348 8.34218ZM82.4998 15.9772L82.8533 16.3307L90.4883 8.69574L90.1348 8.34218L89.7812 7.98863L82.1462 15.6236L82.4998 15.9772ZM90.1348 8.34218L90.4883 7.98863L82.8533 0.35364L82.4998 0.707194L82.1462 1.06075L89.7812 8.69574L90.1348 8.34218Z" fill="currentColor" />
    </svg>
  ),
  phone: (
    <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  mail: (
    <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  pin: (
    <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  whatsappFill: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.114.546 4.1 1.5 5.83L0 24l6.335-1.662A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.366l-.36-.214-3.727.978.994-3.632-.234-.373A9.818 9.818 0 1 1 12 21.818z" />
    </svg>
  )
};


/* WishButton */
function WishButton({ active, onClick }) {
  return (
    <button
      className={`product-wish${active ? " active" : ""}`}
      aria-label="Add to wishlist"
      aria-pressed={active}
      onClick={onClick}
    >
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "currentColor"} strokeWidth="1.6">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

/* Reveal */
function Reveal({ children, as: Tag = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVisible(true); return; }
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={`reveal${visible ? " visible" : ""} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  /* scroll to footer-contact when navigated here with state */
  useEffect(() => {
    if (location.state?.scrollTo === 'footer-contact') {
      setTimeout(() => {
        document.getElementById('footer-contact')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.state]);

  /* ---- navbar scroll state ---- */
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openLogin } = useAuth();

  /* lock body scroll while menu is open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    // Track accumulated delta to avoid flicker from tiny jitters
    let lastY = window.scrollY;
    let accDelta = 0;
    const DELTA_THRESHOLD = 6; // px before we commit to a direction
    const HERO_H = window.innerHeight; // hero is 100vh

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;

      // White background only once we've left the hero viewport
      setScrolled(y > HERO_H * 0.85);

      // Back at very top — always show transparent nav
      if (y < 80) {
        setNavHidden(false);
        accDelta = 0;
        return;
      }

      // Accumulate delta to prevent jitter-toggling
      accDelta += delta;

      if (accDelta > DELTA_THRESHOLD) {
        // Sustained scroll DOWN → hide
        setNavHidden(true);
        accDelta = 0;
      } else if (accDelta < -DELTA_THRESHOLD) {
        // Sustained scroll UP → show
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
      const price = priceVal >= 2000 ? 'Premium Collection' : `₹${priceVal.toFixed(2)}`;
      const category = Array.isArray(item.category) ? item.category[0] : (item.category || 'Jewels');
      return {
        id: item._id,
        category,
        name: item.name || '',
        price,
        img: imgUrl,
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
        const page = Math.floor(Math.random() * 4) + 1;
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=12&page=${page}`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.data || data.products || []);
        if (list.length === 0) {
          const fb = await fetch(`${API_BASE_URL}/api/jewellery?limit=12`);
          const fbData = await fb.json();
          list = Array.isArray(fbData) ? fbData : (fbData.data || fbData.products || []);
        }
        if (list.length > 0) {
          const cards = list.slice(0, 12).map(toCard);
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
    { icon: iconHassleFree, head: "Hassle Free Experience", desc: "Smooth, easy & worry-free from start to finish." }
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
            <button className="nav-icon-btn" aria-label="Account" onClick={openLogin}>{Icon.account}</button>
          </div>
        </nav>
      </header>

      {/* ── SEARCH OVERLAY (Figma 524:1413) ── */}
      {isSearchOpen && <DesktopSearchOverlay onClose={() => setIsSearchOpen(false)} />}

      {/* ── MENU DRAWER (Figma 491:2) ── */}
      <div className={`menu-overlay${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
        <div className="menu-panel">

          {/* Topbar: close button + search bar */}
          <div className="menu-topbar">
            <button className="menu-close-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 1l11 11M12 1L1 12" stroke="#000" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <div className="menu-searchbar" onClick={() => { setMenuOpen(false); navigate('/shop'); }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="menu-search-placeholder">Search</span>
            </div>
          </div>

          {/* ── scrollable nav area ── */}
          <div className="menu-nav-scroll">

            {/* Section 1 — CATEGORY */}
            <span className="menu-section-heading">Category</span>
            <ul className="menu-section menu-section--first">
              {[
                { label: 'Victorian & Moissinate', slug: 'victorian-moissinate' },
                { label: 'AD Jewels', slug: 'ad-jewels' },
                { label: 'Gold Antique Jewels', slug: 'gold-antique-jewels' },
                { label: 'Kundan Jewels', slug: 'kundan-jewels' },
              ].map(item => (
                <li key={item.slug} className="menu-item">
                  <Link to={`/shop?category=${item.slug}`} className="menu-item-link" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                  <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                    <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

            <hr className="menu-rule" />

            {/* Section 2 — JEWELLERY TYPE */}
            <span className="menu-section-heading">Jewellery Type</span>
            <ul className="menu-section">
              {[
                { label: 'Choker & Necklace', slug: 'choker-necklace' },
                { label: 'Long Haram', slug: 'long-haram' },
                { label: 'Semi Bridal Set', slug: 'semi-bridal' },
                { label: 'Full Bridal Set', slug: 'full-bridal' },
                { label: 'Bangles', slug: 'bangles-bracelets' },
                { label: 'Accessories', slug: 'accessories' },
              ].map(item => (
                <li key={item.slug} className="menu-item">
                  <Link to={`/shop?category=${item.slug}`} className="menu-item-link" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                  <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                    <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

            <hr className="menu-rule" />

            {/* Section 3 — OCCASION */}
            <span className="menu-section-heading">Occasion</span>
            <ul className="menu-section">
              {[
                { label: 'Bridal Set', slug: 'bridal' },
                { label: 'Bridesmaid', slug: 'bridesmaid' },
                { label: 'Designer Collection', slug: 'designer' },
                { label: 'Reception Jewels', slug: 'reception' },
                { label: 'Party Wear', slug: 'party' },
                { label: 'Small Jewels', slug: 'small' },
              ].map(item => (
                <li key={item.slug} className="menu-item">
                  <Link to={`/shop?occasion=${item.slug}`} className="menu-item-link" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                  <svg className="menu-chevron" width="5" height="9" viewBox="0 0 5 9" fill="none">
                    <path d="M1 1l3 3.5L1 8" stroke="#000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </li>
              ))}
            </ul>

          </div>

          {/* ── static Contact Us (always visible at bottom) ── */}
          <div className="menu-contact">
            <p className="menu-contact-heading">Contact Us</p>
            <hr className="menu-rule menu-rule--contact" />
            <a href="tel:+917397721101" className="menu-contact-row">
              <img src={iconCall} width="14" height="14" alt="" />
              <span>+91 73977 21101</span>
            </a>
          </div>

        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <img className="hero-bg" src={heroBanner} alt="Bridal Jewellery" />
        <div className="hero-content">
          <h1 className="hero-title">{"Premium Bridal Jewellery\nRental in Chennai"}</h1>
          <p className="hero-sub">
            Premium Rental Collections Crafted For Weddings,<br />Receptions And Celebrations.
          </p>
          <button className="btn-primary" onClick={() => navigate('/shop')}><span>Explore All Jewels</span></button>
        </div>
      </section>

      {/* JEWELLERY TYPE GRID & CAROUSEL */}
      <section className="jewellery-type-section">
        <div className="jewellery-grid">
          {MAIN_JEWELLERY_TYPES.map((c, i) => (
            <Link to={`/shop?category=${c.slug}`} className="jewellery-grid-card" key={i}>
              <img src={c.img} alt={c.title} />
              <div className="jewellery-grid-overlay">
                <p className="jewellery-grid-title">{c.title}</p>
                <p className="jewellery-grid-sub">{c.sub}</p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="section-title">Shop By Jewellery Type</h2>

        <div
          className="carousel-wrapper"
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
        >
          <div ref={trackRef} className="carousel-track"
            style={{ transform: `translateX(-${translatePx}px)` }}>
            {CAROUSEL.map((c, i) => (
              <Link to={`/shop?category=${c.slug}`} className="carousel-card" key={i}>
                <img src={c.img} alt={c.title} loading={i === 0 ? "eager" : "lazy"} />
                <div className="carousel-card-overlay">
                  <p className="carousel-card-title">{c.title}</p>
                  <p className="carousel-card-sub" style={{ textTransform: 'uppercase', fontSize: '13px', letterSpacing: '1px', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationThickness: '1px' }}>{c.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="carousel-nav">
          <button className="carousel-nav-btn" aria-label="Previous"
            onClick={() => goTo(current - 1)}><span style={{ transform: 'scaleX(-1)', display: 'flex' }}>{Icon.arrow}</span></button>
          {Array.from({ length: dotCount }).map((_, i) => (
            <span key={i}
              className={`carousel-dot${i === activeDotIndex ? " active" : ""}`}
              role="button" aria-label={`Slide ${i + 1}`}
              onClick={() => goTo(maxSlide() > 0 ? Math.round((i / (dotCount - 1)) * maxSlide()) : 0)} />
          ))}
          <button className="carousel-nav-btn" aria-label="Next"
            onClick={() => goTo(current + 1)}>{Icon.arrow}</button>
        </div>
      </section>

      {/* SHOP BY OCCASION */}
      <section className="occasion-section">
        <h2 className="section-title">Shop By Occasion</h2>
        <div className="occasion-grid">
          {OCCASIONS.map((o, i) => (
            <Reveal as={Link} to={`/shop?occasion=${o.slug}`} className="occasion-card" key={i}>
              <img src={o.img} alt={o.label} />
              <div className="occasion-arrow">{Icon.arrow}</div>
              <div className="occasion-overlay">
                <span className="occasion-label">{o.label}</span>
                <span className="occasion-sub">{o.sub}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TRENDING COLLECTIONS */}
      <section className="trending-section">
        <h2 className="section-title">Trending Collections</h2>
        <div className="products-grid">
          {(trending.length > 0 ? trending : TRENDING_SAMPLES).map((p, i) => (
            <Reveal as={Link} to={`/shop/${p.id}`} className="product-card" key={p.id || i}>
              <div className="product-img-wrap">
                <WishButton active={wishlisted[p.id]} onClick={(e) => toggleWishlist(e, p.id)} />
                {p.img
                  ? <img src={p.img} alt={p.name} />
                  : <div className="product-img-placeholder" />}
              </div>
              <p className="product-name">{p.category}</p>
              <p className="product-desc">{p.name}</p>
              <p className="product-price">{p.price}</p>
            </Reveal>
          ))}
        </div>
        <div className="view-all-wrap">
          <button className="btn-outline" onClick={() => navigate('/shop')}><span>View All Collections</span></button>
        </div>
      </section>

      {/* DELIVERY & PICKUP */}
      <section className="delivery-section">
        <p className="delivery-eyebrow">Safe &amp; Reliable</p>
        <h2 className="delivery-title">Delivery &amp; Pickup</h2>
        <div className="delivery-grid">
          {DELIVERY.map((d, i) => (
            <div className="delivery-item" key={i}>
              <div className="delivery-icon">
                <img src={d.icon} alt={d.head} style={{ objectFit: 'contain', width: '26.6px', height: '26px', opacity: 1 }} />
              </div>
              <div>
                <p className="delivery-head">{d.head}</p>
                <p className="delivery-desc">{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button className="btn-know" onClick={() => window.open('/Rental_Delivery_Guide.pdf', '_blank')}><span>Know More</span></button>
      </section>

      {/* NEED STYLING HELP */}
      <section className="style-section">
        <h2 className="style-title">Need Styling Help?</h2>
        <p className="style-body">
          Tell us your outfit colour, event date, and budget. We'll suggest matching pieces instantly on WhatsApp.
        </p>
        <button className="btn-chat"
          onClick={() => window.open(`https://wa.me/+917397721122?text=${encodeURIComponent('Hi, I need styling help!')}`, "_blank")}>
          <span>Chat Now</span>
        </button>
      </section>

      {/* FOOTER */}
      <footer className="footer" id="footer-contact">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=victorian-moissinate">victorian-moissinate</Link>
            <Link className="footer-link-sm" to="/shop?category=ad-jewels">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=gold-antique-jewels">Gold Antique</Link>
            <Link className="footer-link-sm" to="/shop?category=kundan-jewels">Kundan Jewels</Link>
          </div>
          <div>
            <span className="footer-col-head">Support</span>
            <Link className="footer-link-lg" to="/rental-policy">Delivery &amp; Pickup</Link>
            <Link className="footer-link-lg" to="/terms">Rental Terms</Link>
            <Link className="footer-link-lg" to="/faqs">FAQ</Link>
            <Link className="footer-link-lg" to="/care">Care Instructions</Link>
            <a className="footer-link-lg" href="#footer-contact">Contact Us</a>
          </div>
          <div>
            <span className="footer-col-head">Contact</span>
            <a href="tel:+917397721122" className="footer-contact-row"><img src={iconCall} alt="Phone" className="footer-contact-icon" /><span className="footer-contact-text">+91 73977 21122</span></a>
            <a href="mailto:apila.jewels@gmail.com" className="footer-contact-row"><img src={iconMail} alt="Mail" className="footer-contact-icon" /><span className="footer-contact-text">apila.jewels@gmail.com</span></a>
            <a href="https://maps.google.com/?q=SIS+Marakesh,Karanai+Puducherry+Rd,Urapakkam,Chennai,Tamil+Nadu+603202" target="_blank" rel="noreferrer" className="footer-contact-row"><img src={iconLocation} alt="Location" className="footer-contact-icon" /><span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd, Urapakkam, Chennai, Tamil Nadu 603202</span></a>
          </div>
          <div>
            <span className="footer-follow-label">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="https://www.instagram.com/apila_jewels/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <img src={iconInstagram} alt="Instagram" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://www.facebook.com/profile.php?id=61590540475572" target="_blank" rel="noreferrer" aria-label="Facebook">
                <img src={iconFacebook} alt="Facebook" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://in.pinterest.com/apilajewels/" target="_blank" rel="noreferrer" aria-label="Pinterest">
                <img src={iconPinterest} alt="Pinterest" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="http://whatsapp.com/catalog/917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src={iconWhatsapp} alt="WhatsApp" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">2026 Apila Jewels. All Rights Reserved.</span>
          <img src={apilaLogo} alt="Apila Jewels" className="footer-logo-img" />
          <span className="footer-secure">100% Secure Payments</span>
        </div>
      </footer>
    </div>
  );
}
