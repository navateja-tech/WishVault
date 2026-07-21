import { api } from '@/services/api';

export interface CollectionItem {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  sort_order: number;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionInput {
  name: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export interface UpdateCollectionInput {
  name?: string;
  icon?: string;
  color?: string;
  sort_order?: number;
}

export const collectionsApi = {
  list: async (): Promise<CollectionItem[]> => {
    return await api.get('/collections');
  },

  getById: async (id: string): Promise<CollectionItem> => {
    return await api.get(`/collections/${id}`);
  },

  create: async (data: CreateCollectionInput): Promise<CollectionItem> => {
    return await api.post('/collections', data);
  },

  update: async (id: string, data: UpdateCollectionInput): Promise<CollectionItem> => {
    return await api.patch(`/collections/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await api.delete(`/collections/${id}`);
  },
};
