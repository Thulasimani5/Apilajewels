import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

export default function RelatedCard({ product }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product._id);
  const imgUrl = product.images?.[0]?.url || product.media?.[0]?.url || '';
  const price = product.rentalPrice || product.price || 0;
  let category = Array.isArray(product.category) ? product.category[0] : product.category;
  if (category === 'Bangles & Bracelets') category = 'Bangles';
  const typeArray = Array.isArray(product.type) ? product.type : (product.type ? [product.type] : []);
  if (typeArray.includes('Accessories') && product.accessoryType) {
    category = product.accessoryType;
  }

  return (
    <Link to={`/shop/${product._id}`} className="pdp-rel-card">
      <div className="pdp-rel-img-wrap">
        <img
          className="pdp-rel-img"
          src={getOptimizedCloudinaryUrl(imgUrl, { width: 330, height: 410 })}
          alt={product.name}
          loading="lazy"
        />
        <button
          className={`product-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={e => {
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
      </div>
      <p className="pdp-rel-name">{category || 'Jewels'}</p>
      <p className="pdp-rel-desc">{product.name}</p>
      <p className="pdp-rel-price">
        {price > 1500 ? 'Price on Request' : `₹${price.toFixed(2)}`}
      </p>
    </Link>
  );
}
