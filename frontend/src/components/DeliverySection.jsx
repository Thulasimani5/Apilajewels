import React from 'react';

import iconSecurePackaging from '../assets/icons/Secure.svg';
import iconDoorstepDelivery from '../assets/icons/Doorstepdelivery.svg';
import iconTimelyReturn from '../assets/icons/TimelyReturn.svg';
import iconHassleFree from '../assets/icons/HassleFree.svg';

const DELIVERY = [
  { icon: iconSecurePackaging, head: "Secure Packaging", desc: "Tamper proof packaging for your precious jewels." },
  { icon: iconDoorstepDelivery, head: "Doorstep Delivery", desc: "Delivered safely to your doorstep on time." },
  { icon: iconTimelyReturn, head: "Timely Return Pickup", desc: "We pick up your jewels at your convenience." },
  { icon: iconHassleFree, head: "Hassle Free Experience", desc: "Smooth, easy & worry-free from start to finish." }
];

export default function DeliverySection() {
  return (
    <section className="delivery-section">
      <p className="delivery-eyebrow">Safe &amp; Reliable</p>
      <h2 className="delivery-title">Delivery &amp; Pickup</h2>
      <div className="delivery-grid">
        {DELIVERY.map((d, i) => (
          <div className="delivery-item" key={i}>
            <div className="delivery-icon">
              <img src={d.icon} alt={d.head} style={{ objectFit: 'contain', width: '26.6px', height: '26px', opacity: 1 }} />
            </div>
            <div>
              <p className="delivery-head">{d.head}</p>
              <p className="delivery-desc">{d.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button className="btn-know" onClick={() => window.open('/Rental_Delivery_Guide.pdf', '_blank')}>
        <span>Know More</span>
      </button>
    </section>
  );
}
