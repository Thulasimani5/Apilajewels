import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="pb-20">
      {/* Hero Section / Categories */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Link to="/shop?type=moissanite" className="relative h-[260px] md:h-[400px] rounded-[2rem] overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80" alt="Moissanite Jewels" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60"></div>
          
          <div className="absolute top-6 left-4 right-2 text-white">
            <h2 className="text-[1.1rem] md:text-2xl font-serif mb-1 tracking-wide font-medium leading-tight">Moissinate Jewels</h2>
            <p className="text-[10px] md:text-sm text-white/80 font-light">Necklace Sets</p>
          </div>
          
          <div className="absolute bottom-5 left-4 right-4 flex justify-between items-center text-white">
            <span className="text-xs md:text-sm font-light">Explore Now</span>
            <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/10">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        </Link>

        <Link to="/shop?type=ad" className="relative h-[260px] md:h-[400px] rounded-[2rem] overflow-hidden group">
          <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80" alt="AD Jewels" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/50"></div>
          
          <div className="absolute top-6 left-4 right-2 text-white">
            <h2 className="text-[1.1rem] md:text-2xl font-serif mb-1 tracking-wide font-medium leading-tight">AD Jewels</h2>
            <p className="text-[10px] md:text-sm text-white/80 font-light">Necklace Sets</p>
          </div>
          
          <div className="absolute bottom-5 left-4 text-white">
            <span className="text-xs md:text-sm font-light">Explore Now</span>
          </div>
        </Link>
      </div>

      {/* Shop by Occasion */}
      <div className="px-4 mt-8">
        <h2 className="text-xl font-serif text-gray-800 mb-4">Shop by Occassion</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/shop?occasion=bridal" className="relative h-48 rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1583391733958-d25e01a88b50?w=800&q=80" alt="Bridal Set" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
            <div className="absolute bottom-3 left-3 text-white">
              <h3 className="font-serif text-lg leading-tight">Bridal Set</h3>
              <p className="text-[10px] text-white/70">Collections</p>
            </div>
          </Link>
          <div className="grid gap-3">
            <Link to="/shop?occasion=bridesmaid" className="relative h-[90px] rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1595781577436-1e002eb23c21?w=800&q=80" alt="Bridal Maid" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute bottom-2 left-3 text-white">
                <h3 className="font-serif text-sm">Bridal Maid</h3>
                <p className="text-[8px] text-white/70">Collections</p>
              </div>
            </Link>
            <Link to="/shop?occasion=reception" className="relative h-[90px] rounded-2xl overflow-hidden group">
              <img src="https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80" alt="Reception" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/30"></div>
              <div className="absolute bottom-2 left-3 text-white">
                <h3 className="font-serif text-sm">Reception</h3>
                <p className="text-[8px] text-white/70">Collections</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Info Section */}
      <div className="bg-[#FFF8F3] mt-10 p-6 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Safe & Reliable</p>
        <h3 className="font-serif text-xl mb-6">Delivery & Pickup</h3>
        
        <div className="flex justify-between items-start mb-6 max-w-sm mx-auto">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            </div>
            <p className="text-[10px] text-gray-500 w-16">Secure Packaging</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            </div>
            <p className="text-[10px] text-gray-500 w-16">Doorstep Delivery</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <p className="text-[10px] text-gray-500 w-16">Timely Return Pickup</p>
          </div>
        </div>
        <button className="bg-[#B07A85] text-white px-8 py-2 rounded-full text-xs uppercase tracking-wider">Know More</button>
      </div>
      
      {/* WhatsApp Help */}
      <div className="mx-4 mt-6 bg-[#FFF8F3] p-4 rounded-xl flex items-center justify-between">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-green-500">
            {/* Simple WA Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 mb-0.5">Have Questions?</p>
            <h4 className="text-sm font-semibold text-gray-800">Book on Whatsapp</h4>
            <p className="text-[10px] text-gray-500">Our team is happy to help you!</p>
          </div>
        </div>
        <button className="bg-[#B07A85] text-white px-4 py-2 rounded-md text-[10px] uppercase tracking-wider flex items-center gap-1">
          Chat Now &gt;
        </button>
      </div>
    </div>
  );
};

export default Home;
