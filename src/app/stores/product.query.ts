import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ProductStore } from './product.store';
import { ProductState } from './product.state';
import { Observable } from 'rxjs';
import { IProductDetailModel } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductQuery extends Query<ProductState> {
  readonly products$: Observable<IProductDetailModel[]> = this.select((state) => state.products);
  readonly loading$ : Observable<boolean>               = this.select((state) => state.loading);
  readonly cacheParams$                                 = this.select((state) => state.cacheParams);
  readonly currentStatus$                               = this.select((state) => state.cacheParams?.status || 'ACTIVE');

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

