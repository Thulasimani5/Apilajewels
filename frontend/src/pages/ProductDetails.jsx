import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Share2, ChevronDown } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import ShareBottomSheet from '../components/ShareBottomSheet';
import SearchOverlay from '../components/SearchOverlay';
import FullScreenMediaViewer from '../components/FullScreenMediaViewer';
import API_BASE_URL from '../config/api';
import LazyImage from '../components/LazyImage';
import { useProduct } from '../hooks/useProduct';
import Navbar from '../components/Navbar';
import DesktopProduct from './DesktopProduct';
import useIsDesktop from '../hooks/useIsDesktop';

/* ── Accordion ── */
const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-200/80">
      <button 
        className="w-full flex justify-between items-center py-4 text-left font-semibold text-gray-900 focus:outline-none" 
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-bold text-black">{title}</span>
        <ChevronDown size={18} className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 text-xs md:text-sm text-gray-600 leading-relaxed space-y-2">
          {children}
        </div>
      )}
    </div>
  );
};
const MobileAccordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-gray-100">
      <button 
        className="w-full flex justify-between items-center py-4 text-left focus:outline-none" 
        onClick={() => setOpen(!open)}
      >
        <span className="text-[11px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>{title}</span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4 text-[11px] text-[#666] leading-[1.6]" style={{ fontFamily: "'Gotham', sans-serif" }}>
          {children}
        </div>
      )}
    </div>
  );
};

const ProductDetails = () => {
  const isDesktop = useIsDesktop();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  
  const { data: product, isLoading: loading, error: queryError } = useProduct(id);
  const error = queryError?.message;
  
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [clickedMediaIndex, setClickedMediaIndex] = useState(0);

  const [relatedProducts, setRelatedProducts] = useState([]);

  // Scroll to top and reset media index on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveMediaIndex(0);
  }, [id]);

  // Fetch related products (same category first, fallback to general)
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        // Try same-category items first
        const catRes = await fetch(
          `${API_BASE_URL}/api/jewellery?limit=20`
        );
        const catData = await catRes.json();
        if (catData.success) {
          const sameCategory = catData.data.filter(
            item => item._id !== product._id && item.category === product.category
          );
          if (sameCategory.length >= 4) {
            setRelatedProducts(sameCategory.slice(0, 10));
            return;
          }
          // Fallback: use any other items excluding current
          const others = catData.data.filter(item => item._id !== product._id);
          setRelatedProducts(others.slice(0, 10));
        }
      } catch (err) {
        console.error('Failed to fetch related products:', err);
      }
    };
    fetchRelated();
  }, [product]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = e.target.clientWidth * 0.90 + 4; // 90% width + 4px gap
    const index = Math.round(scrollLeft / itemWidth);
    setActiveMediaIndex(index);
  };

  const mediaList = React.useMemo(() => {
    if (!product) return [];
    if (product.media && product.media.length > 0) return product.media;
    if (product.images && product.images.length > 0) return product.images;
    return [];
  }, [product]);

  const handleBookOnWhatsapp = () => {
    if (!product) return;
    const price = product.rentalPrice || product.price || 0;
    const priceText = price >= 2000 ? 'Price on Request' : `₹${price}`;
    const message = `Hi Apila Jewels, I would like to book:\n\n*${product.name}*\nPrice: ${priceText}\n\nPlease let me know the availability.`;
    const whatsappUrl = `https://wa.me/+917397721122?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    // if (!user) {
    //   navigate('/login', { state: { from: `/shop/${id}` } });
    //   return;
    // }
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

  const handleShare = async () => {
    setIsShareOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-[#FFF8F3] min-h-screen pb-24 flex flex-col justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#B07A85] border-t-transparent rounded-full animate-spin mb-4 mt-20"></div>
        <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase">Loading Details...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-[#FFF8F3] min-h-screen pb-24 flex flex-col items-center pt-20">
        <div className="text-red-500 font-semibold text-xs uppercase tracking-wider mb-4">
          {error || 'Product not found'}
        </div>
        <button onClick={() => navigate(-1)} className="px-6 py-2 bg-[#B07A85] text-white rounded-lg text-sm font-medium">Go Back</button>
      </div>
    );
  }


  if (isDesktop) {
    return <DesktopProduct product={product} relatedProducts={relatedProducts} />;
  }

  // Shared media rendering helper
  const renderMediaItem = (item, idx, className) => {
    const url = item.url || item;
    const isVideo = item.type === 'video' || (typeof url === 'string' && (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')));
    return (
      <div 
        key={idx} 
        className={className}
        onClick={() => {
          setClickedMediaIndex(idx);
          setIsMediaViewerOpen(true);
        }}
      >
        {isVideo ? (
          <video src={url} className="w-full h-full object-cover pointer-events-none" autoPlay muted loop playsInline />
        ) : (
              <LazyImage src={url} alt={`${product.name} - ${idx}`} className="w-full h-full object-cover pointer-events-none" />
        )}
      </div>
    );
  };

  // Shared product details content (used on both mobile & desktop)
  const ProductInfo = () => (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-bold text-lg text-gray-900 leading-tight">
            {product.name}
          </h1>
          <p className="text-xl font-semibold mt-2">
            {(product.rentalPrice || product.price || 0) >= 2000 
              ? 'Premium Collection' 
              : `₹${(product.rentalPrice || product.price || 0).toFixed(2)}`}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              // if (!user) {
              //   navigate('/login', { state: { from: window.location.pathname } });
              // } else {
                toggleWishlist(product);
              // }
            }}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm transition-colors"
          >
            <Heart 
              size={20} 
              className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-gray-500"} 
            />
          </button>
          <button 
            onClick={handleShare}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-white shadow-sm transition-colors hover:bg-gray-50"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-4 text-sm text-gray-600 mb-6 mt-6">
        <div>
          <h3 className="font-bold text-black mb-1 text-xs">Description</h3>
          <p className="text-[13px] leading-relaxed">{product.description || 'No description available.'}</p>
        </div>
      </div>

      {/* Accordions */}
      <div className="border-b border-gray-200/80 mb-6">
        <Accordion title="Specifications">
          <p><span className="font-bold text-black">Material : </span>{product.material || 'Premium Alloy'}</p>
          <p className="mt-1"><span className="font-bold text-black">Size : </span>{product.size || 'Adjustable'}</p>
          <p className="mt-1"><span className="font-bold text-black">Finish : </span>{product.finish || 'Antique'}</p>
        </Accordion>
        <Accordion title="Delivery & Return Policy">
          <p>Standard delivery within 3–5 business days. Easy returns within 7 days of receipt.</p>
        </Accordion>
        <Accordion title="Care Instructions">
          <p>Store in a dry place. Avoid contact with water, perfume, and harsh chemicals. Clean gently with a soft cloth.</p>
        </Accordion>
      </div>

      {/* Sticky Action Buttons (Mobile only) */}
      <div className="sticky md:static bottom-0 left-0 right-0 bg-[#FFF8F3] pt-4 pb-6 z-30">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3 border-2 border-[#B07A85] text-[#B07A85] font-semibold rounded-lg text-sm bg-transparent hover:bg-[#B07A85] hover:text-white transition-colors"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBookOnWhatsapp}
            className="flex-1 py-3 bg-[#B07A85] text-white font-semibold rounded-lg text-sm hover:bg-[#9E6A75] transition-colors shadow-[0_4px_14px_rgba(176,122,133,0.3)]"
          >
            Book On Whatsapp
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white min-h-screen pb-24 overflow-x-hidden">
      {/* Shared Navbar (includes hamburger menu + drawer, same as home page) */}
      <Navbar />

      {/* ===== MOBILE VIEW ===== */}
      <div className="md:hidden pt-16">
        {/* Back button row */}
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
          <button onClick={() => navigate(-1)} className="text-black">
            <ArrowLeft size={22} />
          </button>
          <span className="font-semibold text-sm truncate text-gray-800">{product.name}</span>
        </div>
        {/* Image Gallery (AJIO Style Horizontal Scroll) */}
        <div className="relative select-none">
          <div 
            onScroll={handleScroll}
            className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-1 pr-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mediaList.length > 0 ? (
              mediaList.map((item, idx) => 
                renderMediaItem(item, idx, "w-[90vw] sm:w-[90%] aspect-[4/5] flex-shrink-0 snap-start bg-gray-50 flex items-center justify-center cursor-pointer")
              )
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                No Media Available
              </div>
            )}
          </div>


        </div>

        {/* Details Container */}
        <div className="bg-white relative px-4 pt-4 pb-6">
          <div className="flex justify-between items-start mb-1">
            <span className="uppercase text-[10px] font-bold tracking-[0.1em] text-[#666]" style={{ fontFamily: "'Gotham', sans-serif" }}>
              {product.type || 'Moissinate Jewels'}
            </span>
            <div className="flex gap-4">
              <button 
                onClick={() => toggleWishlist(product)}
                className="text-gray-500 transition-colors"
              >
                <Heart size={16} className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-[#111]"} />
              </button>
              <button 
                onClick={handleShare}
                className="text-gray-500 transition-colors"
              >
                <Share2 size={16} className="text-[#111]" />
              </button>
            </div>
          </div>

          <h1 className="text-[#111] text-lg leading-[1.3] mb-3 pr-8" style={{ fontFamily: "'Belgant Aesthetic', Georgia, serif", fontSize: '20px' }}>
            {product.name}
          </h1>
          
          <div className="font-bold text-[14px] text-[#111] mb-6" style={{ fontFamily: "'Gotham', sans-serif" }}>
            {(product.rentalPrice || product.price || 0) >= 2000 
              ? 'Price on Request' 
              : `₹${(product.rentalPrice || product.price || 0).toFixed(2)}`}
          </div>

          <div className="space-y-2 mb-6">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5 border border-[#111] text-[#111] font-bold tracking-[0.1em] text-[10px] uppercase transition-colors"
              style={{ fontFamily: "'Gotham', sans-serif" }}
            >
              ADD TO BAG
            </button>
            <button
              onClick={handleBookOnWhatsapp}
              className="w-full py-3.5 bg-[#B07A85] text-white font-bold tracking-[0.1em] text-[10px] uppercase transition-colors shadow-[0_4px_14px_rgba(176,122,133,0.2)]"
              style={{ fontFamily: "'Gotham', sans-serif" }}
            >
              BOOK ON WHATSAPP
            </button>
          </div>

          {/* Features list */}
          <div className="flex justify-between items-center py-4 border-t border-b border-gray-100 mb-6 px-2">
            <div className="flex flex-col items-center gap-2 w-1/3 border-r border-gray-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
              <span className="text-[9px] text-center text-[#666] leading-tight" style={{ fontFamily: "'Gotham', sans-serif" }}>Secure<br/>Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-1/3 border-r border-gray-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>
              <span className="text-[9px] text-center text-[#666] leading-tight" style={{ fontFamily: "'Gotham', sans-serif" }}>Easy Return /<br/>Pickup</span>
            </div>
            <div className="flex flex-col items-center gap-2 w-1/3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
              <span className="text-[9px] text-center text-[#666] leading-tight" style={{ fontFamily: "'Gotham', sans-serif" }}>Whatsapp<br/>Support</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-[#111] mb-2 text-[11px]" style={{ fontFamily: "'Gotham', sans-serif" }}>Description</h3>
            <p className="text-[11px] leading-[1.6] text-[#666]" style={{ fontFamily: "'Gotham', sans-serif" }}>
              {product.description || 'No description available.'}
            </p>
          </div>

          {/* Accordions */}
          <div className="border-b border-gray-200/80 mb-8">
            <MobileAccordion title="Specifications">
              <p><span className="font-bold text-black">Material : </span>{product.material || 'Premium Alloy'}</p>
              <p className="mt-1"><span className="font-bold text-black">Size : </span>{product.size || 'Adjustable'}</p>
              <p className="mt-1"><span className="font-bold text-black">Finish : </span>{product.finish || 'Antique'}</p>
            </MobileAccordion>
            <MobileAccordion title="Delivery & Return Policy">
              <p>Standard delivery within 3–5 business days. Easy returns within 7 days of receipt.</p>
            </MobileAccordion>
            <MobileAccordion title="Care Instructions">
              <p>Store in a dry place. Avoid contact with water, perfume, and harsh chemicals. Clean gently with a soft cloth.</p>
            </MobileAccordion>
          </div>

          {/* Related Jewels Section */}
          <div className="pt-2 pb-10">
            <h2 className="text-[20px] text-center mb-6 text-[#111]" style={{ fontFamily: "'Belgant Aesthetic', Georgia, serif", fontWeight: 'normal' }}>You May Also Like</h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-6">
              {relatedProducts.map(prod => (
                <Card key={prod._id} jewellery={prod} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ===== DESKTOP VIEW (two-column Myntra-style layout with same content) ===== */}
      <div className="hidden md:block pt-6 px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-gray-800">Home</Link> / <Link to={product?.category ? `/shop?category=${encodeURIComponent(product.category.toLowerCase().replace(/\s+/g, '-'))}` : '/shop'} className="hover:text-gray-800">{product?.category || 'Jewellery'}</Link> / <span className="font-semibold text-gray-800">{product.name}</span>
        </div>

        <div className="flex gap-6 lg:gap-10">
          {/* LEFT: Image Grid */}
          <div className="w-[55%] lg:w-[58%] min-w-0">
            <div className="grid grid-cols-2 gap-4">
              {mediaList.map((item, idx) => {
                const url = item.url || item;
                const isVideo = item.type === 'video' || (typeof url === 'string' && (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')));
                return (
                  <div 
                    key={idx} 
                    className="w-full cursor-pointer overflow-hidden relative group"
                    onClick={() => {
                      setClickedMediaIndex(idx);
                      setIsMediaViewerOpen(true);
                    }}
                  >
                    {isVideo ? (
                      <video src={url} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" autoPlay muted loop playsInline />
                    ) : (
                      <LazyImage src={url} alt={`${product.name} - ${idx}`} className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT: Product Details (same content as mobile) */}
          <div className="w-[45%] lg:w-[42%] min-w-0 sticky top-24 self-start">
            <ProductInfo />
          </div>
        </div>

        {/* Related Jewels Section */}
        <div className="pt-8 pb-10 mt-2 border-t border-gray-200/60 relative z-20">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Related Jewels</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[10px]">
            {relatedProducts.map(prod => (
              <Card key={prod._id} jewellery={prod} />
            ))}
          </div>
        </div>
      </div>

      {/* Share Bottom Sheet Modal */}
      <ShareBottomSheet
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        product={product}
      />
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    
    <FullScreenMediaViewer 
      mediaList={mediaList} 
      initialIndex={clickedMediaIndex} 
      isOpen={isMediaViewerOpen} 
      onClose={() => setIsMediaViewerOpen(false)} 
      productName={product?.name} 
    />
    </div>
  );
};

export default ProductDetails;
