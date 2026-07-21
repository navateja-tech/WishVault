import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi, CreateCollectionInput, UpdateCollectionInput } from '../api/collectionsApi';

export const COLLECTIONS_QUERY_KEY = ['collections'];

export function useCollectionsQuery() {
  return useQuery({
    queryKey: COLLECTIONS_QUERY_KEY,
    queryFn: () => collectionsApi.list(),
  });
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCollectionInput) => collectionsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCollectionInput }) =>
      collectionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => collectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTIONS_QUERY_KEY });
    },
  });
}
