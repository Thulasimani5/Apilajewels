import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

let trendingGridMemCache = null;
const TRENDING_GRID_CACHE_KEY = 'apila_trending_grid_v3';

export function useTrendingProducts() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    try {
      localStorage.removeItem('apila_trending_grid');
      localStorage.removeItem('apila_trending_grid_v2');
    } catch {}

    const toCard = item => {
      const rawImg = item.images?.[0];
      const imgUrl = rawImg?.url || rawImg?.secure_url
        || (typeof rawImg === 'string' && rawImg.startsWith('http') ? rawImg : '')
        || '';
      const priceVal = item.rentalPrice || item.price || 0;
      const price = (item.showPrice === false || priceVal > 1200) ? 'Price on Request' : `₹${priceVal.toFixed(2)}`;
      let category = Array.isArray(item.category) ? item.category[0] : (item.category || 'Jewels');
      if (category === 'Bangles & Bracelets') category = 'Bangles';
      return {
        id: item._id,
        category,
        name: item.name || '',
        price,
        img: imgUrl,
      };
    };

    if (trendingGridMemCache && trendingGridMemCache.length >= 8) {
      setTrending(trendingGridMemCache);
    } else {
      try {
        const stored = localStorage.getItem(TRENDING_GRID_CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length >= 8) {
            trendingGridMemCache = parsed;
            setTrending(parsed);
          }
        }
      } catch { }
    }

    const refresh = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=100`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.data || data.products || []);
        list = list.filter(item => {
          const types = Array.isArray(item.type) ? item.type : [item.type];
          const isAccessory = types.some(t => t?.toLowerCase() === 'accessories');
          const hasImg = Boolean(item.images?.[0]?.url || item.images?.[0]?.secure_url || (typeof item.images?.[0] === 'string' && item.images[0].startsWith('http')));
          return !isAccessory && hasImg;
        });

        if (list.length >= 8) {
          const cards = list.slice(0, 8).map(toCard);
          trendingGridMemCache = cards;
          try { localStorage.setItem(TRENDING_GRID_CACHE_KEY, JSON.stringify(cards)); } catch { }
          setTrending(cards);
        } else if (list.length > 0) {
          const cards = list.map(toCard);
          setTrending(cards);
        }
      } catch (err) {
        console.error('Failed to fetch trending items:', err);
      }
    };
    refresh();
  }, []);

  return trending;
}

