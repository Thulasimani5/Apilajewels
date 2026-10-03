import React, { useEffect, useCallback } from 'react';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

export default function Lightbox({ mediaList, index, onClose, onSetIndex }) {
  const total = mediaList.length;

  const goPrev = useCallback(() => onSetIndex(i => Math.max(0, i - 1)), [onSetIndex]);
  const goNext = useCallback(() => onSetIndex(i => Math.min(total - 1, i + 1)), [onSetIndex, total]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handler);
    };
  }, [onClose, goPrev, goNext]);

  const item = mediaList[index];
  const url = item?.url || item;
  const isVideo = item?.type === 'video' || (typeof url === 'string' && /\.(mp4|mov|webm)$/i.test(url));

  return (
    <div className="pdp-lightbox" onClick={onClose}>
      <button className="pdp-lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {index > 0 && (
        <button className="pdp-lightbox-arrow pdp-lightbox-prev"
          onClick={e => { e.stopPropagation(); goPrev(); }} aria-label="Previous">
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M8 1L1 8l7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="pdp-lightbox-content" onClick={e => e.stopPropagation()}>
        {isVideo ? (
          <video src={url} autoPlay controls loop className="pdp-lightbox-media" />
        ) : (
          <img
            src={getOptimizedCloudinaryUrl(url, { width: 1600, height: 1600, crop: 'limit', quality: 'auto' })}
            alt={`Product image ${index + 1}`}
            className="pdp-lightbox-media"
          />
        )}
      </div>

      {index < total - 1 && (
        <button className="pdp-lightbox-arrow pdp-lightbox-next"
          onClick={e => { e.stopPropagation(); goNext(); }} aria-label="Next">
          <svg width="9" height="16" viewBox="0 0 9 16" fill="none">
            <path d="M1 1l7 7-7 7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {total > 1 && (
        <div className="pdp-lightbox-dots" onClick={e => e.stopPropagation()}>
          {mediaList.map((_, i) => (
            <button key={i}
              className={`pdp-lightbox-dot${i === index ? ' active' : ''}`}
              onClick={() => onSetIndex(i)}
              aria-label={`Go to image ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
