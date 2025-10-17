import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { IProductDetailModel, IProductApiResponse } from '../models/product.model';
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
    return this.http.get<IProductApiResponse[]>(this.API_URLS.PRODUCTS, { headers: this.headers }).pipe(
      map( ( res: IProductApiResponse[] ) => {
        if ( !Array.isArray(res) ) return [];

        const ProductList: IProductDetailModel[] = [];

        res.forEach( ( product ) => {
          product.variants?.forEach( ( variant ) => {
            // Use variant's imageSrc if available, otherwise fall back to product's imageUrl
            const variantImage = variant.imageSrc || product.imageUrl;
            
            // Only append variant title if it's not "Default Title"
            const productTitle = variant.title && variant.title !== 'Default Title' ? `${product.title} - ${variant.title}` : product.title;
            
            ProductList.push({
              id: variant.id,
              title: productTitle,
              productType: product.productType,
              status: product.status,
              image: variantImage,
              variantTitle: variant.title,
              price: variant.price,
              sku: variant.sku,
              inventoryQuantity: variant.inventoryQuantity,
              oldInventoryQuantity: variant.oldInventoryQuantity
            });
          });
        });

        return ProductList;
      })
    );
  }


}