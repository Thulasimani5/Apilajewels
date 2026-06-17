import React, { useEffect, useState, useContext, useRef } from 'react';

import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

import HomeWebView from '../components/HomeWebView';

import Card from '../components/Card';

import LazyImage from '../components/LazyImage';

import CategoryContext from '../context/CategoryContext';

import API_BASE_URL from '../config/api';

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



const ArrowIcon = () => (

  <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20 flex-shrink-0">

    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">

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

      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"

    />

    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

    <div className="absolute top-6 left-5 right-5 text-white">

      <h2 className="text-lg sm:text-xl font-serif font-semibold leading-snug tracking-wide">

        {cat.title}

      </h2>

      <p className="text-xs sm:text-sm text-white/75 mt-1 font-light">{cat.sub}</p>

    </div>

    <div className="absolute bottom-6 left-5 right-5 flex items-center justify-between text-white">

      <span className="text-xs sm:text-sm font-light tracking-wide">Explore Now</span>

      <ArrowIcon />

    </div>

  </Link>

);



const Home = () => {

  const [trending, setTrending] = useState([]);

  const [trendingLoading, setTrendingLoading] = useState(true);

  const { categories } = useContext(CategoryContext);



  const mobileCarouselRef = useRef(null);

  const [activeMobileDot, setActiveMobileDot] = useState(0);



  const scrollMobile = (direction) => {

    if (mobileCarouselRef.current) {

      const scrollAmount = mobileCarouselRef.current.clientWidth * 0.8;

      mobileCarouselRef.current.scrollBy({

        left: direction === 'left' ? -scrollAmount : scrollAmount,

        behavior: 'smooth',

      });

    }

  };



  const handleMobileScroll = () => {

    if (mobileCarouselRef.current) {

      const { scrollLeft, scrollWidth, clientWidth } = mobileCarouselRef.current;

      const maxScroll = scrollWidth - clientWidth;

      if (maxScroll <= 0) {

        setActiveMobileDot(0);

        return;

      }

      const progress = scrollLeft / maxScroll;

      setActiveMobileDot(Math.round(progress * 2));

    }

  };



  const displayCategories = categories.map((c) => ({

    slug: c.name.toLowerCase().replace(/\s+/g, '-'),

    title: c.name,

    sub: c.subtext || 'Collections',

    img: c.image ? (c.image.startsWith('http') ? c.image : `${API_BASE_URL}${c.image}`) : '',

  }));



  useEffect(() => {

    document.body.classList.add('home-hide-scrollbar');

    return () => document.body.classList.remove('home-hide-scrollbar');

  }, []);



  useEffect(() => {

    const fetchTrending = async () => {

      try {

        const res = await fetch(`${API_BASE_URL}/api/jewellery?sort=popularity&limit=8`);

        const data = await res.json();

        if (data.success && data.data) {

          const sorted = [...data.data]

            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

            .slice(0, 8);

          setTrending(sorted);

        }

      } catch (err) {

        console.error('Failed to fetch trending items:', err);

      } finally {

        setTrendingLoading(false);

      }

    };

    fetchTrending();

  }, []);



  const handleChatNow = () => {

    const message =

      `✨ Welcome to Apila Jewels ✨\nWhere elegance meets affordability 💎\n\nThank you for reaching out to us.\nOur exclusive rental jewellery collections are crafted to make your special moments unforgettable.\n\nKindly share your requirements, preferred designs, or event date.\nWe'll get back to you shortly with the best options 💫`;

    window.open(`https://wa.me/+917397721122?text=${encodeURIComponent(message)}`, '_blank');

  };



  return (

    <div className="pb-28 md:pb-0 bg-white min-h-screen relative">

      <Navbar />



      {/* ── Desktop / tablet webview (Figma frame 179:56) ── */}

      <HomeWebView

        categories={displayCategories}

        trending={trending}

        trendingLoading={trendingLoading}

        onChatNow={handleChatNow}

      />



      {/* ── Mobile-only layout ── */}

      <div className="md:hidden">

        {/* Hero */}

        <section className="relative w-full h-screen bg-black overflow-hidden">

          <img
            src={HeroBannerImage}
            alt="Apila Hero Banner"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: '65% center' }}
          />

          <div

            className="absolute inset-0"

            style={{

              background:

                'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.75) 25%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0.0) 75%)',

            }}

          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15" />

          <div className="absolute bottom-[12%] left-0 z-10 flex flex-col px-8 sm:px-12 max-w-lg text-white">

            <h1 className="font-serif font-normal leading-[1.1] tracking-wide mb-4 text-[2.4rem] sm:text-[2.8rem]">

              Premium Bridal Jewellery Rental in Chennai

            </h1>

            <p className="text-[13px] sm:text-[14px] text-white/75 font-light tracking-wide leading-relaxed mb-7 max-w-[300px] sm:max-w-sm">

              Premium Rental Collections Crafted For Weddings, Receptions And Celebrations.

            </p>

            <Link

              to="/shop"

              className="inline-block bg-brand-rose hover:bg-brand-rose-hover text-white px-7 py-3 text-[11px] font-semibold uppercase tracking-widest transition-colors duration-300 shadow-lg"

            >

              Explore All Jewels

            </Link>

          </div>

        </section>



        {/* Categories carousel */}

        <section className="mt-4 mb-4">

          <div

            ref={mobileCarouselRef}

            onScroll={handleMobileScroll}

            className="flex space-x-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar ml-4 pr-4 pb-2"

          >

            {displayCategories.map((cat, index) => (

              <CategoryCard

                key={cat.slug}

                cat={cat}

                index={index}

                className="w-[75vw] sm:w-[300px] shrink-0 snap-start h-[40vh]"

              />

            ))}

          </div>

          <div className="flex items-center justify-center space-x-3 mt-3">

            <button

              type="button"

              onClick={() => scrollMobile('left')}

              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"

              aria-label="Previous categories"

            >

              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">

                <polyline points="15 18 9 12 15 6" />

              </svg>

            </button>

            <div className="flex space-x-1.5">

              {[0, 1, 2].map((dot) => (

                <div

                  key={dot}

                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${

                    activeMobileDot === dot ? 'bg-gray-800 scale-125' : 'bg-gray-300'

                  }`}

                />

              ))}

            </div>

            <button

              type="button"

              onClick={() => scrollMobile('right')}

              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"

              aria-label="Next categories"

            >

              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">

                <polyline points="9 18 15 12 9 6" />

              </svg>

            </button>

          </div>

        </section>



        {/* Shop by Occasion */}

        <section className="bg-brand-cream-bg px-5 pt-4 pb-8 mt-6">

          <h2 className="text-[18px] font-serif text-gray-800 mb-4 px-1">Shop By Occassion</h2>

          <div className="grid grid-cols-2 gap-3">

            <div className="flex flex-col gap-2">

              <Link to="/shop?occasion=bridal" className="relative h-44 rounded-[2rem] overflow-hidden group">

                <LazyImage src={imgC1} alt="Bridal Set" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">

                  <div>

                    <h3 className="font-serif text-[15px] leading-tight">Bridal Set</h3>

                    <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>

                  </div>

                  <ArrowIcon />

                </div>

              </Link>

              <Link to="/shop?occasion=designer" className="relative h-36 rounded-[2rem] overflow-hidden group">

                <LazyImage src={imgC3} alt="Designer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">

                  <div>

                    <h3 className="font-serif text-[15px] leading-tight">Designer</h3>

                    <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>

                  </div>

                  <ArrowIcon />

                </div>

              </Link>

              <Link to="/shop?occasion=party" className="relative h-44 rounded-[2rem] overflow-hidden group">

                <LazyImage src={imgC5} alt="Party Wear" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">

                  <div>

                    <h3 className="font-serif text-[15px] leading-tight">Party Wear</h3>

                    <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>

                  </div>

                  <ArrowIcon />

                </div>

              </Link>

            </div>

            <div className="flex flex-col gap-2">

              <Link to="/shop?occasion=bridesmaid" className="relative h-36 rounded-[2rem] overflow-hidden group">

                <LazyImage src={imgC2} alt="Bridemaid" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">

                  <div>

                    <h3 className="font-serif text-[15px] leading-tight">Bridemaid</h3>

                    <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>

                  </div>

                  <ArrowIcon />

                </div>

              </Link>

              <Link to="/shop?occasion=reception" className="relative h-52 rounded-[2rem] overflow-hidden group">

                <LazyImage src={imgC4} alt="Reception" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">

                  <div>

                    <h3 className="font-serif text-[15px] leading-tight">Reception</h3>

                    <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>

                  </div>

                  <ArrowIcon />

                </div>

              </Link>

              <Link to="/shop?occasion=small" className="relative h-36 rounded-[2rem] overflow-hidden group">

                <LazyImage src={imgC6} alt="Small Jewel" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">

                  <div>

                    <h3 className="font-serif text-[15px] leading-tight">Small Jewel</h3>

                    <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>

                  </div>

                  <ArrowIcon />

                </div>

              </Link>

            </div>

          </div>

        </section>



        {/* Trending */}

        <section className="bg-white px-5 pt-6 pb-4">

          <div className="mb-4">

            <h2 className="text-[18px] font-serif text-gray-800">Trending Collections</h2>

          </div>

          {trendingLoading ? (

            <div className="flex justify-center items-center h-40">

              <div className="w-7 h-7 border-[3px] border-brand-rose border-t-transparent rounded-full animate-spin" />

            </div>

          ) : trending.length > 0 ? (

            <div className="grid grid-cols-2 gap-[10px]">

              {trending.map((item, index) => (

                <Card key={item._id} jewellery={item} priority={index < 4} />

              ))}

            </div>

          ) : (

            <p className="text-center text-sm text-gray-400 py-10">No trending items yet.</p>

          )}

          <div className="mt-8 flex justify-center">

            <Link

              to="/shop?explore=true"

              className="px-8 py-2.5 border border-[#A56D7A] text-[#A56D7A] rounded-lg text-[13px] font-medium tracking-wide hover:bg-[#A56D7A] hover:text-white transition-all shadow-sm flex items-center gap-2"

            >

              Explore More <span className="text-sm leading-none">›</span>

            </Link>

          </div>

        </section>



        {/* Delivery */}

        <section className="bg-brand-cream-bg mt-10 pt-5 pb-4 text-center border-b border-[#EAEAEA]">

          <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#555] mb-1">Safe &amp; Reliable</p>

          <h3 className="font-serif text-[28px] text-[#222] mb-3">Delivery &amp; Pickup</h3>

          <div className="flex justify-center items-stretch mb-4 px-2 max-w-md mx-auto">

            {[

              { label: 'Secure\nPackaging', iconSrc: iconSecure },

              { label: 'Doorstep\nDelivery', iconSrc: iconDoorstepDelivery },

              { label: 'Timely\nReturn Pickup', iconSrc: iconTimelyReturn },

              { label: 'Hassle-Free\nExperience', iconSrc: iconHassleFree },

            ].map(({ label, iconSrc }, index, arr) => (

              <div

                key={label}

                className={`flex flex-col items-center flex-1 ${index !== arr.length - 1 ? 'border-r border-[#EAEAEA]' : ''}`}

              >

                <div className="w-11 h-11 mb-1 rounded-full bg-[#FAF3ED] flex items-center justify-center text-[#555]">

                  <img src={iconSrc} alt={label.replace('\n', ' ')} className="w-5 h-5 object-contain" />

                </div>

                <p className="text-[8px] text-[#555] text-center leading-[1.2] whitespace-pre-line px-4">{label}</p>

              </div>

            ))}

          </div>

          <button

            type="button"

            onClick={() => window.open('/Rental_Delivery_Guide.pdf', '_blank')}

            className="bg-[#A56D7A] text-white px-3 py-2 rounded-md text-[8px] font-semibold uppercase tracking-[0.15em] hover:bg-[#935b67] transition-colors"

          >

            Know More

          </button>

        </section>



        {/* WhatsApp CTA */}

        <section className="bg-white py-10">

          <div className="mx-4 bg-brand-cream-bg px-5 py-6 rounded-[1.5rem] flex items-center justify-between gap-4">

            <div className="flex gap-4 items-center">

              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-[#D3B49E] flex-shrink-0">

                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">

                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />

                </svg>

              </div>

              <div>

                <p className="text-[10px] text-[#555] mb-1">Have Questions?</p>

                <h4 className="text-[17.5px] sm:text-[20px] font-serif text-[#222] leading-tight mb-1 whitespace-nowrap tracking-tight">

                  Book on Whatsapp

                </h4>

                <p className="text-[10px] text-[#555]">Our team is happy to help you!</p>

              </div>

            </div>

            <button

              type="button"

              onClick={handleChatNow}

              className="bg-[#A56D7A] text-white px-3 py-2 rounded-md text-[8px] uppercase font-semibold tracking-[0.15em] hover:bg-[#935b67] transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"

            >

              CHAT NOW <span className="text-[10px] leading-none ml-1">›</span>

            </button>

          </div>

        </section>



        <Footer />

      </div>

    </div>

  );

};



export default Home;

