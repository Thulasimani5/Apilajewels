import { useQuery, useQueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../config/api";

export const fetchProduct = async (id) => {
  // First attempt from jewellery collection
  try {
    const response = await fetch(`${API_BASE_URL}/api/jewellery/${id}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (e) {
    // proceed to fallback
  }

  // Fallback to sale jewellery endpoint
  try {
    const saleResponse = await fetch(`${API_BASE_URL}/api/sales/${id}`);
    if (saleResponse.ok) {
      const saleResult = await saleResponse.json();
      if (saleResult.success && saleResult.data) {
        return {
          ...saleResult.data,
          isSale: true,
          salesAmount: saleResult.data.discountedRate || saleResult.data.salesPrice,
          price: saleResult.data.discountedRate || saleResult.data.salesPrice,
          rentalPrice: saleResult.data.discountedRate || saleResult.data.salesPrice,
        };
      }
    }
  } catch (e) {
    // throw below
  }

  throw new Error("Failed to load product");
};

export const useProduct = (id) => {
  const queryClient = useQueryClient();

  // Check if the product already exists in the all-products cache
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
