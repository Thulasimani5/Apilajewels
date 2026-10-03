import React from 'react';
import { Link } from 'react-router-dom';

import imgVictorianMoissinate from '../assets/images/jtype-victorian-moissinate.jpg';
import imgAmericanDiamond from '../assets/images/jtype-american-diamond.jpg';
import imgGoldAntique from '../assets/images/jtype-gold-antique.jpg';
import imgKundan from '../assets/images/jtype-kundan.jpg';

const MAIN_JEWELLERY_TYPES = [
  { title: "Victorian & Moissinate", sub: "Premium Luxury Design", img: imgVictorianMoissinate, slug: "victorian-moissinate" },
  { title: "American Diamond", sub: "Modern Sparkle Collections", img: imgAmericanDiamond, slug: "american-diamond" },
  { title: "Gold Antique Jewels", sub: "Timeless Heritage Designs", img: imgGoldAntique, slug: "gold-antique-jewels" },
  { title: "Kundan Jewels", sub: "Traditional Collections", img: imgKundan, slug: "kundan-jewels" },
];

export default function CategoryGrid() {
  return (
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
  );
}
