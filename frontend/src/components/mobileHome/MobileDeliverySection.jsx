import React from 'react';
import { DELIVERY_ITEMS } from '../../constants/mobileHomeConstants';

const MobileDeliverySection = () => {
  return (
    <section className="bg-[#fdf9f4] mt-10 pt-[45px] pb-[45px] text-center">
      <p
        className="uppercase mb-1"
        style={{
          fontFamily: "'Gotham', sans-serif",
          fontSize: '11px',
          letterSpacing: '1.54px',
          color: '#1e1e1e',
        }}
      >
        Safe &amp; Reliable
      </p>
      <h3
        className="text-black mb-[49px]"
        style={{
          fontFamily: "'Belgant Aesthetic', Georgia, serif",
          fontSize: '30px',
        }}
      >
        Delivery &amp; Pickup
      </h3>

      <div className="flex justify-center items-stretch mb-[53px] px-2 max-w-md mx-auto">
        {DELIVERY_ITEMS.map(({ label, iconSrc }, index, arr) => (
          <div
            key={label}
            className={`flex flex-col items-center flex-1 ${
              index !== arr.length - 1 ? 'border-r border-[#EAEAEA]' : ''
            }`}
          >
            <div className="w-12 h-12 mb-[15px] rounded-full bg-[#FAF3ED] flex items-center justify-center">
              <img
                src={iconSrc}
                alt={label.replace('\n', ' ')}
                className="w-5 h-5 object-contain"
              />
            </div>
            <p
              className="text-[#1e1e1e] text-center leading-[1.6] whitespace-pre-line px-1"
              style={{
                fontFamily: "'Gotham Book', sans-serif",
                fontSize: '10px',
              }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => window.open('/Rental_Delivery_Guide.pdf', '_blank')}
        className="bg-[#ab6281] text-white hover:bg-[#935b67] transition-colors flex items-center justify-center mx-auto"
        style={{
          fontFamily: "'Gotham', sans-serif",
          fontSize: '11px',
          letterSpacing: '1.54px',
          width: '159px',
          height: '44px',
        }}
      >
        KNOW MORE
      </button>
    </section>
  );
};

export default MobileDeliverySection;
