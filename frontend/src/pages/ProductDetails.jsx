import React, { useState } from 'react';
import { ArrowLeft, Search, Heart, ShoppingCart, Share2, ChevronDown } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Mock Data
  const product = {
    _id: id || '1',
    name: 'Moissanite & AD Designer Necklace Set',
    type: 'Moissanite Jewels',
    rentalPrice: 1499.00,
    images: ['https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80', 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80'],
    description: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don\'t look even slightly believable.',
    material: 'Brass',
    size: 'Adjustable',
    finish: 'Mehndi Polish'
  };

  const handleAddToCart = () => {
    addToCart(product);
    // Could show a toast here
  };

  const handleBookOnWhatsapp = () => {
    const message = `Hi Apila Jewels, I would like to book:\n\n*${product.name}*\nPrice: ₹${product.rentalPrice}\n\nPlease let me know the availability.`;
    const whatsappUrl = `https://wa.me/+917397721122?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-[#FFF8F3] min-h-screen pb-24">
      {/* Custom Header */}
      <div className="fixed top-0 w-full bg-white z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-black">
            <ArrowLeft size={24} />
          </button>
          <h1 className="font-semibold text-lg">{product.type}</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <button><Search size={22} /></button>
          <button><Heart size={22} /></button>
          <Link to="/cart"><ShoppingCart size={22} /></Link>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="pt-[60px]">
        <div className="w-full aspect-[4/5] bg-white">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Details Container */}
      <div className="bg-[#FFF8F3] -mt-4 relative rounded-t-3xl pt-6 px-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">
              <span className="font-black">{product.type}</span> {product.name.replace(product.type, '')}
            </h1>
            <p className="text-xl font-semibold mt-2">₹{product.rentalPrice.toFixed(2)}</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-white shadow-sm">
              <Heart size={20} />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-white shadow-sm">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 my-6">
          <button 
            onClick={handleAddToCart}
            className="flex-1 py-3 border-2 border-[#B07A85] text-[#B07A85] font-semibold rounded-lg text-sm bg-transparent hover:bg-[#B07A85] hover:text-white transition-colors"
          >
            Add to Cart
          </button>
          <button 
            onClick={handleBookOnWhatsapp}
            className="flex-1 py-3 bg-[#B07A85] text-white font-semibold rounded-lg text-sm hover:bg-[#9E6A75] transition-colors"
          >
            Book On Whatsapp
          </button>
        </div>

        {/* Description */}
        <div className="space-y-4 text-sm text-gray-600 mb-6">
          <div>
            <h3 className="font-bold text-black mb-1 text-xs">Description</h3>
            <p className="text-[13px] leading-relaxed">{product.description}</p>
          </div>
          
          <div className="text-[13px]">
            <p><span className="font-bold text-black">Material : </span>{product.material}</p>
            <p className="mt-1"><span className="font-bold text-black">Size : </span>{product.size}</p>
            <p className="mt-1"><span className="font-bold text-black">Finish : </span>{product.finish}</p>
          </div>

          <div className="pt-2">
            <h3 className="font-bold text-black mb-1 text-xs">Delivery and Return Policy:</h3>
            <p className="text-[13px] leading-relaxed mb-1">There are many variations of passages of Lorem Ipsum available, but the majority have suffered.</p>
            <a href="#" className="font-bold text-black text-[13px] underline">View Policy - Here</a>
          </div>
        </div>

        {/* Accordions */}
        <div className="border border-gray-200 rounded-lg bg-white mb-8">
          <button className="w-full flex justify-between items-center px-4 py-3 text-sm font-semibold text-gray-800">
            Care Instructions
            <ChevronDown size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
