import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from './Footer';
import Card from './Card';
import LazyImage from './LazyImage';
import HeroBannerImage from '../assets/images/Header-image01.jpg';

import imgC1 from '../assets/images/c1.jpg';
import imgC2 from '../assets/images/c2.jpg';
import imgC3 from '../assets/images/c3.jpg';
import imgC4 from '../assets/images/c4.jpg';
import imgC5 from '../assets/images/c5.jpg';
import imgC6 from '../assets/images/c6.jpg';

import iconDoorstepDelivery from '../assets/icons/Doorstepdelivery.svg';
import iconHassleFree from '../assets/icons/HassleFree.svg';
import iconSecure from '../assets/icons/Secure.svg';
import iconTimelyReturn from '../assets/icons/TimelyReturn.svg';

const occasions = [
  { slug: 'bridal', title: 'Bridal Set', img: imgC1 },
  { slug: 'bridesmaid', title: 'Bridemaid', img: imgC2, arrow: true },
  { slug: 'designer', title: 'Designer', img: imgC3, arrow: true },
  { slug: 'reception', title: 'Reception', img: imgC4, arrow: true },
  { slug: 'party', title: 'Party Wear', img: imgC5, arrow: true },
  { slug: 'small', title: 'Small Jewel', img: imgC6, arrow: true },
];

const deliveryFeatures = [
  {
    title: 'Secure Packaging',
    desc: 'Tamper proof packaging for your precious jewels',
    iconSrc: iconSecure,
  },
  {
    title: 'Doorstep Delivery',
    desc: 'Delivered Safely to your Doorstep on time',
    iconSrc: iconDoorstepDelivery,
  },
  {
    title: 'Timely Return Pickup',
    desc: 'We Pick up your Jewels at your convenience',
    iconSrc: iconTimelyReturn,
  },
  {
    title: 'Hassle Free Experience',
    desc: 'Smooth, easy & worry-free from Start to finish',
    iconSrc: iconHassleFree,
  },
];

const ArrowIcon = () => (
  <div className="w-[46px] h-[46px] rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20 flex-shrink-0 transition-all duration-300 group-hover:bg-white/40">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </div>
);

const CategoryCard = ({ cat, index, className }) => (
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

/**
 * Desktop / tablet homepage — Figma frame 179:56 (webview)
 */
const HomeWebView = ({ categories, trending, trendingLoading, onChatNow }) => {
  const carouselRef = useRef(null);
  const [activeDot, setActiveDot] = useState(0);

  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = carouselRef.current.clientWidth * 0.5;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCarouselScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll <= 0) {
      setActiveDot(0);
      return;
    }
    const progress = scrollLeft / maxScroll;
    setActiveDot(Math.round(progress * 2));
  };

  return (
    <div className="hidden md:block bg-white overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative w-full h-screen bg-black overflow-hidden">
        <img
          src={HeroBannerImage}
          alt="Apila Hero Banner"
          className="absolute inset-0 w-full h-full object-cover object-[72%_center]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.28) 42%, rgba(0,0,0,0.02) 72%)',
          }}
        />
        <div className="absolute inset-0 z-10 flex flex-col justify-center px-16 lg:px-24 max-w-2xl text-white">
          <h1 className="font-serif font-normal text-[3.25rem] lg:text-[3.75rem] leading-[1.12] tracking-wide mb-4">
            Elevate Every Moment
          </h1>
          <p className="text-[15px] lg:text-[16px] text-white/75 font-light tracking-wide leading-relaxed mb-9 max-w-md">
            Inspired By An Archival Bow Crafted Embodies Meaningful Connection.
          </p>
          <Link
            to="/shop"
            className="inline-block w-fit bg-brand-rose hover:bg-brand-rose-hover text-white px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 rounded-none"
          >
            Explore All Jewels
          </Link>
        </div>
      </section>

      {/* ── Categories carousel ── */}
      <section className="px-12 lg:px-20 py-10">
        <div
          ref={carouselRef}
          onScroll={handleCarouselScroll}
          className="flex space-x-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-6"
        >
          {categories.map((cat, index) => (
            <CategoryCard
              key={cat.slug}
              cat={cat}
              index={index}
              className="w-[calc(33.333%-16px)] shrink-0 snap-start h-[280px] lg:h-[400px]"
            />
          ))}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            type="button"
            onClick={() => scrollCarousel('left')}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Previous categories"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex space-x-2">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeDot === dot ? 'bg-gray-800 scale-125' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollCarousel('right')}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Next categories"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Shop by Occasion ── */}
      <section className="bg-brand-cream-bg px-4 lg:px-8 pt-10 pb-12">
        <h2 className="text-[26px] font-serif text-gray-800 mb-8 text-center">
          Shop By Occassion
        </h2>
        <div className="grid grid-cols-3 gap-6 w-full mx-auto">
          {occasions.map((occ) => (
            <Link
              key={occ.slug}
              to={`/shop?occasion=${occ.slug}`}
              className="relative aspect-[485/428] overflow-hidden group"
            >
              <LazyImage
                src={occ.img}
                alt={occ.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />
              <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
                <div className="mb-1">
                  <h3 className="font-serif text-[28px] leading-tight font-normal tracking-wide">{occ.title}</h3>
                  <p className="text-[13px] text-white/80 mt-1.5 font-light tracking-wide">Collections</p>
                </div>
                {occ.arrow && <ArrowIcon />}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending Collections ── */}
      <section className="bg-white px-12 lg:px-20 pt-12 pb-10">
        <h2 className="text-[26px] font-serif text-gray-800 mb-8">Trending Collections</h2>
        {trendingLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-7 h-7 border-[3px] border-brand-rose border-t-transparent rounded-full animate-spin" />
          </div>
        ) : trending.length > 0 ? (
          <div className="grid grid-cols-4 lg:grid-cols-5 gap-4">
            {trending.map((item, index) => (
              <Card key={item._id} jewellery={item} priority={index < 4} />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400 py-10">No trending items yet.</p>
        )}
        <div className="mt-12 flex justify-center">
          <Link
            to="/shop?explore=true"
            className="px-10 py-3 border border-[#A56D7A] text-[#A56D7A] rounded-lg text-[14px] font-medium tracking-wide hover:bg-[#A56D7A] hover:text-white transition-all shadow-sm flex items-center gap-2"
          >
            Explore More <span className="text-sm leading-none">›</span>
          </Link>
        </div>
      </section>

      {/* ── Delivery & Pickup ── */}
      <section className="flex flex-col justify-center bg-brand-cream-bg min-h-[60vh] py-16 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#555] mb-2">
          Safe &amp; Reliable
        </p>
        <h3 className="font-serif text-[36px] text-[#222] mb-12">Delivery &amp; Pickup</h3>
        <div className="grid grid-cols-4 px-2 lg:px-8 xl:px-16 max-w-[1536px] mx-auto mb-16 mt-8">
          {deliveryFeatures.map(({ title, desc, iconSrc }, index, arr) => (
            <div
              key={title}
              className={`flex items-center justify-center gap-6 xl:gap-8 px-4 lg:px-6 xl:px-10 ${index !== arr.length - 1 ? 'border-r border-[#EAEAEA]' : ''
                }`}
            >
              <div className="w-[72px] h-[72px] lg:w-[84px] lg:h-[84px] xl:w-[104px] xl:h-[104px] rounded-[1.25rem] bg-[#F9EFE5] flex items-center justify-center flex-shrink-0">
                <img src={iconSrc} alt={title} className="w-4 h-4 lg:w-5 lg:h-5 xl:w-7 xl:h-7 object-contain opacity-80" />
              </div>
              <div className="text-left">
                <h4 className="text-[12px] xl:text-[15px] font-bold text-[#222] mb-1.5 xl:mb-2 leading-tight whitespace-nowrap">
                  {title}
                </h4>
                <p className="text-[10px] text-[#666] leading-[1.5] xl:leading-[1.6] max-w-[150px] xl:max-w-[200px] line-clamp-2">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => window.open('/Rental_Delivery_Guide.pdf', '_blank')}
            className="border border-[#D2B4BC] bg-transparent text-[#7B4E59] px-10 py-2.5 rounded-sm text-[10px] font-semibold uppercase tracking-[0.15em] hover:bg-[#FDF7F3] transition-colors"
          >
            KNOW MORE
          </button>
        </div>
      </section>

      {/* ── WhatsApp CTA ── */}
      <section className="bg-white py-16 px-12 lg:px-20 flex justify-center border-b border-[#F2F2F2]">
        <div className="text-center max-w-2xl">
          <h2 className="text-[32px] font-serif text-[#222] mb-4">Need Styling Help?</h2>
          <p className="text-[14px] text-[#555] leading-relaxed mb-8">
            Tell us your outfit colour, event date, and budget. We&apos;ll suggest
            <br />
            matching pieces instantly on WhatsApp.
          </p>
          <button
            type="button"
            onClick={onChatNow}
            className="bg-[#A56D7A] text-white px-10 py-3 rounded-sm text-[12px] uppercase font-semibold tracking-[0.15em] hover:bg-[#935b67] transition-colors"
          >
            CHAT NOW
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeWebView;
