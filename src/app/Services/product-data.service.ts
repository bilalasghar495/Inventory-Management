import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of, pipe } from 'rxjs';
import { tap } from 'rxjs/operators';

// Models
import { IProductDetailModel, IProductApiResponse, IExportProductData } from '../models/product.model';

// Environment
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

// Akita Store
import { ProductStore } from '../stores/product.store';
import { ProductQuery } from '../stores/product.query';
import { ProductCountResponse } from '../stores/product.state';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {
  readonly userService          = inject( UserService );
  private readonly productStore = inject( ProductStore );
  private readonly productQuery = inject( ProductQuery );

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    PRODUCTS          : `${this.baseApiUrl}/restock-prediction`,
    PRODUCTS_BY_DATE  : `${this.baseApiUrl}/restock-prediction/range`,
    CSV_EXPORT        : `${this.baseApiUrl}/export/csv/specific-products`,
    GET_TOTAL_PRODUCTS: `${this.baseApiUrl}/products/total`,
  };

  constructor( private http: HttpClient ) { }



  getProducts( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '15', status: string = 'ACTIVE', forceRefresh: boolean = false ): Observable<IProductDetailModel[]> {
    const currentStoreUrl = this.userService.getStoreUrl();
    
    // Check if we have valid cached data and it's for the same store
    if ( !forceRefresh && this.productQuery.isCacheValid( rangeDays1, rangeDays2, futureDays, status, currentStoreUrl ) ) {
      return of( this.productQuery.products );
    }

    // Update loading state
    this.productStore.update({ loading: true });

    // Fetch from API
    return this.fetchProductsFromApi( rangeDays1, rangeDays2, futureDays, status ).pipe(
      tap({
        next: ( products: IProductDetailModel[] ) => {
          this.productStore.update({ products, loading: false, cacheParams: { shortRange: rangeDays1, longRange: rangeDays2, futureDays, status, storeUrl: currentStoreUrl },
          });
        },
        error: () => {
          this.productStore.update({ loading: false });
        },
      })
    );
  }


  private fetchProductsFromApi( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '15', status: string = 'ACTIVE' ): Observable<IProductDetailModel[]> {
    const storeUrl = this.userService.getStoreUrl();
    const params = new HttpParams()
      .set('store', storeUrl ?? '')
      .set('rangeDays1', rangeDays1.toString())
      .set('rangeDays2', rangeDays2.toString())
      .set('futureDays', futureDays )
      .set('status', status )
  
    return this.http.get<IProductApiResponse[]>(`${this.API_URLS.PRODUCTS}`, { 
      params: params 
    }).pipe(
      map((res: IProductApiResponse[]) => {
        console.log( 'product data', res );
        if (!Array.isArray(res)) return [];
  
        return res.map(( product ) => {
          const displayName =
            product.variantName && product.variantName !== 'Default Title' ? `${product.productName} - ${product.variantName}` : product.productName;
  
          return {
            productId                          : product.productId,
            productName                        : displayName,
            productImage                       : product.productImage,
            variantId                          : product.variantId,
            variantName                        : product.variantName,
            availableStock                     : product.availableStock,
            totalInventory                     : product.totalInventory,
            incomingStock                      : product.incomingStock,
            sevenDaysRangeSales                : product.sevenDaysRangeSales,
            fourteenDaysRangeSales             : product.fourteenDaysRangeSales,
            thirtyDaysRangeSales               : product.thirtyDaysRangeSales,
            
            perDaySoldSevenDaysRange           : product.perDaySoldSevenDaysRange,
            perDaySoldFourteenDaysRange        : product.perDaySoldFourteenDaysRange,
            perDaySoldThirtyDaysRange          : product.perDaySoldThirtyDaysRange,
            recommendedAverageStock            : product.recommendedAverageStock,

            recommendedRestockSevenDaysRange   : product.recommendedRestockSevenDaysRange,
            recommendedRestockFourteenDaysRange: product.recommendedRestockFourteenDaysRange,
            recommendedRestockThirtyDaysRange  : product.recommendedRestockThirtyDaysRange,

            totalSales                         : product.totalSales,
            soldPerDay                         : product.soldPerDay,
            recommendedRestock                 : product.recommendedRestock,
            
            urgencyLevel                       : product.urgencyLevel,
            sku                                : product.sku,
            status                             : product.status,
          };
        });
      })
    );
  }


  getTotalProducts( storeUrl: string, status: string | string[] = 'ACTIVE', forceRefresh: boolean = false ): Observable<number | ProductCountResponse | { active: number | ProductCountResponse; draft: number | ProductCountResponse }> {
    // Check if we have valid cached data and it's for the same store and status
    if ( !forceRefresh && this.productQuery.isTotalProductsCacheValid( storeUrl, status ) ) {
      return of( this.productQuery.totalProducts! );
    }

    // If status is an array, fetch totals for all statuses in parallel and return separately
    if ( Array.isArray(status) ) {
      const activeRequest = this.http.get<number | ProductCountResponse>(`${this.API_URLS.GET_TOTAL_PRODUCTS}?store=${storeUrl}&status=ACTIVE`);
      const draftRequest = this.http.get<number | ProductCountResponse>(`${this.API_URLS.GET_TOTAL_PRODUCTS}?store=${storeUrl}&status=DRAFT`);
      
      return forkJoin({
        active: activeRequest,
        draft: draftRequest
      }).pipe( tap({
          next: ( data: { active: number | ProductCountResponse; draft: number | ProductCountResponse } ) => {
            this.productStore.update({ 
              totalProducts: data, 
              totalProductsCacheParams: { storeUrl, status } 
            });
          }
        })
      );
    }
    
    // Single status - original behavior
    return this.http.get<number | ProductCountResponse>(`${this.API_URLS.GET_TOTAL_PRODUCTS}?store=${storeUrl}&status=${status}`).pipe(
      tap({
        next: ( data: number | ProductCountResponse ) => {
          this.productStore.update({ 
            totalProducts: data, 
            totalProductsCacheParams: { storeUrl, status } 
          });
        }
      })
    );
  }


  refreshProducts( rangeDays1: number = 7, rangeDays2: number = 30, futureDays: string = '15', status: string = 'ACTIVE' ): Observable<IProductDetailModel[]> {
    return this.getProducts( rangeDays1, rangeDays2, futureDays, status, true );
  }


  clearCache(): void {
    this.productStore.update({ products: [], cacheParams: null, totalProducts: null, totalProductsCacheParams: null });
  }


  exportProductsData( products: IExportProductData[] ): Observable<Blob> {
    // Send only the products array
    return this.http.post(`${this.API_URLS.CSV_EXPORT}`, products, {
      responseType: 'blob'
    }).pipe(
      map(( res: Blob ) => {
        return res;
      })
    );
  }


  getProductsByDateRange( storeUrl: string, startDate: string, endDate: string, futureDays: string = '15', status: string = 'active' ): Observable<IProductDetailModel[]> {
    const params = new HttpParams()
      .set('store', storeUrl)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('futureDays', futureDays)
      .set('status', status);

    return this.http.get<IProductApiResponse[]>(`${this.API_URLS.PRODUCTS_BY_DATE}`, {
      params: params
    }).pipe(
      map((res: IProductApiResponse[]) => {
        console.log('product data by date range', res);
        if (!Array.isArray(res)) return [];

        const rangeData = res.map((product) => {
          const displayName =
            product.variantName && product.variantName !== 'Default Title' ? `${product.productName} - ${product.variantName}` : product.productName;

          return {
            productId                          : product.productId,
            productName                        : displayName,
            variantId                          : product.variantId,
            variantName                        : product.variantName,
            totalSales                         : product.totalSales,
            soldPerDay                         : product.soldPerDay,
            recommendedRestock                 : product.recommendedRestock,
            sku                                : product.sku, 
          } as IProductDetailModel;
        });

        this.productQuery.updateProductRangeData( rangeData );
        console.log('product data by date range', this.productQuery.products);
        return this.productQuery.products;
      })
    );
  }
}