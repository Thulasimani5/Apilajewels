import React, { useEffect, useState } from 'react';
import SearchOverlay from '../components/SearchOverlay';
import ShareBottomSheet from '../components/ShareBottomSheet';
import LazyImage from '../components/LazyImage';
import { ArrowLeft, Search, Heart, Share2, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import DesktopCart from './DesktopCart';
import useIsDesktop from '../hooks/useIsDesktop';
import Navbar from '../components/Navbar';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import iconPremiumJewel from '../assets/icons/Premium JewelIcon.svg';
import iconDesignerCollection from '../assets/icons/Designer CollectionIcon.svg';
import '../styles/ApilaJewels.css';

const Cart = ({ isSale: isSaleProp }) => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
  const location = useLocation();
  const isSale = isSaleProp ?? (location.pathname.startsWith('/sale') || new URLSearchParams(location.search).get('type') === 'sale');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const [selectedItems, setSelectedItems] = useState([]);

  const isItemSale = (item) => Boolean(item.isSale || item.sale || item.sales);
  const currentCartItems = cartItems.filter(item => isSale ? isItemSale(item) : !isItemSale(item));

  useEffect(() => {
    setSelectedItems(currentCartItems.map(item => item._id));
  }, [cartItems, isSale]);

  if (isDesktop) {
    return <DesktopCart isSale={isSale} />;
  }

  const toggleSelection = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const selectedCartItems = currentCartItems.filter(item => selectedItems.includes(item._id));

  const getItemPrice = (item) => isItemSale(item)
    ? Number(item.discountedRate != null ? item.discountedRate : (item.salesAmount || item.salesPrice || item.price || 0))
    : Number(item.rentalPrice || item.price || 0);

  const getItemQty = (item) => Number(item.quantity || 1);

  const isPremium = (item) => !isSale && (item.showPrice === false || getItemPrice(item) > 1200);
  const premiumSelected = selectedCartItems.filter(isPremium);
  const pricedSelected = selectedCartItems.filter(item => !isPremium(item));

  // Actual original total before discount
  const actualOriginalAmount = pricedSelected.reduce((total, item) => {
    const orig = Number(item.salesPrice || item.salesAmount || item.price || 0);
    return total + (orig * getItemQty(item));
  }, 0);

  // Final amount to pay after discount
  const finalPayableAmount = pricedSelected.reduce((total, item) => total + (getItemPrice(item) * getItemQty(item)), 0);

  const displaySubtotal = isSale ? actualOriginalAmount : finalPayableAmount;
  const totalDiscount = isSale ? Math.max(0, actualOriginalAmount - finalPayableAmount) : 0;
  const finalTotalAmount = finalPayableAmount;

  const allPremiumSelected = !isSale && premiumSelected.length === selectedCartItems.length && selectedCartItems.length > 0;

  const handleBookOnWhatsapp = async () => {
    if (selectedCartItems.length === 0) {
      alert("Please select at least one item to book.");
      return;
    }

    try {
      const jewelleryIds = selectedCartItems.map(item => item._id).filter(Boolean);
      await axios.post(`${API_BASE_URL}/api/bookings`, {
        jewelleryIds,
        totalAmount: finalTotalAmount || 0,
        bookingDate: new Date(),
        customerDetails: {
          name: user?.name || 'Guest Visitor',
          phone: user?.phone || user?.mobile || 'WhatsApp Inquiry'
        }
      });
    } catch (e) {
      console.error('Error recording booking:', e);
    }

    if (isSale) {
      let message = `Hi Apila Jewels, I would like to purchase the following sale jewellery items:\n\n`;
      selectedCartItems.forEach((item, index) => {
        const price = getItemPrice(item);
        const qty = getItemQty(item);
        const itemTotal = price * qty;
        message += `${index + 1}. *${item.name}* (Code: ${item.code || item.jewelId || 'N/A'}) – Qty: ${qty} × Rs. ${Math.round(price).toLocaleString('en-IN')} = Rs. ${Math.round(itemTotal).toLocaleString('en-IN')}\n`;
      });
      message += `\n*Total Amount: Rs. ${Math.round(finalTotalAmount).toLocaleString('en-IN')}*\n\nPlease confirm availability and payment details.`;
      const whatsappUrl = `https://wa.me/+917397721122?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      return;
    }
    let message = `Hi Apila Jewels, I would like to book the following items:\n\n`;
    selectedCartItems.forEach((item, index) => {
      const price = item.rentalPrice || item.price || 0;
      const pText = isPremium(item) ? 'Price on Request' : `₹${price}`;
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
        <h2 className="mb-3" style={{ color: '#000', fontFamily: "'Bacasime Antique', serif", fontSize: '22px', fontStyle: 'normal', fontWeight: 400, lineHeight: '39px', letterSpacing: '-0.66px' }}>
          Your Order ({currentCartItems.length})
        </h2>

        {currentCartItems.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-4">Your cart is empty</p>
            <Link
              to={isSale ? "/sale" : "/shop"}
              className="inline-block px-5 py-2 bg-[#B07A85] text-white text-xs font-semibold uppercase tracking-wider rounded"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div>
            {currentCartItems.map((item) => {
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
              let categoryLabel = categoryArr[0] || (item.material ? item.material : (isSale ? 'MOISSINATE JEWELS' : 'victorian-moissinate'));
              if (categoryLabel === 'Bangles & Bracelets') categoryLabel = 'Bangles';
              const displayCategory = categoryLabel.toUpperCase().includes('JEWEL') || categoryLabel.toUpperCase().includes('SET')
                ? categoryLabel.toUpperCase()
                : `${categoryLabel.toUpperCase()} JEWELS`;

              const stockLimit = typeof item.stockCount === 'number' && item.stockCount > 0 ? item.stockCount : 10;
            const qty = Math.min(Number(item.quantity || 1), stockLimit);

              return (
                <div key={item._id} className="bg-white mb-3 p-3 flex gap-3 relative shadow-[0_2px_8px_rgba(0,0,0,0.04)] items-start rounded-sm">
                  {/* Delete button in top-right corner */}
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="absolute top-2.5 right-2.5 text-gray-400 hover:text-black transition-colors z-10 p-1"
                    aria-label="Remove item"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1 1l9 9M10 1l-9 9" stroke="black" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Left: Product Image */}
                  <div
                    className="w-[110px] h-[135px] aspect-[4/5] overflow-hidden bg-gray-100 flex-shrink-0 relative cursor-pointer group border border-[#EAEAEA]"
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

                  {/* Right Details */}
                  <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between" style={{ minHeight: '150px' }}>
                    <div>
                      <p style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                        {displayCategory}
                      </p>
                      <p className="line-clamp-2 mt-0.5" style={{ color: '#555', fontFamily: "'Gotham Book', sans-serif", fontSize: '12px', lineHeight: '16px' }}>
                        {item.name}
                      </p>
                      <p className="mt-0.5" style={{ color: '#777', fontFamily: "'Gotham Book', sans-serif", fontSize: '11px' }}>
                        Ref : {item.code || item.jewelId || 'MP006'}
                      </p>

                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-[#F4F4F4] px-1.5 py-0.5 text-[10px] text-black font-medium">
                          <img src={iconPremiumJewel} alt="" width="10" height="9" />
                          Premium Jewel
                        </span>
                        <span className="inline-flex items-center gap-1 bg-[#F4F4F4] px-1.5 py-0.5 text-[10px] text-black font-medium">
                          <img src={iconDesignerCollection} alt="" width="10" height="9" />
                          Designer Collection
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: Quantity and Price block */}
                    <div className="flex justify-between items-end mt-4 pt-1">
                      {/* Quantity Selector */}
                      {isSale ? (
                        <div className="flex flex-col">
                          <div
                            className="flex items-center justify-between"
                            style={{
                              width: '80px',
                              height: '34px',
                              padding: '2px 4px',
                              background: '#FFF6EB',
                              borderBottom: '1.5px solid rgba(0,0,0,0.2)',
                              borderRadius: '1px'
                            }}
                          >
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, Math.max(1, qty - 1), stockLimit)}
                              disabled={qty <= 1}
                              className="w-6 h-6 flex items-center justify-center text-sm font-medium text-black disabled:opacity-25"
                            >
                              −
                            </button>
                            <span style={{ fontFamily: "'Gotham Book', sans-serif", fontSize: '14px', fontWeight: 500, color: '#000' }}>
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item._id, qty + 1, stockLimit)}
                              disabled={qty >= stockLimit}
                              className="w-6 h-6 flex items-center justify-center text-sm font-medium text-black disabled:opacity-25"
                            >
                              +
                            </button>
                          </div>
                          {qty >= stockLimit && stockLimit > 0 && (
                            <span style={{ fontSize: '9px', color: '#d32f2f', marginTop: '2px', fontFamily: "'Gotham Book', sans-serif" }}>
                              Max ({stockLimit})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="cc-qty" style={{ width: '64px', height: '34px', padding: '6px 8px', background: '#FFF6EB', borderBottom: '1px solid rgba(0,0,0,0.15)' }}>
                          <span className="cc-qty-num" style={{ fontSize: '14px' }}>{qty}</span>
                          <svg
                            width="8"
                            height="12"
                            viewBox="0 0 7 12"
                            fill="none"
                            style={{ transform: 'rotate(-90deg)', opacity: 0.5, flexShrink: 0, pointerEvents: 'none' }}
                          >
                            <path d="M6 1L1 6l5 5" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}

                      {/* Price Block */}
                      {isSale ? (
                        <div className="flex flex-col items-end gap-1">
                          <span style={{ border: 'none', backgroundColor: '#D32F2F', color: '#fff', fontSize: '11px', fontWeight: 400, padding: '5px 16px', borderRadius: '0', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Gotham Book', sans-serif" }}>
                            SALE
                          </span>
                          <div className="flex items-baseline gap-1.5 flex-wrap justify-end">
                            {discountPercent > 0 && (
                              <span style={{ color: '#FF4D4F', fontFamily: "'Gotham', sans-serif", fontSize: '10.5px', fontWeight: 600 }}>
                                ({discountPercent}% OFF)
                              </span>
                            )}
                            {origPrice > finalPrice && (
                              <span style={{ color: '#888', fontFamily: "'Gotham Book', sans-serif", fontSize: '11px', textDecoration: 'line-through' }}>
                                Rs. {Math.round(origPrice).toLocaleString('en-IN')}
                              </span>
                            )}
                            <span style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '14px', fontWeight: 700 }}>
                              Rs. {Math.round(finalPrice).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span style={{ border: 'none', backgroundColor: '#ECECEC', color: '#111', fontSize: '11px', fontWeight: 400, padding: '5px 16px', borderRadius: '0', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Gotham Book', sans-serif" }}>
                            RENT
                          </span>
                          <div style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '13px', fontWeight: 600 }}>
                            {isPremium(item) ? 'Price on Request' : `₹${getItemPrice(item).toFixed(2)}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Total Summary */}
        {currentCartItems.length > 0 && (
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
                <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>
                  {isSale ? `Rs. ${Math.round(displaySubtotal).toLocaleString('en-IN')}` : `₹${displaySubtotal.toFixed(2)}`}
                </span>
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
                <span style={{ color: totalDiscount > 0 ? '#10B981' : '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '12px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>{isSale ? (totalDiscount > 0 ? `- Rs. ${Math.round(totalDiscount).toLocaleString('en-IN')}` : 'Rs. 0') : '₹0'}</span>
              </div>

              <div className="flex justify-between items-center mb-10 ">
                <span style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '14px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal', letterSpacing: '0.64px', textTransform: 'uppercase' }}>Total</span>
                <span style={{ color: '#000', textAlign: 'right', fontFamily: "'Gotham', sans-serif", fontSize: '14px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>
                  {allPremiumSelected ? 'Price on Request' : (isSale ? `Rs. ${Math.round(finalTotalAmount).toLocaleString('en-IN')}` : `₹${finalTotalAmount.toFixed(2)}`)}
                </span>
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
      {currentCartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white px-2 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex justify-between items-center z-40 ">
          <div className="flex flex-col">
            <span style={{ color: '#000', fontFamily: "'Gotham', sans-serif", fontSize: '15px', fontStyle: 'normal', fontWeight: 500, lineHeight: 'normal' }}>
              {isSale ? `Rs. ${Math.round(finalTotalAmount).toLocaleString('en-IN')}` : `₹${finalTotalAmount.toFixed(2)}`}
            </span>
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
