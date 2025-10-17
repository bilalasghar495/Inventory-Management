import { Component, computed, inject, OnInit, signal } from '@angular/core';

// Services
import { ProductDataService } from '../../Services/product-data.service';

// Models
import { IProductDetailModel } from '../../models/product.model';

@Component({
  selector: 'app-reorder-product',
  templateUrl: './reorder-product.component.html',
  styleUrl: './reorder-product.component.scss'
})
export class ReorderProductComponent implements OnInit {
  readonly productDataService = inject( ProductDataService );

  readonly products           = signal<IProductDetailModel[]>([]);
  readonly filteredProducts   = signal<IProductDetailModel[]>([]);
  
  // Pagination properties (as signals)
  readonly currentPage  = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);
  readonly totalItems   = signal<number>(0);
  
  readonly paginatedProducts = computed(() => {
    const start = ( this.currentPage() - 1 ) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.products().slice(start, end);
  });

  searchTerm: string = '';
  

  constructor() { }


  ngOnInit(): void {
    this.fetchProductDetail();
  }


  // Fetch product detail
  private fetchProductDetail(): void {
    this.productDataService.getProducts().subscribe({
      next: ( data: IProductDetailModel[] ) => {
        this.products.set(data);
        this.totalItems.set( data.length );
        console.log( data );
      },
      error: (error: any) => {
        this.showError( error.message );
      },
    });
  }


  onPageChange( page: number ): void {
    this.currentPage.set( page );
  }


  onItemsPerPageChange( itemsPerPage: number ): void {
    this.itemsPerPage.set( itemsPerPage );
    this.currentPage.set(1);
  }


  private showError( message: string ): void {
    console.error('Error:', message);
  }
}
