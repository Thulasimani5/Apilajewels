import React, { useState } from 'react';
import { ArrowLeft, Search, Heart, ShoppingCart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const JewelleryListing = () => {
  // Mock Data
  const [products] = useState([
    {
      _id: '1',
      name: 'Moissanite & AD Designer Necklace Set',
      code: 'M-1',
      type: 'Moissanite Jewels',
      rentalPrice: 1499.00,
      images: ['https://images.unsplash.com/photo-1599643478524-fb66f70a0066?w=800&q=80']
    },
    {
      _id: '2',
      name: 'Moissanite Designer Polgi Set',
      code: 'M-2',
      type: 'Moissanite Jewels',
      rentalPrice: 2399.00,
      images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80']
    },
    {
      _id: '3',
      name: 'Moissanite Designer Polgi Necklace',
      code: 'M-3',
      type: 'Moissanite Jewels',
      rentalPrice: 1299.00,
      images: ['https://images.unsplash.com/photo-1583391733958-d25e01a88b50?w=800&q=80']
    },
    {
      _id: '4',
      name: 'Moissanite Designer Polgi Choker',
      code: 'M-4',
      type: 'Moissanite Jewels',
      rentalPrice: 1599.00,
      images: ['https://images.unsplash.com/photo-1595781577436-1e002eb23c21?w=800&q=80']
    },
    {
      _id: '5',
      name: 'Moissanite Polgi Necklace Set',
      code: 'M-5',
      type: 'Moissanite Jewels',
      rentalPrice: 899.00,
      images: ['https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80']
    },
    {
      _id: '6',
      name: 'Moissanite Emerald Premium Set',
      code: 'M-6',
      type: 'Moissanite Jewels',
      rentalPrice: 2799.00,
      images: ['https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80']
    }
  ]);

  return (
    <div className="bg-white min-h-screen pb-10">
      {/* Custom Header for Listing matching Figma */}
      <div className="sticky top-0 bg-white z-40 px-4 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-black">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-semibold text-lg">Moissanite Jewels</h1>
        </div>
        <div className="flex items-center gap-4 text-gray-700">
          <button><Search size={22} /></button>
          <button><Heart size={22} /></button>
          <Link to="/cart"><ShoppingCart size={22} /></Link>
        </div>
      </div>

      {/* Filter and Sort bar */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 text-sm font-medium">
        <button className="flex items-center gap-1">
          Filter <ChevronDown size={16} />
        </button>
        <button className="flex items-center gap-1 text-gray-500">
          Sort by : <span className="text-black">What's new</span> <ChevronDown size={16} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 px-4 py-4">
        {products.map(product => (
          <Card key={product._id} jewellery={product} />
        ))}
      </div>
    </div>
  );
};

export default JewelleryListing;
