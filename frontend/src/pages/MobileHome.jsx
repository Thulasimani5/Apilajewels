import React, { useEffect, useState, useContext } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomeWebView from '../components/HomeWebView';
import CategoryContext from '../context/CategoryContext';
import API_BASE_URL from '../config/api';

import MobileHeroSection from '../components/mobileHome/MobileHeroSection';
import MobileMainJewelleryTypesSection from '../components/mobileHome/MobileMainJewelleryTypesSection';
import MobileJewelleryTypesScrollSection from '../components/mobileHome/MobileJewelleryTypesScrollSection';
import MobileOccasionSection from '../components/mobileHome/MobileOccasionSection';
import MobileTrendingSection from '../components/mobileHome/MobileTrendingSection';
import MobileDeliverySection from '../components/mobileHome/MobileDeliverySection';
import MobileStylingHelpSection from '../components/mobileHome/MobileStylingHelpSection';

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
        const res = await fetch(`${API_BASE_URL}/api/jewellery?random=true&limit=8`);
        const data = await res.json();
        if (data.success && data.data) {
          const filtered = data.data.filter((item) => {
            const types = Array.isArray(item.type) ? item.type : [item.type];
            return !types.some((t) => t?.toLowerCase() === 'accessories');
          });
          setTrending(filtered);
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
    const message = `✨ Welcome to Apila Jewels ✨\nWhere elegance meets affordability 💎\n\nThank you for reaching out to us.\nOur exclusive rental jewellery collections are crafted to make your special moments unforgettable.\n\nKindly share your requirements, preferred designs, or event date.\nWe'll get back to you shortly with the best options 💫`;
    window.open(`https://wa.me/+917397721122?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="pb-0 md:pb-0 bg-white min-h-screen relative">
      <Navbar />

      {/* Desktop / tablet webview */}
      <HomeWebView
        categories={displayCategories}
        trending={trending}
        trendingLoading={trendingLoading}
        onChatNow={handleChatNow}
      />

      {/* Mobile-only layout */}
      <div className="md:hidden">
        <MobileHeroSection />
        <MobileMainJewelleryTypesSection />
        <MobileJewelleryTypesScrollSection />
        <MobileOccasionSection />
        <MobileTrendingSection trending={trending} trendingLoading={trendingLoading} />
        <MobileDeliverySection />
        <MobileStylingHelpSection onChatNow={handleChatNow} />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
