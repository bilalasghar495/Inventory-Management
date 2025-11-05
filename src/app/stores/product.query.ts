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


  isCacheValid( shortRange: number, longRange: number, futureDays: string ): boolean {
    const cacheParams = this.cacheParams;
    if ( !cacheParams ) {
      return false;
    }

    return (
      cacheParams.shortRange === shortRange &&
      cacheParams.longRange === longRange &&
      cacheParams.futureDays === futureDays &&
      this.products.length > 0
    );
  }
}

