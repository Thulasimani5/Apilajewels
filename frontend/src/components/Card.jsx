import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Card = ({ jewellery }) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-luxury transition-transform duration-300 hover:-translate-y-1 group">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F8F8F8]">
        <img 
          src={jewellery.images?.[0] || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80'} 
          alt={jewellery.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/50 backdrop-blur-md text-gray-700 hover:text-red-500 transition-colors">
          <Heart size={20} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{jewellery.type}</div>
        <h3 className="font-medium text-gray-900 truncate">{jewellery.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-semibold">₹{jewellery.rentalPrice?.toFixed(2)}</span>
          <Link to={`/shop/${jewellery._id || jewellery.code}`} className="text-xs font-medium uppercase tracking-wider text-[#B07A85] hover:underline">
            Explore Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
