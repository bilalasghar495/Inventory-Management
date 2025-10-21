import { Component, computed, input, output } from '@angular/core';

export interface PaginationConfig {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {

  readonly currentPage     = input<number>(1);
  readonly itemsPerPage    = input<number>(10);
  readonly totalItems      = input<number>(0);
  readonly pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  readonly pageChange         = output<number>();
  readonly itemsPerPageChange = output<number>();
  
  readonly totalPages = computed(() => Math.ceil(this.totalItems() / this.itemsPerPage()));

  // Get page numbers array
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, this.currentPage() - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages(), startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Get start index for display
  get startIndex(): number {
    if ( this.totalItems() === 0 ) return 0;
    return ( this.currentPage() - 1 ) * this.itemsPerPage() + 1;
  }

  // Get end index for display
  get endIndex(): number {
    return Math.min( this.currentPage() * this.itemsPerPage(), this.totalItems() );
  }

  // Go to specific page
  goToPage( page: number ): void {
    if ( page >= 1 && page <= this.totalPages() && page !== this.currentPage() ) {
      this.pageChange.emit(page);
    }
  }

  // Go to previous page
  previousPage(): void {
    if (  this.currentPage() > 1 ) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  // Go to next page
  nextPage(): void {
    if ( this.currentPage() < this.totalPages() ) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  // Change items per page
  onItemsPerPageChange( event: Event ): void {
    const target = event.target as HTMLSelectElement;
    const newSize = parseInt(target.value, 10);
    this.itemsPerPageChange.emit(newSize);
  }
}

