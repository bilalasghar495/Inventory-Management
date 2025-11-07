import { Component, computed, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';
import { UserService } from '../../Services/user-service';
import { WebsocketService } from '../../Services/websocket.service';

// Akita Store
import { ProductQuery } from '../../stores/product.query';

// Models
import { IProductDetailModel, IShopDataModel } from '../../models/product.model';

// RxJS
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Enums
import { UrgencyLevelEnum } from '../../shared/enums/enum';

@Component({
  standalone: true,
  selector: 'app-reorder-product',
  imports: [CommonModule, MatTooltipModule, MatSnackBarModule, PaginationComponent],
  templateUrl: './reorder-product.component.html',
  styleUrl: './reorder-product.component.scss'
})
export class ReorderProductComponent implements OnInit, OnDestroy {
  readonly productDataService = inject( ProductDataService );
  readonly productQuery       = inject( ProductQuery );
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
  readonly futureDays   = signal<string>('15');

  readonly sortColumn    = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  private readonly searchTermSubject = new Subject<string>();
  private readonly destroy$          = new Subject<void>();

  // Filtered products based on search term and urgency level
  readonly filteredProducts = computed( () => {
    const search        = this.searchTerm().toLowerCase().trim();
    const urgencyLevel  = this.urgencyLevel();

    const sortColumn    = this.sortColumn();
    const sortDirection = this.sortDirection();


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
        const matchesName    = product.productName.toLowerCase().includes( search );
        // const matchesUrgency = product.urgencyLevel?.toLowerCase().includes( search );
        const matchesSku     = product.sku?.toLowerCase().includes( search );

        return matchesName || matchesSku;
      });
    }
    
    // Sort by column if provided
    if ( sortColumn && sortDirection ) {
      filtered = [...filtered].sort( ( a, b ) => {
        let aValue: any;
        let bValue: any;
        
        if ( sortColumn === 'productName' ) {
          aValue = a.productName?.toLowerCase() || '';
          bValue = b.productName?.toLowerCase() || '';
        }
        
        if ( aValue < bValue ) {
          return sortDirection === 'asc' ? -1 : 1;
        }
        if ( aValue > bValue ) {
          return sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
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
  

  constructor() {}

  ngOnInit(): void {
    // Subscribe to Akita store products
    this.productQuery.products$.pipe(takeUntil(this.destroy$)).subscribe( ( products ) => {
        this.products.set( products );
        this.totalItems.set( products.length );
      });

    // Subscribe to Akita store loading state
    this.productQuery.loading$.pipe(takeUntil(this.destroy$)).subscribe( ( loading ) => {
        this.isSkeletonLoading.set( loading );
    });

    // Debounce the search term to prevent multiple requests
    this.searchTermSubject.pipe( debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$) ).subscribe(( searchValue: string ) => {
        this.onSearchChange( searchValue );
    });

    // Fetch product detail (will use cache if available)
    this.fetchProductDetail();
    this.fetchShopData();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  onSort( column: string ): void {
    const currentColumn    = this.sortColumn();
    const currentDirection = this.sortDirection();
    
    if ( currentColumn === column ) {
      // Toggle direction: asc -> desc -> null
      if ( currentDirection === 'asc' ) {
        this.sortDirection.set( 'desc' );
      } else if ( currentDirection === 'desc' ) {
        this.sortColumn.set( null );
        this.sortDirection.set( 'asc' );
      }
    } else {
      // New column, start with ascending
      this.sortColumn.set( column );
      this.sortDirection.set( 'asc' );
    }
    
    // Reset to first page when sorting changes
    this.currentPage.set( 1 );
  }


  // onShortRangeChange( value: string ): void {
  //   this.shortRange.set(+value);
  //   this.fetchProductDetail( true );
  // }
  

  // onLongRangeChange(value: string): void {
  //   this.longRange.set(+value);
  //   this.fetchProductDetail( true );
  // }


  // Fetch product detail
  public fetchProductDetail( forceRefresh: boolean = false ): void {
    const shortRangeDays = this.shortRange();
    const longRangeDays  = this.longRange();
    const futureDays     = this.futureDays();

    this.productDataService.getProducts( shortRangeDays, longRangeDays, futureDays, forceRefresh ).pipe(takeUntil(this.destroy$) ).subscribe({
        next: (data: IProductDetailModel[]) => {
          console.log('Product data loaded', data);
          // Data is automatically synced via store subscription
        },
        error: (error: any) => {
          this.showError(error.message);
        },
      });
  }


  public refreshProducts(): void {
    this.productDataService.refreshProducts( this.shortRange(), this.longRange(), this.futureDays() ).subscribe({
      next: (data: IProductDetailModel[]) => {
        this.showSnackbar('Products refreshed successfully');
      },
      error: (error: any) => {
        this.showError(error.message);
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
        return 'Stock is low (< 5). Immediate restock required';
      case 'MEDIUM':
        return 'Stock is moderate (≥ 5 and < 10). Plan restock soon';
      case 'HIGH':
        return 'Stock is decreasing (≥ 10 and < 20). Restock recommended';
      case 'CRITICAL':
        return 'Stock level is high (≥ 20). Monitor regularly';
      default:
        return 'No urgency level found.';
    }
  }
}
