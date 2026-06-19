import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingCart, Share2, X, Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import SearchOverlay from '../components/SearchOverlay';
import ShareBottomSheet from '../components/ShareBottomSheet';
import LazyImage from '../components/LazyImage';
import DesktopWishlist from './DesktopWishlist';
import useIsDesktop from '../hooks/useIsDesktop';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Wishlist = () => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Guest users can access the wishlist; items are stored in localStorage.

  // Guest access is allowed - wishlist is stored in localStorage.

  if (isDesktop) {
    return <DesktopWishlist />;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="bg-white flex flex-col min-h-[100dvh]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center bg-white border-b border-[#EAEAEA] mt-[64px] md:mt-[80px] py-20">
          <h2 className="uppercase mb-4 text-[#111] text-center" style={{ fontFamily: "'Belgant Aesthetic', Georgia, serif", fontSize: '26px', letterSpacing: '0.02em', fontWeight: 'normal' }}>
            YOUR WISHLIST IS EMPTY
          </h2>
          <p className="text-[#666] text-center" style={{ fontFamily: "'Gotham', sans-serif", fontSize: '13px' }}>
            Your saved jewellery will appear here.
          </p>
        </div>
        <Footer />
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my wishlist at Apila Jewels!" />
      </div>
    );
  }

  return (
    <div className="bg-white flex flex-col min-h-[100dvh]">
      <Navbar />
      <div className="flex-1 flex flex-col mt-[64px] md:mt-[80px] bg-white border-b border-[#EAEAEA] pb-14">
        <div className="px-4 pt-6 pb-6">
          <h2 className="text-[#111]" style={{ fontFamily: "'Belgant Aesthetic', Georgia, serif", fontSize: '24px', fontWeight: 'normal' }}>
            My Wishlist
          </h2>
          {!user && (
            <p className="text-[#666] mt-2 leading-[1.6]" style={{ fontFamily: "'Gotham', sans-serif", fontSize: '11px' }}>
              Wishlist is not saved permanently yet.<br />
              Please <Link to="/login" className="font-bold border-b border-[#111] pb-[1px] text-[#111]">Create Account</Link> to save it.
            </p>
          )}
        </div>

        <div className="px-4 py-2 space-y-4">
          {wishlistItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-3 flex gap-3 relative shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-100 items-center">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(item);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors z-10"
              >
                <X size={16} />
              </button>
              
              <Link to={`/shop/${item._id || item.code}`} className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative block">
                {item.images?.[0]?.type === 'video' ? (
                  <video src={item.images[0].url} className="w-full h-full object-cover" />
                ) : (
                  <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" width={80} height={80} />
                )}
                <div className="absolute top-1 left-1 bg-[#A65A6F] text-white rounded-full w-4 h-4 flex items-center justify-center">
                  <Heart size={8} fill="white" strokeWidth={0} />
                </div>
              </Link>
              
              <div className="flex-1 pt-1 pr-6">
                <Link to={`/shop/${item._id || item.code}`} className="block">
                  <p className="text-[10px] text-gray-400 mb-0.5">{item.type || 'Apila Jewels'}</p>
                  <h3 className="text-[13px] font-bold text-gray-900 leading-tight line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
              </div>
              
              <div className="font-bold text-sm text-gray-900 self-center">
                ₹{item.rentalPrice?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my wishlist at Apila Jewels!" />
    </div>
  );
};

export default Wishlist;
