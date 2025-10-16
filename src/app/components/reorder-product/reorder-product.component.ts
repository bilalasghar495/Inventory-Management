import { Component, inject, OnInit } from '@angular/core';
import { ProductDataService } from '../../Services/product-data.service';
import { IProductDetailModel } from '../../models/product.model';

@Component({
  selector: 'app-reorder-product',
  templateUrl: './reorder-product.component.html',
  styleUrl: './reorder-product.component.scss'
})
export class ReorderProductComponent implements OnInit {
  readonly productDataService = inject( ProductDataService );
  readonly productId = [];
  products: IProductDetailModel[] = [];
  filteredProducts: IProductDetailModel[] = [];
  searchTerm: string = '';

  // productList = [
  //   {
  //     title: 'Product 1',
  //     variants: [{ inventory_quantity: 50 }],
  //     image: { src: 'assets/product1.png', alt: 'Product 1' },
  //     available: 30,
  //     on_hand: 20,
  //     type: 'Electronics',
  //     store: 'Store 1',
  //     amount: 100,
  //     project: 'Project A',
  //     status: 'Active'
  //   },
  //   {
  //     title: 'Product 2',
  //     variants: [{ inventory_quantity: 75 }],
  //     image: { src: 'assets/product2.png', alt: 'Product 2' },
  //     available: 50,
  //     on_hand: 25,
  //     type: 'Furniture',
  //     store: 'Store 2',
  //     amount: 200,
  //     project: 'Project B',
  //     status: 'Inactive'
  //   },
  //   {
  //     title: 'Product 3',
  //     variants: [{ inventory_quantity: 120 }],
  //     image: { src: 'assets/product3.png', alt: 'Product 3' },
  //     available: 80,
  //     on_hand: 40,
  //     type: 'Clothing',
  //     store: 'Store 3',
  //     amount: 150,
  //     project: 'Project C',
  //     status: 'Out of Stock'
  //   },
  //   {
  //     title: 'Product 4',
  //     variants: [{ inventory_quantity: 60 }],
  //     image: { src: 'assets/product4.png', alt: 'Product 4' },
  //     available: 45,
  //     on_hand: 15,
  //     type: 'Accessories',
  //     store: 'Store 4',
  //     amount: 50,
  //     project: 'Project D',
  //     status: 'Low Stock'
  //   }
  // ];


  constructor() { }

  ngOnInit(): void {
    this.fetchProductDetail();
  }

  // Fetch product detail
  private fetchProductDetail(): void {
    this.productDataService.getProducts().subscribe({
      next: ( data: IProductDetailModel[] ) => {
        this.products = data;
        console.log( data );
      },
      error: (error: any) => {
        this.showError(error.message);
      },
    });
  }


  getProductType(product: IProductDetailModel): string {
    // Return a type based on product status or use default
    return product.status === 'active' ? 'IE Project Items' : 'Standard Items';
  }


  private showError(message: string): void {
    console.error('Error:', message);
  }
}
