import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconDeliveryTruck from '../assets/icons/icon-delivery-truck.svg';
import iconSecurePayments from '../assets/icons/icon-secure-payments.svg';
import iconPremiumJewel from '../assets/icons/Premium JewelIcon.svg';
import iconDesignerCollection from '../assets/icons/Designer CollectionIcon.svg';
import axios from 'axios';
import API_BASE_URL from '../config/api';

/* ── Cart item card matching Reference UI ── */
function CartItemCard({ item, onRemove, onUpdateQuantity }) {
  const isSale = Boolean(item.isSale || item.sale || item.sales);
  const rawImg = item.images?.[0];
  const imgUrl = rawImg?.url || (typeof rawImg === 'string' ? rawImg : '') ||
    item.media?.[0]?.url || '';
  const isVideo = rawImg?.type === 'video';

  const origPrice = Number(item.salesPrice || item.salesAmount || item.price || 0);
  const finalPrice = item.discountedRate != null
    ? Number(item.discountedRate)
    : (item.salesAmount != null ? Number(item.salesAmount) : origPrice);

  let discountPercent = item.discountPercent;
  if (discountPercent == null || discountPercent === 0) {
    if (origPrice > finalPrice && origPrice > 0) {
      discountPercent = Math.round(((origPrice - finalPrice) / origPrice) * 100);
    } else {
      discountPercent = 0;
    }
  }

  const rentalPrice = Number(item.rentalPrice || item.price || 0);
  const priceText = item.showPrice === false || rentalPrice > 1200
    ? 'Price on Request'
    : `₹${rentalPrice.toFixed(2)}`;

  const categoryArr = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
  let categoryLabel = categoryArr[0] || (item.material ? item.material : (isSale ? 'MOISSINATE JEWELS' : 'victorian-moissinate'));
  if (categoryLabel === 'Bangles & Bracelets') categoryLabel = 'Bangles';
  const displayCategory = categoryLabel.toUpperCase().includes('JEWEL') || categoryLabel.toUpperCase().includes('SET')
    ? categoryLabel.toUpperCase()
    : `${categoryLabel.toUpperCase()} JEWELS`;

  const ref = item.code || item.jewelId || item.sku || 'MP006';
  const stockLimit = typeof item.stockCount === 'number' && item.stockCount > 0 ? item.stockCount : 10;
  const qty = Math.min(Number(item.quantity || 1), stockLimit);

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
        <p className="cc-cat">{displayCategory}</p>
        <p className="cc-name" title={item.name}>{item.name}</p>
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
          {isSale ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="cc-qty-stepper">
                <button
                  type="button"
                  className="cc-stepper-btn"
                  onClick={() => onUpdateQuantity && onUpdateQuantity(item._id, Math.max(1, qty - 1), stockLimit)}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="cc-stepper-val">{qty}</span>
                <button
                  type="button"
                  className="cc-stepper-btn"
                  onClick={() => onUpdateQuantity && onUpdateQuantity(item._id, qty + 1, stockLimit)}
                  disabled={qty >= stockLimit}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
              {qty >= stockLimit && stockLimit > 0 && (
                <span className="cc-stock-warning">Max available ({stockLimit})</span>
              )}
            </div>
          ) : (
            <div className="cc-qty">
              <span className="cc-qty-num">{qty}</span>
              <svg
                width="8"
                height="12"
                viewBox="0 0 7 12"
                fill="none"
                style={{ transform: 'rotate(-90deg)', opacity: 0.5, flexShrink: 0, pointerEvents: 'none' }}
              >
                <path d="M6 1L1 6l5 5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}

          {isSale ? (
            <div className="cc-sale-block">
              <span className="cc-sale-tag">SALE</span>
              <div className="cc-sale-prices">
                {discountPercent > 0 && (
                  <span className="cc-sale-discount">({discountPercent}% OFF)</span>
                )}
                {origPrice > finalPrice && (
                  <span className="cc-sale-original">Rs. {Math.round(origPrice).toLocaleString('en-IN')}</span>
                )}
                <span className="cc-sale-current">Rs. {Math.round(finalPrice).toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <div className="cc-rent-block">
              <span className="cc-rent-btn">RENT</span>
              <span className="cc-price">{priceText}</span>
            </div>
          )}
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
   ══════════════════════════════════════════════════════ */
export default function DesktopCart({ isSale: isSaleProp }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isSale = isSaleProp ?? (location.pathname.startsWith('/sale') || new URLSearchParams(location.search).get('type') === 'sale');

  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const { user, openLogin } = useAuth();
  const [coupon, setCoupon] = useState('');

  const isItemSale = (item) => Boolean(item.isSale || item.sale || item.sales);
  const currentCartItems = cartItems.filter(item => isSale ? isItemSale(item) : !isItemSale(item));
  const cartCount = currentCartItems.length;

  const getItemPrice = (item) => isItemSale(item)
    ? Number(item.discountedRate != null ? item.discountedRate : (item.salesAmount || item.salesPrice || item.price || 0))
    : Number(item.rentalPrice || item.price || 0);

  const getItemQty = (item) => Number(item.quantity || 1);

  const isPremium = (item) => !isSale && (item.showPrice === false || getItemPrice(item) > 1200);
  const premiumItems = currentCartItems.filter(isPremium);
  const pricedItems = currentCartItems.filter(item => !isPremium(item));

  // Actual original total (before discount)
  const actualOriginalSubtotal = pricedItems.reduce((sum, item) => {
    const orig = Number(item.salesPrice || item.salesAmount || item.price || 0);
    return sum + (orig * getItemQty(item));
  }, 0);

  // Discounted subtotal (final amount to pay)
  const finalDiscountedSubtotal = pricedItems.reduce((sum, item) => sum + (getItemPrice(item) * getItemQty(item)), 0);

  // Subtotal calculated on discounted price (final payable for items)
  const displaySubtotal = finalDiscountedSubtotal;
  const totalDiscount = isSale ? Math.max(0, actualOriginalSubtotal - finalDiscountedSubtotal) : 0;
  const shippingFee = isSale ? (displaySubtotal >= 1000 ? 0 : 70) : 0;
  const finalTotalAmount = finalDiscountedSubtotal + shippingFee;

  const allPremium = !isSale && premiumItems.length === currentCartItems.length && currentCartItems.length > 0;
  const hasPremium = !isSale && premiumItems.length > 0;
  const hasPriced = isSale || pricedItems.length > 0;

  const handleBookOnWhatsapp = async () => {
    if (!currentCartItems.length) return;

    try {
      const jewelleryIds = currentCartItems.map(item => item._id).filter(Boolean);
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        jewelleryIds,
        totalAmount: finalTotalAmount || 0,
        bookingDate: new Date(),
        customerDetails: {
          name: user?.name || 'Guest Visitor',
          phone: user?.phone || user?.mobile || 'WhatsApp Inquiry'
        }
      });
    } catch (e) {
      console.error('Error recording booking:', e);
    }

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://apilajewels.com';

    if (isSale) {
      let msg = `Hi Apila Jewels, I would like to purchase the following sale jewellery items:\n\n`;
      currentCartItems.forEach((item, i) => {
        const price = getItemPrice(item);
        const qty = getItemQty(item);
        const itemTotal = price * qty;
        const code = item.code || item.jewelId || item.sku || 'N/A';
        const itemUrl = item._id || item.id ? `${baseUrl}/shop/${item._id || item.id}` : '';
        msg += `${i + 1}. *${item.name}*\n   • Jewel Code: ${code}\n   • Qty: ${qty} × Rs. ${Math.round(price).toLocaleString('en-IN')} = Rs. ${Math.round(itemTotal).toLocaleString('en-IN')}${itemUrl ? `\n   • Link: ${itemUrl}` : ''}\n\n`;
      });
      if (shippingFee > 0) {
        msg += `Shipping Fee: Rs. ${shippingFee}\n`;
      } else {
        msg += `Shipping Fee: Free\n`;
      }
      msg += `*Total Amount: Rs. ${Math.round(finalTotalAmount).toLocaleString('en-IN')}*\n\nPlease confirm availability and payment details.`;
      window.open(`https://wa.me/+917397721122?text=${encodeURIComponent(msg)}`, '_blank');
      return;
    }
    let msg = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    currentCartItems.forEach((item, i) => {
      const price = item.rentalPrice || item.price || 0;
      const pText = isPremium(item) ? 'Price on Request' : `₹${price}`;
      const code = item.code || item.jewelId || item.sku || 'N/A';
      const itemUrl = item._id || item.id ? `${baseUrl}/shop/${item._id || item.id}` : '';
      msg += `${i + 1}. *${item.name}*\n   • Jewel Code: ${code}\n   • Price: ${pText}${itemUrl ? `\n   • Link: ${itemUrl}` : ''}\n\n`;
    });
    if (allPremium) {
      msg += `*Total Amount: Price on Request*\n\nPlease let me know the availability.`;
    } else if (hasPremium) {
      msg += `*Sub Total (${pricedItems.length} ${pricedItems.length === 1 ? 'Item' : 'Items'}): ₹${pricedSubtotal.toFixed(2)}*\n*Premium Jewels (${premiumItems.length} ${premiumItems.length === 1 ? 'Item' : 'Items'}): Price on Request*\n\nPlease let me know the availability.`;
    } else {
      msg += `*Sub Total (${cartCount} ${cartCount === 1 ? 'Item' : 'Items'}): ₹${pricedSubtotal.toFixed(2)}*\n\nPlease let me know the availability.`;
    }
    window.open(`https://wa.me/+917397721122?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="apila apila-cart">

      {/* ── NAVBAR ── */}
      <header>
        <nav className="navbar scrolled cart-navbar">
          <div className="nav-left">
            <Link to={isSale ? "/sale" : "/shop"} className="cart-nav-back">
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
            <button className="nav-mode-btn" onClick={() => navigate(isSale ? '/cart' : '/sale/cart')}>{isSale ? 'RENT' : 'SALE'}</button>
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate(isSale ? '/sale/wishlist' : '/wishlist')}>
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/profile')}>
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
              <Link to={isSale ? "/sale" : "/shop"} className="btn-know">
                <span>Continue Shopping</span>
              </Link>
            </div>
          ) : (
            <div className="cart-items-list">
              {currentCartItems.map(item => (
                <CartItemCard
                  key={item._id}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdateQuantity={updateQuantity}
                />
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
                <span className="cart-sumval">{isSale ? `Rs. ${Math.round(displaySubtotal).toLocaleString('en-IN')}` : `₹${displaySubtotal.toFixed(2)}`}</span>
              </div>
            )}
            <div className="cart-sumrow">
              <span className="cart-sumlabel">Shipping</span>
              <span className="cart-sumval">{isSale ? (shippingFee === 0 ? 'Free' : 'Rs. 70') : 'Free'}</span>
            </div>
            <div className="cart-sumrow cart-sumrow--last">
              <span className="cart-sumlabel">Discount</span>
              <span className="cart-sumval" style={{ color: totalDiscount > 0 ? '#10B981' : 'inherit' }}>
                {isSale ? (totalDiscount > 0 ? `- Rs. ${Math.round(totalDiscount).toLocaleString('en-IN')}` : 'Rs. 0') : '₹0'}
              </span>
            </div>
            <div className="cart-sum-divider" />
            <div className="cart-totalrow">
              <span className="cart-totallabel">Total</span>
              <span className="cart-totalval">
                {allPremium ? 'Price on Request' : (isSale ? `Rs. ${Math.round(finalTotalAmount).toLocaleString('en-IN')}` : `₹${finalTotalAmount.toFixed(2)}`)}
              </span>
            </div>
          </div>

          {/* Delivery Banner */}
          <div className="cart-delivery" style={{ flexDirection: 'column', alignItems: 'center', height: 'auto', padding: '12px 16px', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={iconDeliveryTruck} width="27" height="20" alt="" />
              <span className="cart-delivery-text">Estimated Delivery: 3 - 4 days</span>
            </div>
            {isSale && (
              <span style={{ color: '#000', fontFamily: 'Gotham Book, sans-serif', fontSize: '11px', letterSpacing: '0.2px', opacity: 0.6, marginTop: '2px', textAlign: 'center' }}>
                Free Delivery for orders above Rs. 1000
              </span>
            )}
          </div>

          {/* Actions Container anchored to bottom */}
          <div style={{ marginTop: 'auto' }}>
            {/* Help Text */}
            <p className="cart-help-text">
              Need Live Video or Help? Get Instant Assistance From Our Jewellery Expert
            </p>

            {/* Book / Buy on WhatsApp */}
            <button className="cart-book-btn" onClick={handleBookOnWhatsapp}>
              {isSale ? 'BUY ON WHATSAPP' : 'BOOK ON WHATSAPP'}
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
