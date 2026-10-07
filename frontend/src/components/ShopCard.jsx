import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

export default function ShopCard({ product, activeCategory }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product._id);
  const imgUrl = product.images?.[0]?.url || product.media?.[0]?.url || '';
  const isSale = Boolean(product.isSale);
  const price = isSale && product.salesAmount ? product.salesAmount : (product.rentalPrice || product.price || 0);
  const priceText = product.showPrice === false
    ? 'Price on Request'
    : isSale
    ? `₹${price.toFixed(2)}`
    : price > 1200
    ? 'Price on Request'
    : `₹${price.toFixed(2)}`;

  const categoryArr = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);
  const typeArray = Array.isArray(product.type) ? product.type : (product.type ? [product.type] : []);

  // If filtering by a specific category, show that category label if the product belongs to it
  let category;
  if (activeCategory && categoryArr.some(c => c?.toLowerCase() === activeCategory.toLowerCase())) {
    category = activeCategory;
  } else {
    category = categoryArr[0] || 'Jewels';
  }
  if (category === 'Bangles & Bracelets') category = 'Bangles';
  if (typeArray.includes('Accessories') && product.accessoryType) {
    category = product.accessoryType;
  }

  return (
    <Link to={`/shop/${product._id}`} className="product-card">
      <div className="product-img-wrap">
        {isSale && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: '#B07A85',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              padding: '3px 8px',
              borderRadius: '4px',
              zIndex: 2,
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
          >
            For Sale
          </span>
        )}
        <button
          className={`product-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? '#fff' : 'none'}
            stroke={liked ? '#fff' : 'currentColor'} strokeWidth="1.6">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <img
          src={getOptimizedCloudinaryUrl(imgUrl, { width: 390, height: 450 })}
          alt={product.name}
          loading="lazy"
        />
      </div>
      <p className="product-name">{category || 'Jewels'}</p>
      <p className="product-desc">{product.name}</p>
      <p className="product-price">{priceText}</p>
    </Link>
  );
}
