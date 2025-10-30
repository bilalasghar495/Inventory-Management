import { Component, computed, inject, OnInit, signal } from '@angular/core';

// Services
import { ProductDataService } from '../../Services/product-data.service';

// Models
import { IProductDetailModel } from '../../models/product.model';
import { ToastService } from '../../Services/toast.service';
import { WebsocketService } from '../../Services/websocket.service';
import { UserService } from '../../Services/user-service';

@Component({
  selector: 'app-reorder-product',
  templateUrl: './reorder-product.component.html',
  styleUrl: './reorder-product.component.scss'
})
export class ReorderProductComponent implements OnInit {
  readonly productDataService = inject( ProductDataService );
  readonly toastService       = inject( ToastService );
  readonly websocketService   = inject( WebsocketService );
  readonly userService        = inject( UserService );
  
  readonly products           = signal<IProductDetailModel[]>([]);
  readonly filteredProducts   = signal<IProductDetailModel[]>([]);
  readonly isSkeletonLoading  = signal<boolean>(false);
  
  // Pagination properties (as signals)
  readonly currentPage  = signal<number>(1);
  readonly itemsPerPage = signal<number>(10);
  readonly totalItems   = signal<number>(0);

  shortRange = signal<number>(7);
  longRange = signal<number>(30);
  
  readonly paginatedProducts = computed(() => {
    const start = ( this.currentPage() - 1 ) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.products().slice(start, end);
  });

  searchTerm: string = '';
  

  constructor() { }


  ngOnInit(): void {
    this.fetchProductDetail();
    this.fetchShopData();
  }


  onShortRangeChange( value: string ): void {
    this.shortRange.set(+value);
    this.fetchProductDetail();
  }
  

  onLongRangeChange(value: string): void {
    this.longRange.set(+value);
    this.fetchProductDetail();
  }


  // Fetch product detail
  private fetchProductDetail(): void {
    const shortRangeDays = this.shortRange();
    const longRangeDays = this.longRange();

    this.isSkeletonLoading.set(true);

    this.productDataService.getProducts( shortRangeDays, longRangeDays ).subscribe({
      next: (data: IProductDetailModel[]) => {
        this.products.set( data );
        this.totalItems.set( data.length );
        this.isSkeletonLoading.set(false);
      },
      error: (error: any) => {
        this.showError( error.message );
        this.isSkeletonLoading.set( false );
      },
    });
  }


  private fetchShopData(): void {
    const shop = this.userService.getStoreUrl();
    this.userService.getShopData( shop ?? '' ).subscribe({
      next: (data: any) => {
        
        // Connect WebSocket with the shopDomain from the API response
        if ( data?.shopDomain ) {
          this.websocketService.connect( data.shopDomain );
          
          // Set up WebSocket event listeners after connection
          this.websocketService.listen('orderCreated').subscribe(( orderData ) => {
            this.fetchProductDetail();
          });

          this.websocketService.listen('productUpdated').subscribe(( productData ) => {
            this.fetchProductDetail();
          });
        }
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
    this.toastService.error( message );
  }
}
