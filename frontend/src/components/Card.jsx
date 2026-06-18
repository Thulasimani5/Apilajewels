import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProduct } from '../hooks/useProduct';

const Card = ({ jewellery, priority = false, imageAspect, imageClassName = 'rounded-[10px]' }) => {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const liked = isInWishlist(jewellery._id || jewellery.code);
  
  const imageUrl = jewellery.images?.[0]?.url || 'https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80';

  const prefetchProduct = (id) => {
    queryClient.prefetchQuery({
      queryKey: ["product", id],
      queryFn: () => fetchProduct(id),
      staleTime: 5 * 60 * 1000,
    });
  };

  return (
    <Link
      to={`/shop/${jewellery._id || jewellery.code}`}
      className="block group"
      onMouseEnter={() => prefetchProduct(jewellery._id || jewellery.code)}
    >
      <div className={`relative overflow-hidden bg-[#F0EDED] ${imageClassName}`} style={{ aspectRatio: imageAspect ?? '1 / 1' }}>
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
            toggleWishlist(jewellery);
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

      <div className="pt-[9px] pb-[2px]">
        <p className="text-[10px] font-medium text-black leading-[normal] tracking-[-0.1px]">
          {Array.isArray(jewellery.category) ? jewellery.category.join(', ') : jewellery.category}
        </p>
        <h3 className="text-[11px] text-black/60 truncate leading-[normal] mt-[5px] tracking-[-0.11px]">
          {jewellery.name}
        </h3>
        <p className="text-[9px] font-medium text-black leading-[normal] mt-[9px]">
          {jewellery.rentalPrice >= 2000
            ? 'Premium Collection'
            : `₹${jewellery.rentalPrice?.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
};

export default Card;
