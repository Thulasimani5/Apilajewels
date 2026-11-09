import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * ScrollRestorationManager
 * Ensures browser default back/forward navigation restores the exact scroll position
 * and navigation history, while scrolling to top only on new page navigations ('PUSH').
 */
export default function ScrollRestorationManager() {
  const location = useLocation();
  const navType = useNavigationType();

  // Enable browser manual scroll restoration and manage positions in session storage
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const saveScrollPosition = () => {
      const key = `scroll_pos_${window.location.pathname}${window.location.search}`;
      sessionStorage.setItem(key, String(window.scrollY));
    };

    window.addEventListener('scroll', saveScrollPosition, { passive: true });
    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, []);

  useEffect(() => {
    const key = `scroll_pos_${location.pathname}${location.search}`;
    const savedY = sessionStorage.getItem(key);

    if (navType === 'POP' && savedY !== null) {
      // Small timeout to allow DOM/React render to settle
      requestAnimationFrame(() => {
        window.scrollTo(0, parseInt(savedY, 10) || 0);
      });
    } else if (navType === 'PUSH') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.search, navType]);

  return null;
}

