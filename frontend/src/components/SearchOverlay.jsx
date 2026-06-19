import React, { useState, useEffect, useRef } from 'react';
import LazyImage from '../components/LazyImage';
import { ArrowLeft, Search as SearchIcon, X, Loader2, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import logoImage from "../assets/Apila Logo01.svg";

const SearchOverlay = ({ isOpen, onClose, category, type }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [premiumJewels, setPremiumJewels] = useState([]);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const fetchPremium = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=4`);
          const data = await res.json();
          if (data.success) {
            setPremiumJewels(data.data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchPremium();
    }
  }, [isOpen]);

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    } else if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URL}/api/jewellery?search=${encodeURIComponent(query.trim())}&limit=50`;
        if (category) url += `&category=${encodeURIComponent(category)}`;
        if (type) url += `&type=${encodeURIComponent(type)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setResults(data.data);
        } else {
          setError(data.error || 'Failed to search');
        }
      } catch (err) {
        setError('Could not connect to server');
      } finally {
        setLoading(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [query, category, type]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Search Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4 text-black">
          <button><Menu size={20} strokeWidth={1.5} /></button>
          <button onClick={onClose}><X size={20} strokeWidth={1.5} /></button>
        </div>
        
        <div className="flex-1 flex justify-center">
           <img src={logoImage} alt="Apila Jewels" className="h-6 object-contain" />
        </div>

        <div className="flex items-center gap-4 text-black">
          <button onClick={() => { onClose(); navigate('/wishlist'); }}><Heart size={20} strokeWidth={1.5} /></button>
          <button onClick={() => { onClose(); navigate('/cart'); }}><ShoppingBag size={20} strokeWidth={1.5} /></button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#F9F9F9] px-4 py-3 flex items-center relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent text-[13px] text-[#111] placeholder-[#A0A0A0] focus:outline-none"
          style={{ fontFamily: "'Gotham', sans-serif" }}
        />
        {query ? (
          <button onClick={() => setQuery('')} className="absolute right-4 text-[#111]">
            <X size={16} strokeWidth={1.5} />
          </button>
        ) : (
          <SearchIcon size={16} strokeWidth={1.5} className="absolute right-4 text-[#111]" />
        )}
      </div>

      {/* Search Results Area */}
      <div className="flex-1 overflow-y-auto bg-white px-4">
        {!query.trim() ? (
          <div className="py-6">
            <h3 className="text-[10px] text-[#A0A0A0] mb-4" style={{ fontFamily: "'Gotham', sans-serif" }}>Suggestions</h3>
            <div className="flex flex-col space-y-4 mb-8">
              {['MOISSINATE JEWELS', 'AD JEWELS', 'GOLD ANTIQUE JEWELS', 'KUNDAN JEWELS'].map((term) => (
                <button 
                  key={term}
                  onClick={() => setQuery(term)}
                  className="text-left text-[10px] font-bold tracking-[0.1em] text-[#666] uppercase hover:text-[#111] transition-colors"
                  style={{ fontFamily: "'Gotham', sans-serif" }}
                >
                  {term}
                </button>
              ))}
            </div>

            <h3 className="text-[10px] text-[#A0A0A0] mb-4 pt-4 border-t border-[#EAEAEA]" style={{ fontFamily: "'Gotham', sans-serif" }}>Premium Jewels</h3>
            <div className="flex flex-col space-y-4">
              {premiumJewels.map((item) => (
                <div 
                  key={item._id} 
                  className="flex gap-4 cursor-pointer"
                  onClick={() => {
                    onClose();
                    navigate(`/shop/${item._id || item.code}`);
                  }}
                >
                  <div className="w-[100px] h-[100px] bg-gray-100 flex-shrink-0">
                    {item.images?.[0]?.type === 'video' ? (
                       <video src={item.images[0].url} className="w-full h-full object-cover" />
                    ) : (
                       <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h4 className="text-[10px] font-bold text-[#111] mb-1 tracking-[0.05em] uppercase" style={{ fontFamily: "'Gotham', sans-serif" }}>{item.type || 'Moissinate Jewels'}</h4>
                    <p className="text-[10px] text-[#666] leading-[1.3] mb-2 pr-4 line-clamp-2" style={{ fontFamily: "'Gotham', sans-serif" }}>{item.name}</p>
                    <span className="text-[10px] font-bold text-[#111] underline text-left" style={{ fontFamily: "'Gotham', sans-serif" }}>Details</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-[10px] font-bold tracking-[0.1em] text-[#666] uppercase mt-8 pt-4 border-t border-[#EAEAEA] pb-4" style={{ fontFamily: "'Gotham', sans-serif" }}>CONNECT US</h3>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#B07A85]" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        ) : results.length > 0 ? (
          <div className="py-4">
            {results.map((item) => (
              <div 
                key={item._id}
                onClick={() => {
                  onClose();
                  navigate(`/shop/${item._id || item.code}`);
                }}
                className="flex gap-4 mb-4 cursor-pointer"
              >
                <div className="w-[100px] h-[100px] bg-gray-100 flex-shrink-0">
                  {item.images?.[0]?.type === 'video' ? (
                     <video src={item.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                     <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[10px] font-bold text-[#111] mb-1 tracking-[0.05em] uppercase" style={{ fontFamily: "'Gotham', sans-serif" }}>{item.type || item.category || 'Moissinate Jewels'}</h4>
                  <p className="text-[10px] text-[#666] leading-[1.3] mb-2 pr-4 line-clamp-2" style={{ fontFamily: "'Gotham', sans-serif" }}>{item.name}</p>
                  <span className="text-[10px] font-bold text-[#111] underline text-left" style={{ fontFamily: "'Gotham', sans-serif" }}>Details</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-[12px] text-gray-500" style={{ fontFamily: "'Gotham', sans-serif" }}>No results found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
