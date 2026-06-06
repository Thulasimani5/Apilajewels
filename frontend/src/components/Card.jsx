import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

const Card = ({ jewellery, priority = false }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const liked = isInWishlist(jewellery._id || jewellery.code);
  
  const imageUrl = jewellery.images?.[0]?.url || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80';

  return (
    <Link
      to={`/shop/${jewellery._id || jewellery.code}`}
      className="block group"
    >
      {/* Image container — square aspect to fit more items on screen, 10px radius */}
      <div className="relative aspect-square rounded-[10px] overflow-hidden bg-[#F0EDED]">
        {jewellery.images?.[0]?.type === 'video' ? (
          <video
            src={jewellery.images[0].url}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            muted
            loop
            playsInline
            autoPlay
          />
        ) : (
          <img
            src={getOptimizedCloudinaryUrl(imageUrl, { width: 400, height: 400 })}
            srcSet={`
              ${getOptimizedCloudinaryUrl(imageUrl, { width: 200, height: 200 })} 200w,
              ${getOptimizedCloudinaryUrl(imageUrl, { width: 400, height: 400 })} 400w,
              ${getOptimizedCloudinaryUrl(imageUrl, { width: 800, height: 800 })} 800w
            `}
            sizes="
              (max-width: 640px) 50vw,
              (max-width: 1024px) 33vw,
              25vw
            "
            width={400}
            height={400}
            alt={jewellery.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        )}

        {/* Heart overlay — top-right */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              navigate('/login', { state: { from: window.location.pathname } });
            } else {
              toggleWishlist(jewellery);
            }
          }}
          className={`absolute top-2.5 right-2.5 w-[20px] h-[20px] rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${liked ? 'bg-white' : 'bg-white/5 hover:bg-white/20'}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            size={14}
            className={`transition-colors duration-200 ${liked
                ? 'fill-red-500 text-transparent'
                : 'text-white drop-shadow-sm'
              }`}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Text info — tightened spacing to reduce height */}
      <div className="pt-[5px] pb-[2px]">
        {/* Brand name — italic, small, muted grey */}
        <p className="text-[9px] text-[#888] leading-[1.2] italic tracking-[0.2px]">
          {Array.isArray(jewellery.category) ? jewellery.category.join(', ') : jewellery.category}
        </p>
        {/* Product name — medium weight, truncated, dark */}
        <h3 className="text-[11.5px] font-medium text-[#1A1A1A] truncate leading-[1.3] mt-[1px]">
          {jewellery.name}
        </h3>
        {/* Price — regular weight, gray color */}
        <p className="text-[11.5px] text-[#666666] leading-[1.2] mt-[1px] tracking-[-0.1px]">
          {jewellery.rentalPrice >= 2000 
            ? 'Premium Collection' 
            : `₹${jewellery.rentalPrice?.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
};

export default Card;
