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
  const { user, openLogin } = useAuth();
  const [coupon, setCoupon] = useState('');

  const cartCount = cartItems.length;
  const premiumItems = cartItems.filter(item => (item.rentalPrice || item.price || 0) >= 2000);
  const pricedItems = cartItems.filter(item => (item.rentalPrice || item.price || 0) < 2000);
  const pricedSubtotal = pricedItems.reduce((sum, item) => sum + (item.rentalPrice || item.price || 0), 0);
  const allPremium = premiumItems.length === cartItems.length && cartItems.length > 0;
  const hasPremium = premiumItems.length > 0;
  const hasPriced = pricedItems.length > 0;

  const handleBookOnWhatsapp = () => {
    if (!cartItems.length) return;
    let msg = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    cartItems.forEach((item, i) => {
      const price = item.rentalPrice || item.price || 0;
      const pText = price >= 2000 ? 'Price on Request' : `₹${price}`;
      msg += `${i + 1}. *${item.name}* (Code: ${item.code || item.jewelId || 'N/A'}) – ${pText}\n`;
    });
    if (allPremium) {
      msg += `\n*Total Amount: Price on Request*\n\nPlease let me know the availability.`;
    } else if (hasPremium) {
      msg += `\n*Sub Total (${pricedItems.length} ${pricedItems.length === 1 ? 'Item' : 'Items'}): ₹${pricedSubtotal.toFixed(2)}*\n*Premium Jewels (${premiumItems.length} ${premiumItems.length === 1 ? 'Item' : 'Items'}): Price on Request*\n\nPlease let me know the availability.`;
    } else {
      msg += `\n*Sub Total (${cartCount} ${cartCount === 1 ? 'Item' : 'Items'}): ₹${pricedSubtotal.toFixed(2)}*\n\nPlease let me know the availability.`;
    }
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
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Account" onClick={openLogin}>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
              <Link to="/shop" className="btn-know"><span>Continue Shopping</span></Link>
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
        <div className="cart-right" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 'clamp(28px, 5.5vh, 64px)', overflowY: 'auto' }}>
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
            {hasPremium && (
              <div className="cart-sumrow">
                <span className="cart-sumlabel">Premium Jewels ({premiumItems.length} {premiumItems.length === 1 ? 'Item' : 'Items'})</span>
                <span className="cart-sumval">Price on Request</span>
              </div>
            )}
            {hasPriced && (
              <div className="cart-sumrow">
                <span className="cart-sumlabel">Sub Total ({pricedItems.length} {pricedItems.length === 1 ? 'Item' : 'Items'})</span>
                <span className="cart-sumval">₹{pricedSubtotal.toFixed(2)}</span>
              </div>
            )}
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
              <span className="cart-totalval">{allPremium ? 'Price on Request' : `₹${pricedSubtotal.toFixed(2)}`}</span>
            </div>
          </div>

          {/* Delivery Banner */}
          <div className="cart-delivery">
            <img src={iconDeliveryTruck} width="27" height="20" alt="" />
            <span className="cart-delivery-text">Estimated Delivery: 3 - 4 days</span>
          </div>

          {/* Actions Container anchored to bottom */}
          <div style={{ marginTop: 'auto' }}>
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
    </div>
  );
}
