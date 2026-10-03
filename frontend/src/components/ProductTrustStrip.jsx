import React from 'react';
import iconSecureDelivery from '../assets/icons/icon-secure-delivery.svg';
import iconEasyReturn from '../assets/icons/icon-easy-return.svg';
import iconWhatsapp from '../assets/icons/icon-whatsapp-support.svg';

export default function ProductTrustStrip() {
  return (
    <div className="pdp-trust">
      <div className="pdp-trust-item">
        <div className="flex items-center justify-center h-[32px]">
          <img src={iconSecureDelivery} alt="Secure Delivery" width="28" height="30" />
        </div>
        <span className="pdp-trust-label">Secure Delivery</span>
      </div>
      <div className="pdp-trust-divider"></div>
      <div className="pdp-trust-item">
        <div className="flex items-center justify-center h-[32px]">
          <img src={iconEasyReturn} alt="Easy Return Pickup" width="30" height="32" />
        </div>
        <span className="pdp-trust-label">Easy Return Pickup</span>
      </div>
      <div className="pdp-trust-divider"></div>
      <div className="pdp-trust-item">
        <div className="flex items-center justify-center h-[32px]">
          <img src={iconWhatsapp} alt="Whatsapp Support" width="30" height="32" />
        </div>
        <span className="pdp-trust-label">Whatsapp Support</span>
      </div>
    </div>
  );
}
