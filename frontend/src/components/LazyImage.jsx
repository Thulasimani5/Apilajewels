import React, { useState } from 'react';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

/**
 * LazyImage component
 * - Uses Cloudinary optimized URLs via getOptimizedCloudinaryUrl
 * - Implements a low-quality blur placeholder
 * - Fades into the full resolution image (w_1200) once loaded
 */
const LazyImage = ({ src, alt = '', className = '', priority = false, width = 1200, height = 1200, ...rest }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Phase 5: Blur Placeholder URL
  const blurUrl = getOptimizedCloudinaryUrl(src, {
    width: 20,
    quality: 1,
  });

  // Phase 4: Full Resolution URL (w_1200)
  const finalSrc = getOptimizedCloudinaryUrl(src, {
    width: 1200,
  });

  return (
    <div className={`relative overflow-hidden ${className}`} {...rest}>
      {/* Blurred Placeholder */}
      <img
        src={blurUrl}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-0' : 'opacity-100 scale-110 blur-md'}`}
        aria-hidden="true"
      />
      
      {/* Final Image */}
      <img
        src={finalSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setIsLoaded(true)}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        width={width}
        height={height}
      />
    </div>
  );
};

export default LazyImage;
