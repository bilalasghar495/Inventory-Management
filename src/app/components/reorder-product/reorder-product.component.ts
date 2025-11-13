import { Component, computed, effect, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';
import { DatepickerComponent } from '../../shared/components/datepicker/datepicker.component';


// Services
import { ProductDataService } from '../../Services/product-data.service';
import { ToastService } from '../../Services/toast.service';
import { UserService } from '../../Services/user-service';
import { WebsocketService } from '../../Services/websocket.service';

// Akita Store
import { ProductQuery } from '../../stores/product.query';

// Models
import { IProductDetailModel, IShopDataModel, IExportProductData } from '../../models/product.model';

// RxJS
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

// Enums
import { ProductStatusEnum, UrgencyLevelEnum } from '../../shared/enums/enum';

@Component({
  standalone: true,
  selector: 'app-reorder-product',
  imports: [CommonModule, MatTooltipModule, MatSnackBarModule, PaginationComponent, DatepickerComponent],
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
  readonly isExporting       = signal<boolean>(false);
  readonly isDateRangeLoading = signal<boolean>(false);
  readonly urgencyLevel      = signal<UrgencyLevelEnum | null>(null);
  readonly searchTerm        = signal<string>('');
  
  // Pagination properties (as signals)
  readonly currentPage  = signal<number>(1);
  readonly itemsPerPage = signal<number>(50);
  readonly totalItems   = signal<number>(0);

  readonly shortRange   = signal<number>(7);
  readonly longRange    = signal<number>(30);
  readonly futureDays   = signal<string>('15');
  readonly status       = signal<ProductStatusEnum>(ProductStatusEnum.Active);

  readonly sortColumn    = signal<string | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  // Date range signals
  readonly startDate = signal<string | null>(null);
  readonly endDate   = signal<string | null>(null);

  private readonly searchTermSubject = new Subject<string>();
  private readonly dateRangeSubject  = new Subject<{ startDate: string; endDate: string }>();
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
        let aValue: string | number;
        let bValue: string | number;
        
        switch ( sortColumn ) {
          case 'productName':
            aValue = a.productName?.toLowerCase() || '';
            bValue = b.productName?.toLowerCase() || '';
            break;
          case 'availableStock':
            aValue = a.availableStock ?? 0;
            bValue = b.availableStock ?? 0;
            break;
          case 'incomingStock':
            aValue = a.incomingStock ?? 0;
            bValue = b.incomingStock ?? 0;
            break;
          case 'recommendedAverageStock':
            aValue = a.recommendedAverageStock ?? 0;
            bValue = b.recommendedAverageStock ?? 0;
            break;
          case 'urgencyLevel':
            aValue = a.urgencyLevel?.toLowerCase() || '';
            bValue = b.urgencyLevel?.toLowerCase() || '';
            break;
          default:
            return 0;
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
  

  constructor() {
    // Effect to trigger date range API when both dates are set
    effect(() => {
      const startDate = this.startDate();
      const endDate = this.endDate();
      
      // Only trigger if both dates are set
      if (startDate && endDate) {
        this.dateRangeSubject.next({ startDate, endDate });
      }
    });

    // Debounce date range changes to prevent rapid API calls
    this.dateRangeSubject.pipe(
      debounceTime(500),
      distinctUntilChanged((prev, curr) => prev.startDate === curr.startDate && prev.endDate === curr.endDate),
      takeUntil(this.destroy$)
    ).subscribe(({ startDate, endDate }) => {
      // Verify dates are still set (they might have been cleared)
      if ( this.startDate() === startDate && this.endDate() === endDate && startDate && endDate ) {
        this.fetchProductsByDateRange();
      }
    });
  }

  ngOnInit(): void {
    // Restore status filter from store if available
    const cachedStatus = this.productQuery.currentStatus;
    if ( cachedStatus ) {
      this.status.set( cachedStatus as ProductStatusEnum );
    }

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
    
    // Complete subjects
    this.searchTermSubject.complete();
    this.dateRangeSubject.complete();
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


  // Fetch product detail
  public fetchProductDetail( forceRefresh: boolean = false ): void {
    const shortRangeDays = this.shortRange();
    const longRangeDays  = this.longRange();
    const futureDays     = this.futureDays();
    const status         = this.status();

    this.productDataService.getProducts( shortRangeDays, longRangeDays, futureDays, status, forceRefresh ).pipe(takeUntil(this.destroy$) ).subscribe({
      next: ( data: IProductDetailModel[] ) => {
        console.log('Product data loaded', data);
        // Data is automatically synced via store subscription
      },
      error: ( error: any ) => {
        this.showError( error.message );
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
    this.isExporting.set(true);

    // Check if there's a search term or filters applied
    const hasSearchTerm = this.searchTerm().trim().length > 0;
    const hasUrgencyFilter = this.urgencyLevel() !== null;
    const currentStatus = this.status();
    const hasStatusFilter = currentStatus !== ProductStatusEnum.Active;
    
    // If search, urgency filter, or status filter (non-default) is applied, export filtered products (limited view)
    const hasAnyFilter = hasSearchTerm || hasUrgencyFilter || hasStatusFilter;
    const productsToExport = hasAnyFilter ? this.filteredProducts() : this.products();

    // Transform products to match backend format (only urgencyLevel needs lowercase conversion)
    const exportData: IExportProductData[] = productsToExport.map(product => ({
      ...product,
      sku   : product.sku || null,
      status: product.status as string,
      urgencyLevel: product.urgencyLevel?.toLowerCase() || ''
    } as IExportProductData));

    if ( exportData.length === 0 ) {
      this.isExporting.set(false);
      this.showSnackbar('No products to export');
      return;
    }

    this.productDataService.exportProductsData( exportData ).pipe(takeUntil(this.destroy$)).subscribe({
      next: ( blob: Blob ) => {
        try {
          // Create a download link and trigger it
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          const exportType = hasAnyFilter ? 'filtered' : 'full';
          link.download = `inventory-export-${exportType}-${new Date().getTime()}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          this.isExporting.set(false);

          const exportMessage = hasAnyFilter 
            ? `CSV Exported Successfully (${exportData.length} filtered products)` 
            : `CSV Exported Successfully (${exportData.length} products)`;
          this.showSnackbar( exportMessage );
        } catch (error) {
          this.isExporting.set(false);
          const errorMessage = error instanceof Error ? error.message : 'Failed to download CSV file';
          this.showError(errorMessage);
        }
      },
      error: ( error: any ) => {
        console.log( error );
        this.isExporting.set( false );
        const errorMessage = error instanceof Error ? error.message : 'Failed to export CSV';
        this.showError( errorMessage );
      },
    });
  }


  private fetchShopData(): void {
    const shop = this.userService.getStoreUrl();
    this.userService.getShopData( shop ?? '' ).pipe(takeUntil(this.destroy$)).subscribe({
      next: ( data: IShopDataModel ) => {
        
        // Connect WebSocket with the shopDomain from the API response
        if ( data?.shopDomain ) {
          this.websocketService.connect( data.shopDomain );
          
          // Set up WebSocket event listeners after connection
          // this.websocketService.listen('orderCreated').subscribe(( productData ) => {
          //   const productName = productData?.title || productData?.name || 'Unknown Product';
          //   this.showSnackbar(`${productName} Order Created Successfully`);
          //   this.fetchProductDetail();
          // });

          // this.websocketService.listen('productUpdated').subscribe(( productData ) => {
          //   const productName = productData?.title || productData?.name || 'Unknown Product';
          //   this.showSnackbar(`${productName} Product Updated Successfully`);
          //   this.fetchProductDetail();
          // });

          this.websocketService.listen('appUninstalled').subscribe(() => {
            this.router.navigate(['/register-store'], { queryParams: { uninstalled: 'true' } });
          });
        }
      },
      error: (error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shop data';
        this.showError( errorMessage );
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


  onStatusChange( value: ProductStatusEnum ): void {
    this.status.set( value );
    this.currentPage.set( 1 );
    this.fetchProductDetail( true );
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

  // Fetch products by date range when dates are selected
  private fetchProductsByDateRange(): void {
    const storeUrl = this.userService.getStoreUrl();
    if (!storeUrl) {
      console.warn('Store URL not available, skipping date range API call');
      return;
    }

    const startDateStr = this.startDate();
    const endDateStr = this.endDate();

    if ( !startDateStr || !endDateStr ) {
      return;
    }

    // Validate date order (startDate should be before endDate)
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    if ( startDate > endDate ) {
      console.warn('Start date is after end date, swapping dates');
      // Swap dates if they're in wrong order
      const temp = startDateStr;
      this.startDate.set(endDateStr);
      this.endDate.set(temp);
      return; // Effect will trigger again with swapped dates
    }

    // Format dates as ISO datetime strings with milliseconds (e.g., 2025-11-05T10:53:16.510Z)
    // Start date: beginning of day in UTC (00:00:00.000Z)
    const startDateObj = new Date(startDateStr + 'T00:00:00.000Z');
    const formattedStartDate = startDateObj.toISOString();
    
    // End date: always use end of day (23:59:59)
    const formattedEndDate = endDateStr + 'T23:59:59';

    console.log('Triggering date range API with:', { storeUrl, startDateStr: formattedStartDate, endDateStr: formattedEndDate });

    // Set loading state to true
    this.isDateRangeLoading.set(true);

    this.productDataService.getProductsByDateRange( storeUrl, formattedStartDate, formattedEndDate, this.futureDays(), this.status().toLowerCase() ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        console.log('Date range API response:', data);
        this.isDateRangeLoading.set(false);
      },
      error: (error) => {
        console.error('Date range API error:', error);
        this.isDateRangeLoading.set(false);
        this.showError('Failed to fetch products for selected date range');
      }
    });
  }
}
