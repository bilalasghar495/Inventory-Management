import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Models
import { IProductDetailModel, IProductApiResponse } from '../models/product.model';

// Environment
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {
  readonly userService  = inject(UserService);

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    PRODUCTS: `${this.baseApiUrl}/restock-prediction`
  };

  constructor( private http: HttpClient ) { }


  getProducts( rangeDays1: number = 7, rangeDays2: number = 30 ): Observable<IProductDetailModel[]> {
    const storeUrl = this.userService.getStoreUrl();
    const params = new HttpParams()
      .set('store', storeUrl ?? '')
      .set('limit', '250')
      .set('rangeDays1', rangeDays1.toString())
      .set('rangeDays2', rangeDays2.toString());
  
    return this.http.get<IProductApiResponse[]>(`${this.API_URLS.PRODUCTS}`, { 
      params: params 
    }).pipe(
      map((res: IProductApiResponse[]) => {
        if (!Array.isArray(res)) return [];
  
        return res.map((product) => {
          const displayName =
            product.variantName && product.variantName !== 'Default Title' ? `${product.productName} - ${product.variantName}` : product.productName;
  
          return {
            productId: product.productId,
            productName: displayName,
            productImage: product.productImage,
            variantId: product.variantId,
            variantName: product.variantName,
            availableStock: product.availableStock,
            totalInventory: product.totalInventory,
            incomingStock: product.incomingStock,
            shortRangeSales: product.shortRangeSales,
            longRangeSales: product.longRangeSales,
            perDaySoldShortRange: product.perDaySoldShortRange,
            perDaySoldLongRange: product.perDaySoldLongRange,
            recommendedAverageStock: product.recommendedAverageStock,
            recommendedRestockShortRange: product.recommendedRestockShortRange,
            recommendedRestockLongRange: product.recommendedRestockLongRange,
          };
        });
      })
    );
  }
  
}