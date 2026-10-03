import React from 'react';
import { Link } from 'react-router-dom';
import Reveal from './Reveal';

import imgC1 from '../assets/images/c1.jpg';
import imgC2 from '../assets/images/c2.jpg';
import imgC3 from '../assets/images/c3.jpg';
import imgC4 from '../assets/images/c4.jpg';
import imgC5 from '../assets/images/c5.jpg';
import imgC6 from '../assets/images/c6.jpg';

const ArrowIcon = (
  <svg width="8.403" height="16.807" viewBox="80 0 11 17" fill="none" stroke="currentColor" strokeWidth="1">
    <path d="M82.1462 15.6236L81.7927 15.9772L82.4998 16.6843L82.8533 16.3307L82.4998 15.9772L82.1462 15.6236ZM90.1348 8.34218L90.4883 8.69574C90.6836 8.50047 90.6836 8.18389 90.4883 7.98863L90.1348 8.34218ZM82.4998 15.9772L82.8533 16.3307L90.4883 8.69574L90.1348 8.34218L89.7812 7.98863L82.1462 15.6236L82.4998 15.9772ZM90.1348 8.34218L90.4883 7.98863L82.8533 0.35364L82.4998 0.707194L82.1462 1.06075L89.7812 8.69574L90.1348 8.34218Z" fill="currentColor" />
  </svg>
);

const OCCASIONS = [
  { img: imgC1, label: "Bridal Set", sub: "Collections", slug: "bridal-set" },
  { img: imgC2, label: "Bridesmaid", sub: "Collections", slug: "bridesmaid" },
  { img: imgC3, label: "Designer", sub: "Collections", slug: "designer" },
  { img: imgC4, label: "Reception", sub: "Collections", slug: "reception" },
  { img: imgC5, label: "Party Wear", sub: "Collections", slug: "party-wear" },
  { img: imgC6, label: "Small Jewel", sub: "Collections", slug: "small-jewel" }
];

export default function OccasionGrid() {
  return (
    <section className="occasion-section">
      <h2 className="section-title">Shop By Occasion</h2>
      <div className="occasion-grid">
        {OCCASIONS.map((o, i) => (
          <Reveal as={Link} to={`/shop?occasion=${o.slug}`} className="occasion-card" key={i}>
            <img src={o.img} alt={o.label} />
            <div className="occasion-arrow">{ArrowIcon}</div>
            <div className="occasion-overlay">
              <span className="occasion-label">{o.label}</span>
              <span className="occasion-sub">{o.sub}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
