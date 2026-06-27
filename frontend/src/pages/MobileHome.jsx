import React, { useEffect, useState, useContext } from 'react';

import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

import HomeWebView from '../components/HomeWebView';

import Card from '../components/Card';

import LazyImage from '../components/LazyImage';

import CategoryContext from '../context/CategoryContext';

import API_BASE_URL from '../config/api';

import MobileHeroBanner from '../assets/images/Header-image11-1.jpg';



import imgVictorianMoissinate from '../assets/images/jtype-victorian-moissinate.jpg';
import imgAmericanDiamond from '../assets/images/jtype-american-diamond.jpg';
import imgGoldAntique from '../assets/images/jtype-gold-antique.jpg';
import imgKundan from '../assets/images/jtype-kundan.jpg';

import imgChokerNecklace from '../assets/images/jtype-choker-necklace.jpg';
import imgLongHaram from '../assets/images/jtype-long-haram.jpg';
import imgBanglesBracelets from '../assets/images/jtype-bangles-bracelets.jpg';
import imgAccessories from '../assets/images/jtype-accessories.jpg';

import imgSemiBridal from '../assets/images/jtype-semi-bridal.jpg';
import imgFullBridal from '../assets/images/jtype-full-bridal.jpg';

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


const MAIN_JEWELLERY_TYPES = [
  { title: "Victorian & Moissinate", sub: "Premium Luxury Design", img: imgVictorianMoissinate, slug: "victorian-moissinate" },
  { title: "American Diamond", sub: "Modern Sparkle Collections", img: imgAmericanDiamond, slug: "american-diamond" },
  { title: "Gold Antique Jewels", sub: "Timeless Heritage Designs", img: imgGoldAntique, slug: "gold-antique-jewels" },
  { title: "Kundan Jewels", sub: "Traditional Collections", img: imgKundan, slug: "kundan-jewels" },
];

const OCCASIONS = [
  { title: 'Bridal Set', href: '/shop?occasion=bridal', img: imgC1, sub: 'Collections' },
  { title: 'Bridal Maid', href: '/shop?occasion=bridesmaid', img: imgC2, sub: 'Collections' },
  { title: 'Designer', href: '/shop?occasion=designer', img: imgC3, sub: 'Collections' },
  { title: 'Reception', href: '/shop?occasion=reception', img: imgC4, sub: 'Collections' },
  { title: 'Party wear', href: '/shop?occasion=party', img: imgC5, sub: 'Collections' },
  { title: 'Small Jewel', href: '/shop?occasion=small', img: imgC6, sub: 'Collections' },
];



const ArrowCircle = ({ size = 46 }) => {

  const iconSize = Math.round(size * 0.54);

  return (

    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className="rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 flex-shrink-0"
    >

      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">

        <polyline points="9 18 15 12 9 6" />

      </svg>

    </div>

  );

};



const Home = () => {

  const [trending, setTrending] = useState([]);

  const [trendingLoading, setTrendingLoading] = useState(true);

  const { categories } = useContext(CategoryContext);



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

    <div className="pb-0 md:pb-0 bg-white min-h-screen relative">

      <Navbar />



      {/* ── Desktop / tablet webview ── */}

      <HomeWebView

        categories={displayCategories}

        trending={trending}

        trendingLoading={trendingLoading}

        onChatNow={handleChatNow}

      />



      {/* ── Mobile-only layout ── */}

      <div className="md:hidden">



        {/* ── 1. Hero ── */}

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

              background:

                'linear-gradient(to bottom, rgba(0,0,0,0.0) 45%, rgba(0,0,0,0.55) 100%)',

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



        {/* ── 2. Shop by Jewellery Type – vertical stacked landscape cards ── */}

        {MAIN_JEWELLERY_TYPES.length >= 1 && (

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
                        opacity: 0.7

                      }}

                    >

                      {cat.sub}

                    </p>

                  </div>

                </Link>

              ))}

            </div>

          </section>

        )}




        {/* ── 2b. Shop by Jewellery Type – horizontal scroll portrait cards ── */}

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

            {[
              { img: imgSemiBridal, title: 'Semi Bridal & Combo Sets', href: '/shop?category=semi-bridal' },
              { img: imgFullBridal, title: 'Full Bridal Set', href: '/shop?category=full-bridal' },
              { img: imgChokerNecklace, title: 'Choker & Necklace', href: '/shop?category=choker-necklace' },
              { img: imgLongHaram, title: 'Long Haram', href: '/shop?category=long-haram' },
              { img: imgBanglesBracelets, title: 'Bangles & Bracelets', href: '/shop?category=bangles-bracelets' }
            ].map((card) => (

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




        {/* ── 3. Shop by Occasion – single-column stacked ── */}

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



        {/* ── 4. Trending Collections ── */}

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

                <Card key={item._id} jewellery={item} priority={index < 4} imageAspect="190 / 236" imageClassName="" />

              ))}

            </div>

          ) : (

            <p className="text-center text-sm text-gray-400 py-10">No trending items yet.</p>

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



        {/* ── 5. Delivery & Pickup ── */}

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

                <div className="w-12 h-12 mb-[15px] rounded-full bg-[#FAF3ED] flex items-center justify-center">

                  <img src={iconSrc} alt={label.replace('\n', ' ')} className="w-5 h-5 object-contain" />

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



        {/* ── 6. Need Styling Help? / WhatsApp CTA ── */}

        <section className="bg-white py-12 text-center px-6">

          <h2

            className="text-black mb-4"

            style={{
              fontFamily: "'Belgant Aesthetic', Georgia, serif",
              fontSize: '30px',
            }}

          >

            Need Styling Help?

          </h2>

          <p

            className="text-black text-center max-w-[342px] mx-auto mb-8"

            style={{
              fontFamily: "'Gotham Book', sans-serif",
              fontSize: '12px',
              lineHeight: '22px',
            }}

          >

            Tell us your outfit colour, event date, and budget. We&apos;ll suggest matching pieces instantly on WhatsApp.

          </p>

          <button

            type="button"

            onClick={handleChatNow}

            className="bg-[#ab6281] text-white hover:bg-[#935b67] transition-colors flex items-center justify-center mx-auto"

            style={{
              fontFamily: "'Gotham', sans-serif",
              fontSize: '11px',
              letterSpacing: '1.54px',
              width: '159px',
              height: '44px',
            }}

          >

            CHAT NOW

          </button>

        </section>



        <Footer />

      </div>

    </div>

  );

};



export default Home;
