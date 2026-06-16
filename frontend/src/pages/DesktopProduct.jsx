import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconSecureDelivery from '../assets/icons/icon-secure-delivery.svg';
import iconEasyReturn from '../assets/icons/icon-easy-return.svg';
import iconWhatsapp from '../assets/icons/icon-whatsapp-support.svg';
import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsappSocial from '../assets/icons/whatsapp.svg';
import '../styles/ApilaJewels.css';

/* ── Image Lightbox Carousel ── */
function Lightbox({ mediaList, index, onClose, onSetIndex }) {
  const total = mediaList.length;

  const goPrev = useCallback(() => onSetIndex(i => Math.max(0, i - 1)), [onSetIndex]);
  const goNext = useCallback(() => onSetIndex(i => Math.min(total - 1, i + 1)), [onSetIndex, total]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [onClose, goPrev, goNext]);

  const item = mediaList[index];
  const url = item?.url || item;
  const isVideo = item?.type === 'video' || (typeof url === 'string' && /\.(mp4|mov|webm)$/i.test(url));

  return (
    <div className="pdp-lightbox" onClick={onClose}>
      {/* Close */}
      <button className="pdp-lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Prev */}
      {index > 0 && (
        <button className="pdp-lightbox-arrow pdp-lightbox-prev"
          onClick={e => { e.stopPropagation(); goPrev(); }} aria-label="Previous">
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M8 1L1 8l7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Media */}
      <div className="pdp-lightbox-content" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video src={url} autoPlay controls loop className="pdp-lightbox-media"/>
        ) : (
          <img src={url} alt={`Product image ${index + 1}`} className="pdp-lightbox-media"/>
        )}
      </div>

      {/* Next */}
      {index < total - 1 && (
        <button className="pdp-lightbox-arrow pdp-lightbox-next"
          onClick={e => { e.stopPropagation(); goNext(); }} aria-label="Next">
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M1 1l7 7-7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}

      {/* Dot indicators */}
      {total > 1 && (
        <div className="pdp-lightbox-dots" onClick={e => e.stopPropagation()}>
          {mediaList.map((_, i) => (
            <button key={i}
              className={`pdp-lightbox-dot${i === index ? ' active' : ''}`}
              onClick={() => onSetIndex(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Accordion ── */
function Accordion({ title, children, defaultOpen = false }) {
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
          className={`product-wish${liked ? ' active' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={e => {
            e.preventDefault(); e.stopPropagation();
            toggleWishlist(product);
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? '#fff' : 'none'}
            stroke={liked ? '#fff' : 'currentColor'} strokeWidth="1.6">
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

function renderDescription(text) {
  if (!text) return <p className="pdp-desc-text">No description available.</p>;
  const LABELS = ['Set Includes:', 'Styling Tip:'];
  const regex = new RegExp(`(${LABELS.map(l => l.replace(':', '\\:')).join('|')})`);
  const segments = text.split(regex);
  const lines = [];
  if (segments[0] && segments[0].trim()) lines.push({ label: null, content: segments[0].trim() });
  for (let i = 1; i < segments.length; i += 2) {
    lines.push({ label: segments[i], content: (segments[i + 1] || '').trim() });
  }
  return lines.map((item, idx) => (
    <p key={idx} className="pdp-desc-text">
      {item.label && <strong>{item.label}</strong>}
      {item.content ? (item.label ? ` ${item.content}` : item.content) : ''}
    </p>
  ));
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

  const [lightboxIndex, setLightboxIndex] = useState(null);

  const mediaList = product.media?.length ? product.media : product.images || [];
  const liked = isInWishlist(product._id);
  const price = product.rentalPrice || product.price || 0;
  const priceText = price >= 2000 ? 'Price on Request' : `₹${price.toFixed(2)}`;
  const category = Array.isArray(product.category) ? product.category[0] : product.category;

  const handleAddToCart = () => {
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
              <svg width="18" height="16" viewBox="0 0 18 16" fill="none">
                <path d="M8.99887 16C8.83828 16 8.67769 15.9592 8.53717 15.8777C4.1711 13.2582 -0.666706 8.59001 0.0760276 4.0849C0.417284 2.01581 1.97301 0.446155 4.03059 0.0792224C5.89746 -0.246939 7.71414 0.446155 8.98884 1.93427C10.2435 0.486925 11.9899 -0.216362 13.7965 0.0690301C15.8742 0.405385 17.4801 1.96485 17.8916 4.05432C18.7749 8.48808 14.1077 13.0747 9.4405 15.8777C9.29998 15.9592 9.13939 16 8.9788 16H8.99887ZM4.91384 1.82215C4.7131 1.82215 4.53243 1.84254 4.35177 1.87311C3.31796 2.05658 2.11353 2.81083 1.8626 4.38048C1.33064 7.62172 4.99413 11.4847 9.00891 14.0125C12.823 11.6172 16.8277 7.7746 16.1552 4.41106C15.8943 3.07584 14.8604 2.08716 13.5356 1.87311C12.0401 1.62849 10.6449 2.41332 9.79179 3.95239C9.6312 4.23779 9.33009 4.42125 9.00891 4.42125C8.68773 4.42125 8.38662 4.24798 8.22603 3.95239C7.35281 2.37255 6.03798 1.82215 4.92387 1.82215H4.91384Z" fill="currentColor"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Cart" onClick={() => navigate('/cart')}>
              <svg width="15" height="17" viewBox="0 0 15 17" fill="none">
                <path d="M13.282 13.5346C13.4101 14.7175 12.4834 15.75 11.2936 15.75H2.75034C1.56051 15.75 0.633827 14.7175 0.761975 13.5346L1.62864 5.53459C1.73863 4.51934 2.59581 3.75 3.61701 3.75H10.4269C11.4481 3.75 12.3053 4.51934 12.4153 5.53459L13.282 13.5346Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7.02516 0.75C8.40732 0.75 9.52197 1.69624 9.52197 2.85753V3.75H4.52197V2.85753C4.52197 1.69086 5.64299 0.75 7.01879 0.75H7.02516Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.52197 6.75H8.52197" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate('/login')}>
              <svg width="13" height="15" viewBox="0 0 13 15" fill="none">
                <path d="M0.75 13.63C0.75 10.5388 3.19364 8.03 6.20455 8.03C9.21545 8.03 11.6591 10.5388 11.6591 13.63" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.20432 6.35C7.71055 6.35 8.9316 5.0964 8.9316 3.55C8.9316 2.0036 7.71055 0.75 6.20432 0.75C4.69809 0.75 3.47705 2.0036 3.47705 3.55C3.47705 5.0964 4.69809 6.35 6.20432 6.35Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
                <div key={idx} className={`pdp-img-cell${!isVideo ? ' pdp-img-cell--clickable' : ''}`}
                  onClick={() => !isVideo && setLightboxIndex(idx)}>
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

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <Lightbox
            mediaList={mediaList}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onSetIndex={setLightboxIndex}
          />
        )}

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
                  toggleWishlist(product);
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24"
                  fill={liked ? '#fff' : 'none'}
                  stroke={liked ? '#fff' : '#000'} strokeWidth="1.5">
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

          {/* Description Section */}
          <div className="pdp-desc-section">
            <p className="pdp-section-head">Description</p>
            {renderDescription(product.description)}
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
            <Link className="footer-link-sm" to="/shop?category=moissinate-jewels">Moissanite Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad-jewels">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=gold-antique-jewels">Gold Antique</Link>
            <Link className="footer-link-sm" to="/shop?category=kundan-jewels">Kundan Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=gold-bangles">Bangles</Link>
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
            <div className="footer-contact-row"><img src={iconCall} alt="Phone" className="footer-contact-icon" /><span className="footer-contact-text">+91 73977 21122</span></div>
            <div className="footer-contact-row"><img src={iconMail} alt="Mail" className="footer-contact-icon" /><span className="footer-contact-text">apila.jewels@gmail.com</span></div>
            <div className="footer-contact-row"><img src={iconLocation} alt="Location" className="footer-contact-icon" /><span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd, Urapakkam, Chennai, Tamil Nadu 603202</span></div>
          </div>
          <div>
            <span className="footer-follow-label">Follow Us</span>
            <div className="social-row">
              <a className="social-btn" href="https://www.instagram.com/apila_jewels/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <img src={iconInstagram} alt="Instagram" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://www.facebook.com/profile.php?id=61590540475572" target="_blank" rel="noreferrer" aria-label="Facebook">
                <img src={iconFacebook} alt="Facebook" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://in.pinterest.com/apilajewels/" target="_blank" rel="noreferrer" aria-label="Pinterest">
                <img src={iconPinterest} alt="Pinterest" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="http://whatsapp.com/catalog/917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src={iconWhatsappSocial} alt="WhatsApp" width="22" height="22" style={{ objectFit: 'contain' }} />
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
