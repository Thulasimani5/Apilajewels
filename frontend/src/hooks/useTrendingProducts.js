import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

// No persistent cache — we re-randomize on every load for variety
const TRENDING_STALE_KEYS = ['apila_trending_grid', 'apila_trending_grid_v2', 'apila_trending_grid_v3', 'apila_trending_grid_v4', 'apila_trending_grid_v5'];

export function useTrendingProducts() {
  const [trending, setTrending] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Clear all stale caches so items re-randomize each load
    try {
      TRENDING_STALE_KEYS.forEach(k => localStorage.removeItem(k));
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

    // Safety timeout — stop showing skeleton after 10s if API doesn't respond
    const timeoutId = setTimeout(() => setLoaded(true), 10000);

    const refresh = async () => {
      try {
        // Fetch with high limit to get all items (not just newest)
        const res = await fetch(`${API_BASE_URL}/api/jewellery?limit=500`);
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.data || data.products || []);
        // Filter out accessories, bangles, items without images, and sale items
        list = list.filter(item => {
          const types = Array.isArray(item.type) ? item.type : [item.type];
          const cats = Array.isArray(item.category) ? item.category : [item.category];

          const isAccessory = types.some(t => t?.toLowerCase() === 'accessories');
          const isBangle = cats.some(c => c?.toLowerCase().includes('bangle') || c?.toLowerCase().includes('bracelet')) ||
            types.some(t => t?.toLowerCase().includes('bangle') || t?.toLowerCase().includes('bracelet'));

          const hasImg = Boolean(
            item.images?.[0]?.url ||
            item.images?.[0]?.secure_url ||
            (typeof item.images?.[0] === 'string' && item.images[0].startsWith('http'))
          );
          return !isAccessory && !isBangle && hasImg && !item.isSale;
        });

        // Fisher-Yates shuffle for true randomization across all items
        for (let i = list.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [list[i], list[j]] = [list[j], list[i]];
        }

        if (list.length > 0) {
          const cards = list.slice(0, 12).map(toCard);
          setTrending(cards);
        }
      } catch (err) {
        console.error('Failed to fetch trending items:', err);
      } finally {
        clearTimeout(timeoutId);
        setLoaded(true);
      }
    };
    refresh();

    return () => clearTimeout(timeoutId);
  }, []);

  return { trending, loaded };
}


