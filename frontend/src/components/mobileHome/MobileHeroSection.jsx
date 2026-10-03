import React from 'react';
import { Link } from 'react-router-dom';
import MobileHeroBanner from '../../assets/images/Header-image11-1.jpg';

const MobileHeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: '580px' }}>
      <img
        src={MobileHeroBanner}
        alt="Apila Hero Banner"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center top' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      <div
        className="absolute inset-0 flex flex-col items-center justify-end text-center text-white px-5"
        style={{ paddingBottom: 'clamp(28px, 5dvh, 60px)' }}
      >
        <h1
          className="font-normal"
          style={{
            fontFamily: "'Belgant Aesthetic', Georgia, serif",
            fontSize: '32px',
            lineHeight: '38px',
            letterSpacing: '-0.96px',
            maxWidth: '375px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Premium Bridal Jewellery</span>
          <span style={{ display: 'block' }}>Rental in Chennai</span>
        </h1>

        <p
          className="capitalize text-white/80 mt-[13px] text-center"
          style={{
            fontFamily: "'Gotham Light', 'Gotham Book', sans-serif",
            fontSize: '13px',
            lineHeight: '19px',
            maxWidth: '342px',
            width: '100%',
          }}
        >
          Premium rental collections crafted for weddings, receptions and celebrations.
        </p>

        <Link
          to="/shop"
          className="mt-[27px] bg-[#ab6281] text-white hover:bg-[#935b67] transition-colors flex items-center justify-center"
          style={{
            fontFamily: "'Gotham', sans-serif",
            fontSize: '13px',
            letterSpacing: '-0.13px',
            width: '183px',
            height: '48px',
          }}
        >
          Explore All Jewels
        </Link>
      </div>
    </section>
  );
};

export default MobileHeroSection;
