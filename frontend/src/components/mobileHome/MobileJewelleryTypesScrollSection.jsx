import React from 'react';
import { Link } from 'react-router-dom';
import ArrowCircle from './ArrowCircle';
import { JEWELLERY_TYPES_CAROUSEL } from '../../constants/mobileHomeConstants';

const MobileJewelleryTypesScrollSection = () => {
  return (
    <section className="bg-white pt-[24px] pb-[24px]">
      <h2
        className="text-center text-black capitalize px-4"
        style={{
          fontFamily: "'Bacasime Antique', Georgia, serif",
          fontSize: '22px',
          letterSpacing: '-0.44px',
        }}
      >
        Shop by Jewellery type
      </h2>
      <div
        className="flex gap-[7px] overflow-x-auto snap-x snap-mandatory hide-scrollbar mt-[20px]"
        style={{ paddingLeft: '11px', paddingRight: '11px' }}
      >
        {JEWELLERY_TYPES_CAROUSEL.map((card) => (
          <Link
            key={card.title}
            to={card.href}
            className="relative flex-none snap-start overflow-hidden"
            style={{ width: '62.6vw', aspectRatio: '258 / 401' }}
          >
            <img
              src={card.img}
              alt={card.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
            <div className="absolute top-[20px] left-[21px]">
              <h3
                className="text-white font-normal"
                style={{
                  fontFamily: "'Belgant Aesthetic', Georgia, serif",
                  fontSize: 'clamp(18px, 5.83vw, 24px)',
                  letterSpacing: '0.8px',
                  lineHeight: '30px',
                  maxWidth: '176px',
                }}
              >
                {card.title}
              </h3>
              {card.subtitle && (
                <p
                  className="text-white mt-[4px]"
                  style={{
                    fontFamily: "'Gotham Light', sans-serif",
                    fontSize: '13px',
                    letterSpacing: '-0.13px',
                    opacity: 0.9,
                  }}
                >
                  {card.subtitle}
                </p>
              )}
            </div>
            <div className="absolute left-[21px]" style={{ bottom: '6.7%' }}>
              <p
                className="text-white"
                style={{
                  fontFamily: "'Gotham Book', sans-serif",
                  fontSize: '14px',
                }}
              >
                Explore Now
              </p>
            </div>
            <div className="absolute" style={{ bottom: '3%', right: '17px' }}>
              <ArrowCircle size={53} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MobileJewelleryTypesScrollSection;
