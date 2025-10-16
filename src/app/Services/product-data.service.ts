import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IProductDetailModel } from '../models/product.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductDataService {

	protected baseApiUrl : string = `${environment.apiUrl}`;
  
  // API URLS
  readonly API_URLS = {
    PRODUCTS: `${this.baseApiUrl}/products?store=testapplica.myshopify.com&limit=250`
  };

  private headers = new HttpHeaders({
    'ngrok-skip-browser-warning': 'true'
  });


  constructor( private http: HttpClient ) { }


  getProducts(): Observable<IProductDetailModel[]> {
    return this.http.get<any>(`${this.API_URLS.PRODUCTS}`, { 
      headers: this.headers 
    }).pipe( 
      map( res => {
        // Check if response has a products property and it's an array
        if (res?.products && Array.isArray(res.products)) {
          return res.products;
        }
        return [];
      })
    );
  }


}