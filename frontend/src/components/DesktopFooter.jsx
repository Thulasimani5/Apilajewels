import React from 'react';
import { Link } from 'react-router-dom';
import apilaLogo from '../assets/Apila Logo01.svg';
import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';

export default function DesktopFooter({ id }) {
  return (
    <footer className="footer" id={id}>
      <div className="footer-main">
        <div>
          <span className="footer-col-head">Collections</span>
          <Link className="footer-link-sm" to="/shop?category=victorian-moissinate">victorian-moissinate</Link>
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
          <Link className="footer-link-lg" to="/" state={{ scrollTo: 'footer-contact' }}>Contact Us</Link>
        </div>
        <div>
          <span className="footer-col-head">Contact</span>
          <a href="tel:+917397721122" className="footer-contact-row">
            <img src={iconCall} alt="Phone" className="footer-contact-icon" />
            <span className="footer-contact-text">+91 73977 21122</span>
          </a>
          <a href="mailto:apila.jewels@gmail.com" className="footer-contact-row">
            <img src={iconMail} alt="Mail" className="footer-contact-icon" />
            <span className="footer-contact-text">apila.jewels@gmail.com</span>
          </a>
          <a href="https://maps.google.com/?q=SIS+Marakesh,Karanai+Puducherry+Rd,Urapakkam,Chennai,Tamil+Nadu+603202" target="_blank" rel="noreferrer" className="footer-contact-row">
            <img src={iconLocation} alt="Location" className="footer-contact-icon" />
            <span className="footer-contact-text">SIS Marakesh, Karanai Puducherry Rd, Urapakkam, Chennai, Tamil Nadu 603202</span>
          </a>
        </div>
        <div>
          <span className="footer-col-head">Follow Us</span>
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
  );
}
