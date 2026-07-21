import { api } from '@/services/api';

export interface ProductItem {
  id: string;
  user_id: string;
  collection_id: string | null;
  title: string;
  url: string;
  image_url: string | null;
  website: string | null;
  domain: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ExtractProductInput {
  url: string;
}

export interface ExtractProductResponse {
  title: string;
  url: string;
  image_url: string | null;
  website: string | null;
  domain: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
}

export interface SaveProductInput {
  collection_id: string | null;
  title: string;
  url: string;
  image_url: string | null;
  website: string | null;
  domain: string | null;
  price: number | null;
  currency: string | null;
  description: string | null;
  notes: string | null;
  raw_metadata?: Record<string, any>;
}

export const productsApi = {
  extract: async (data: ExtractProductInput): Promise<ExtractProductResponse> => {
    return await api.post('/products/extract', data);
  },

  list: async (collectionId?: string): Promise<ProductItem[]> => {
    const path = collectionId ? `/products?collection_id=${collectionId}` : '/products';
    return await api.get(path);
  },

  getById: async (id: string): Promise<ProductItem> => {
    return await api.get(`/products/${id}`);
  },

  create: async (data: SaveProductInput): Promise<ProductItem> => {
    return await api.post('/products', data);
  },

  update: async (id: string, data: { notes?: string | null; collection_id?: string | null }): Promise<ProductItem> => {
    return await api.patch(`/products/${id}`, data);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    return await api.delete(`/products/${id}`);
  },
};
