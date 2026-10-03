import React from 'react';

const ArrowCircle = ({ size = 46 }) => {
  const iconSize = Math.round(size * 0.54);

  return (
    <div
      style={{ width: `${size}px`, height: `${size}px` }}
      className="rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 flex-shrink-0"
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  );
};

export default ArrowCircle;
