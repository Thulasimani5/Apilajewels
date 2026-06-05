import React, { useState, useEffect, useRef } from 'react';
import LazyImage from '../components/LazyImage';
import { ArrowLeft, Search as SearchIcon, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchOverlay = ({ isOpen, onClose, category, type }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const inputRef = useRef(null);

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
      <div className="flex items-center px-4 py-3 border-b border-gray-100 gap-3 shadow-sm bg-white sticky top-0">
        <button 
          onClick={onClose} 
          className="p-1 -ml-1 text-gray-600 hover:text-black transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>
        
        <div className="flex-1 relative flex items-center">
          <SearchIcon size={18} className="absolute left-3 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search${category ? ` in ${category}` : type ? ` in ${type}` : ''} by name, ID, colour, occasion…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-10 pr-10 text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#B07A85] focus:border-[#B07A85] transition-all"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/30">
        {!query.trim() ? (
          <div className="px-6 py-10 text-center">
            <h3 className="text-gray-900 font-semibold mb-2">Trending Searches</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Bridal Set', 'Moissanite', 'Kundan', 'Antique', 'APL'].map((term) => (
                <button 
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-[#B07A85] hover:text-[#B07A85] transition-colors shadow-sm"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#B07A85]" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        ) : results.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {results.map((item) => (
              <div 
                key={item._id}
                onClick={() => {
                  onClose();
                  navigate(`/shop/${item._id || item.code}`);
                }}
                className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.images?.[0]?.type === 'video' ? (
                     <video src={item.images[0].url} className="w-full h-full object-cover" />
                  ) : (
                     <LazyImage src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center gap-2 mb-0.5">
                     <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{item.type || item.category}</p>
                     {item.jewelId && <span className="text-[9px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{item.jewelId}</span>}
                   </div>
                   <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                   <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                     <p className="text-xs text-gray-500">₹{(item.rentalPrice || item.price || 0).toFixed(2)}</p>
                     {item.category && <span className="text-[9px] bg-[#FFF0F3] text-[#A56D7A] px-1.5 py-0.5 rounded-full">{item.category}</span>}
                     {item.colour && <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{item.colour}</span>}
                   </div>
                </div>
                <div className="text-gray-300">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon size={24} className="text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No results found</h3>
            <p className="text-sm text-gray-500">Try searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
