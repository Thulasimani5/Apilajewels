import React from 'react';

export default function WishButton({ active, onClick }) {
  return (
    <button
      className={`product-wish${active ? " active" : ""}`}
      aria-label="Add to wishlist"
      aria-pressed={active}
      onClick={onClick}
    >
      <svg width="16" height="16" viewBox="0 0 24 24"
        fill={active ? "#fff" : "none"} stroke={active ? "#fff" : "currentColor"} strokeWidth="1.6">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
