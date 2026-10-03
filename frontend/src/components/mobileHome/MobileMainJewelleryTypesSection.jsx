import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../LazyImage';
import { MAIN_JEWELLERY_TYPES } from '../../constants/mobileHomeConstants';

const MobileMainJewelleryTypesSection = () => {
  if (!MAIN_JEWELLERY_TYPES || MAIN_JEWELLERY_TYPES.length === 0) return null;

  return (
    <section className="bg-[#fdf9f4] pt-[53px] pb-[55px]">
      <div className="flex flex-col gap-[5px] px-[40px]">
        {MAIN_JEWELLERY_TYPES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/shop?category=${cat.slug}`}
            className="relative block overflow-hidden"
            style={{ aspectRatio: '324 / 186' }}
          >
            <LazyImage
              src={cat.img}
              alt={cat.title}
              className="absolute inset-0 w-full h-full bg-white/50"
              imageClassName="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/55" />
            <div className="absolute bottom-[10px] left-[12px]">
              <h4
                className="text-white font-normal"
                style={{
                  fontFamily: "'Belgant Aesthetic', Georgia, serif",
                  fontSize: 'clamp(16px, 4.85vw, 16px)',
                  letterSpacing: '1px',
                  fontWeight: '100',
                  lineHeight: 'normal',
                }}
              >
                {cat.title}
              </h4>
              <p
                className="text-white capitalize"
                style={{
                  fontFamily: "'Gotham Light', sans-serif",
                  fontSize: 'clamp(8px, 2.43vw, 10px)',
                  letterSpacing: '0.8px',
                  lineHeight: '18px',
                  opacity: 0.7,
                }}
              >
                {cat.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MobileMainJewelleryTypesSection;
