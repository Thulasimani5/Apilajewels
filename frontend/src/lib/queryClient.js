import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       // Data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000,          // Keep unused data in cache for 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,      // No refetch when user tabs back
    },
  },
});
