import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchAllProducts } from '../hooks/useProducts';
import DesktopHome from './DesktopHome';
import MobileHome from './MobileHome';

const Home = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch all products in the background when the user lands on the homepage
    queryClient.prefetchQuery({
      queryKey: ["products", "all"],
      queryFn: fetchAllProducts,
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? <MobileHome /> : <DesktopHome />;
};

export default Home;

