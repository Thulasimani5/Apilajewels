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
import Footer from '../components/Footer';
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
        <span style={{ fontFamily: "Gotham Book, sans-serif", fontSize: "14px", color: "#000", letterSpacing: "-0.14px" }}>{title}</span>
        <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4" style={{ fontFamily: "Gotham Book, sans-serif", fontSize: "13px", lineHeight: "20px", letterSpacing: "-0.13px", color: "#000" }}>
          {children}
        </div>
      )}
    </div>
  );
};

const renderMobileDescription = (text) => {
  if (!text) return <p style={{ fontFamily: "Gotham Book, sans-serif", fontSize: "13px", lineHeight: "20px", letterSpacing: "-0.13px", color: "#000", marginBottom: "12px" }}>No description available.</p>;
  const LABELS = ['Set Includes:', 'Styling Tip:'];
  const regex = new RegExp(`(${LABELS.map(l => l.replace(':', '\\:')).join('|')})`);
  const segments = text.split(regex);
  const lines = [];
  if (segments[0] && segments[0].trim()) lines.push({ label: null, content: segments[0].trim() });
  for (let i = 1; i < segments.length; i += 2) {
    lines.push({ label: segments[i], content: (segments[i + 1] || '').trim() });
  }
  return lines.map((item, idx) => (
    <p key={idx} style={{ fontFamily: "Gotham Book, sans-serif", fontSize: "13px", lineHeight: "15px", letterSpacing: "-0.13px", color: "#000", marginBottom: "12px" }}>
      {item.label && <strong style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "13px", fontStyle: "normal", fontWeight: 500, lineHeight: "24px", letterSpacing: "-0.16px" }}>{item.label}</strong>}
      {item.content ? (item.label ? ` ${item.content}` : item.content) : ''}
    </p>
  ));
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

  // Fetch related products — same category first, then general fallback
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=100`);
        const data = await res.json();
        if (!data.success) return;

        const allItems = data.data;

        // Helper: get category(s) of a product as lowercase array
        const getCats = (p) => {
          const c = p.category;
          return Array.isArray(c) ? c.map(x => x?.toLowerCase()) : [c?.toLowerCase()].filter(Boolean);
        };

        const currentCats = getCats(product);

        // 1. Same category (e.g. "AD Jewels", "Kundan", etc.)
        let related = allItems.filter(item =>
          item._id !== product._id &&
          getCats(item).some(c => currentCats.includes(c))
        );

        // 2. If we don't have enough to fill 10 slots, pad with other products
        if (related.length < 10) {
          const others = allItems.filter(item =>
            item._id !== product._id &&
            !getCats(item).some(c => currentCats.includes(c))
          );
          related = [...related, ...others];
        }

        setRelatedProducts(related.slice(0, 10));
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
    const priceText = product.showPrice === false || price > 1500 ? 'Price on Request' : `₹${price}`;
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
            {product.showPrice === false || (product.rentalPrice || product.price || 0) > 1500
              ? 'Price on Request'
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
            className="flex-1 py-3 border-2 border-transparent bg-[#B07A85] text-white font-semibold rounded-lg text-sm hover:bg-[#9E6A75] transition-colors shadow-[0_4px_14px_rgba(176,122,133,0.3)]"
          >
            Book On Whatsapp
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="bg-white min-h-screen  overflow-x-hidden">
      {/* Shared Navbar (includes hamburger menu + drawer, same as home page) */}
      <Navbar />

      {/* ===== MOBILE VIEW ===== */}
      <div className="md:hidden pt-12">
        {/* Image Gallery (AJIO Style Horizontal Scroll) */}
        <div className="relative select-none">
          <div
            onScroll={handleScroll}
            className="w-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth gap-1 pr-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {mediaList.length > 0 ? (
              mediaList.map((item, idx) =>
                renderMediaItem(item, idx, "w-[335px] h-[418px] aspect-[109/136] flex-shrink-0 snap-center bg-gray-50 flex items-center justify-center cursor-pointer")
              )
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                No Media Available
              </div>
            )}
          </div>


        </div>

        {/* Details Container */}
        <div className="bg-white relative px-2 pt-4 ">
          <div className="flex justify-between items-start" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <span style={{ color: "#000", fontFamily: "var(--f-gotham-b), 'Gotham Book', sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}>
              {product.category || 'victorian-moissinate'}
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => toggleWishlist(product)}
                className="transition-colors"
              >
                <Heart
                  size={20}
                  className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-black"}
                  strokeWidth={isInWishlist(product._id) ? 2 : 1.5}
                />
              </button>
              <button
                onClick={handleShare}
                className="text-gray-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M10.7698 4.13965L7.00977 6.21965" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.5 17.5C15.7091 17.5 17.5 15.7091 17.5 13.5C17.5 11.2909 15.7091 9.5 13.5 9.5C11.2909 9.5 9.5 11.2909 9.5 13.5C9.5 15.7091 11.2909 17.5 13.5 17.5Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13 5.5C14.3807 5.5 15.5 4.38071 15.5 3C15.5 1.61929 14.3807 0.5 13 0.5C11.6193 0.5 10.5 1.61929 10.5 3C10.5 4.38071 11.6193 5.5 13 5.5Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 11.5C5.933 11.5 7.5 9.933 7.5 8C7.5 6.067 5.933 4.5 4 4.5C2.067 4.5 0.5 6.067 0.5 8C0.5 9.933 2.067 11.5 4 11.5Z" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.0102 11.5604L6.9502 9.86035" stroke="black" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <h1 className="mb-3 pr-8" style={{ width: "276px", color: "#000", fontFamily: "'Bacasime Antique', serif", fontSize: "25px", fontStyle: "normal", fontWeight: 400, lineHeight: "28px", letterSpacing: "-0.84px" }}>
            {product.name}
          </h1>

          <div className="mb-5" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "14px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>
            {product.showPrice === false || (product.rentalPrice || product.price || 0) > 1500
              ? 'Price on Request'
              : `₹${(product.rentalPrice || product.price || 0).toFixed(2)}`}
          </div>

          <div className="space-y-2 mb-2">
            <button
              onClick={handleAddToCart}
              className="w-full py-3.5"
              style={{ border: "1px solid #AB6281", color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "12px", fontWeight: 500, lineHeight: "normal", letterSpacing: "1.96px", textTransform: "uppercase" }}
            >
              ADD TO BAG
            </button>
            <button
              onClick={handleBookOnWhatsapp}
              className="w-full py-3.5"
              style={{ border: "1px solid #AB6281", background: "#AB6281", color: "#FFF", fontFamily: "Gotham Book, sans-serif", fontSize: "12px", fontWeight: 500, lineHeight: "normal", letterSpacing: "1.96px", textTransform: "uppercase" }}
            >
              BOOK ON WHATSAPP
            </button>
          </div>

          {/* Features list */}
          <div className="flex justify-between items-center py-4 border-b border-gray-100 mb-6 px-2">
            <div className="flex flex-col items-center gap-3 w-1/3 border-r border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18 " viewBox="0 0 21 21" fill="none"><path d="M19.4521 6.81113C19.4521 12.9409 15.5621 18.1557 10.1068 20.1685C4.64005 18.1557 0.75 12.9409 0.75 6.81113C0.75 5.14146 1.03773 3.52897 1.56714 2.04228C2.48786 2.32818 3.47764 2.47685 4.49043 2.47685C6.57356 2.47685 8.50707 1.84786 10.1068 0.75C11.7066 1.83643 13.6401 2.47685 15.7232 2.47685C16.736 2.47685 17.7143 2.32818 18.6465 2.04228C19.1874 3.52897 19.4637 5.14146 19.4637 6.81113H19.4521Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.13135 10.4482L8.90374 12.2208L13.3232 7.84082" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ color: "#000", textAlign: "center", fontFamily: "Gotham Book, sans-serif", fontSize: "11px", fontWeight: 400, lineHeight: "14px", letterSpacing: "-0.14px" }}>Secure<br />Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-1/3 border-r border-gray-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 22 21" fill="none"><path d="M5.41584 14.062L1.86701 12.9434L0.750244 16.5106" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.2483 6.07025L19.7971 7.20134L20.9263 3.64648" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M20.1444 10.0723C20.1444 15.2181 15.9752 19.3944 10.838 19.3944C6.87974 19.3944 3.49222 16.9209 2.1521 13.4282" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M1.53149 10.0722C1.53149 4.92633 5.68834 0.75 10.8379 0.75C14.7962 0.75 18.1837 3.22348 19.5238 6.71618" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ color: "#000", textAlign: "center", fontFamily: "Gotham Book, sans-serif", fontSize: "11px", fontWeight: 400, lineHeight: "14px", letterSpacing: "-0.14px" }}>Easy Return /<br />Pickup</span>
            </div>
            <div className="flex flex-col items-center gap-3 w-1/3">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 19 20" fill="none"><path d="M6.39493 17.1647C7.27456 17.4706 8.21538 17.6389 9.19445 17.6389C13.8603 17.6389 17.6389 13.8603 17.6389 9.19445C17.6389 4.52858 13.8603 0.75 9.19445 0.75C4.52858 0.75 0.75 4.52858 0.75 9.19445C0.75 11.1526 1.41546 12.9577 2.53221 14.3881" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6.3949 17.1643L2.11914 18.3346L2.53218 14.3877" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M11.7492 10.9002L12.8812 12.0322C11.7492 13.1643 9.92109 13.1643 8.7967 12.0322L6.34903 9.58454C5.21699 8.4525 5.21699 6.6244 6.34903 5.5L7.58816 6.73913" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span style={{ color: "#000", textAlign: "center", fontFamily: "Gotham Book, sans-serif", fontSize: "11px", fontWeight: 400, lineHeight: "14px", letterSpacing: "-0.14px" }}>Whatsapp<br />Support</span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 style={{ fontFamily: "Gotham Book, sans-serif", fontSize: "14px", color: "#000", letterSpacing: "-0.14px", marginBottom: "12px" }}>Description</h3>
            {renderMobileDescription(product.description)}
          </div>

          {/* Accordions */}
          <div className="border-b border-gray-200/80 mb-8">
            <MobileAccordion title="Specifications">
              <p><span style={{ fontFamily: "Gotham Medium, sans-serif", fontWeight: 500 }}>Material : </span>{product.material || 'Premium Alloy'}</p>
              <p className="mt-1"><span style={{ fontFamily: "Gotham Medium, sans-serif", fontWeight: 500 }}>Size : </span>{product.size || 'Adjustable'}</p>
              <p className="mt-1"><span style={{ fontFamily: "Gotham Medium, sans-serif", fontWeight: 500 }}>Finish : </span>{product.finish || 'Antique'}</p>
            </MobileAccordion>
            <MobileAccordion title="Delivery & Return Policy">
              <p>Standard delivery within 3–5 business days. Easy returns within 7 days of receipt.</p>
            </MobileAccordion>
            <MobileAccordion title="Care Instructions">
              <p>Store in a dry place. Avoid contact with water, perfume, and harsh chemicals. Clean gently with a soft cloth.</p>
            </MobileAccordion>
          </div>

          {/* Related Jewels Section */}
          <div className="pt-1 pb-6">
            <h2 className="text-center mb-4" style={{ color: "#000", fontFamily: "'Bacasime Antique', serif", fontSize: "24px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "-0.52px", textTransform: "capitalize" }}>You may Also Like</h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              {relatedProducts.map(prod => (
                <Card key={prod._id} jewellery={prod} variant="shop" imageAspect="195 / 244" imageClassName="" />
              ))}
            </div>

            {/* Explore More Button */}
            <div className="mt-8 flex justify-center">
              <Link
                to="/shop?explore=true"
                className="flex items-center justify-center border border-[#ab6281] text-[#ab6281] hover:bg-[#ab6281] hover:text-white transition-all"
                style={{
                  fontFamily: "'Gotham', sans-serif",
                  fontSize: '13px',
                  letterSpacing: '-0.13px',
                  width: '183px',
                  height: '48px',
                }}
              >
                Explore More&nbsp;&nbsp;›
              </Link>
            </div>
          </div>

          {/* Mobile Footer */}
          <Footer />
        </div>
      </div>

      {/* ===== DESKTOP VIEW (two-column Myntra-style layout with same content) ===== */}
      <div className="hidden md:block pt-6 px-4">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4">
          {(() => {
            const catRaw = product?.category;
            const catStr = Array.isArray(catRaw) ? (catRaw[0] || '') : (catRaw || '');
            const catSlug = catStr.toLowerCase().replace(/\s+/g, '-');
            return (
              <>
                <Link to="/" className="hover:text-gray-800">Home</Link>
                {' / '}
                <Link to={catStr ? `/shop?category=${encodeURIComponent(catSlug)}` : '/shop'} className="hover:text-gray-800">{catStr || 'Jewellery'}</Link>
                {' / '}
                <span className="font-semibold text-gray-800">{product.name}</span>
              </>
            );
          })()}
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
