import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = 'px-6 py-2 rounded-full font-medium transition-all duration-300 flex items-center justify-center';
  
  const variants = {
    primary: 'bg-[#B07A85] text-white hover:bg-[#9E6A75]',
    secondary: 'bg-brand-cream text-brand-black border border-brand-gold hover:bg-brand-gold hover:text-white',
    outline: 'border-2 border-[#B07A85] text-[#B07A85] hover:bg-[#B07A85] hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
