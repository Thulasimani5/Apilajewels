import React, { useEffect, useState } from 'react';
import SearchOverlay from '../components/SearchOverlay';
import ShareBottomSheet from '../components/ShareBottomSheet';
import LazyImage from '../components/LazyImage';
import { ArrowLeft, Search, Heart, Share2, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DesktopCart from './DesktopCart';
import useIsDesktop from '../hooks/useIsDesktop';
import Navbar from '../components/Navbar';
import '../styles/ApilaJewels.css';

const Cart = () => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { cartItems, removeFromCart } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    setSelectedItems(cartItems.map(item => item._id));
  }, [cartItems]);

  if (isDesktop) {
    return <DesktopCart />;
  }

  const toggleSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item._id));
  const premiumSelected = selectedCartItems.filter(item => (item.rentalPrice || item.price || 0) >= 2000);
  const pricedSelected = selectedCartItems.filter(item => (item.rentalPrice || item.price || 0) < 2000);
  const pricedAmount = pricedSelected.reduce((total, item) => total + (item.rentalPrice || item.price || 0), 0);
  const allPremiumSelected = premiumSelected.length === selectedCartItems.length && selectedCartItems.length > 0;

  const handleBookOnWhatsapp = () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to book.");
      return;
    }

    let message = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    selectedCartItems.forEach((item, index) => {
      const price = item.rentalPrice || item.price || 0;
      const pText = price >= 2000 ? 'Price on Request' : `₹${price}`;
      message += `${index + 1}. *${item.name}* (Code: ${item.code || item.jewelId || 'N/A'}) – ${pText}\n`;
    });
    if (allPremiumSelected) {
      message += `\n*Total Amount: Price on Request*\n\nPlease let me know the availability.`;
    } else if (premiumSelected.length > 0) {
      message += `\n*Sub Total (${pricedSelected.length} ${pricedSelected.length === 1 ? 'Item' : 'Items'}): ₹${pricedAmount.toFixed(2)}*\n*Premium Jewels (${premiumSelected.length} ${premiumSelected.length === 1 ? 'Item' : 'Items'}): Price on Request*\n\nPlease let me know the availability.`;
    } else {
      message += `\n*Sub Total (${pricedSelected.length} ${pricedSelected.length === 1 ? 'Item' : 'Items'}): ₹${pricedAmount.toFixed(2)}*\n\nPlease let me know the availability.`;
    }

    const whatsappUrl = `https://wa.me/+917397721122?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-[#FFF8F3] min-h-[100dvh] flex flex-col pb-28">
      <Navbar />
      <div className="flex-1 mt-[64px] md:mt-[80px] px-4 pt-6 pb-6">
        <h2 className="text-[#111] mb-6" style={{ fontFamily: "'Belgant Aesthetic', Georgia, serif", fontSize: '20px', fontWeight: 'normal' }}>
          Your Order ({cartItems.length})
        </h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white p-3 flex gap-4 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] items-start">
                <button 
                  onClick={() => removeFromCart(item._id)}
                  className="absolute top-3 right-3 text-[#D9D9D9] hover:text-red-500 transition-colors z-10"
                >
                  <X size={14} strokeWidth={2} />
                </button>
                
                <div 
                  className="w-[90px] h-[100px] overflow-hidden bg-gray-100 flex-shrink-0 relative cursor-pointer group border border-[#EAEAEA]"
                  onClick={() => toggleSelection(item._id)}
                >
                  {item.images?.[0]?.type === 'video' ? (
                    <video src={item.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}
                  
                  {/* Selection Checkmark */}
                  <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-colors border ${selectedItems.includes(item._id) ? 'bg-white border-white' : 'bg-transparent border-white text-transparent'}`}>
                    {selectedItems.includes(item._id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#B07A85" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 pt-0.5 pb-1 flex flex-col justify-between" style={{ minHeight: '96px' }}>
                  <div className="pr-5">
                    <p className="text-[10px] text-[#666] mb-1 font-bold tracking-[0.08em] uppercase" style={{ fontFamily: "'Gotham', sans-serif" }}>
                      {item.type || 'Moissinate Jewels'}
                    </p>
                    <h3 className="text-[11px] text-[#888] leading-[1.3] pr-2 line-clamp-2" style={{ fontFamily: "'Gotham', sans-serif" }}>
                      {item.name}
                    </h3>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <p className="text-[9px] text-[#A0A0A0]" style={{ fontFamily: "'Gotham', sans-serif" }}>
                      Ref : {item.code || 'MP000'}
                    </p>
                    <div className="font-bold text-[11px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>
                      {(item.rentalPrice || item.price || 0) >= 2000 ? 'Price on Request' : `₹${(item.rentalPrice || item.price || 0).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Summary */}
        {cartItems.length > 0 && (
          <div className="mt-8 space-y-6">
            <div className="flex border border-[#EAEAEA] bg-white h-[44px]">
              <input 
                type="text" 
                placeholder="Enter Coupen Code" 
                className="flex-1 px-4 text-[11px] text-[#666] outline-none placeholder-[#A0A0A0] bg-transparent"
                style={{ fontFamily: "'Gotham', sans-serif" }}
              />
              <button 
                className="px-6 font-bold text-[11px] text-[#111] border-l border-[#EAEAEA] bg-transparent hover:bg-gray-50 transition-colors"
                style={{ fontFamily: "'Gotham', sans-serif" }}
              >
                Apply
              </button>
            </div>

            <div className="pt-6 border-t border-[#EAEAEA] space-y-4">
              <div className="flex justify-between items-center">
                <span className="uppercase text-[10px] font-bold text-[#666] tracking-wide" style={{ fontFamily: "'Gotham', sans-serif" }}>Sub Total ( {pricedSelected.length} Items )</span>
                <span className="font-bold text-[11px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>₹{pricedAmount.toFixed(2)}</span>
              </div>
              
              {premiumSelected.length > 0 && (
                <div className="flex justify-between items-center">
                  <span className="uppercase text-[10px] font-bold text-[#666] tracking-wide" style={{ fontFamily: "'Gotham', sans-serif" }}>Premium Jewels ( {premiumSelected.length} Items )</span>
                  <span className="font-bold text-[11px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>Price on Request</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="uppercase text-[10px] font-bold text-[#666] tracking-wide" style={{ fontFamily: "'Gotham', sans-serif" }}>Shipping</span>
                <span className="font-bold text-[11px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>Free</span>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-[#EAEAEA]">
                <span className="uppercase text-[10px] font-bold text-[#666] tracking-wide" style={{ fontFamily: "'Gotham', sans-serif" }}>Discount</span>
                <span className="font-bold text-[11px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>₹0</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="uppercase text-[12px] font-bold text-[#111] tracking-wide" style={{ fontFamily: "'Gotham', sans-serif" }}>Total</span>
                <span className="font-bold text-[12px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>₹{pricedAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 bg-white border border-[#EAEAEA] py-3.5 mt-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              <span className="text-[10px] font-bold text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>Estimated Delivery: 3 - 4 days</span>
            </div>

            <p className="text-center text-[10px] text-[#A0A0A0] mt-6 leading-relaxed" style={{ fontFamily: "'Gotham', sans-serif" }}>
              Need Live Video or Help? Get Instant Assistance<br />
              From Our Jewellery Expert
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-between items-center z-40 border-t border-[#EAEAEA]">
          <div className="flex flex-col">
            <span className="font-bold text-[13px] text-[#111]" style={{ fontFamily: "'Gotham', sans-serif" }}>₹{pricedAmount.toFixed(2)}</span>
            <span className="text-[9px] text-[#888] underline mt-0.5 cursor-pointer" style={{ fontFamily: "'Gotham', sans-serif" }}>View Price Details</span>
          </div>
          <button 
            onClick={handleBookOnWhatsapp}
            className={`px-8 py-3.5 font-bold tracking-[0.1em] text-[9px] uppercase transition-colors ${selectedItems.length > 0 ? 'bg-[#B07A85] text-white hover:bg-[#9E6A75]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
            style={{ fontFamily: "'Gotham', sans-serif" }}
          >
            BOOK ON WHATSAPP
          </button>
        </div>
      )}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my cart at Apila Jewels!" />
    </div>
  );
};

export default Cart;
