import React, { useState, useEffect, useRef } from 'react';

/**
 * LazyImage component
 * - Uses IntersectionObserver to load image when it enters viewport.
 * - Applies Cloudinary automatic format and quality optimizations.
 * - Shows a blurred low‑quality placeholder while loading.
 * - Accepts all standard img props (src, alt, className, etc.).
 */
const LazyImage = ({ src, alt = '', className = '', placeholderClass = 'bg-gray-200 animate-pulse', ...rest }) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef(null);

  // Build Cloudinary optimized URL if src is a Cloudinary base URL
  const getOptimizedUrl = (url) => {
    try {
      const hasUpload = url.includes('/upload/');
      if (hasUpload) {
        // Insert transformation string after /upload/
        return url.replace('/upload/', '/upload/f_auto,q_auto,dpr_auto/');
      }
      // If not a Cloudinary URL, return as‑is
      return url;
    } catch {
      return url;
    }
  };

  useEffect(() => {
    if (!imgRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );
    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  const finalSrc = isInView ? getOptimizedUrl(src) : '';

  return (
    <div ref={imgRef} className={`relative ${className}`} {...rest}>
      {!isLoaded && (
        <div className={`absolute inset-0 ${placeholderClass}`} />
      )}
      {finalSrc && (
        <img
          src={finalSrc}
          alt={alt}
          className={`w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
};

export default LazyImage;
