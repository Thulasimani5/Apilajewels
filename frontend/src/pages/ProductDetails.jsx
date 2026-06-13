import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Heart, ShoppingCart, Share2, ChevronDown } from 'lucide-react';
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

const ProductDetails = () => {
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
    if (!user) {
      navigate('/login', { state: { from: `/shop/${id}` } });
      return;
    }
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
              if (!user) {
                navigate('/login', { state: { from: window.location.pathname } });
              } else {
                toggleWishlist(product);
              }
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

        <div className="text-[13px]">
          <p><span className="font-bold text-black">Material : </span>{product.material || 'Premium Alloy'}</p>
          <p className="mt-1"><span className="font-bold text-black">Size : </span>{product.size || 'Adjustable'}</p>
          <p className="mt-1"><span className="font-bold text-black">Finish : </span>{product.finish || 'Antique'}</p>
        </div>

        <div className="pt-2">
          <h3 className="font-bold text-black mb-1 text-xs">Delivery and Return Policy:</h3>
          <p className="text-[13px] leading-relaxed mb-1">There are many variations of passages of Lorem Ipsum available, but the majority have suffered.</p>
          <a href="#" className="font-bold text-black text-[13px] underline">View Policy - Here</a>
        </div>
      </div>

      {/* Accordions */}
      <div className="border border-gray-200 rounded-lg bg-white mb-2">
        <button className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-800">
          Care Instructions
          <ChevronDown size={18} />
        </button>
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
    <div className="bg-[#FFF8F3] min-h-screen pb-24 overflow-x-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white z-40 px-4 py-[11px] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/shop')} className="text-black">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-lg truncate max-w-[200px]">{product.name}</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <button onClick={() => setIsSearchOpen(true)} className="text-gray-700"><Search size={22} /></button>
          <Link to="/wishlist"><Heart size={22} /></Link>
          <Link to="/cart"><ShoppingCart size={22} /></Link>
        </div>
      </div>

      {/* ===== MOBILE VIEW (unchanged original) ===== */}
      <div className="md:hidden pt-16">
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
        <div className="bg-[#FFF8F3] relative pt-4 px-4">
          <ProductInfo />

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
      </div>

      {/* ===== DESKTOP VIEW (two-column Myntra-style layout with same content) ===== */}
      <div className="hidden md:block pt-6 px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-gray-800">Home</Link> / <Link to="/shop" className="hover:text-gray-800">Jewellery</Link> / <span className="font-semibold text-gray-800">{product.name}</span>
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
