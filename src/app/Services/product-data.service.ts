import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';

// Models
import { IProductDetailModel, IProductApiResponse } from '../models/product.model';

// Environment
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    PRODUCTS: `${this.baseApiUrl}/restock-prediction?store=testapplica.myshopify.com&limit=250`
  };

  private headers = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true'
  });


  constructor( private http: HttpClient ) { }


  getProducts( rangeDays1: number = 7, rangeDays2: number = 30 ): Observable<IProductDetailModel[]> {
    const url = `${this.API_URLS.PRODUCTS}&rangeDays1=${rangeDays1}&rangeDays2=${rangeDays2}`;
  
    return this.http.get<IProductApiResponse[]>(url, { headers: this.headers }).pipe(
      map((res: IProductApiResponse[]) => {
        if (!Array.isArray(res)) return [];
  
        return res.map((product) => {
          const displayName =
            product.variantName && product.variantName !== 'Default Title'
              ? `${product.productName} - ${product.variantName}`
              : product.productName;
  
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