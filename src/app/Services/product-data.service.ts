import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable, of, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

// Models
import { IProductDetailModel, IProductApiResponse } from '../models/product.model';

// Environment
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

// Akita Store
import { ProductStore } from '../stores/product.store';
import { ProductQuery } from '../stores/product.query';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {
  readonly userService  = inject(UserService);
  private readonly productStore = inject( ProductStore );
  private readonly productQuery = inject( ProductQuery );

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    PRODUCTS  : `${this.baseApiUrl}/restock-prediction`,
    CSV_EXPORT: `${this.baseApiUrl}/export/csv`
  };

  constructor( private http: HttpClient ) { }



  getProducts( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '30', forceRefresh: boolean = false ): Observable<IProductDetailModel[]> {
    // Check if we have valid cached data
    if ( !forceRefresh && this.productQuery.isCacheValid( rangeDays1, rangeDays2, futureDays ) ) {
      return of( this.productQuery.products );
    }

    // Update loading state
    this.productStore.update({ loading: true });

    // Fetch from API
    return this.fetchProductsFromApi( rangeDays1, rangeDays2, futureDays ).pipe(
      tap({
        next: ( products: IProductDetailModel[] ) => {
          this.productStore.update({ products, loading: false, cacheParams: { shortRange: rangeDays1, longRange: rangeDays2, futureDays },
          });
        },
        error: () => {
          this.productStore.update({ loading: false });
        },
      })
    );
  }


  private fetchProductsFromApi( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '30' ): Observable<IProductDetailModel[]> {
    const storeUrl = this.userService.getStoreUrl();
    const params = new HttpParams()
      .set('store', storeUrl ?? '')
      .set('rangeDays1', rangeDays1.toString())
      .set('rangeDays2', rangeDays2.toString())
      .set('futureDays', futureDays )
  
    return this.http.get<IProductApiResponse[]>(`${this.API_URLS.PRODUCTS}`, { 
      params: params 
    }).pipe(
      map((res: IProductApiResponse[]) => {
        console.log( 'product data', res );
        if (!Array.isArray(res)) return [];
  
        return res.map((product) => {
          const displayName =
            product.variantName && product.variantName !== 'Default Title' ? `${product.productName} - ${product.variantName}` : product.productName;
  
          return {
            productId                   : product.productId,
            productName                 : displayName,
            productImage                : product.productImage,
            variantId                   : product.variantId,
            variantName                 : product.variantName,
            availableStock              : product.availableStock,
            totalInventory              : product.totalInventory,
            incomingStock               : product.incomingStock,
            shortRangeSales             : product.shortRangeSales,
            longRangeSales              : product.longRangeSales,
            perDaySoldShortRange        : product.perDaySoldShortRange,
            perDaySoldLongRange         : product.perDaySoldLongRange,
            recommendedAverageStock     : product.recommendedAverageStock,
            recommendedRestockShortRange: product.recommendedRestockShortRange,
            recommendedRestockLongRange : product.recommendedRestockLongRange,
            urgencyLevel                : product.urgencyLevel,
            sku                         : product.sku,
          };
        });
      })
    );
  }


  refreshProducts( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '30' ): Observable<IProductDetailModel[]> {
    return this.getProducts( rangeDays1, rangeDays2, futureDays, true );
  }


  clearCache(): void {
    this.productStore.update({ products: [], cacheParams: null });
  }


  exportToCsv( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '30' ): Observable<Blob> {
    const storeUrl = this.userService.getStoreUrl();
    const body = {
      store     : storeUrl ?? '',
      limit     : '250',
      rangeDays1: rangeDays1.toString(),
      rangeDays2: rangeDays2.toString(),
      futureDays: futureDays
    };
    
    return this.http.post(`${this.API_URLS.CSV_EXPORT}`, body, {
      responseType: 'blob'
    }).pipe(
      map(( res: Blob ) => {
        return res;
      })
    );
  }
}