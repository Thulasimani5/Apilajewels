import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/Apila Logo01.svg';

import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';

const PlusIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    {open ? (
      <line x1="0" y1="7" x2="14" y2="7" stroke="#1e1e1e" strokeWidth="1.5" />
    ) : (
      <>
        <line x1="7" y1="0" x2="7" y2="14" stroke="#1e1e1e" strokeWidth="1.5" />
        <line x1="0" y1="7" x2="14" y2="7" stroke="#1e1e1e" strokeWidth="1.5" />
      </>
    )}
  </svg>
);

const HEADING_STYLE = {
  fontFamily: "'Gotham', sans-serif",
  fontSize: '14px',
  letterSpacing: '1.96px',
  color: '#1e1e1e',
};

const Footer = () => {
  const [open, setOpen] = useState({});
  const toggle = (key) => setOpen(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <footer className="bg-white border-t border-[#F2F2F2]">
      <div className="max-w-[1400px] mx-auto">

        {/* ── Mobile accordion ── */}
        <div className="md:hidden px-5 pt-[42px]">

          {/* Collections */}
          <div>
            <button
              onClick={() => toggle('collections')}
              className="w-full flex items-center justify-between py-[20px]"
            >
              <span style={HEADING_STYLE}>COLLECTIONS</span>
              <PlusIcon open={open.collections} />
            </button>
            {open.collections && (
              <ul className="pb-5 space-y-3">
                {['Moissinate Jewels', 'AD Jewels', 'Gold Antique Jewels', 'Kundan Jewels', 'Bangles'].map(item => (
                  <li key={item}>
                    <Link
                      to={`/shop?category=${item.toLowerCase().replace(/ /g, '-')}`}
                      className="text-[11px] text-[#555] tracking-[0.08em] uppercase"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[#F2F2F2]" />

          {/* Support */}
          <div>
            <button
              onClick={() => toggle('support')}
              className="w-full flex items-center justify-between py-[20px]"
            >
              <span style={HEADING_STYLE}>SUPPORT</span>
              <PlusIcon open={open.support} />
            </button>
            {open.support && (
              <ul className="pb-5 space-y-3">
                {['Delivery & Pickup', 'Rental Terms', 'FAQ', 'Care Instructions', 'Contact Us'].map(item => (
                  <li key={item}>
                    <Link to="#" className="text-[11px] text-[#555] tracking-[0.08em] uppercase">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-[#F2F2F2]" />

          {/* Contact */}
          <div>
            <button
              onClick={() => toggle('contact')}
              className="w-full flex items-center justify-between py-[20px]"
            >
              <span style={HEADING_STYLE}>CONTACT</span>
              <PlusIcon open={open.contact} />
            </button>
            {open.contact && (
              <ul className="pb-5 space-y-3">
                <li className="flex items-start gap-3 text-[#555]">
                  <img src={iconCall} alt="Call" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
                  <span className="text-[11px] tracking-[0.08em] uppercase">+91 73977 21101</span>
                </li>
                <li className="flex items-start gap-3 text-[#555]">
                  <img src={iconMail} alt="Mail" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
                  <span className="text-[11px] tracking-[0.08em] uppercase">APILA.JEWELS@GMAIL.COM</span>
                </li>
                <li className="flex items-start gap-3 text-[#555]">
                  <img src={iconLocation} alt="Location" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
                  <span className="text-[11px] tracking-[0.08em] uppercase leading-[1.6]">
                    SIS MARAKESH, KARANAI PUDUCHERRY<br />RD, URAPAKKAM, CHENNAI,<br />TAMIL NADU 603202
                  </span>
                </li>
              </ul>
            )}
          </div>

          <div className="border-t border-[#F2F2F2]" />

          {/* Follow Us */}
          <div className="pt-[61px] text-center">
            <p style={{
              fontFamily: "'Gotham Book', sans-serif",
              fontSize: '12px',
              letterSpacing: '0.84px',
              opacity: 0.5,
              textTransform: 'uppercase',
            }}>
              Follow Us
            </p>
            <div className="flex items-center justify-center gap-[30px] mt-[30px]">
              <a href="https://www.instagram.com/apila_jewels/" target="_blank" rel="noreferrer"><img src={iconInstagram} alt="Instagram" className="w-[23px] h-[23px] opacity-80" /></a>
              <a href="https://www.facebook.com/profile.php?id=61590540475572" target="_blank" rel="noreferrer"><img src={iconFacebook} alt="Facebook" className="w-[23px] h-[23px] opacity-80" /></a>
              <a href="https://in.pinterest.com/apilajewels/" target="_blank" rel="noreferrer"><img src={iconPinterest} alt="Pinterest" className="w-[23px] h-[23px] opacity-80" /></a>
              <a href="http://whatsapp.com/catalog/917397721122" target="_blank" rel="noreferrer"><img src={iconWhatsapp} alt="WhatsApp" className="w-[23px] h-[23px] opacity-80" /></a>
            </div>
          </div>

          <div className="border-t border-[#F2F2F2] mt-[36px]" />

          {/* Logo + Copyright */}
          <div className="flex flex-col items-center pt-[25px] pb-[18px] gap-[21px]">
            <img src={logoImage} alt="Apila Jewels" style={{ height: '32px' }} className="opacity-90" />
            <p style={{
              fontFamily: "'Gotham Book', sans-serif",
              fontSize: '10px',
              opacity: 0.5,
              letterSpacing: '-0.3px',
              textAlign: 'center',
            }}>
              2026 Apila Jewels. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* ── Desktop grid (unchanged) ── */}
        <div className="hidden md:block px-12 lg:px-20 pt-16 pb-6">
          <div className="grid grid-cols-4 gap-10 lg:gap-16 mb-16">
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Collections</h4>
              <ul className="space-y-4">
                {['Moissinate Jewels', 'AD Jewels', 'Gold Antique Jewels', 'Kundan Jewels', 'Bangles'].map(item => (
                  <li key={item}>
                    <Link to={`/shop?category=${item.toLowerCase().replace(/ /g, '-')}`} className="text-[11px] text-[#555] hover:text-[#A56D7A] transition-colors tracking-[0.08em] uppercase">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Support</h4>
              <ul className="space-y-4">
                {['Delivery & Pickup', 'Rental Terms', 'FAQ', 'Care Instructions', 'Contact Us'].map(item => (
                  <li key={item}>
                    <Link to="#" className="text-[11px] text-[#555] hover:text-[#A56D7A] transition-colors tracking-[0.08em] uppercase">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-[#555]">
                  <img src={iconCall} alt="Call" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
                  <span className="text-[11px] tracking-[0.08em] uppercase">+91 73977 21101</span>
                </li>
                <li className="flex items-start gap-3 text-[#555]">
                  <img src={iconMail} alt="Mail" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
                  <span className="text-[11px] tracking-[0.08em] uppercase">APILA.JEWELS@GMAIL.COM</span>
                </li>
                <li className="flex items-start gap-3 text-[#555]">
                  <img src={iconLocation} alt="Location" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
                  <span className="text-[11px] tracking-[0.08em] uppercase leading-[1.6]">
                    SIS MARAKESH, KARANAI PUDUCHERRY<br />RD, URAPAKKAM, CHENNAI,<br />TAMIL NADU 603202
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Follow Us</h4>
              <div className="flex items-center gap-4 text-[#222]">
                <a href="https://www.instagram.com/apila_jewels/" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity"><img src={iconInstagram} alt="Instagram" className="w-[18px] h-[18px] opacity-80" /></a>
                <a href="https://www.facebook.com/profile.php?id=61590540475572" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity"><img src={iconFacebook} alt="Facebook" className="w-[18px] h-[18px] opacity-80" /></a>
                <a href="https://in.pinterest.com/apilajewels/" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity"><img src={iconPinterest} alt="Pinterest" className="w-[18px] h-[18px] opacity-80" /></a>
                <a href="http://whatsapp.com/catalog/917397721122" target="_blank" rel="noreferrer" className="hover:opacity-70 transition-opacity"><img src={iconWhatsapp} alt="WhatsApp" className="w-[18px] h-[18px] opacity-80" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#F2F2F2] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[11px] text-[#999] font-light tracking-wide">2026 Apila Jewels. All Rights Reserved.</p>
            <div className="flex items-center justify-center">
              <img src={logoImage} alt="Apila Jewels" className="h-9 md:h-11 opacity-90" />
            </div>
            <p className="text-[11px] text-[#999] font-light tracking-wide">100% Secure Payments</p>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
