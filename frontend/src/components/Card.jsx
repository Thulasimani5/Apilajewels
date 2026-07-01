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
          className={`absolute top-[14px] right-[14px] w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all duration-200 z-[2] border-none ${liked ? 'bg-black/40' : 'bg-black/25 hover:bg-black/40'}`}
          style={{ backdropFilter: 'blur(2px)' }}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 24 24" fill={liked ? '#fff' : 'none'} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="pt-[9px] pb-[2px]">
        <p style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "9px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "0.7px", textTransform: "uppercase" }}>
          {Array.isArray(jewellery.category) ? jewellery.category.join(', ') : jewellery.category}
        </p>
        <h3 className="line-clamp-2 mt-[5px] w-full whitespace-normal break-words" style={{ maxWidth: "130px", color: "#000", fontFamily: "Gotham Book, sans-serif", fontSize: "11.5px", fontStyle: "normal", fontWeight: 400, lineHeight: "16px", height: "32px", opacity: 0.6, letterSpacing: "-0.13px" }}>
          {jewellery.name}
        </h3>
        <p className="mt-[4px]" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "12px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal" }}>
          {jewellery.showPrice === false || jewellery.rentalPrice > 1500
            ? 'Price on Request'
            : `₹${jewellery.rentalPrice?.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
};

export default Card;
