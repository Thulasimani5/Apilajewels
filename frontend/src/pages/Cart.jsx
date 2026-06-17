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
    <div className="bg-[#FFF8F3] min-h-screen pb-28">
      {/* Custom Header */}
      <div className="sticky top-0 bg-[#FFF8F3] z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-black">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-lg">My Cart</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <button onClick={() => setIsSearchOpen(true)}><Search size={22} /></button>
          <button onClick={() => navigate('/wishlist')}><Heart size={22} /></button>
          <button onClick={() => setIsShareOpen(true)}><Share2 size={22} /></button>
        </div>
      </div>

      <div className="px-4 py-6 space-y-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Your cart is empty
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl p-3 flex gap-3 relative shadow-sm items-center">
              <button 
                onClick={() => removeFromCart(item._id)}
                className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div 
                className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative cursor-pointer group"
                onClick={() => toggleSelection(item._id)}
              >
                {item.images?.[0]?.type === 'video' ? (
                  <video src={item.images[0].url} className="w-full h-full object-cover" />
                ) : (
              <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" width={80} height={80} />
                )}
                
                <div className={`absolute inset-0 bg-black/10 transition-opacity ${selectedItems.includes(item._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                
                <div className={`absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center transition-colors border-2 ${selectedItems.includes(item._id) ? 'bg-[#8B1A10] border-[#8B1A10] text-white' : 'bg-white/50 border-white text-transparent'}`}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <p className="text-[10px] text-gray-400 mb-0.5" style={{ fontFamily: "'Gotham Book', sans-serif" }}>{item.type}</p>
                <h3 className="text-[13px] font-bold text-gray-900 leading-tight pr-4" style={{ fontFamily: "'Gotham Book', sans-serif" }}>
                  {item.name}
                </h3>
              </div>
              
              <div className="font-bold text-sm text-gray-900 self-center" style={{ fontFamily: "'Gotham Book', sans-serif" }}>
                {(item.rentalPrice || item.price || 0) >= 2000 ? 'Price on Request' : `₹${(item.rentalPrice || item.price || 0).toFixed(2)}`}
              </div>
            </div>
          ))
        )}

        {/* Total Summary */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm mt-6 space-y-2">
            {premiumSelected.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Premium Jewels ({premiumSelected.length} {premiumSelected.length === 1 ? 'Item' : 'Items'})</span>
                <span className="font-bold text-gray-900">Price on Request</span>
              </div>
            )}
            {pricedSelected.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Sub Total ({pricedSelected.length} {pricedSelected.length === 1 ? 'Item' : 'Items'})</span>
                <span className="font-bold text-gray-900">₹{pricedAmount.toFixed(2)}</span>
              </div>
            )}
            {selectedCartItems.length === 0 && (
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Total Selected</span>
                <span className="font-bold text-gray-900">₹0.00</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleBookOnWhatsapp}
            className={`w-full py-4 font-semibold rounded-xl text-sm transition-colors ${selectedItems.length > 0 ? 'bg-[#B07A85] text-white hover:bg-[#9E6A75]' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Book Selected ({selectedItems.length})
          </button>
        </div>
      )}
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    <ShareBottomSheet isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} customTitle="Check out my cart at Apila Jewels!" />
    </div>
  );
};

export default Cart;
