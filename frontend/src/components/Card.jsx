import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';
import { useQueryClient } from '@tanstack/react-query';
import { fetchProduct } from '../hooks/useProduct';

const Card = ({ jewellery, priority = false, imageAspect, imageClassName = 'rounded-[10px]', variant }) => {
  const isShop = variant === 'shop';
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
        {isShop ? (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(jewellery); }}
            className="absolute top-[8px] right-[8px] w-[33px] h-[33px] rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <clipPath id={`wl-${jewellery._id}`}>
                  <rect width="17.875" height="15.125" transform="translate(8.25 9.625)" />
                </clipPath>
              </defs>
              <circle cx="16.5" cy="16.5" r="16.5" fill={liked ? 'white' : 'black'} opacity={liked ? 0.55 : 0.2} />
              <g opacity={liked ? 1 : 0.8} clipPath={`url(#wl-${jewellery._id})`}>
                <path d="M17.1661 24.7504C17.0724 24.7504 16.9786 24.7301 16.9057 24.6794C12.489 22.1332 7.58277 17.6393 8.32236 13.3483C8.64527 11.4716 10.1244 10.0312 12.0932 9.69641C13.6453 9.43266 15.7182 9.86886 17.1661 11.7861C18.3849 10.1935 20.2182 9.40222 22.1036 9.68626C24.0828 9.99059 25.6244 11.4209 26.0203 13.328C26.8953 17.5379 22.1661 21.9506 17.4369 24.6692C17.3536 24.72 17.2599 24.7403 17.1765 24.7403L17.1661 24.7504Z" fill={liked ? '#ef4444' : 'white'} />
              </g>
            </svg>
          </button>
        ) : (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(jewellery); }}
            className={`absolute top-2.5 right-2.5 w-[20px] h-[20px] rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${liked ? 'bg-white' : 'bg-white/5 hover:bg-white/20'}`}
            aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart
              size={14}
              className={`transition-colors duration-200 ${liked ? 'fill-red-500 text-transparent' : 'text-white drop-shadow-sm'}`}
              strokeWidth={2}
            />
          </button>
        )}
      </div>

      <div className={isShop ? 'pt-[16px]' : 'pt-[9px] pb-[2px]'}>
        <p
          className={`text-[10px] font-medium text-black leading-[normal] ${isShop ? 'tracking-[0.7px] uppercase' : 'tracking-[-0.1px]'}`}
          style={isShop ? { fontFamily: "'Gotham', sans-serif", lineHeight: '12px' } : undefined}
        >
          {Array.isArray(jewellery.category) ? jewellery.category.join(', ') : jewellery.category}
        </p>
        <h3
          className={`text-black/60 ${isShop ? 'text-[13px] line-clamp-2 leading-[18px] mt-[4px] tracking-[-0.13px]' : 'text-[11px] truncate leading-[normal] mt-[5px] tracking-[-0.11px]'}`}
          style={isShop ? { fontFamily: "'Gotham Book', sans-serif" } : undefined}
        >
          {jewellery.name}
        </h3>
        <p
          className={`font-medium text-black leading-[normal] ${isShop ? 'text-[13px] mt-[11px]' : 'text-[9px] mt-[9px]'}`}
          style={isShop ? { fontFamily: "'Gotham', sans-serif" } : undefined}
        >
          {jewellery.rentalPrice >= 2000
            ? 'Premium Collection'
            : `₹${jewellery.rentalPrice?.toFixed(2)}`}
        </p>
      </div>
    </Link>
  );
};

export default Card;
