import { useQuery, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../config/api";

export const fetchProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/api/jewellery/${id}`);
  if (!response.ok) throw new Error("Failed to load product");
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to load product");
  return result.data;
};

export const useProduct = (id) => {
  const queryClient = useQueryClient();

  // Phase 10: Check if the product already exists in the all-products cache
  const cachedProducts = queryClient.getQueryData(["products", "all"]);
  const cachedProduct = cachedProducts?.data?.find((p) => p._id === id);

  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    // Use cached list data as instant placeholder — no spinner
    initialData: cachedProduct,
    initialDataUpdatedAt: cachedProduct ? Date.now() - 1000 : undefined,
  });
};
