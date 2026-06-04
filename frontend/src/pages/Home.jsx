import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import CategoryContext from '../context/CategoryContext';
import API_BASE_URL from '../config/api';

/* ── Arrow button ── */
const ArrowIcon = () => (
  <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20 flex-shrink-0">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </div>
);


/* ── Base URL ── */
const baseUrl = API_BASE_URL;
const CLOUD_BASE = import.meta.env.VITE_CLOUDINARY_BASE || API_BASE_URL;

/* ── Shop by Occasion data ── */
const occasions = [
  { slug: 'bridal', title: 'Bridal Set', img: `${CLOUD_BASE}/Bridal_Set.png` },
  { slug: 'bridesmaid', title: 'Bridal Maid', img: `${CLOUD_BASE}/Bridal_Maid.png` },
  { slug: 'designer', title: 'Designer', img: `${CLOUD_BASE}/Designer.png`, arrow: true },
  { slug: 'reception', title: 'Reception', img: `${CLOUD_BASE}/Reception.png`, arrow: true },
  { slug: 'party', title: 'Party Wear', img: `${CLOUD_BASE}/Party_Wear.png`, arrow: true },
  { slug: 'small', title: 'Small Jewel', img: `${CLOUD_BASE}/Small_Jewel.png`, arrow: true },
];

const Home = () => {
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const { categories } = useContext(CategoryContext);

  const displayCategories = categories.map((c) => ({
    slug: c.name.toLowerCase().replace(/\s+/g, '-'),
    title: c.name,
    sub: c.subtext || 'Collections',
    img: c.image ? (c.image.startsWith('http') ? c.image : `${baseUrl}${c.image}`) : ''
  }));

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?sort=popularity&limit=8`);
        const data = await res.json();
        if (data.success && data.data) {
          // Sort by popularity descending and take top 8
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
    <div className="pb-28 bg-white">
      <Navbar />

      {/* ── SECTION 1 — Full-viewport hero carousel (All Categories) ── */}
      <section className="flex space-x-2 overflow-x-auto snap-x snap-mandatory hide-scrollbar mt-4 mb-4 ml-4 pr-4">
        {displayCategories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/shop?category=${cat.slug}`}
            className="relative rounded-[1.5rem] overflow-hidden group w-[55vw] sm:w-[300px] shrink-0 snap-start h-[40vh] shadow-sm"
          >
            <img
              src={cat.img}
              alt={cat.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />

            <div className="absolute top-6 left-5 right-5 text-white">
              <h2 className="text-lg sm:text-xl font-serif font-semibold leading-snug tracking-wide">
                {cat.title}
              </h2>

              <p className="text-xs sm:text-sm text-white/75 mt-1 font-light">
                {cat.sub}
              </p>
            </div>

            <div className="absolute bottom-6 left-5 right-5 flex items-center justify-between text-white">
              <span className="text-xs sm:text-sm font-light tracking-wide">
                Explore Now
              </span>

              <ArrowIcon />
            </div>
          </Link>
        ))}
      </section>


      {/* ════════════════════════════════════════════
          SECTION 3 — Shop by Occasion
          ════════════════════════════════════════════ */}
      <section className="bg-[#FCF8F5] px-5 pt-4 pb-8 mt-6">
        <h2 className="text-[18px] font-serif text-gray-800 mb-4 px-1">
          Shop by Occassion
        </h2>

        {/* Mobile: 2-col masonry  |  Desktop: 4-col equal */}
        <div className="hidden md:grid md:grid-cols-4 gap-2">
          {occasions.map((occ) => (
            <Link key={occ.slug} to={`/shop?occasion=${occ.slug}`}
              className="relative h-64 lg:h-72 rounded-2xl overflow-hidden group">
              <img src={occ.img} alt={occ.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <h3 className="font-serif text-[15px] leading-tight">{occ.title}</h3>
                  <p className="text-[9px] text-white/65 mt-0.5">Collections</p>
                </div>
                {occ.arrow && <ArrowIcon />}
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile 2-col masonry */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {/* Left col */}
          <div className="flex flex-col gap-2">
            <Link to="/shop?occasion=bridal" className="relative h-44 rounded-[2rem] overflow-hidden group">
              <img src={`${CLOUD_BASE}/Bridal_Set.png`} alt="Bridal Set" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
              <img src={`${CLOUD_BASE}/Designer.png`} alt="Designer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
              <img src={`${CLOUD_BASE}/Party_Wear.png`} alt="Party Wear" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
          {/* Right col */}
          <div className="flex flex-col gap-2">
            <Link to="/shop?occasion=bridesmaid" className="relative h-36 rounded-[2rem] overflow-hidden group">
              <img src={`${CLOUD_BASE}/Bridal_Maid.png`} alt="Bridal Maid" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                <div>
                  <h3 className="font-serif text-[15px] leading-tight">Bridal Maid</h3>
                  <p className="text-[10px] text-white/65 mt-1 font-light">Collections</p>
                </div>
                <ArrowIcon />
              </div>
            </Link>
            <Link to="/shop?occasion=reception" className="relative h-52 rounded-[2rem] overflow-hidden group">
              <img src={`${CLOUD_BASE}/Reception.png`} alt="Reception" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
              <img src={`${CLOUD_BASE}/Small_Jewel.png`} alt="Small Jewel" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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

      <section className="bg-white px-5 pt-6 pb-4">
        {/* ── Trending Collections ── */}
        <div>
          <div className="mb-4">
            <h2 className="text-[18px] font-serif text-gray-800">Trending Collections</h2>
          </div>

          {trendingLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-7 h-7 border-[3px] border-[#B07A85] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]">
              {trending.map((item) => (
                <Card key={item._id} jewellery={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-10">No trending items yet.</p>
          )}
        </div>


        <div className="mt-8 flex justify-center">
          <Link
            to="/shop?explore=true"
            className="px-8 py-2.5 border border-[#A56D7A] text-[#A56D7A] rounded-lg text-[13px] font-medium tracking-wide hover:bg-[#A56D7A] hover:text-white transition-all shadow-sm flex items-center gap-2"
          >
            Explore More <span className="text-sm leading-none">›</span>
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4 — Delivery Info
          ════════════════════════════════════════════ */}
      <section className="bg-[#FCF8F5] mt-10 pt-5 pb-4 text-center border-b border-[#EAEAEA]">
        <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#555] mb-1">
          Safe &amp; Reliable
        </p>

        <h3 className="font-serif text-[28px] text-[#222] mb-3">
          Delivery &amp; Pickup
        </h3>

        <div className="flex justify-center items-stretch mb-4 px-2 max-w-md mx-auto">
          {[
            {
              label: 'Secure\nPackaging',
              icon: (
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              ),
            },
            {
              label: 'Doorstep\nDelivery',
              icon: (
                <>
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <rect x="10" y="14" width="4" height="4" />
                </>
              ),
            },
            {
              label: 'Timely\nReturn Pickup',
              icon: (
                <>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <circle cx="9" cy="15" r="1" fill="currentColor" stroke="none" />
                  <circle cx="15" cy="15" r="1" fill="currentColor" stroke="none" />
                </>
              ),
            },
            {
              label: 'Hassle-Free\nExperience',
              icon: (
                <>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </>
              ),
            },
          ].map(({ label, icon }, index, arr) => (
            <div
              key={label}
              className={`flex flex-col items-center flex-1 ${index !== arr.length - 1 ? 'border-r border-[#EAEAEA]' : ''
                }`}
            >
              <div className="w-11 h-11 mb-1 rounded-full bg-[#FAF3ED] flex items-center justify-center text-[#555]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                >
                  {icon}
                </svg>
              </div>

              <p className="text-[8px] text-[#555] text-center leading-[1.2] whitespace-pre-line px-4">
                {label}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.open(`/Rental_Delivery_Guide.pdf`, '_blank')}
          className="bg-[#A56D7A] text-white px-3 py-2 rounded-md text-[8px] font-semibold uppercase tracking-[0.15em] hover:bg-[#935b67] transition-colors"
        >
          Know More
        </button>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5 — WhatsApp CTA
          ════════════════════════════════════════════ */}
      <section className="bg-white py-10">
        <div className="mx-4 bg-[#FCF8F5] px-5 py-6 rounded-[1.5rem] flex items-center justify-between gap-4">
          <div className="flex gap-4 items-center">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm text-[#D3B49E] flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-[#555] mb-1">Have Questions?</p>
              <h4 className="text-[17.5px] sm:text-[20px] font-serif text-[#222] leading-tight mb-1 whitespace-nowrap tracking-tight">Book on Whatsapp</h4>
              <p className="text-[10px] text-[#555]">Our team is happy to help you!</p>
            </div>
          </div>
          <button
            onClick={handleChatNow}
            className="bg-[#A56D7A] text-white px-3 py-2 rounded-md text-[8px] uppercase font-semibold tracking-[0.15em] hover:bg-[#935b67] transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-1"
          >
            CHAT NOW <span className="text-[10px] leading-none ml-1">›</span>
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;
