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
          </div>
        </nav>
      </header>

      {/* ── MAIN CONTENT ── */}
      <div className="wl-page">
        <h1 className="wl-title">My Wishlist</h1>
        <p className="wl-notice">
          Save your favorite jewellery pieces in one place for easy access.
        </p>

        {wishlistItems.length === 0 ? (
          <div className="wl-empty">
            <p className="wl-empty-text">Your wishlist is empty.</p>
            <Link to="/shop" className="wl-empty-link">Explore Collection</Link>
          </div>
        ) : (
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
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-main">
          <div>
            <span className="footer-col-head">Collections</span>
            <Link className="footer-link-sm" to="/shop?category=moissanite">Moissanite Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=ad">AD Jewels</Link>
            <Link className="footer-link-sm" to="/shop?category=antique">Gold Antique</Link>
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
