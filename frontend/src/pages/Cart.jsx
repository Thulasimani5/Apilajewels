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
  const premiumSelected = selectedCartItems.filter(item => (item.rentalPrice || item.price || 0) > 1500);
  const pricedSelected = selectedCartItems.filter(item => (item.rentalPrice || item.price || 0) <= 1500);
  const pricedAmount = pricedSelected.reduce((total, item) => total + (item.rentalPrice || item.price || 0), 0);
  const allPremiumSelected = premiumSelected.length === selectedCartItems.length && selectedCartItems.length > 0;

  const handleBookOnWhatsapp = async () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to book.");
      return;
    }

    try {
      const jewelleryIds = selectedCartItems.map(item => item._id).filter(Boolean);
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        jewelleryIds,
        totalAmount: pricedAmount || 0,
        bookingDate: new Date(),
        customerDetails: {
          name: user?.name || 'Guest Visitor',
          phone: user?.phone || user?.mobile || 'WhatsApp Inquiry'
        }
      });
    } catch (e) {
      console.error('Error recording booking:', e);
    }

    let message = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    selectedCartItems.forEach((item, index) => {
      const price = item.rentalPrice || item.price || 0;
      const pText = price > 1500 ? 'Price on Request' : `₹${price}`;
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
    <div className="bg-[#FFF8F3] min-h-[100dvh] flex flex-col pb-20">
      <Navbar />
      <div className="flex-1 mt-[55px] md:mt-[80px] px-2 pt-6 pb-4">
        <h2 className="mb-2" style={{ color: '#000', fontFamily: "'Bacasime Antique', serif", fontSize: '22px', fontStyle: 'normal', fontWeight: 400, lineHeight: '39px', letterSpacing: '-0.66px' }}>
          Your Order ({cartItems.length})
        </h2>

        {cartItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Your cart is empty
          </div>
        ) : (
          <div>
            {cartItems.map((item) => (
              <div key={item._id} className="bg-white mb-2 p-2 flex gap-2 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] items-start">
                <button
                  onClick={() => removeFromCart(item._id)}
                  className="absolute top-3 right-3 text-[#D9D9D9] hover:text-red-500 transition-colors z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 13 13" fill="none" style={{ opacity: 0.7 }}>
                    <g opacity="0.5">
                      <path d="M0.530273 11.5303L11.5303 0.530274" stroke="#707070" strokeWidth="1.5" />
                      <path d="M11.5308 11.5303L0.530761 0.530275" stroke="#707070" strokeWidth="1.5" />
                    </g>
                  </svg>
                </button>

                <div
                  className="w-[100px] h-[125px] aspect-[4/5] overflow-hidden bg-gray-100 flex-shrink-0 relative cursor-pointer group border border-[#EAEAEA]"
                  onClick={() => toggleSelection(item._id)}
                >
                  {item.images?.[0]?.type === 'video' ? (
                    <video src={item.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}

                  {/* Selection Checkmark */}
                  <div className={`absolute top-2 left-2 w-[18px] h-[18px] rounded-full flex items-center justify-center transition-colors ${selectedItems.includes(item._id) ? 'bg-white border border-white' : 'bg-transparent border border-white/70 text-transparent'}`}>
                    {selectedItems.includes(item._id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#B07A85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    )}
                  </div>
                </div>

                <div className="flex-1 py-1 flex flex-col mt-1 justify-between" style={{ height: '125px' }}>
                  <div className="pr-5">
                    <p className="mb-3 line-clamp-1" style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 300, lineHeight: 'normal', letterSpacing: '0.84px', textTransform: 'uppercase' }}>
                      {item.category || 'victorian-moissinate'}
                    </p>
                    <p className="pr-2 line-clamp-2" style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 400, lineHeight: '18px', letterSpacing: '0.3px', opacity: 0.5 }}>
                      {item.name}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-2 mb-1">
                    <p
                      style={{
                        color: '#000',
                        fontFamily: "'Gotham Book', sans-serif",
                        fontSize: '12px',
                        fontWeight: 400,
                        lineHeight: 'normal',
                        letterSpacing: '-0.36px',
                        opacity: 0.5,
                        margin: 0
                      }}
                    >
                      Ref : {item.code || 'MP000'}
                    </p>

                    <div
                      style={{
                        color: '#000',
                        fontFamily: "'Gotham', sans-serif",
                        fontSize: '12px',
                        fontWeight: 500,
                        marginRight: 20
                      }}
                    >
                      {(item.rentalPrice || item.price || 0) > 1500
                        ? 'Price on Request'
                        : `₹${(item.rentalPrice || item.price || 0).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Summary */}
        {cartItems.length > 0 && (
          <div className="mt-10 space-y-2">
            <div
              className="flex mx-auto mb-10 bg-transparent"
              style={{ width: '391px', maxWidth: '100%', height: '48px', border: '1.5px solid #BDBDBD' }}
            >
              <input
                type="text"
                placeholder="Enter Coupen Code"
                className="flex-1 px-4 outline-none bg-transparent"
                style={{ color: 'rgba(0, 0, 0, 0.5)', fontFamily: "'Gotham Book', sans-serif", fontSize: '13px', fontStyle: 'normal', fontWeight: 400, lineHeight: '39px', letterSpacing: '-0.42px' }}
              />
              <button
                className="px-8 bg-white hover:bg-gray-50 transition-colors h-full flex items-center justify-center"
                style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '15px', fontStyle: 'normal', fontWeight: 500, lineHeight: '39px', letterSpacing: '-0.45px' }}
              >
                Apply
              </button>
            </div>

            <div className="pt-6 pb-4 border-t border-[#EAEAEA] space-y-5">
              <div className="flex justify-between items-center">
                <span style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal', letterSpacing: '0.48px', textTransform: 'uppercase' }}>Sub Total ( {pricedSelected.length} Items )</span>
                <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>₹{pricedAmount.toFixed(2)}</span>
              </div>

              {premiumSelected.length > 0 && (
                <div className="flex justify-between items-center">
                  <span style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal', letterSpacing: '0.48px', textTransform: 'uppercase' }}>Premium Jewels ( {premiumSelected.length} Items )</span>
                  <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>Price on Request</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal', letterSpacing: '0.48px', textTransform: 'uppercase' }}>Shipping</span>
                <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>Free</span>
              </div>

              <div className="flex justify-between items-center pb-6 border-b border-[#EAEAEA]">
                <span style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '11px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal', letterSpacing: '0.48px', textTransform: 'uppercase' }}>Discount</span>
                <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>₹0</span>
              </div>

              <div className="flex justify-between items-center mb-10 ">
                <span style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '14px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '0.64px', textTransform: 'uppercase' }}>Total</span>
                <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '14px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>₹{pricedAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 bg-white py-1.5 ">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M5.79188 14.6593C6.90583 14.6593 7.80886 13.7696 7.80886 12.6722C7.80886 11.5747 6.90583 10.6851 5.79188 10.6851C4.67793 10.6851 3.7749 11.5747 3.7749 12.6722C3.7749 13.7696 4.67793 14.6593 5.79188 14.6593Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14.869 14.6593C15.983 14.6593 16.886 13.7696 16.886 12.6722C16.886 11.5747 15.983 10.6851 14.869 10.6851C13.7551 10.6851 12.8521 11.5747 12.8521 12.6722C12.8521 13.7696 13.7551 14.6593 14.869 14.6593Z" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.77547 12.6726H0.75V2.64768C0.75 1.59452 1.6173 0.75 2.67621 0.75H9.90708C10.9761 0.75 11.8333 1.60445 11.8333 2.64768V12.6726H7.79934" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16.8855 12.6725H17.3494C18.2067 12.6725 18.9025 11.987 18.9025 11.1424V8.59896L17.2587 5.43948C17.0267 4.99238 16.5628 4.72412 16.0586 4.72412H11.833V12.6725H12.8415" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '13px', fontStyle: 'normal', fontWeight: 400, lineHeight: '39px', letterSpacing: '-0.42px' }}>Estimated Delivery: 3 - 4 days</span>
            </div>

            <p className="pt-4" style={{ color: '#000', textAlign: 'center', fontFamily: "'Gotham Book', sans-serif", fontSize: '13px', fontStyle: 'normal', fontWeight: 400, lineHeight: '25px', letterSpacing: '-0.42px', opacity: 0.5 }}>
              Need Live Video or Help? Get Instant Assistance<br />
              From Our Jewellery Expert
            </p>
          </div>
        )}
      </div>

      {/* Fixed Bottom Button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white px-2 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-between items-center z-40 ">
          <div className="flex flex-col">
            <span style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '15px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>₹{pricedAmount.toFixed(2)}</span>
            <span style={{ color: '#000', fontFamily: "'Gotham Book', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 200, lineHeight: '185.7%', letterSpacing: '-0.13px' }}>View Price Details</span>
          </div>
          <button
            onClick={handleBookOnWhatsapp}
            style={{ width: '223px', height: '53px', border: '1px solid #AB6281', background: selectedItems.length > 0 ? '#AB6281' : '#ccc', cursor: selectedItems.length > 0 ? 'pointer' : 'not-allowed', color: '#FFF', fontFamily: "'Gotham Book', sans-serif", fontSize: '13px', fontStyle: 'normal', fontWeight: 300, lineHeight: 'normal', letterSpacing: '1.82px' }}
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
