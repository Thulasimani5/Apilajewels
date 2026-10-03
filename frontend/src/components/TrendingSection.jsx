import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WishButton from './WishButton';
import Reveal from './Reveal';
import { useTrendingProducts } from '../hooks/useTrendingProducts';

import carouselImg1 from '../assets/images/carousel1.jpg';
import carouselImg2 from '../assets/images/carousel2.jpg';
import carouselImg3 from '../assets/images/carousel3.jpg';
import carouselImg4 from '../assets/images/carousel4.jpg';
import carouselImg6 from '../assets/images/carousel6.jpg';

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

export default function TrendingSection() {
  const navigate = useNavigate();
  const trending = useTrendingProducts();
  const [wishlisted, setWishlisted] = useState({});

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const list = trending.length > 0 ? trending : TRENDING_SAMPLES;

  return (
    <section className="trending-section">
      <h2 className="section-title">Trending Collections</h2>
      <div className="products-grid">
        {list.map((p, i) => (
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
        <button className="btn-outline" onClick={() => navigate('/shop')}>
          <span>View All Collections</span>
        </button>
      </div>
    </section>
  );
}
