import { IProductDetailModel } from '../models/product.model';

export interface ProductCountResponse {
  count: number;
  precision: string;
}

export interface ProductState {
  products: IProductDetailModel[];
  loading: boolean;
  cacheParams: { shortRange: number; longRange: number; futureDays: string; status: string; storeUrl: string | null } | null;
  totalProducts: number | ProductCountResponse | { active: number | ProductCountResponse; draft: number | ProductCountResponse } | null;
  totalProductsCacheParams: { storeUrl: string | null; status: string | string[] } | null;
}

export function createInitialState(): ProductState {
  return { 
    products: [], 
    loading: false, 
    cacheParams: null,
    totalProducts: null,
    totalProductsCacheParams: null
  };
}

