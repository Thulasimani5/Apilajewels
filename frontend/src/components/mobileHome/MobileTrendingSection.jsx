import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../Card';

const MobileTrendingSection = ({ trending, trendingLoading }) => {
  return (
    <section className="bg-white px-[10px] pt-6 pb-4">
      <h2
        className="text-black mb-4 text-center"
        style={{
          fontFamily: "'Bacasime Antique', Georgia, serif",
          fontSize: '22px',
          letterSpacing: '-0.44px',
          textTransform: 'capitalize',
        }}
      >
        Trending Collections
      </h2>

      {trendingLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="w-7 h-7 border-[3px] border-[#ab6281] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : trending.length > 0 ? (
        <div className="grid grid-cols-2 gap-[10px]">
          {trending.map((item, index) => (
            <Card
              key={item._id}
              jewellery={item}
              priority={index < 4}
              imageAspect="190 / 236"
              imageClassName=""
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-sm text-gray-400 py-10">
          No trending items yet.
        </p>
      )}

      <div className="mt-8 flex justify-center">
        <Link
          to="/shop?explore=true"
          className="flex items-center justify-center border border-[#ab6281] text-[#ab6281] hover:bg-[#ab6281] hover:text-white transition-all"
          style={{
            fontFamily: "'Gotham', sans-serif",
            fontSize: '13px',
            letterSpacing: '-0.13px',
            width: '183px',
            height: '48px',
          }}
        >
          Explore More&nbsp;&nbsp;›
        </Link>
      </div>
    </section>
  );
};

export default MobileTrendingSection;
