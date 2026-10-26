import React from 'react';
import { useNavigate } from 'react-router-dom';
import saleBannerBg from '../assets/sale-banner-bg.jpg';

/**
 * JewelleryToOwnBanner
 * --------------------
 * Full-width promotional banner for the "Jewellery to Own" / sale section.
 * Shown on the home page between TrendingSection and DeliverySection.
 */
export default function JewelleryToOwnBanner() {
  const navigate = useNavigate();

  return (
    <section className="jto-section">
      <div
        className="jto-banner"
        style={{ backgroundImage: `url(${saleBannerBg})` }}
      >
        {/* Dark overlay for text legibility */}
        <div className="jto-overlay" />

        <div className="jto-content">
          <p className="jto-eyebrow">Jewellery to Own</p>
          <h2 className="jto-headline">Love it? Make it yours.</h2>
          <p className="jto-sub">
            A selection of our jewellery is now available to purchase.
          </p>
          <button
            className="jto-btn"
            onClick={() => navigate('/shop?sale=true')}
          >
            <span>Shop to Own</span>
          </button>
        </div>
      </div>
    </section>
  );
}
