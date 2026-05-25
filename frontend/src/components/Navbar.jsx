import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between p-4 bg-white sticky top-0 z-50 shadow-sm">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Apila Jewels" className="h-10 object-contain" />
        </Link>
      </div>

      <div className="flex items-center gap-4 text-gray-700">
        <button className="hover:text-black transition">
          <Search size={24} strokeWidth={1.5} />
        </button>
        <button className="hover:text-black transition">
          <Heart size={24} strokeWidth={1.5} />
        </button>
        <Link to="/cart" className="hover:text-black transition">
          <ShoppingCart size={24} strokeWidth={1.5} />
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
