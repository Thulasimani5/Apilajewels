import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WishButton from './WishButton';
import Reveal from './Reveal';
import { useTrendingProducts } from '../hooks/useTrendingProducts';

export default function TrendingSection() {
  const navigate = useNavigate();
  const trending = useTrendingProducts();
  const [wishlisted, setWishlisted] = useState({});

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Show skeletons while loading, real items once available
  const isLoading = trending.length === 0;
  const list = trending.slice(0, 12);

  return (
    <section className="trending-section">
      <h2 className="section-title">Trending Collections</h2>
      <div className="products-grid">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div className="product-card product-card-skeleton" key={i}>
                <div className="product-img-wrap skeleton-img" />
                <div className="skeleton-line" style={{ width: '60%', marginTop: '10px' }} />
                <div className="skeleton-line" style={{ width: '80%' }} />
                <div className="skeleton-line" style={{ width: '40%' }} />
              </div>
            ))
          : list.map((p, i) => (
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
            ))
        }
      </div>
      <div className="view-all-wrap">
        <button className="btn-outline" onClick={() => navigate('/shop')}>
          <span>View All Collections</span>
        </button>
      </div>
    </section>
  );
}
