import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroBanner from '../assets/images/Header-image01.jpg';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <img className="hero-bg" src={heroBanner} alt="Bridal Jewellery" />
      <div className="hero-content">
        <h1 className="hero-title">{"Premium Bridal Jewellery\nRental in Chennai"}</h1>
        <p className="hero-sub">
          Premium Rental Collections Crafted For Weddings,<br />Receptions And Celebrations.
        </p>
        <button className="btn-primary" onClick={() => navigate('/shop')}>
          <span>Explore All Jewels</span>
        </button>
      </div>
    </section>
  );
}
