import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

const FullScreenMediaViewer = ({ mediaList, initialIndex = 0, isOpen, onClose, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });

  // Touch / swipe tracking
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);
  const isDragging = useRef(false);
  const containerRef = useRef(null);
  const slideRef = useRef(null);

  // Pinch tracking
  const initialPinchDistance = useRef(0);
  const lastScale = useRef(1);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsZoomed(false);
      setZoomScale(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, initialIndex]);

  const goTo = useCallback((index) => {
    if (index >= 0 && index < mediaList.length) {
      setCurrentIndex(index);
      setIsZoomed(false);
      setZoomScale(1);
    }
  }, [mediaList.length]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, goNext, goPrev]);

  // ── Touch handlers ──
  const handleTouchStart = (e) => {
    if (isZoomed) return;
    if (e.touches.length === 2) {
      // Pinch start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialPinchDistance.current = dist;
      lastScale.current = zoomScale;
      return;
    }
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
    isDragging.current = true;
    if (slideRef.current) {
      slideRef.current.style.transition = 'none';
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = Math.min(Math.max((dist / initialPinchDistance.current) * lastScale.current, 1), 4);
      setZoomScale(scale);
      if (scale > 1.1) {
        setIsZoomed(true);
        // Set zoom origin to midpoint of fingers
        const midX = ((e.touches[0].clientX + e.touches[1].clientX) / 2 / window.innerWidth) * 100;
        const midY = ((e.touches[0].clientY + e.touches[1].clientY) / 2 / window.innerHeight) * 100;
        setZoomOrigin({ x: midX, y: midY });
      }
      e.preventDefault();
      return;
    }

    if (!isDragging.current || isZoomed) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Only swipe horizontally if horizontal movement > vertical
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault();
      touchDeltaX.current = deltaX;
      if (slideRef.current) {
        slideRef.current.style.transform = `translateX(${deltaX}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (isZoomed && zoomScale <= 1.05) {
      setIsZoomed(false);
      setZoomScale(1);
    }

    if (!isDragging.current) return;
    isDragging.current = false;

    if (slideRef.current) {
      slideRef.current.style.transition = 'transform 0.3s ease';
      slideRef.current.style.transform = 'translateX(0)';
    }

    const threshold = 60;
    if (touchDeltaX.current < -threshold) {
      goNext();
    } else if (touchDeltaX.current > threshold) {
      goPrev();
    }
    touchDeltaX.current = 0;
  };

  // Double-tap to zoom
  const lastTap = useRef(0);
  const handleDoubleTap = (e) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      // Double tap detected
      if (isZoomed) {
        setIsZoomed(false);
        setZoomScale(1);
      } else {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX || e.changedTouches?.[0]?.clientX || rect.width / 2) - rect.left) / rect.width * 100;
        const y = ((e.clientY || e.changedTouches?.[0]?.clientY || rect.height / 2) - rect.top) / rect.height * 100;
        setZoomOrigin({ x, y });
        setZoomScale(2.5);
        setIsZoomed(true);
      }
    }
    lastTap.current = now;
  };

  if (!isOpen || !mediaList || mediaList.length === 0) return null;

  const currentMedia = mediaList[currentIndex];
  const url = currentMedia?.url || currentMedia;
  const isVideo = currentMedia?.type === 'video' ||
    (typeof url === 'string' && (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')));

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[99999] bg-black flex flex-col"
      style={{ touchAction: isZoomed ? 'none' : 'pan-y' }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/90 hover:bg-black/60 transition-colors"
          aria-label="Close"
        >
          <X size={20} strokeWidth={2} />
        </button>
        <span className="text-white/70 text-xs font-medium tracking-wide">
          {currentIndex + 1} / {mediaList.length}
        </span>
      </div>

      {/* Main Media Area */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleDoubleTap}
      >
        <div
          ref={slideRef}
          className="w-full h-full flex items-center justify-center"
          style={{ transition: 'transform 0.3s ease' }}
        >
          {isVideo ? (
            <video
              key={currentIndex}
              src={url}
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              muted
              loop
              playsInline
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transition: isDragging.current ? 'none' : 'transform 0.3s ease',
              }}
            />
          ) : (
            <img
              key={currentIndex}
              src={getOptimizedCloudinaryUrl(url, { width: 1600, height: 1600, crop: 'limit', quality: 'auto' })}
              alt={`${productName || 'Product'} - ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain select-none"
              draggable="false"
              style={{
                transform: `scale(${zoomScale})`,
                transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                transition: isDragging.current ? 'none' : 'transform 0.3s ease',
              }}
            />
          )}
        </div>

        {/* Desktop arrow buttons */}
        {currentIndex > 0 && !isZoomed && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {currentIndex < mediaList.length - 1 && !isZoomed && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white/80 hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Pagination Dots */}
      {mediaList.length > 1 && !isZoomed && (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-50">
          {mediaList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goTo(idx)}
              className={`rounded-full transition-all duration-300 ${
                currentIndex === idx
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Double-tap hint (shown briefly on open) */}
      {!isVideo && (
        <DoubleTapHint />
      )}
    </div>
  );
};

// Small hint component that fades out
const DoubleTapHint = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 animate-pulse">
      <div className="bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/60 text-[11px] font-medium tracking-wide">
        Double-tap to zoom
      </div>
    </div>
  );
};

export default FullScreenMediaViewer;
