import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ProductStore } from './product.store';
import { ProductState, ProductCountResponse } from './product.state';
import { Observable } from 'rxjs';
import { IProductDetailModel } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductQuery extends Query<ProductState> {
  readonly products$: Observable<IProductDetailModel[]> = this.select((state) => state.products);
  readonly loading$ : Observable<boolean>               = this.select((state) => state.loading);
  readonly cacheParams$                                 = this.select((state) => state.cacheParams);
  readonly currentStatus$                               = this.select((state) => state.cacheParams?.status || 'ACTIVE');
  readonly totalProducts$: Observable<number | ProductCountResponse | { active: number | ProductCountResponse; draft: number | ProductCountResponse } | null> = this.select((state) => state.totalProducts);
  readonly totalProductsCacheParams$ = this.select((state) => state.totalProductsCacheParams);

  constructor( protected override store: ProductStore ) {
    super(store);
  }

  get products(): IProductDetailModel[] {
    return this.getValue().products;   
  }

  get loading(): boolean {
    return this.getValue().loading;
  }

  get cacheParams() {
    return this.getValue().cacheParams;
  }

  get currentStatus(): string {
    return this.getValue().cacheParams?.status ?? 'ACTIVE';
  }

  get totalProducts(): number | ProductCountResponse | { active: number | ProductCountResponse; draft: number | ProductCountResponse } | null {
    return this.getValue().totalProducts;
  }

  get totalProductsCacheParams() {
    return this.getValue().totalProductsCacheParams;
  }


  isCacheValid( shortRange: number, longRange: number, futureDays: string, status: string, storeUrl: string | null ): boolean {
    const cacheParams = this.cacheParams;
    if ( !cacheParams ) {
      return false;
    }

    // Check if store URL matches - invalidate cache if store changed
    if ( cacheParams.storeUrl !== storeUrl ) {
      return false;
    }

    return ( cacheParams.shortRange === shortRange && cacheParams.longRange === longRange && cacheParams.futureDays === futureDays && cacheParams.status === status && this.products.length > 0 );
  }

  isTotalProductsCacheValid( storeUrl: string | null, status: string | string[] ): boolean {
    const cacheParams = this.totalProductsCacheParams;
    if ( !cacheParams || !this.totalProducts ) {
      return false;
    }

    // Check if store URL matches - invalidate cache if store changed
    if ( cacheParams.storeUrl !== storeUrl ) {
      return false;
    }

    // Check if status matches
    if ( Array.isArray(status) ) {
      // For array status, check if cache also has array and they match
      if ( !Array.isArray(cacheParams.status) ) {
        return false;
      }
      // Check if both arrays have the same elements (order doesn't matter)
      const cacheStatusSet = new Set(cacheParams.status);
      const statusSet = new Set(status);
      if ( cacheStatusSet.size !== statusSet.size ) {
        return false;
      }
      return Array.from(cacheStatusSet).every(s => statusSet.has(s));
    } else {
      // For single status, check if cache has the same single status
      return cacheParams.status === status;
    }
  }


  updateProductRangeData( rangeData: IProductDetailModel[] ) {
    const products = [...this.products];

    products.forEach(product => {
      const matchingRangeData = rangeData.find( r => r.productId === product.productId && r.variantId === product.variantId );
      if ( matchingRangeData ) {
        product.totalSales = matchingRangeData.totalSales;
        product.soldPerDay = matchingRangeData.soldPerDay;
        product.recommendedRestock = matchingRangeData.recommendedRestock;
      }
    });
    this.store.update({ products: products });
  }
}

