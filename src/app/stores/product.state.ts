import { IProductDetailModel } from '../models/product.model';

export interface ProductState {
  products: IProductDetailModel[];
  loading: boolean;
  cacheParams: { shortRange: number; longRange: number; futureDays: string } | null;
}

export function createInitialState(): ProductState {
  return { products: [], loading: false, cacheParams: null };
}

