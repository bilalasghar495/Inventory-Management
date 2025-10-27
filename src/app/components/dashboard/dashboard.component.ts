import { Component, inject, OnInit } from '@angular/core';

// Models
import { IProductDetailModel } from '../../models/product.model';

// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  readonly productService = inject( ProductDataService );
  readonly toastService   = inject( ToastService );
  products: IProductDetailModel[] = [];
  availableStock: number = 0;

  constructor() {}

  ngOnInit(): void {
    this.loadProductData();
  }

  loadProductData(): void {
    this.productService.getProducts().subscribe({
      next: (data: IProductDetailModel[]) => {
        this.products = data;
        this.calculateAvailableStock();
      },
      error: (error) => {
        this.toastService.error(error.message);
      }
    });
  }

  calculateAvailableStock(): void {
    this.availableStock = this.products.reduce((total, product) => {
      return total + (product.availableStock || 0);
    }, 0);
  }

}
