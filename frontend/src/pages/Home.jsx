import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import HomeWebView from '../components/HomeWebView';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Card from '../components/Card';
import LazyImage from '../components/LazyImage';
import CategoryContext from '../context/CategoryContext';
import API_BASE_URL from '../config/api';

import imgC1 from '../assets/images/c1.jpg';
import imgC2 from '../assets/images/c2.jpg';
import imgC3 from '../assets/images/c3.jpg';
import imgC4 from '../assets/images/c4.jpg';
import imgC5 from '../assets/images/c5.jpg';
import imgC6 from '../assets/images/c6.jpg';
import HeroBannerImage from '../assets/hero-banner.jpg';

const occasions = [
  { slug: 'bridal', title: 'Bridal Set', img: imgC1 },
  { slug: 'bridesmaid', title: 'Bridesmaid', img: imgC2 },
  { slug: 'designer', title: 'Designer', img: imgC3 },
  { slug: 'reception', title: 'Reception', img: imgC4 },
  { slug: 'party', title: 'Party Wear', img: imgC5 },
  { slug: 'small', title: 'Small Jewel', img: imgC6 },
];

const Home = () => {
  const { categories } = useContext(CategoryContext);
  const [trending, setTrending] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/jewellery?featured=true&limit=10`);
        setTrending(res.data.data || []);
      } catch (err) {
        setTrending([]);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleChatNow = () => {
    window.open('https://wa.me/919999999999?text=Hi!%20I%20need%20styling%20help.', '_blank');
  };

  return (
    <>
      <Navbar />

      {/* ── Desktop View (md and above) ── */}
      <HomeWebView
        categories={categories || []}
        trending={trending}
        trendingLoading={trendingLoading}
        onChatNow={handleChatNow}
      />

      {/* ── Mobile View (below md) ── */}
      <div className="block md:hidden bg-white">
        {/* Hero */}
        <section className="relative w-full h-[60vh] bg-black overflow-hidden">
          <img
            src={HeroBannerImage}
            alt="Apila Hero Banner"
            className="absolute inset-0 w-full h-full object-cover object-[72%_center]"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.6) 100%)',
            }}
          />
          <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-10 text-white">
            <h1 className="font-serif font-normal text-[2rem] leading-[1.15] tracking-wide mb-3">
              Elevate Every Moment
            </h1>
            <p className="text-[13px] text-white/75 font-light leading-relaxed mb-6 max-w-xs">
              Inspired by archival craft. Meaningful jewellery for every occasion.
            </p>
            <Link
              to="/shop"
              className="inline-block w-fit bg-brand-rose text-white px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-300"
            >
              Explore All Jewels
            </Link>
          </div>
        </section>

        {/* Shop by Occasion */}
        <section className="px-4 py-8 bg-brand-cream-bg">
          <h2 className="text-[20px] font-serif text-gray-800 mb-5 text-center">
            Shop By Occasion
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {occasions.map((occ, index) => (
              <Link
                key={occ.slug}
                to={`/shop?occasion=${occ.slug}`}
                className="relative aspect-[3/4] overflow-hidden group rounded-xl"
              >
                <LazyImage
                  src={occ.img}
                  alt={occ.title}
                  priority={index < 2}
                  className="absolute inset-0 w-full h-full object-cover group-active:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-[17px] leading-tight font-normal tracking-wide">
                    {occ.title}
                  </h3>
                  <p className="text-[11px] text-white/75 mt-1 font-light">Collections</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending Collections */}
        <section className="bg-white px-4 pt-8 pb-6">
          <h2 className="text-[20px] font-serif text-gray-800 mb-5">Trending Collections</h2>
          {trendingLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-[3px] border-brand-rose border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {trending.slice(0, 6).map((item, index) => (
                <Card key={item._id} jewellery={item} priority={index < 2} />
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-gray-400 py-8">No trending items yet.</p>
          )}
          <div className="mt-6 flex justify-center">
            <Link
              to="/shop?explore=true"
              className="px-8 py-2.5 border border-[#A56D7A] text-[#A56D7A] rounded-lg text-[13px] font-medium tracking-wide hover:bg-[#A56D7A] hover:text-white transition-all"
            >
              Explore More ›
            </Link>
          </div>
        </section>

        {/* WhatsApp CTA */}
        <section className="bg-brand-cream-bg py-10 px-6 text-center">
          <h2 className="text-[22px] font-serif text-[#222] mb-3">Need Styling Help?</h2>
          <p className="text-[13px] text-[#555] leading-relaxed mb-6">
            Tell us your outfit colour, event date, and budget. We&apos;ll suggest matching pieces
            on WhatsApp.
          </p>
          <button
            type="button"
            onClick={handleChatNow}
            className="bg-[#A56D7A] text-white px-8 py-3 rounded-sm text-[11px] uppercase font-semibold tracking-[0.15em] hover:bg-[#935b67] transition-colors"
          >
            CHAT NOW
          </button>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Home;
