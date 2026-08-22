import React, { useState, useEffect, useRef } from 'react';
import LazyImage from '../components/LazyImage';
import { ArrowLeft, Search as SearchIcon, X, Loader2, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import logoImage from "../assets/Apila Logo01.svg";
import imgC1 from '../assets/images/c1.jpg';
import { getOptimizedCloudinaryUrl } from '../utils/imageUtils';

let jewelsMemCache = null;
const CACHE_KEY = 'apila_srch_jewels';


function isAccessory(product) {
  if (!product) return false;
  const types = Array.isArray(product.type) ? product.type : (product.type ? [product.type] : []);
  const categories = Array.isArray(product.category) ? product.category : (product.category ? [product.category] : []);
  const hasAccessoryType = Boolean(product.accessoryType);

  return (
    hasAccessoryType ||
    types.some(t => t?.toLowerCase() === 'accessories') ||
    categories.some(c => c?.toLowerCase() === 'accessories')
  );
}

const SearchOverlay = ({ isOpen, onClose, category, type }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [premiumJewels, setPremiumJewels] = useState([]);

  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    if (jewelsMemCache) {
      const filteredMem = jewelsMemCache.filter(item => !isAccessory(item));
      setPremiumJewels(filteredMem);
    } else {
      try {
        const stored = localStorage.getItem(CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const filteredStored = parsed.filter(item => !isAccessory(item));
          jewelsMemCache = filteredStored;
          setPremiumJewels(filteredStored);
        }
      } catch { }
    }

    async function refresh() {
      try {
        const page = Math.floor(Math.random() * 4) + 1;
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=20&page=${page}`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.products || data.data || []);
        if (list.length === 0) {
          const fb = await fetch(`${API_BASE_URL}/api/jewellery?limit=20`);
          const fbData = await fb.json();
          list = Array.isArray(fbData) ? fbData : (fbData.products || fbData.data || []);
        }
        const nonAccessories = list.filter(item => !isAccessory(item)).slice(0, 4);
        if (nonAccessories.length > 0) {
          jewelsMemCache = nonAccessories;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(nonAccessories)); } catch { }
          setPremiumJewels(nonAccessories);
        }
      } catch { }
    }
    refresh();
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
          className="w-full bg-transparent placeholder-[#A0A0A0] focus:outline-none"
          style={{ fontFamily: "var(--f-gotham-b)", fontSize: "16px", color: "#000", letterSpacing: "-0.18px", lineHeight: 1 }}
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
            <h3 className="mb-4" style={{ fontFamily: "var(--f-gotham-b)", fontSize: "13px", color: "rgba(0, 0, 0, 0.50)", letterSpacing: "-0.13px" }}>Suggestions</h3>
            <div className="flex flex-col space-y-4  mb-4">
              {['VICTORIAN-MOISSINATE', 'AD JEWELS', 'GOLD ANTIQUE JEWELS', 'KUNDAN JEWELS'].map((term) => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="text-left uppercase hover:text-[#ab6281] transition-colors"
                  style={{ fontFamily: "var(--f-gotham-b)", fontSize: "12px", fontWeight: "normal", color: "#000", letterSpacing: "0.91px" }}
                >
                  {term}
                </button>
              ))}
            </div>

            <h3 className="mb-4 pt-4 border-t border-[#EAEAEA]" style={{ fontFamily: "var(--f-gotham-b)", fontSize: "13px", color: "rgba(0, 0, 0, 0.50)", letterSpacing: "-0.13px" }}>Premium Jewels</h3>
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
                  <div className="w-[132px] h-[132px] bg-[#f5f0ea] flex-shrink-0">
                    {item.images?.[0]?.type === 'video' ? (
                      <video src={item.images[0].url} className="w-full h-full object-cover" />
                    ) : (
                      <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex flex-col ">
                    <h4 className="mb-2 mt-4 truncate" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "10px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "0.7px", textTransform: "uppercase" }}>{Array.isArray(item.category) ? item.category[0] : item.category || item.type || 'victorian-moissinate'}</h4>
                    <p className=" pr-4 line-clamp-2 w-[165px] whitespace-normal" style={{ fontFamily: "var(--f-gotham-b)", fontSize: "12px", color: "rgba(0, 0, 0, 0.60)", letterSpacing: "-0.13px" }}>{item.name}</p>
                    <span className="text-left inline-block self-start transition-colors mt-6" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "13px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "-0.14px", borderBottom: "1px solid rgba(0, 0, 0, 0.55)" }}>Details</span>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="uppercase mt-8 pt-4 border-t border-[#EAEAEA] pb-4" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "13px", fontStyle: "normal", fontWeight: 400, lineHeight: "normal", letterSpacing: "0.91px", textTransform: "uppercase" }}>CONNECT US</h3>
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
                <div className="w-[100px] h-[100px] bg-[#f5f0ea] flex-shrink-0">
                  {item.images?.[0]?.type === 'video' ? (
                    <video src={item.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                    <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="mb-1 truncate" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "10px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "0.7px", textTransform: "uppercase" }}>{Array.isArray(item.category) ? item.category[0] : item.category || item.type || 'victorian-moissinate'}</h4>
                  <p className="mb-2 pr-4 line-clamp-2 w-[165px] whitespace-normal" style={{ fontFamily: "var(--f-gotham-b)", fontSize: "13px", color: "rgba(0, 0, 0, 0.60)", letterSpacing: "-0.13px" }}>{item.name}</p>
                  <span className="text-left inline-block self-start transition-colors" style={{ color: "#000", fontFamily: "Gotham, sans-serif", fontSize: "14px", fontStyle: "normal", fontWeight: 500, lineHeight: "normal", letterSpacing: "-0.14px", borderBottom: "1px solid rgba(0, 0, 0, 0.55)" }}>Details</span>
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
