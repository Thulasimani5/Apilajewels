import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../assets/Apila Logo01.svg';

import iconCall from '../assets/icons/call.svg';
import iconMail from '../assets/icons/mail.svg';
import iconLocation from '../assets/icons/location.svg';
import iconFacebook from '../assets/icons/facebook.svg';
import iconInstagram from '../assets/icons/instagram.svg';
import iconPinterest from '../assets/icons/pinterest.svg';
import iconWhatsapp from '../assets/icons/whatsapp.svg';

const Footer = () => {
  return (
    <footer className="bg-white pt-16 pb-6 px-5 md:px-12 lg:px-20 border-t border-[#F2F2F2]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-16">
          {/* Column 1 */}
          <div>
            <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Collections</h4>
            <ul className="space-y-4">
              {['Moissinate Jewels', 'AD Jewels', 'Gold Antique Jewels', 'Kundan Jewels', 'Bangles'].map((item) => (
                <li key={item}>
                  <Link to={`/shop?category=${item.toLowerCase().replace(/ /g, '-')}`} className="text-[11px] text-[#555] hover:text-[#A56D7A] transition-colors tracking-[0.08em] uppercase">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Support</h4>
            <ul className="space-y-4">
              {['Delivery & Pickup', 'Rental Terms', 'FAQ', 'Care Instructions', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-[11px] text-[#555] hover:text-[#A56D7A] transition-colors tracking-[0.08em] uppercase">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 */}
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

          {/* Column 4 */}
          <div>
            <h4 className="text-[12px] font-semibold tracking-[0.15em] text-[#222] uppercase mb-6">Follow Us</h4>
            <div className="flex items-center gap-4 text-[#222]">
              <a href="#" className="hover:opacity-70 transition-opacity">
                <img src={iconInstagram} alt="Instagram" className="w-[18px] h-[18px] opacity-80" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <img src={iconFacebook} alt="Facebook" className="w-[18px] h-[18px] opacity-80" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                 <img src={iconPinterest} alt="Pinterest" className="w-[18px] h-[18px] opacity-80" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <img src={iconWhatsapp} alt="WhatsApp" className="w-[18px] h-[18px] opacity-80" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#F2F2F2] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-[#999] font-light tracking-wide">
            2026 Apila Jewels. All Rights Reserved.
          </p>
          <div className="flex items-center justify-center">
            <img src={logoImage} alt="Apila Jewels" className="h-9 md:h-11 opacity-90" />
          </div>
          <p className="text-[11px] text-[#999] font-light tracking-wide">
            100% Secure Payments
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
