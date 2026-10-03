import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

let trendingGridMemCache = null;
const TRENDING_GRID_CACHE_KEY = 'apila_trending_grid_v2';

export function useTrendingProducts() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    localStorage.removeItem('apila_trending_grid'); // clear old v1 cache key

    const toCard = item => {
      const rawImg = item.images?.[0];
      const imgUrl = rawImg?.url || rawImg?.secure_url
        || (typeof rawImg === 'string' && rawImg.startsWith('http') ? rawImg : '')
        || '';
      const priceVal = item.rentalPrice || item.price || 0;
      const price = priceVal > 1500 ? 'Price on Request' : `₹${priceVal.toFixed(2)}`;
      const category = Array.isArray(item.category) ? item.category[0] : (item.category || 'Jewels');
      return {
        id: item._id,
        category,
        name: item.name || '',
        price,
        img: imgUrl,
      };
    };

    if (trendingGridMemCache && !trendingGridMemCache[0]?.category) {
      trendingGridMemCache = null;
    }
    if (trendingGridMemCache) {
      setTrending(trendingGridMemCache);
    } else {
      try {
        const stored = localStorage.getItem(TRENDING_GRID_CACHE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          trendingGridMemCache = parsed;
          setTrending(parsed);
        }
      } catch { }
    }

    const refresh = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/jewellery?random=true&limit=12`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.data || data.products || []);
        list = list.filter(item => {
          const types = Array.isArray(item.type) ? item.type : [item.type];
          return !types.some(t => t?.toLowerCase() === 'accessories');
        });
        if (list.length > 0) {
          const cards = list.map(toCard);
          trendingGridMemCache = cards;
          try { localStorage.setItem(TRENDING_GRID_CACHE_KEY, JSON.stringify(cards)); } catch { }
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
