import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, SaveProductInput, ExtractProductInput } from '../api/productsApi';
import { COLLECTIONS_QUERY_KEY } from '@/features/collections/hooks/useCollections';

export const PRODUCTS_QUERY_KEY = ['products'];

export function useProductsQuery(collectionId?: string) {
  return useQuery({
    queryKey: collectionId ? [...PRODUCTS_QUERY_KEY, collectionId] : PRODUCTS_QUERY_KEY,
    queryFn: () => productsApi.list(collectionId),
  });
}

export function useExtractProductMutation() {
  return useMutation({
    mutationFn: (data: ExtractProductInput) => productsApi.extract(data),
  });
}

export function useSaveProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveProductInput) => productsApi.create(data),
    onSuccess: (_, variables) => {
      // Invalidate both main products list and collection list counts
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
      if (variables.collection_id) {
        queryClient.invalidateQueries({ queryKey: [...PRODUCTS_QUERY_KEY, variables.collection_id] });
      }
    },
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}
