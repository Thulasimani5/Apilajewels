import React from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';

export default function CategoryCard({ cat, index, className }) {
  return (
    <Link
      to={`/shop?category=${cat.slug}`}
      className={`relative rounded-[1.5rem] overflow-hidden group shadow-sm ${className}`}
    >
      <LazyImage
        src={cat.img}
        alt={cat.title}
        priority={index === 0}
        className="absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
      <div className="absolute top-6 left-5 right-5 text-white">
        <h2 className="text-xl font-serif font-semibold leading-snug tracking-wide">{cat.title}</h2>
        <p className="text-sm text-white/75 mt-1 font-light">{cat.sub}</p>
      </div>
      <div className="absolute bottom-6 left-5 right-5 flex items-center justify-between text-white">
        <span className="text-sm font-light tracking-wide">Explore Now</span>
        <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
