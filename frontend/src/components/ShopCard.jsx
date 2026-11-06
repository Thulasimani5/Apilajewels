import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

export default function ShopCard({ product, activeCategory }) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const liked = isInWishlist(product._id);
  const imgUrl = product.images?.[0]?.url || product.media?.[0]?.url || '';
  const isSale = Boolean(product.isSale || product.sale || product.sales);

  const categoryArr = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);
  const typeArray = Array.isArray(product.type) ? product.type : (product.type ? [product.type] : []);

  let categoryLabel;
  if (activeCategory && categoryArr.some(c => c?.toLowerCase() === activeCategory.toLowerCase())) {
    categoryLabel = activeCategory;
  } else if (categoryArr.length > 0) {
    categoryLabel = categoryArr[0];
  } else if (product.material) {
    categoryLabel = product.material;
  } else {
    categoryLabel = 'MOISSINATE JEWELS';
  }

  if (categoryLabel === 'Bangles & Bracelets') categoryLabel = 'Bangles';
  if (typeArray.includes('Accessories') && product.accessoryType) {
    categoryLabel = product.accessoryType;
  }

  // Format brand/category header in uppercase
  const displayCategory = categoryLabel.toUpperCase().includes('JEWEL') || categoryLabel.toUpperCase().includes('SET')
    ? categoryLabel.toUpperCase()
    : `${categoryLabel.toUpperCase()} JEWELS`;

  const origPrice = Number(product.salesPrice || product.salesAmount || product.price || 0);
  const finalPrice = product.discountedRate != null
    ? Number(product.discountedRate)
    : (product.salesAmount != null ? Number(product.salesAmount) : origPrice);

  let discountPercent = product.discountPercent;
  if (discountPercent == null || discountPercent === 0) {
    if (origPrice > finalPrice && origPrice > 0) {
      discountPercent = Math.round(((origPrice - finalPrice) / origPrice) * 100);
    } else {
      discountPercent = 0;
    }
  }

  const formatRs = (num) => `Rs. ${Math.round(num || 0).toLocaleString('en-IN')}`;

  return (
    <Link to={`/shop/${product._id}`} className={`product-card${isSale ? ' sale-card' : ''}`}>
      <div className="product-img-wrap">
        <button
          className={`product-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"
            fill={liked ? '#E53935' : 'none'}
            stroke={liked ? '#E53935' : 'currentColor'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <img
          src={getOptimizedCloudinaryUrl(imgUrl, { width: 390, height: 450 })}
          alt={product.name}
          loading="lazy"
        />
      </div>

      {isSale ? (
        <div className="sale-card-info">
          <p className="sale-card-category">{displayCategory}</p>
          <p className="sale-card-title" title={product.name}>{product.name}</p>
          <div>
            <span className="sale-card-tag">SALE</span>
          </div>
          <div className="sale-card-prices">
            <span className="sale-price-current">{formatRs(finalPrice)}</span>
            {origPrice > finalPrice && (
              <span className="sale-price-original">{formatRs(origPrice)}</span>
            )}
            {discountPercent > 0 && (
              <span className="sale-price-discount">({discountPercent}% OFF)</span>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="product-name">{categoryLabel || 'Jewels'}</p>
          <p className="product-desc">{product.name}</p>
          <p className="product-price">
            {product.showPrice === false
              ? 'Price on Request'
              : origPrice > 1200
              ? 'Price on Request'
              : `₹${origPrice.toFixed(2)}`}
          </p>
        </>
      )}
    </Link>
  );
}
