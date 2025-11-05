import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { IProductDetailModel } from '../../models/product.model';

// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
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
    // Load data - will use cache if valid for current store, otherwise fetch fresh
    this.loadProductData();
  }

  loadProductData( forceRefresh: boolean = false ): void {
    this.productService.getProducts( 7, 30, '15', forceRefresh ).subscribe({
      next: ( data: IProductDetailModel[] ) => {
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
