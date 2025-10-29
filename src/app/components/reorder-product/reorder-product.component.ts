import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

// Services
import { ProductDataService } from '../../Services/product-data.service';

// Models
import { IProductDetailModel } from '../../models/product.model';
import { ToastService } from '../../Services/toast.service';
import { WebsocketService } from '../../Services/websocket.service';

@Component({
  selector: 'app-reorder-product',
  templateUrl: './reorder-product.component.html',
  styleUrl: './reorder-product.component.scss'
})
export class ReorderProductComponent implements OnInit, OnDestroy {
  readonly productDataService = inject( ProductDataService );
  readonly toastService       = inject( ToastService );
  readonly websocketService   = inject( WebsocketService );
  
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
  
  private destroy$ = new Subject<void>();

  constructor() { }


  ngOnInit(): void {
    this.fetchProductDetail();
    
    merge(
      this.websocketService.listen('orderCreated'),
      this.websocketService.listen('productUpdated')
    )
    .pipe(
      debounceTime(500), // Wait 500ms after last event before refreshing
      takeUntil(this.destroy$) // Unsubscribe when component is destroyed
    )
    .subscribe(( data ) => {
      this.fetchProductDetail();
    });
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


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
