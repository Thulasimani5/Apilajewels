import React, { useState } from 'react';
import { ArrowLeft, Search, ShoppingCart, Share2, X, Heart } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import SearchOverlay from '../components/SearchOverlay';
import ShareBottomSheet from '../components/ShareBottomSheet';
import LazyImage from '../components/LazyImage';
import DesktopWishlist from './DesktopWishlist';
import useIsDesktop from '../hooks/useIsDesktop';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Wishlist = ({ isSale: isSaleProp }) => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const location = useLocation();
  const isSale = isSaleProp ?? (location.pathname.startsWith('/sale') || new URLSearchParams(location.search).get('type') === 'sale');

  const { wishlistItems, toggleWishlist } = useWishlist();
  const { user, openLogin } = useAuth();
  const { addToCart } = useCart();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const isItemSale = (item) => Boolean(item.isSale || item.sale || item.sales);
  const currentWishlistItems = wishlistItems.filter(item => isSale ? isItemSale(item) : !isItemSale(item));
  const rentalCount = wishlistItems.filter(item => !isItemSale(item)).length;
  const saleCount = wishlistItems.filter(item => isItemSale(item)).length;

  const handleMoveToBag = (item) => {
    addToCart(item);
    toggleWishlist(item);
  };

  if (isDesktop) {
    return <DesktopWishlist isSale={isSale} />;
  }

  return (
    <div className="bg-white flex flex-col min-h-[100dvh]">
      <Navbar />
      <div className="flex-1 flex flex-col mt-[57px] md:mt-[50px] bg-white border-b border-[#EAEAEA] pb-8">
        <div className="px-4 pt-6 pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <h2 style={{ color: '#000', fontFamily: "'Bacasime Antique', serif", fontSize: '25px', fontStyle: 'normal', fontWeight: 200, lineHeight: '32px', letterSpacing: '-0.75px' }}>
              {isSale ? 'Sale Wishlist' : 'Rental Wishlist'}
            </h2>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <button
              type="button"
              onClick={() => navigate('/wishlist')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all ${!isSale ? 'bg-[#B07A85] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              Rental Wishlist ({rentalCount})
            </button>
            <button
              type="button"
              onClick={() => navigate('/sale/wishlist')}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase transition-all ${isSale ? 'bg-[#B07A85] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              Sale Wishlist ({saleCount})
            </button>
          </div>

          {!user && (
            <p className="mt-1" style={{ color: '#6F6F6F', fontFamily: "'Gotham Book', 'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 100, lineHeight: '158%', letterSpacing: '0.7px', opacity: 0.8 }}>
              Wishlist is not saved permanently yet.<br />
              Please <Link to="/login" style={{ color: '#000', fontFamily: "'Gotham Light', 'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 300, lineHeight: '158%', letterSpacing: '0.5px', textDecorationLine: 'underline', textDecorationStyle: 'solid', textDecorationSkipInk: 'auto', textDecorationThickness: 'auto', textUnderlineOffset: 'auto', textUnderlinePosition: 'from-font' }}>Create Account</Link> to save it.
            </p>
          )}
        </div>

        {currentWishlistItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center bg-white" style={{ paddingTop: '50px', paddingBottom: '70px' }}>
            <h2 className="uppercase mb-4 text-center" style={{ color: '#000', fontFamily: "'Bacasime Antique', serif", fontSize: '22px', fontStyle: 'normal', fontWeight: 400, letterSpacing: '-0.84px' }}>
              {isSale ? 'YOUR SALE WISHLIST IS EMPTY' : 'YOUR WISHLIST IS EMPTY'}
            </h2>
            <p className="text-center mb-6" style={{ color: '#000', fontFamily: "'Gotham Light', sans-serif", fontSize: '13px', fontStyle: 'normal', fontWeight: 300, letterSpacing: '-0.14px', opacity: 0.5 }}>
              {isSale ? 'Your saved sale jewellery will appear here.' : 'Your saved jewellery will appear here.'}
            </p>
            <Link
              to={isSale ? "/sale" : "/shop"}
              className="inline-block px-5 py-2 bg-[#B07A85] text-white text-xs font-semibold uppercase tracking-wider rounded"
            >
              {isSale ? 'Explore Sale Jewellery' : 'Continue Shopping'}
            </Link>
          </div>
        ) : (
          <div className="px-2 py-1 grid grid-cols-2 gap-1">
            {currentWishlistItems.map((item) => {
              const price = isSale
                ? (item.discountedRate || item.salesAmount || item.salesPrice || item.price || 0)
                : (item.rentalPrice || item.price || 0);
              const priceText = isSale
                ? `Rs. ${Math.round(price).toLocaleString('en-IN')}`
                : (item.showPrice === false || price > 1200 ? 'Price on Request' : `₹${price.toFixed(2)}`);
              const categoryText = Array.isArray(item.category) ? item.category[0] : (item.category || (isSale ? 'Sale Jewellery' : 'Jewellery'));

              return (
                <div key={item._id} className="flex flex-col mb-5">
                  <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden group">
                    <Link to={`/shop/${item._id || item.code}`} className="w-full h-full block">
                      {item.images?.[0]?.type === 'video' ? (
                        <video src={item.images[0].url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                      ) : (
                        <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(item);
                      }}
                      className="absolute top-2 right-2 bg-black/20 rounded-full p-1 text-white hover:bg-black/40 transition-colors z-10 backdrop-blur-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="mt-3 pl-2 flex-1 flex flex-col">
                    <p className="mb-1 line-clamp-1" style={{ color: '#000', fontFamily: "'Gotham Book', 'Gotham', sans-serif", fontSize: '10px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '0.7px', textTransform: 'uppercase' }}>
                      {categoryText}
                    </p>
                    <Link to={`/shop/${item._id || item.code}`} className="block flex-1">
                      <h3 className="line-clamp-2 mb-1.5" style={{ color: '#000', fontFamily: "'Gotham Book', 'Gotham', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 200, lineHeight: '15px', letterSpacing: '0.7px', opacity: 0.6 }}>
                        {item.name}
                      </h3>
                    </Link>
                    <div className="mb-3" style={{ color: '#000', fontFamily: "'Gotham Light', 'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: '20px' }}>
                      {priceText}
                    </div>
                  </div>
                  <button
                    onClick={() => handleMoveToBag(item)}
                    className="flex items-center justify-center uppercase hover:bg-[#AB6281] hover:text-white transition-colors mt-auto mx-auto"
                    style={{ border: '1px solid #AB6281', width: '195px', maxWidth: '100%', height: '40px', color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '1.96px' }}
                  >
                    MOVE TO BAG
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my wishlist at Apila Jewels!" />
    </div>
  );
};

export default Wishlist;
