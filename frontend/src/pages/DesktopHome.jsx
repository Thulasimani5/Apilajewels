import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from 'react-router-dom';
import "../styles/ApilaJewels.css";
import API_BASE_URL from '../config/api';

// Existing local images for occasions
import imgC1 from '../assets/images/c1.jpg';
import imgC2 from '../assets/images/c2.jpg';
import imgC3 from '../assets/images/c3.jpg';
import imgC4 from '../assets/images/c4.jpg';
import imgC5 from '../assets/images/c5.jpg';
import imgC6 from '../assets/images/c6.jpg';
import heroBanner from '../assets/hero-banner.jpg';
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

/* small inline-SVG helpers */
const Icon = {
  search: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  heart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  cart: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  account: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  arrow: (
    <svg width="8.403" height="16.807" viewBox="80 0 11 17" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
      <path d="M82.1462 15.6236L81.7927 15.9772L82.4998 16.6843L82.8533 16.3307L82.4998 15.9772L82.1462 15.6236ZM90.1348 8.34218L90.4883 8.69574C90.6836 8.50047 90.6836 8.18389 90.4883 7.98863L90.1348 8.34218ZM82.4998 15.9772L82.8533 16.3307L90.4883 8.69574L90.1348 8.34218L89.7812 7.98863L82.1462 15.6236L82.4998 15.9772ZM90.1348 8.34218L90.4883 7.98863L82.8533 0.35364L82.4998 0.707194L82.1462 1.06075L89.7812 8.69574L90.1348 8.34218Z" fill="currentColor"/>
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
        fill={active ? "#ab6281" : "none"} stroke={active ? "#ab6281" : "currentColor"} strokeWidth="1.6">
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

  /* ---- navbar scroll state ---- */
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 60);
      if (y <= 60) {
        setNavHidden(false);
      } else {
        setNavHidden(y > lastY);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---- Context & API logic ---- */
  const TRENDING_SAMPLES = [
    { id: 's1', name: 'Moissinate Jewels', desc: 'Moissanite Designer Polki Necklace', price: '₹1299.00', img: carouselImg1 },
    { id: 's2', name: 'American Diamond', desc: 'American Diamond Necklace Set', price: '₹1299.00', img: carouselImg2 },
    { id: 's3', name: 'Gold Antique Jewels', desc: 'Gold Antique Premium Necklace', price: '₹1299.00', img: carouselImg3 },
    { id: 's4', name: 'Kundan Jewels', desc: 'Kundan Bridal Necklace Set', price: '₹1299.00', img: carouselImg4 },
    { id: 's5', name: 'Gold Bangles', desc: 'Gold Plated Bangle Set', price: '₹1299.00', img: carouselImg5 },
    { id: 's6', name: 'American Diamond Bangles', desc: 'American Diamond Bangle Set', price: '₹1299.00', img: carouselImg6 },
    { id: 's7', name: 'Accessories', desc: 'Bridal Jewellery Accessories', price: '₹1299.00', img: carouselImg7 },
    { id: 's8', name: 'Moissinate Jewels', desc: 'Moissanite Designer Polki Necklace', price: '₹1299.00', img: carouselImg1 },
    { id: 's9', name: 'American Diamond', desc: 'American Diamond Necklace Set', price: '₹1299.00', img: carouselImg2 },
    { id: 's10', name: 'Gold Antique Jewels', desc: 'Gold Antique Premium Necklace', price: '₹1299.00', img: carouselImg3 },
    { id: 's11', name: 'Kundan Jewels', desc: 'Kundan Bridal Necklace Set', price: '₹1299.00', img: carouselImg4 },
    { id: 's12', name: 'Gold Bangles', desc: 'Gold Plated Bangle Set', price: '₹1299.00', img: carouselImg5 },
  ];

  const [trending, setTrending] = useState([]);
  const [wishlisted, setWishlisted] = useState({});

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?sort=popularity&limit=12`);
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const sorted = [...data.data]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 12);

          setTrending(sorted.map(item => ({
            id: item._id,
            name: item.name,
            desc: item.description,
            price: `₹${item.rentalPrice}`,
            img: item.images && item.images.length > 0
              ? (item.images[0].startsWith('http') ? item.images[0] : `${API_BASE_URL}${item.images[0]}`)
              : "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=cover&w=400&q=80"
          })));
        } else {
          setTrending([]);
        }
      } catch (err) {
        console.error('Failed to fetch trending items:', err);
      }
    };
    fetchTrending();
  }, []);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  /* Carousel — 7 static cards matching Figma design */
  const CAROUSEL = [
    { title: "Moissinate Jewels", sub: "Premium Necklace", img: carouselImg1, slug: "moissinate-jewels" },
    { title: "American Diamond", sub: "Necklace Sets", img: carouselImg2, slug: "american-diamond" },
    { title: "Gold Antique Jewels", sub: "Premium Necklace", img: carouselImg3, slug: "gold-antique-jewels" },
    { title: "Kundan Jewels", sub: "Necklace Sets", img: carouselImg4, slug: "kundan-jewels" },
    { title: "Gold Bangles", sub: "Bangle Sets", img: carouselImg5, slug: "gold-bangles" },
    { title: "American Diamond Bangles", sub: "Bangle Sets", img: carouselImg6, slug: "american-diamond-bangles" },
    { title: "Accessories", sub: "Others", img: carouselImg7, slug: "accessories" },
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
            <div className="nav-hamburger" role="button" aria-label="Menu" tabIndex={0}>
              <span /><span /><span />
            </div>
            <div className="nav-search" role="button" tabIndex={0} onClick={() => navigate('/shop')}>
              {Icon.search}<span>Search</span>
            </div>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels" />
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist">{Icon.heart}</button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>{Icon.cart}</button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/login')}>{Icon.account}</button>
          </div>
        </nav>
      </header>

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

      {/* CAROUSEL STRIP */}
      <section>
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
                  <p className="carousel-card-sub">{c.sub}</p>
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
            <Reveal as={Link} to={`/shop/${p.id}`} className="product-card" key={i}>
              <div className="product-img-wrap">
                <WishButton active={wishlisted[p.id]} onClick={(e) => toggleWishlist(e, p.id)} />
                <img src={p.img} alt={p.name} />
              </div>
              <p className="product-name">{p.name}</p>
              <p className="product-desc">{p.desc}</p>
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
      <footer className="footer">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=moissanite">Moissanite Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=antique">Gold Antique</Link>
            <Link className="footer-link-sm" to="/shop?category=kundan">Kundan Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=bangles">Bangles</Link>
          </div>
          <div>
            <span className="footer-col-head">Support</span>
            <Link className="footer-link-lg" to="/rental-policy">Delivery &amp; Pickup</Link>
            <Link className="footer-link-lg" to="/terms">Rental Terms</Link>
            <Link className="footer-link-lg" to="/faqs">FAQ</Link>
            <Link className="footer-link-lg" to="/care">Care Instructions</Link>
            <Link className="footer-link-lg" to="/contact">Contact Us</Link>
          </div>
          <div>
            <span className="footer-col-head">Contact</span>
            <div className="footer-contact-row"><img src={iconCall} alt="Phone" className="footer-contact-icon" /><span className="footer-contact-text">+91 73977 21122</span></div>
            <div className="footer-contact-row"><img src={iconMail} alt="Mail" className="footer-contact-icon" /><span className="footer-contact-text">apila.jewels@gmail.com</span></div>
            <div className="footer-contact-row"><img src={iconLocation} alt="Location" className="footer-contact-icon" /><span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd, Urapakkam, Chennai, Tamil Nadu 603202</span></div>
          </div>
          <div>
            <span className="footer-follow-label">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="#" aria-label="Instagram">
                <img src={iconInstagram} alt="Instagram" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="#" aria-label="Facebook">
                <img src={iconFacebook} alt="Facebook" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="#" aria-label="Pinterest">
                <img src={iconPinterest} alt="Pinterest" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://wa.me/+917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
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
