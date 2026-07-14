import { useQuery } from "@tanstack/react-query";
import API_BASE_URL from "../config/api";

// Fetcher for paginated product listing
export const fetchProducts = async ({ page = 1, limit = 24 } = {}) => {
  const response = await fetch(
    `${API_BASE_URL}/api/jewellery?page=${page}&limit=${limit}`
  );
  if (!response.ok) throw new Error("Failed to load products");
  return response.json();
};

// Fetcher for ALL products (used when filters are needed client-side)
export const fetchAllProducts = async () => {
  const response = await fetch(
    `${API_BASE_URL}/api/jewellery?limit=500`
  );
  if (!response.ok) throw new Error("Failed to load products");
  const data = await response.json();
  if (data && Array.isArray(data.data)) {
    // Shuffle the products client-side once upon fetch so they are stored in a randomized order in cache
    const shuffled = [...data.data];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    data.data = shuffled;
  }
  return data;
};

export const useProducts = ({ page = 1, limit = 24 } = {}) => {
  return useQuery({
    queryKey: ["products", page, limit],
    queryFn: () => fetchProducts({ page, limit }),
    placeholderData: (previousData) => previousData, // keep old data while new page loads
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for all products (for the full filtered shop page)
export const useAllProducts = () => {
  return useQuery({
    queryKey: ["products", "all"],
    queryFn: fetchAllProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
