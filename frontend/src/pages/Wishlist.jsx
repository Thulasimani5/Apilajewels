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

  const handleMoveToBag = (item) => {
    addToCart(item);
    toggleWishlist(item);
  };

  if (isDesktop) {
    return <DesktopWishlist isSale={isSale} />;
  }

  if (currentWishlistItems.length === 0) {
    return (
      <div className="bg-white flex flex-col min-h-[100dvh]">
        <Navbar />
        <div className="flex-1 flex flex-col items-center bg-white border-b border-[#EAEAEA] mt-[64px] md:mt-[50px]">
          <div className="flex flex-col items-center" style={{ paddingTop: '85px', paddingBottom: '85px' }}>
            <h2 className="uppercase mb-8 text-center" style={{ color: '#000', fontFamily: "'Bacasime Antique', serif", fontSize: '26px', fontStyle: 'normal', fontWeight: 400, lineHeight: 0, letterSpacing: '-0.84px' }}>
              YOUR WISHLIST IS EMPTY
            </h2>
            <p className="text-center" style={{ color: '#000', fontFamily: "'Gotham Light', sans-serif", fontSize: '13px', fontStyle: 'normal', fontWeight: 300, lineHeight: '1px', letterSpacing: '-0.14px', opacity: 0.5 }}>
              Your saved jewellery will appear here.
            </p>
          </div>
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
      <div className="flex-1 flex flex-col mt-[57px] md:mt-[50px] bg-white border-b border-[#EAEAEA] pb-8">
        <div className="px-4 pt-6 pb-4">
          <h2 style={{ color: '#000', fontFamily: "'Bacasime Antique', serif", fontSize: '25px', fontStyle: 'normal', fontWeight: 200, lineHeight: '39px', letterSpacing: '-0.75px' }}>
            My Wishlist
          </h2>
          {!user && (
            <p className="mt-1" style={{ color: '#6F6F6F', fontFamily: "'Gotham Book', 'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 100, lineHeight: '158%', letterSpacing: '0.7px', opacity: 0.8 }}>
              Wishlist is not saved permanently yet.<br />
              Please <Link to="/login" style={{ color: '#000', fontFamily: "'Gotham Light', 'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 300, lineHeight: '158%', letterSpacing: '0.5px', textDecorationLine: 'underline', textDecorationStyle: 'solid', textDecorationSkipInk: 'auto', textDecorationThickness: 'auto', textUnderlineOffset: 'auto', textUnderlinePosition: 'from-font' }}>Create Account</Link> to save it.
            </p>
          )}
        </div>

        <div className="px-2 py-1 grid grid-cols-2 gap-2">
          {currentWishlistItems.map((item) => {
            const isItemSaleProduct = Boolean(item.isSale || item.sale || item.sales);
            const origPrice = Number(item.salesPrice || item.salesAmount || item.price || 0);
            const finalPrice = item.discountedRate != null
              ? Number(item.discountedRate)
              : (item.salesAmount != null ? Number(item.salesAmount) : origPrice);

            let discountPercent = item.discountPercent;
            if (discountPercent == null || discountPercent === 0) {
              if (origPrice > finalPrice && origPrice > 0) {
                discountPercent = Math.round(((origPrice - finalPrice) / origPrice) * 100);
              } else {
                discountPercent = 0;
              }
            }

            const categoryArr = Array.isArray(item.category) ? item.category : (item.category ? [item.category] : []);
            let categoryLabel = categoryArr[0] || (item.material ? item.material : (isItemSaleProduct ? 'MOISSINATE JEWELS' : 'Jewellery'));
            if (categoryLabel === 'Bangles & Bracelets') categoryLabel = 'Bangles';
            const displayCategory = categoryLabel.toUpperCase().includes('JEWEL') || categoryLabel.toUpperCase().includes('SET')
              ? categoryLabel.toUpperCase()
              : `${categoryLabel.toUpperCase()} JEWELS`;

            const rentalPrice = item.rentalPrice || item.price || 0;
            const rentalPriceText = item.showPrice === false || rentalPrice > 1200 ? 'Price on Request' : `₹${rentalPrice.toFixed(2)}`;

            return (
              <div key={item._id} className="flex flex-col mb-5">
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden group">
                  {isItemSaleProduct && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: '#D32F2F',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: '600',
                        letterSpacing: '0.6px',
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        zIndex: 10,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                      }}
                    >
                      For Sale
                    </span>
                  )}
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

                <div className="mt-2.5 px-1 flex-1 flex flex-col">
                  {isItemSaleProduct ? (
                    <>
                      <p className="line-clamp-1" style={{ color: '#111', fontFamily: 'Gotham, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '0.7px', textTransform: 'uppercase', marginBottom: '2px' }}>
                        {displayCategory}
                      </p>
                      <Link to={`/shop/${item._id || item.code}`} className="block">
                        <h3 className="line-clamp-2" style={{ color: '#555', fontFamily: 'Gotham Book, sans-serif', fontSize: '11.5px', fontWeight: 400, lineHeight: '15px', marginBottom: '4px' }}>
                          {item.name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-1.5 flex-wrap" style={{ marginBottom: '4px' }}>
                        <span style={{ color: '#000', fontFamily: 'Gotham, sans-serif', fontSize: '13px', fontWeight: 500 }}>
                          Rs. {Math.round(finalPrice).toLocaleString('en-IN')}
                        </span>
                        {origPrice > finalPrice && (
                          <span style={{ color: '#888', fontFamily: 'Gotham Book, sans-serif', fontSize: '10.5px', textDecoration: 'line-through' }}>
                            Rs. {Math.round(origPrice).toLocaleString('en-IN')}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span style={{ color: '#EF4444', fontFamily: 'Gotham, sans-serif', fontSize: '10px', fontWeight: 600 }}>
                            ({discountPercent}% OFF)
                          </span>
                        )}
                      </div>
                      {/* Stock count */}
                      {(() => {
                        const stock = typeof item.stockCount === 'number' ? item.stockCount : null;
                        if (stock === null) return null;
                        if (stock === 0) return (
                          <p style={{ color: '#B91C1C', fontFamily: 'Gotham, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Out of Stock
                          </p>
                        );
                        if (stock <= 5) return (
                          <p style={{ color: '#D97706', fontFamily: 'Gotham, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Only {stock} left
                          </p>
                        );
                        return (
                          <p style={{ color: '#16A34A', fontFamily: 'Gotham, sans-serif', fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>
                            {stock} Available
                          </p>
                        );
                      })()}
                    </>
                  ) : (
                    <>
                      <p className="mb-1 line-clamp-1" style={{ color: '#000', fontFamily: "'Gotham Book', 'Gotham', sans-serif", fontSize: '10px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '0.7px', textTransform: 'uppercase' }}>
                        {displayCategory}
                      </p>
                      <Link to={`/shop/${item._id || item.code}`} className="block flex-1">
                        <h3 className="line-clamp-2 mb-1.5" style={{ color: '#000', fontFamily: "'Gotham Book', 'Gotham', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 200, lineHeight: '15px', letterSpacing: '0.7px', opacity: 0.6 }}>
                          {item.name}
                        </h3>
                      </Link>
                      <div className="mb-3" style={{ color: '#000', fontFamily: "'Gotham Light', 'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: '20px' }}>
                        {rentalPriceText}
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => handleMoveToBag(item)}
                  className="flex items-center justify-center uppercase hover:bg-[#AB6281] hover:text-white transition-colors mt-auto mx-auto w-full"
                  style={{ border: '1px solid #AB6281', height: '38px', color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '1.5px' }}
                >
                  MOVE TO BAG
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my wishlist at Apila Jewels!" />
    </div>
  );
};

export default Wishlist;
