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
import JewelleryToOwnBanner from '../components/JewelleryToOwnBanner';
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
            const isAccessory = types.some((t) => t?.toLowerCase() === 'accessories');
            const isBangle = types.some((t) => t?.toLowerCase() === 'bangles');
            const hasImg = item.images && item.images.length > 0;
            return !isAccessory && !isBangle && hasImg && !item.isSale;
          });
          setTrending(filtered.slice(0, 4));
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handleChatNow = () => {
    const phoneNumber = '+917397721101';
    const message = encodeURIComponent("Hi Apila, I'd like help styling my jewellery!");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Desktop/Tablet layout */}
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
        <JewelleryToOwnBanner />
        <MobileDeliverySection />
        <MobileStylingHelpSection onChatNow={handleChatNow} />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
