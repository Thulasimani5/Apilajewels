import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import { X } from 'lucide-react';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';
import '../styles/ApilaJewels.css';

function WishlistCard({ item, onRemove, onMoveToBag }) {
  const rawImg = item.images?.[0];
  const imgUrl = rawImg?.url || (typeof rawImg === 'string' ? rawImg : '') || item.media?.[0]?.url || '';
  const isVideo = rawImg?.type === 'video';
  const price = item.rentalPrice || item.price || 0;
  const priceText = price >= 2000 ? 'Price on Request' : `₹${price.toFixed(2)}`;
  const description = item.description || item.material || item.type || '';

  return (
    <div className="wl-card">
      <div className="wl-img-wrap">
        {isVideo ? (
          <video src={imgUrl} className="wl-img" autoPlay muted loop playsInline />
        ) : (
          <img
            src={imgUrl ? getOptimizedCloudinaryUrl(imgUrl, { width: 343, height: 427 }) : ''}
            alt={item.name}
            className="wl-img"
          />
        )}
        <button className="wl-remove-btn" onClick={() => onRemove(item)} aria-label="Remove from wishlist">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1l9 9M10 1l-9 9" stroke="black" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="wl-info">
        <p className="wl-name">{Array.isArray(item.category) ? item.category[0] : (item.category || 'Jewellery')}</p>
        <p className="wl-desc">{item.name}</p>
        <p className="wl-price">{priceText}</p>
      </div>

      <button className="wl-bag-btn" onClick={() => onMoveToBag(item)}>
        MOVE TO BAG
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DesktopWishlist — pixel-perfect Figma 323:3549
   Canvas: 1728px wide
   Grid: 4 cols × 343px, col-gap 26px, left 146px
   ══════════════════════════════════════════════════════ */
export default function DesktopWishlist() {
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleRemove = (item) => toggleWishlist(item);

  const handleMoveToBag = (item) => {
    addToCart(item);
    toggleWishlist(item);
  };

  return (
    <div className="apila">

      {/* ── NAVBAR ── */}
      <header>
        <nav className="navbar scrolled">
          <div className="nav-left">
            <Link to="/shop" className="cart-nav-back">
              <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
                <path d="M6 1L1 6l5 5" stroke="black" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Back to shop</span>
            </Link>
          </div>
          <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img className="nav-logo-img" src={apilaLogo} alt="Apila Jewels"/>
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

      {/* ── MAIN CONTENT ── */}
      <div className="wl-page">
        {wishlistItems.length === 0 ? (
          <div className="wl-empty">
            <h1 className="wl-empty-title">YOUR WISHLIST IS EMPTY</h1>
            <p className="wl-empty-subtitle">Your saved jewellery will appear here</p>
          </div>
        ) : (
          <>
            <h1 className="wl-title">My Wishlist</h1>
            <p className="wl-notice">
              Save your favorite jewellery pieces in one place for easy access.
            </p>
            <div className="wl-grid">
              {wishlistItems.map(item => (
                <WishlistCard
                  key={item._id}
                  item={item}
                  onRemove={handleRemove}
                  onMoveToBag={handleMoveToBag}
                />
              ))}
            </div>
          </>
        )}
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
              <a className="social-btn" href="#" aria-label="Instagram">
                <img src={iconInstagram} alt="Instagram" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="#" aria-label="Facebook">
                <img src={iconFacebook} alt="Facebook" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="#" aria-label="Pinterest">
                <img src={iconPinterest} alt="Pinterest" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
              <a className="social-btn" href="https://wa.me/+917397721122" target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <img src={iconWhatsapp} alt="WhatsApp" width="22" height="22" style={{ objectFit: 'contain' }} />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span className="footer-copy">2026 Apila Jewels. All Rights Reserved.</span>
          <img src={apilaLogo} alt="Apila Jewels" className="footer-logo-img" />
          <span className="footer-secure">100% Secure Payments</span>
        </div>
      </footer>

    </div>
  );
}
