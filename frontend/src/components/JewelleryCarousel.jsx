import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

import imgAccessories from '../assets/images/jtype-accessories.jpg';
import imgBanglesBracelets from '../assets/images/jtype-bangles-bracelets.jpg';
import imgLongHaram from '../assets/images/E10.jpg';
import imgChokerNecklace from '../assets/images/E9.jpg';
import imgSemiBridal from '../assets/images/E5.jpg';
import imgFullBridal from '../assets/images/E8.jpg';

const CAROUSEL = [
  { title: "Semi Bridal & Combo Sets", sub: "Explore Now", img: imgSemiBridal, slug: "semi-bridal" },
  { title: "Full Bridal Set", sub: "Explore Now", img: imgLongHaram, slug: "full-bridal" },
  { title: "Choker & Necklace Set", sub: "Explore Now", img: imgChokerNecklace, slug: "choker-necklace" },
  { title: "Long Haram", sub: "Explore Now", img: imgFullBridal, slug: "long-haram" },
  { title: "Bangles & Bracelets", sub: "Explore Now", img: imgBanglesBracelets, slug: "bangles-bracelets" },
  { title: "Accessories", sub: "Explore Now", img: imgAccessories, slug: "accessories" },
];

const ArrowIcon = (
  <svg width="8.403" height="16.807" viewBox="80 0 11 17" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M82.1462 15.6236L81.7927 15.9772L82.4998 16.6843L82.8533 16.3307L82.4998 15.9772L82.1462 15.6236ZM90.1348 8.34218L90.4883 8.69574C90.6836 8.50047 90.6836 8.18389 90.4883 7.98863L90.1348 8.34218ZM82.4998 15.9772L82.8533 16.3307L90.4883 8.69574L90.1348 8.34218L89.7812 7.98863L82.1462 15.6236L82.4998 15.9772ZM90.1348 8.34218L90.4883 7.98863L82.8533 0.35364L82.4998 0.707194L82.1462 1.06075L89.7812 8.69574L90.1348 8.34218Z" fill="currentColor" />
  </svg>
);

export default function JewelleryCarousel() {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const [translatePx, setTranslatePx] = useState(0);
  const pausedRef = useRef(false);

  const visibleCount = () =>
    window.innerWidth <= 640 ? 1 : window.innerWidth <= 1024 ? 2 : 100 / 30.73;

  const maxSlide = useCallback(
    () => Math.max(0, CAROUSEL.length - Math.floor(visibleCount())),
    []
  );

  const goTo = useCallback((idx) => {
    setCurrent((prev) => Math.max(0, Math.min(idx, maxSlide())));
  }, [maxSlide]);

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

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setCurrent((c) => (c >= maxSlide() ? 0 : c + 1));
    }, 3500);
    return () => clearInterval(id);
  }, [maxSlide]);

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

  return (
    <>
      <h2 className="section-title">Shop By Jewellery Type</h2>
      <div
        className="carousel-wrapper"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
      >
        <div ref={trackRef} className="carousel-track" style={{ transform: `translateX(-${translatePx}px)` }}>
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
        <button className="carousel-nav-btn" aria-label="Previous" onClick={() => goTo(current - 1)}>
          <span style={{ transform: 'scaleX(-1)', display: 'flex' }}>{ArrowIcon}</span>
        </button>
        {Array.from({ length: dotCount }).map((_, i) => (
          <span key={i}
            className={`carousel-dot${i === activeDotIndex ? " active" : ""}`}
            role="button" aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(maxSlide() > 0 ? Math.round((i / (dotCount - 1)) * maxSlide()) : 0)} />
        ))}
        <button className="carousel-nav-btn" aria-label="Next" onClick={() => goTo(current + 1)}>
          {ArrowIcon}
        </button>
      </div>
    </>
  );
}
