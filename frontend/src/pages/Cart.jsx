import React from 'react';
import { ArrowLeft, Search, Heart, Share2, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, totalAmount } = useCart();

  const handleBookOnWhatsapp = () => {
    if (cartItems.length === 0) return;
    
    let message = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (Code: ${item.code || 'N/A'})\n`;
    });
    message += `\n*Total Amount: ₹${totalAmount.toFixed(2)}*\n\nPlease let me know the availability.`;
    
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
          <button><Search size={22} /></button>
          <button><Heart size={22} /></button>
          <button><Share2 size={22} /></button>
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
              
              <div className="w-[80px] h-[80px] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-1 left-1 bg-[#8B1A10] text-white rounded-full w-4 h-4 flex items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
              
              <div className="flex-1 pt-1">
                <p className="text-[10px] text-gray-400 mb-0.5">{item.type}</p>
                <h3 className="text-[13px] font-bold text-gray-900 leading-tight pr-4">
                  {item.name}
                </h3>
              </div>
              
              <div className="font-bold text-sm text-gray-900 self-center">
                ₹{item.rentalPrice?.toFixed(2)}
              </div>
            </div>
          ))
        )}

        {/* Total Summary */}
        {cartItems.length > 0 && (
          <div className="bg-white rounded-2xl p-5 flex justify-between items-center shadow-sm mt-6">
            <span className="font-bold text-gray-900">Total Amount</span>
            <span className="font-bold text-gray-900">₹{totalAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white px-4 py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={handleBookOnWhatsapp}
            className="w-full py-4 bg-[#B07A85] text-white font-semibold rounded-xl text-sm hover:bg-[#9E6A75] transition-colors"
          >
            Book On Whatsapp
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
