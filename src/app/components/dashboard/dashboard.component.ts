import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

// Models
import { IProductDetailModel } from '../../models/product.model';

// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';
import { ProductQuery } from '../../stores/product.query';

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
  
  // Convert observable to signal
  readonly products = toSignal( this.productQuery.products$, { initialValue: [] as IProductDetailModel[] } );
  
  // Track if we're currently fetching to prevent duplicate requests
  private readonly isFetching = signal( false );
  
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
  }
}