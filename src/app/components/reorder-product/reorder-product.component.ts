import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';
import { UserService } from '../../Services/user-service';
import { WebsocketService } from '../../Services/websocket.service';

// Models
import { IProductDetailModel, IShopDataModel } from '../../models/product.model';

// RxJS
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Enums
import { UrgencyLevelEnum } from '../../shared/enums/enum';

@Component({
  selector: 'app-reorder-product',
  templateUrl: './reorder-product.component.html',
  styleUrl: './reorder-product.component.scss'
})
export class ReorderProductComponent implements OnInit {
  readonly productDataService = inject( ProductDataService );
  readonly toastService       = inject( ToastService );
  readonly snackBar           = inject( MatSnackBar );
  readonly websocketService   = inject( WebsocketService );
  readonly userService        = inject( UserService );
  readonly router             = inject( Router );
  
  readonly products          = signal<IProductDetailModel[]>([]);
  readonly isSkeletonLoading = signal<boolean>(false);
  readonly urgencyLevel      = signal<UrgencyLevelEnum | null>(null);
  readonly searchTerm        = signal<string>('');
  
  // Pagination properties (as signals)
  readonly currentPage  = signal<number>(1);
  readonly itemsPerPage = signal<number>(50);
  readonly totalItems   = signal<number>(0);

  readonly shortRange   = signal<number>(7);
  readonly longRange    = signal<number>(30);
  readonly futureDays   = signal<string>('30');
  
  private readonly searchTermSubject = new Subject<string>();

  // Filtered products based on search term and urgency level
  readonly filteredProducts = computed( () => {
    const search = this.searchTerm().toLowerCase().trim();
    const urgencyLevel = this.urgencyLevel();
    
    let filtered = this.products();
    
    // Filter by urgency level if selected
    if ( urgencyLevel ) {
      filtered = filtered.filter( product => {
        // Case-insensitive comparison and handle null/undefined
        return product.urgencyLevel && product.urgencyLevel.toUpperCase() === urgencyLevel.toUpperCase();
      });
    }
    
    // Filter by search term if provided
    if ( search ) {
      filtered = filtered.filter( product => {
        const matchesName = product.productName.toLowerCase().includes( search );
        const matchesUrgency = product.urgencyLevel?.toLowerCase().includes( search );
        return matchesName || matchesUrgency;
      });
    }
    
    return filtered;
  });
  
  readonly paginatedProducts = computed(() => {
    const start = ( this.currentPage() - 1 ) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.filteredProducts().slice(start, end);
  });
  
  readonly totalFilteredItems = computed(() => this.filteredProducts().length);
  

  constructor() { }


  ngOnInit(): void {
    this.fetchProductDetail();
    this.fetchShopData();

    // Debounce the search term to prevent multiple requests
    this.searchTermSubject.pipe( debounceTime(300), distinctUntilChanged() ).subscribe(( searchValue ) => {
        this.onSearchChange( searchValue );
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
  public fetchProductDetail(): void {
    const shortRangeDays = this.shortRange();
    const longRangeDays  = this.longRange();
    const futureDays     = this.futureDays();

    this.isSkeletonLoading.set(true);

    this.productDataService.getProducts( shortRangeDays, longRangeDays, futureDays ).subscribe({
      next: ( data: IProductDetailModel[] ) => {
        console.log( data );
        this.products.set( data );
        this.totalItems.set( data.length );
        this.isSkeletonLoading.set( false );
      },
      error: (error: any) => {
        this.showError( error.message );
        this.isSkeletonLoading.set( false );
      },
    });
  }


  public exportToCsv(): void {
    const shortRangeDays = this.shortRange();
    const longRangeDays  = this.longRange();
    const futureDays     = this.futureDays();

    this.productDataService.exportToCsv( shortRangeDays, longRangeDays, futureDays ).subscribe({
      next: ( blob: Blob ) => {
        // Create a download link and trigger it
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventory-export-${new Date().getTime()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.showSnackbar( 'CSV Exported Successfully' );
      },
      error: ( error: any ) => {
        console.log( error );
        this.showError( error.message || 'Failed to export CSV' );
      },
    });
  }


  private fetchShopData(): void {
    const shop = this.userService.getStoreUrl();
    this.userService.getShopData( shop ?? '' ).subscribe({
      next: ( data: IShopDataModel ) => {
        
        // Connect WebSocket with the shopDomain from the API response
        if ( data?.shopDomain ) {
          this.websocketService.connect( data.shopDomain );
          
          // Set up WebSocket event listeners after connection
          this.websocketService.listen('orderCreated').subscribe(( productData ) => {
            const productName = productData?.title || productData?.name || 'Unknown Product';
            this.showSnackbar(`${productName} Order Created Successfully`);
            // this.fetchProductDetail();
          });

          this.websocketService.listen('productUpdated').subscribe(( productData ) => {
            const productName = productData?.title || productData?.name || 'Unknown Product';
            this.showSnackbar(`${productName} Product Updated Successfully`);
            // this.fetchProductDetail();
          });

          this.websocketService.listen('appUninstalled').subscribe(() => {
            this.router.navigate(['/register-store'], { queryParams: { uninstalled: 'true' } });
          });
        }
      },
      error: (error: any) => {
        this.showError( error.message );
      },
    });
  }


  onUrgencyLevelChange( value: string ): void {
    if (value === '') {
      this.urgencyLevel.set(null);
    } else {
      this.urgencyLevel.set( value as UrgencyLevelEnum );
    }
    // Reset to first page when filter changes
    this.currentPage.set(1);
  }


  onPageChange( page: number ): void {
    this.currentPage.set( page );
  }


  onItemsPerPageChange( itemsPerPage: number ): void {
    this.itemsPerPage.set( itemsPerPage );
    this.currentPage.set(1);
  }


  onSearchChange( searchValue: string ): void {
    this.searchTerm.set( searchValue );
    this.currentPage.set(1);
  }


  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTermSubject.next(input.value);
  }


  private showError( message: string ): void {
    this.toastService.error( message );
  }


  private showSnackbar( message: string ): void {
    this.snackBar.open( message, 'Dismiss', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  getUrgencyTooltip( urgencyLevel: string | null | undefined ): string {
    
    switch ( urgencyLevel?.toUpperCase() ) {
      case 'LOW':
        return 'Sufficient stock, no immediate restock needed.';
      case 'MEDIUM':
        return 'Restock in the near future.';
      case 'HIGH':
        return 'Restock soon to avoid shortage.';
      case 'CRITICAL':
        return 'Your average recommended stock is below the critical leve.';
      default:
        return 'No urgency level found.';
    }
  }
}
