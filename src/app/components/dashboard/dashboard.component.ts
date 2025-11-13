import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

// Models
import { IProductDetailModel } from '../../models/product.model';

// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';
import { ProductQuery } from '../../stores/product.query';
import { UserService } from '../../Services/user-service';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly productService = inject( ProductDataService );
  readonly toastService   = inject( ToastService );
  readonly productQuery   = inject( ProductQuery );
  readonly userService    = inject( UserService );
  
  // Convert observable to signal
  readonly products = toSignal( this.productQuery.products$, { initialValue: [] as IProductDetailModel[] } );
  readonly totalProducts = toSignal( this.productQuery.totalProducts$, { initialValue: null as number | { count: number; precision: string } | { active: number | { count: number; precision: string }; draft: number | { count: number; precision: string } } | null } );
  
  // Track if we're currently fetching to prevent duplicate requests
  private readonly isFetching = signal( false );
  private readonly isFetchingTotalProducts = signal( false );

  readonly activeProducts = signal( 0 );
  readonly draftProducts = signal( 0 );
  
  // Computed signal for available stock
  readonly availableStock = computed( () => {
    return this.products().reduce(( total, product ) => {
      return total + ( product.availableStock );
    }, 0);
  });

  readonly currentStatus = computed(() => {
    return this.productQuery.currentStatus;
  });


  constructor() {

    effect(() => {
      const currentProducts = this.products();
      const currentStatus   = this.productQuery.currentStatus;
      
      // Only fetch if store is empty and we're not already fetching
      if ( ( !currentProducts || currentProducts.length === 0 ) && ( !this.isFetching() ) ) {
        this.isFetching.set(true);
        this.productService.getProducts( 7, 30, '15', currentStatus ).subscribe({
          next: () => {
            // Data is automatically synced via store - no manual assignment needed
            this.isFetching.set( false );
          },
          error: ( error ) => {
            this.toastService.error( error.message );
            this.isFetching.set( false );
          }
        });
      }
    });
    
    // Effect to sync total products from store to component signals
    effect(() => {
      const totalProductsData = this.totalProducts();
      if ( totalProductsData && typeof totalProductsData === 'object' ) {
        // Check if it has 'active' and 'draft' properties (multi-status response)
        if ( 'active' in totalProductsData && 'draft' in totalProductsData ) {
          // Handle both direct number format and object format { count: number, precision: string }
          const activeCount = typeof totalProductsData.active === 'object' && totalProductsData.active !== null && 'count' in totalProductsData.active 
            ? totalProductsData.active.count 
            : totalProductsData.active as number;
          const draftCount = typeof totalProductsData.draft === 'object' && totalProductsData.draft !== null && 'count' in totalProductsData.draft 
            ? totalProductsData.draft.count 
            : totalProductsData.draft as number;
          
          this.activeProducts.set( activeCount );
          this.draftProducts.set( draftCount );
        }
      }
    });

    // Effect to fetch total products if not cached
    effect(() => {
      const storeUrl = this.userService.getStoreUrl();
      const totalProductsData = this.totalProducts();
      
      // Only fetch if data is not cached and we're not already fetching
      if ( !totalProductsData && !this.isFetchingTotalProducts() && storeUrl ) {
        this.isFetchingTotalProducts.set( true );
        this.getTotalProducts();
      }
    });
  }


  getTotalProducts(): void {
    this.productService.getTotalProducts( this.userService.getStoreUrl() ?? '', ['ACTIVE', 'DRAFT'] ).subscribe({
      next: () => {
        console.log( 'Total products', this.totalProducts() );
        // Data is automatically synced via store - no manual assignment needed
        this.isFetchingTotalProducts.set( false );
      },
      error: ( error: any ) => {
        this.toastService.error( error.message );
        this.isFetchingTotalProducts.set( false );
      }
    });
  }
}