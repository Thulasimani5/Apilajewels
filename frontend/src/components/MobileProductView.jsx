import React, { useState } from 'react';
import { Heart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from './Card';
import Navbar from './Navbar';
import Footer from './Footer';
import LazyImage from './LazyImage';
import ShareBottomSheet from './ShareBottomSheet';
import SearchOverlay from './SearchOverlay';
import FullScreenMediaViewer from './FullScreenMediaViewer';
import API_BASE_URL from '../config/api';
import axios from 'axios';

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

export default function MobileProductView({
  product,
  relatedProducts,
  user,
  addToCart,
  toggleWishlist,
  isInWishlist,
  navigate
}) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [clickedMediaIndex, setClickedMediaIndex] = useState(0);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const mediaList = React.useMemo(() => {
    if (!product) return [];
    if (product.media && product.media.length > 0) return product.media;
    if (product.images && product.images.length > 0) return product.images;
    return [];
  }, [product]);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = e.target.clientWidth * 0.90 + 4;
    const index = Math.round(scrollLeft / itemWidth);
    setActiveMediaIndex(index);
  };

  const handleBookOnWhatsapp = async () => {
    if (!product) return;
    try {
      if (product._id) {
        await axios.post(`${API_BASE_URL}/api/bookings`, {
          jewelleryIds: [product._id],
          totalAmount: product.rentalPrice || product.price || 0,
          bookingDate: new Date(),
          customerDetails: {
            name: user?.name || 'Guest Visitor',
            phone: user?.phone || user?.mobile || 'WhatsApp Inquiry'
          }
        });
      }
    } catch (e) {
      console.error('Error recording product booking:', e);
    }

    const price = product.rentalPrice || product.price || 0;
    const priceText = product.showPrice === false || price > 1500 ? 'Price on Request' : `₹${price}`;
    const message = `Hi Apila Jewels, I would like to book:\n\n*${product.name}*\nPrice: ${priceText}\n\nPlease let me know the availability.`;
    const whatsappUrl = `https://wa.me/+917397721122?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      navigate('/cart');
    }
  };

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

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      <Navbar />

      <div className="md:hidden pt-12">
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

        <div className="bg-white relative px-2 pt-4 ">
          <div className="flex justify-between items-start" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <span style={{ color: "#000", fontFamily: "var(--f-gotham-b), 'Gotham Book', sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}>
              { (Array.isArray(product.type) ? product.type : (product.type ? [product.type] : [])).includes('Accessories') && product.accessoryType ? product.accessoryType : (product.category === 'Bangles & Bracelets' ? 'Bangles' : (product.category || 'victorian-moissinate')) }
            </span>
            <div className="flex gap-4">
              <button onClick={() => toggleWishlist(product)} className="transition-colors">
                <Heart
                  size={20}
                  className={isInWishlist(product._id) ? "fill-red-500 text-red-500" : "text-black"}
                  strokeWidth={isInWishlist(product._id) ? 2 : 1.5}
                />
              </button>
              <button onClick={() => setIsShareOpen(true)} className="text-gray-500 transition-colors">
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

          <h1 className="mb-3 pr-8" style={{ color: "#000", fontFamily: "'Bacasime Antique', serif", fontSize: "25px", fontStyle: "normal", fontWeight: 400, lineHeight: "28px", letterSpacing: "-0.84px" }}>
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

          <div className="mb-6">
            <h3 style={{ fontFamily: "Gotham Book, sans-serif", fontSize: "14px", color: "#000", letterSpacing: "-0.14px", marginBottom: "12px" }}>Description</h3>
            {renderMobileDescription(product.description)}
          </div>

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

          <div className="pt-1 pb-6">
            <h2 className="text-center mb-4" style={{ color: "#000", fontFamily: "'Bacasime Antique', serif", fontSize: "24px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "-0.52px", textTransform: "capitalize" }}>You may Also Like</h2>
            <div className="grid grid-cols-2 gap-x-2 gap-y-4">
              {relatedProducts.map(prod => (
                <Card key={prod._id} jewellery={prod} variant="shop" imageAspect="195 / 244" imageClassName="" />
              ))}
            </div>

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

          <Footer />
        </div>
      </div>

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
}
