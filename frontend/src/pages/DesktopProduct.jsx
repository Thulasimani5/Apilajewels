import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconSecureDelivery from '../assets/icons/icon-secure-delivery.svg';
import iconEasyReturn from '../assets/icons/icon-easy-return.svg';
import iconWhatsapp from '../assets/icons/icon-whatsapp-support.svg';
import '../styles/ApilaJewels.css';

/* ── Accordion ── */
function Accordion({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pdp-accordion">
      <button className="pdp-accordion-btn" onClick={() => setOpen(o => !o)}>
        <span className="pdp-accordion-title">{title}</span>
        <span className={`pdp-accordion-arrow${open ? ' open' : ''}`}>
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && <div className="pdp-accordion-body">{children}</div>}
    </div>
  );
}

/* ── Related product card ── */
function RelatedCard({ product }) {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const liked = isInWishlist(product._id);
  const imgUrl = product.images?.[0]?.url || product.media?.[0]?.url || '';
  const price = product.rentalPrice || product.price || 0;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;

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
          className={`pdp-rel-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={e => {
            e.preventDefault(); e.stopPropagation();
            if (!user) navigate('/login');
            else toggleWishlist(product);
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24"
            fill={liked ? '#ab6281' : 'none'}
            stroke={liked ? '#ab6281' : 'currentColor'} strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>
      <p className="pdp-rel-name">{category || 'Jewels'}</p>
      <p className="pdp-rel-desc">{product.name}</p>
      <p className="pdp-rel-price">
        {price >= 2000 ? 'Price on Request' : `₹${price.toFixed(2)}`}
      </p>
    </Link>
  );
}

/* ══════════════════════════════════════════════════════
   DesktopProduct — pixel-perfect Figma 384:2
   Page: 1728px wide
   Images: left 46px, 2×527px cols, 4px gap, 527/658 ratio
   Panel: left 1149px, width 528px, right 50px
   ══════════════════════════════════════════════════════ */
export default function DesktopProduct({ product, relatedProducts }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  const mediaList = product.media?.length ? product.media : product.images || [];
  const liked = isInWishlist(product._id);
  const price = product.rentalPrice || product.price || 0;
  const priceText = price >= 2000 ? 'Price on Request' : `₹${price.toFixed(2)}`;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    addToCart(product);
    navigate('/cart');
  };

  const handleWhatsapp = () => {
    const msg = `Hi Apila Jewels, I would like to book:\n\n*${product.name}*\nPrice: ${priceText}\n\nPlease let me know the availability.`;
    window.open(`https://wa.me/+917397721122?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  return (
    <div className="apila" style={{ paddingTop: '72px' }}>

      {/* ── NAVBAR (always white on PDP) ── */}
      <header>
        <nav className={`navbar scrolled`} style={{ height: '72px', padding: '0 48px' }}>
          <div className="nav-left">
            <div className="nav-hamburger" role="button" tabIndex={0}>
              <span/><span/><span/>
            </div>
            <div className="nav-search" role="button" tabIndex={0} onClick={() => navigate('/shop')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,.45)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <span>Search</span>
            </div>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels" style={{ height: '44px', width: 'auto' }}/>
          </div>
          <div className="nav-right">
            <button className="nav-icon-btn" aria-label="Wishlist" onClick={() => navigate('/wishlist')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/login')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          </div>
        </nav>
      </header>

      {/* ── BREADCRUMB BAR ── */}
      <div className="pdp-breadcrumb-bar">
        <Link to="/" className="pdp-bc-link">Home</Link>
        <span className="pdp-bc-arrow">
          <svg width="5" height="9" viewBox="0 0 5 9" fill="none">
            <path d="M1 1l3 3.5L1 8" stroke="rgba(0,0,0,.40)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
        <Link to={category ? `/shop?category=${encodeURIComponent(category.toLowerCase().replace(/\s+/g, '-'))}` : '/shop'} className="pdp-bc-link">{category || 'Jewellery'}</Link>
        <span className="pdp-bc-arrow">
          <svg width="5" height="9" viewBox="0 0 5 9" fill="none">
            <path d="M1 1l3 3.5L1 8" stroke="rgba(0,0,0,.40)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </span>
        <span className="pdp-bc-current">{product.name}</span>
      </div>

      {/* ── MAIN: image grid (left) + sticky panel (right) ── */}
      <div className="pdp-main">

        {/* Left: 2-column image grid */}
        <div className="pdp-images">
          <div className="pdp-img-grid">
            {mediaList.length > 0 ? mediaList.map((item, idx) => {
              const url = item.url || item;
              const isVideo = item.type === 'video' || (typeof url === 'string' && /\.(mp4|mov|webm)$/i.test(url));
              return (
                <div key={idx} className="pdp-img-cell">
                  {isVideo ? (
                    <video src={url} autoPlay muted loop playsInline/>
                  ) : (
                    <img
                      src={getOptimizedCloudinaryUrl(url, { width: 540, height: 670 })}
                      alt={`${product.name} ${idx + 1}`}
                    />
                  )}
                </div>
              );
            }) : (
              <div className="pdp-img-cell" style={{ gridColumn: '1/-1' }}>
                <div style={{ aspectRatio:'527/658', background:'#f5f5f5' }}/>
              </div>
            )}
          </div>
        </div>

        {/* Right: sticky panel */}
        <div className="pdp-panel">

          {/* Category label */}
          <p className="pdp-category-label">{category || 'Jewellery'}</p>

          {/* Product title */}
          <h1 className="pdp-title">{product.name}</h1>

          {/* Price + wishlist / share */}
          <div className="pdp-price-row">
            <span className="pdp-price">{priceText}</span>
            <div className="pdp-icons-row">
              <button
                className="pdp-icon-btn"
                aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                onClick={() => {
                  if (!user) navigate('/login', { state: { from: window.location.pathname } });
                  else toggleWishlist(product);
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24"
                  fill={liked ? '#ab6281' : 'none'}
                  stroke={liked ? '#ab6281' : '#000'} strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
              <button className="pdp-icon-btn" aria-label="Share" onClick={handleShare}>
                <svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ADD TO BAG */}
          <button className="pdp-btn-outline" onClick={handleAddToCart}>
            <span>Add to Bag</span>
          </button>

          {/* BOOK ON WHATSAPP */}
          <button className="pdp-btn-filled" onClick={handleWhatsapp}>
            <span>Book on Whatsapp</span>
          </button>

          {/* Trust strip: 3 icons with vertical dividers */}
          <div className="pdp-trust">
            <div className="pdp-trust-item">
              <img src={iconSecureDelivery} alt="Secure Delivery" width="26" height="27"/>
              <span className="pdp-trust-label">Secure Delivery</span>
            </div>
            <div className="pdp-trust-item">
              <img src={iconEasyReturn} alt="Easy Return Pickup" width="28" height="26"/>
              <span className="pdp-trust-label">Easy Return Pickup</span>
            </div>
            <div className="pdp-trust-item">
              <img src={iconWhatsapp} alt="Whatsapp Support" width="24" height="25"/>
              <span className="pdp-trust-label">Whatsapp Support</span>
            </div>
          </div>

          {/* Description */}
          <div className="pdp-desc-section">
            <p className="pdp-section-head">Description</p>
            <p className="pdp-desc-text">{product.description || 'No description available.'}</p>
          </div>

          {/* Accordions */}
          <Accordion title="Specifications">
            <p><strong>Material:</strong> {product.material || 'Premium Alloy'}</p>
            <p><strong>Size:</strong> {product.size || 'Adjustable'}</p>
            <p><strong>Finish:</strong> {product.finish || 'Antique'}</p>
          </Accordion>
          <Accordion title="Delivery & Return Policy">
            <p>Standard delivery within 3–5 business days. Easy returns within 7 days of receipt.</p>
          </Accordion>
          <Accordion title="Care Instructions">
            <p>Store in a dry place. Avoid contact with water, perfume, and harsh chemicals. Clean gently with a soft cloth.</p>
          </Accordion>

        </div>{/* end pdp-panel */}
      </div>{/* end pdp-main */}

      {/* ── YOU MAY ALSO LIKE ── */}
      <div className="pdp-related">
        <h2 className="pdp-related-heading">You may Also Like</h2>
        {relatedProducts.length > 0 ? (
          <div className="pdp-related-grid">
            {relatedProducts.slice(0, 10).map(p => (
              <RelatedCard key={p._id} product={p}/>
            ))}
          </div>
        ) : null}
        <div className="pdp-view-all-wrap">
          <Link to="/shop" className="btn-outline">
            <span>View All Collections</span>
          </Link>
        </div>
      </div>

      {/* ── NEED STYLING HELP ── */}
      <div className="pdp-cta">
        <h2 className="pdp-cta-title">Need Styling Help?</h2>
        <p className="pdp-cta-body">
          Tell us your outfit colour, event date, and budget. We'll suggest matching pieces instantly on WhatsApp.
        </p>
        <button className="btn-chat" onClick={() => window.open('https://wa.me/+917397721122', '_blank')}>
          <span>Chat Now</span>
        </button>
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=moissanite">Moissinate Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=antique">Gold Antique Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=kundan">Kundan Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=bangles">Bangles</Link>
          </div>
          <div>
            <span className="footer-col-head">Support</span>
            <Link className="footer-link-lg" to="/rental-policy">Delivery &amp; Pickup</Link>
            <Link className="footer-link-lg" to="/terms">Rental Terms</Link>
            <Link className="footer-link-lg" to="/faqs">FAQ</Link>
            <Link className="footer-link-lg" to="/care">Care Instructions</Link>
            <Link className="footer-link-lg" to="/contact">Contact Us</Link>
          </div>
          <div>
            <span className="footer-col-head">Contact</span>
            <div className="footer-contact-row">
              <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span className="footer-contact-text">+91 73977 21122</span>
            </div>
            <div className="footer-contact-row">
              <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span className="footer-contact-text">apila.jewels@gmail.com</span>
            </div>
            <div className="footer-contact-row">
              <svg className="footer-contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd,<br/>Urapakkam, Chennai, Tamil Nadu 603202</span>
            </div>
          </div>
          <div>
            <span className="footer-follow-label">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="#" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a className="social-btn" href="#" aria-label="Facebook">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a className="social-btn" href="https://wa.me/+917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">2026 Apila Jewels. All Rights Reserved.</span>
          <img src={apilaLogo} alt="Apila Jewels" className="footer-logo-img"/>
          <span className="footer-secure">100% Secure Payments</span>
        </div>
      </footer>

    </div>
  );
}
