import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, ShoppingCart, Share2, X, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import SearchOverlay from '../components/SearchOverlay';
import ShareBottomSheet from '../components/ShareBottomSheet';
import LazyImage from '../components/LazyImage';

const Wishlist = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  if (!user) return null;

  return (
    <div className="bg-[#FFF8F3] min-h-screen pb-28">
      {/* Custom Header - Matching Cart styling exactly */}
      <div className="sticky top-0 bg-[#FFF8F3] z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-black">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-lg">My Wishlist</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <button onClick={() => setIsSearchOpen(true)} className="text-gray-700"><Search size={22} /></button>
          <Link to="/cart"><ShoppingCart size={22} /></Link>
          <button onClick={() => setIsShareOpen(true)}><Share2 size={22} /></button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {wishlistItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-24 px-6 text-center">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-5">
               <Heart size={28} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-8 max-w-[260px]">
              Explore our collection and add your favorite jewellery here to save them for later.
            </p>
            <Link to="/shop" className="px-8 py-3 bg-[#B07A85] text-white rounded-lg text-sm font-semibold transition-colors hover:bg-[#9E6A75]">
              Explore Collection
            </Link>
          </div>
        ) : (
          wishlistItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-3 flex gap-3 relative shadow-sm items-center">
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  toggleWishlist(item);
                }}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
              
              <Link to={`/shop/${item._id || item.code}`} className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative block">
                {item.images?.[0]?.type === 'video' ? (
                  <video src={item.images[0].url} className="w-full h-full object-cover" />
                ) : (
                  <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" width={80} height={80} />
                )}
                <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  <Heart size={8} fill="white" strokeWidth={0} />
                </div>
              </Link>
              
              <div className="flex-1 pt-1">
                <Link to={`/shop/${item._id || item.code}`} className="block">
                  <p className="text-[10px] text-gray-400 mb-0.5">{item.type}</p>
                  <h3 className="text-[13px] font-bold text-gray-900 leading-tight pr-4">
                    {item.name}
                  </h3>
                </Link>
              </div>
              
              <div className="font-bold text-sm text-gray-900 self-center">
                ₹{item.rentalPrice?.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my wishlist at Apila Jewels!" />
    </div>
  );
};

export default Wishlist;
