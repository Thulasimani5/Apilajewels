import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

import imgAccessories from '../assets/images/jtype-accessories.jpg';
import imgBanglesBracelets from '../assets/images/jtype-bangles-bracelets.jpg';
import imgLongHaram from '../assets/images/E10.jpg';
import imgChokerNecklace from '../assets/images/E9.jpg';
import imgSemiBridal from '../assets/images/E5.jpg';
import imgFullBridal from '../assets/images/E8.jpg';

const CAROUSEL = [
  { title: "Full Bridal Set", sub: "Explore Now", img: imgFullBridal, slug: "full-bridal" },
  { title: "Semi Bridal & Combo Sets", sub: "Explore Now", img: imgSemiBridal, slug: "semi-bridal" },
  { title: "Long Haram", sub: "Explore Now", img: imgLongHaram, slug: "long-haram" },
  { title: "Choker & Necklace Set", sub: "Explore Now", img: imgChokerNecklace, slug: "choker-necklace" },
  { title: "Bangles", sub: "Explore Now", img: imgBanglesBracelets, slug: "bangles" },
  { title: "Accessories", sub: "Explore Now", img: imgAccessories, slug: "accessories" },
];

const ArrowIcon = (
  <svg width="8.403" height="16.807" viewBox="80 0 11 17" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M82.1462 15.6236L81.7927 15.9772L82.4998 16.6843L82.8533 16.3307L82.4998 15.9772L82.1462 15.6236ZM90.1348 8.34218L90.4883 8.69574C90.6836 8.50047 90.6836 8.18389 90.4883 7.98863L90.1348 8.34218ZM82.4998 15.9772L82.8533 16.3307L90.4883 8.69574L90.1348 8.34218L89.7812 7.98863L82.1462 15.6236L82.4998 15.9772ZM90.1348 8.34218L90.4883 7.98863L82.8533 0.35364L82.4998 0.707194L82.1462 1.06075L89.7812 8.69574L90.1348 8.34218Z" fill="currentColor" />
  </svg>
);

export default function JewelleryCarousel() {
  const scrollRef = useRef(null);
  const pausedRef = useRef(false);

  /* ── card width helper (matches CSS flex-basis) ── */
  const getCardWidth = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return 300;
    const ww = el.offsetWidth;
    const isSmall = window.innerWidth <= 640;
    const isMed = !isSmall && window.innerWidth <= 1024;
    const cardW = isSmall ? ww * 0.85 : isMed ? ww * 0.5 : ww * 0.3073;
    const gap = (!isSmall && !isMed) ? 16 : 0;
    return cardW + gap;
  }, []);

  /* ── autoplay: smooth-scroll one card width every 3.5s ── */
  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const el = scrollRef.current;
      if (!el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 2) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        el.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
      }
    }, 3500);
    return () => clearInterval(id);
  }, [getCardWidth]);

  /* ── arrow click handlers ── */
  const scrollPrev = () => {
    scrollRef.current?.scrollBy({ left: -getCardWidth(), behavior: 'smooth' });
  };
  const scrollNext = () => {
    scrollRef.current?.scrollBy({ left: getCardWidth(), behavior: 'smooth' });
  };

  /* ── dot tracking ── */
  const dotCount = 3;
  const [activeDot, setActiveDot] = React.useState(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) { setActiveDot(0); return; }
      const ratio = el.scrollLeft / maxScroll;
      setActiveDot(Math.round(ratio * (dotCount - 1)));
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToDot = (dotIdx) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = (dotIdx / (dotCount - 1)) * maxScroll;
    el.scrollTo({ left: target, behavior: 'smooth' });
  };

  return (
    <>
      <h2 className="section-title">Shop By Jewellery Type</h2>
      <div
        className="carousel-wrapper"
        ref={scrollRef}
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        <div className="carousel-track">
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
        <button className="carousel-nav-btn" aria-label="Previous" onClick={scrollPrev}>
          <span style={{ transform: 'scaleX(-1)', display: 'flex' }}>{ArrowIcon}</span>
        </button>
        {Array.from({ length: dotCount }).map((_, i) => (
          <span key={i}
            className={`carousel-dot${i === activeDot ? " active" : ""}`}
            role="button" aria-label={`Slide ${i + 1}`}
            onClick={() => scrollToDot(i)} />
        ))}
        <button className="carousel-nav-btn" aria-label="Next" onClick={scrollNext}>
          {ArrowIcon}
        </button>
      </div>
    </>
  );
}
