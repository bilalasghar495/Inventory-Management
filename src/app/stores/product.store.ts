import { Injectable } from '@angular/core';
import { Store, StoreConfig } from '@datorama/akita';
import { ProductState, createInitialState } from './product.state';

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'product' })
export class ProductStore extends Store<ProductState> {
  constructor() {
    super(createInitialState());
  }
}

