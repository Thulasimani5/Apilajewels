import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconDeliveryTruck from '../assets/icons/icon-delivery-truck.svg';
import iconSecurePayments from '../assets/icons/icon-secure-payments.svg';
import iconPremiumJewel from '../assets/icons/Premium JewelIcon.svg';
import iconDesignerCollection from '../assets/icons/Designer CollectionIcon.svg';
import '../styles/ApilaJewels.css';

/* ── Cart item card ── */
function CartItemCard({ item, onRemove }) {
  const rawImg = item.images?.[0];
  const imgUrl = rawImg?.url || (typeof rawImg === 'string' ? rawImg : '') ||
    item.media?.[0]?.url || '';
  const isVideo = rawImg?.type === 'video';
  const price = item.rentalPrice || item.price || 0;
  const priceText = price >= 2000 ? 'Price on Request' : `₹${price.toFixed(2)}`;
  const category = Array.isArray(item.category) ? item.category[0] : (item.category || 'Moissinate Jewels');
  const ref = item.code || item.jewelId || item.sku || 'N/A';

  return (
    <div className="cc-card">
      {/* Image */}
      <div className="cc-img-wrap">
        {isVideo ? (
          <video src={imgUrl} className="cc-media" autoPlay muted loop playsInline />
        ) : (
          <img
            src={imgUrl ? getOptimizedCloudinaryUrl(imgUrl, { width: 229, height: 249 }) : ''}
            alt={item.name}
            className="cc-media"
          />
        )}
      </div>

      {/* Body */}
      <div className="cc-body">
        <p className="cc-cat">{category}</p>
        <p className="cc-name">{item.name}</p>
        <p className="cc-ref">Ref : {ref}</p>
        <div className="cc-tags">
          <span className="cc-tag">
            <img src={iconPremiumJewel} alt="Premium Jewel" width="12" height="11" />
            Premium Jewel
          </span>
          <span className="cc-tag">
            <img src={iconDesignerCollection} alt="Designer Collection" width="12" height="11" />
            Designer Collection
          </span>
        </div>
        <div className="cc-bottom">
          <div className="cc-qty">
            <span className="cc-qty-num">1</span>
            <svg
              width="8"
              height="12"
              viewBox="0 0 7 12"
              fill="none"
              style={{ transform: 'rotate(-90deg)', opacity: 0.5, flexShrink: 0 }}
            >
              <path d="M6 1L1 6l5 5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="cc-price">{priceText}</span>
        </div>
      </div>

      {/* Delete */}
      <button className="cc-delete" onClick={() => onRemove(item._id)} aria-label="Remove item">
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1 1l9 9M10 1l-9 9" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DesktopCart — pixel-perfect Figma 308:2849
   Page: 1728px wide
   Left panel: 1103px bg=#fdf9f4, cards at left 163px, w 845px, h 249px
   Right panel: flex:1, content 518px wide
   ══════════════════════════════════════════════════════ */
export default function DesktopCart() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart } = useCart();
  const { user } = useAuth();
  const [coupon, setCoupon] = useState('');

  const cartCount = cartItems.length;
  const subtotal = cartItems.reduce((sum, item) => sum + (item.rentalPrice || item.price || 0), 0);

  const handleBookOnWhatsapp = () => {
    if (!cartItems.length) return;
    let msg = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    cartItems.forEach((item, i) => {
      const price = item.rentalPrice || item.price || 0;
      const pText = price >= 2000 ? 'Price on Request' : `₹${price}`;
      msg += `${i + 1}. *${item.name}* (Code: ${item.code || item.jewelId || 'N/A'}) – ${pText}\n`;
    });
    msg += `\n*Total Amount: ₹${subtotal.toFixed(2)}*\n\nPlease let me know the availability.`;
    window.open(`https://wa.me/+917397721122?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="apila apila-cart">

      {/* ── NAVBAR ── */}
      <header>
        <nav className="navbar scrolled cart-navbar">
          <div className="nav-left">
            <Link to="/shop" className="cart-nav-back">
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M6 1L1 6l5 5" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Back to shop</span>
            </Link>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels" />
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ── MAIN SPLIT ── */}
      <div className="cart-page">

        {/* ── LEFT: Shopping Bag ── */}
        <div className="cart-left">
          <h1 className="cart-bag-title">Shoping Bag ({cartCount})</h1>

          {cartCount === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty.</p>
              <Link to="/shop" className="cart-empty-link">Continue Shopping</Link>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map(item => (
                <CartItemCard key={item._id} item={item} onRemove={removeFromCart} />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Your Order ── */}
        <div className="cart-right">
          <h2 className="cart-order-title">Your Order ({cartCount})</h2>

          {/* Coupon */}
          <div className="cart-coupon">
            <input
              className="cart-coupon-input"
              placeholder="Enter Coupen Code"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
            />
            <button className="cart-coupon-btn">Apply</button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="cart-sumrow">
              <span className="cart-sumlabel">Sub Total ({cartCount} Items)</span>
              <span className="cart-sumval">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-sumrow">
              <span className="cart-sumlabel">Shipping</span>
              <span className="cart-sumval">Free</span>
            </div>
            <div className="cart-sumrow cart-sumrow--last">
              <span className="cart-sumlabel">Discount</span>
              <span className="cart-sumval">₹0</span>
            </div>
            <div className="cart-sum-divider" />
            <div className="cart-totalrow">
              <span className="cart-totallabel">Total</span>
              <span className="cart-totalval">₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Banner */}
          <div className="cart-delivery">
            <img src={iconDeliveryTruck} width="27" height="20" alt="" />
            <span className="cart-delivery-text">Estimated Delivery: 3 - 4 days</span>
          </div>

          {/* Help Text */}
          <p className="cart-help-text">
            Need Live Video or Help? Get Instant Assistance From Our Jewellery Expert
          </p>

          {/* Book on WhatsApp */}
          <button className="cart-book-btn" onClick={handleBookOnWhatsapp}>
            BOOK ON WHATSAPP
          </button>

          {/* Secure Payments */}
          <div className="cart-secure">
            <img src={iconSecurePayments} width="19" height="20" alt="" />
            <span className="cart-secure-text">100% Secure Payments</span>
          </div>
        </div>
      </div>
    </div>
  );
}
