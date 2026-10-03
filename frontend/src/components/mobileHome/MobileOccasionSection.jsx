import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from '../LazyImage';
import ArrowCircle from './ArrowCircle';
import { OCCASIONS } from '../../constants/mobileHomeConstants';

const MobileOccasionSection = () => {
  return (
    <section className="bg-[#fdf9f4] pt-[25px] pb-8 mt-3">
      <h2
        className="capitalize text-black text-center mb-5 px-5"
        style={{
          fontFamily: "'Bacasime Antique', Georgia, serif",
          fontSize: '22px',
          letterSpacing: '-0.44px',
        }}
      >
        Shop by Occassion
      </h2>
      <div className="flex flex-col gap-3 px-[67px]">
        {OCCASIONS.map((occ) => (
          <Link
            key={occ.title}
            to={occ.href}
            className="relative w-full aspect-square overflow-hidden group"
          >
            <LazyImage
              src={occ.img}
              alt={occ.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 left-0 right-0 h-[112px] bg-gradient-to-b from-transparent to-black/50" />
            <div className="absolute bottom-5 left-5 text-white">
              <h3
                className="font-normal leading-snug"
                style={{
                  fontFamily: "'Belgant Aesthetic', Georgia, serif",
                  fontSize: '25px',
                }}
              >
                {occ.title}
              </h3>
              <p
                className="text-white/80 mt-0.5"
                style={{
                  fontFamily: "'Gotham Light', 'Gotham Book', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '-0.13px',
                }}
              >
                {occ.sub}
              </p>
            </div>
            <div className="absolute bottom-5 right-5">
              <ArrowCircle />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default MobileOccasionSection;
