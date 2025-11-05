import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { UserService } from '../../../Services/user-service';
import { ProductDataService } from '../../../Services/product-data.service';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    private router             = inject( Router );
    private userService        = inject( UserService );
    private productDataService = inject( ProductDataService );

    userName       : string  = '';
    userEmail      : string  = '';
    userShop       : string  = '';
    
    pageTitle      : string  = '';
    pageDescription: string  = '';

    searchQuery    : string  = '';
    isDropdownOpen : boolean = false;

    ngOnInit() {
        this.getUser();
        this.updatePageTitle();
        
        // Listen for route changes
        this.router.events.pipe(filter( event => event instanceof NavigationEnd )).subscribe(() => this.updatePageTitle());
    }

    private updatePageTitle() {
        const currentUrl = this.router.url;
        
        // Check which route is active
        if ( currentUrl.includes('/dashboard') ) {
            this.pageTitle = 'Dashboard';
            this.pageDescription = 'Overview of your inventory';
        } else if ( currentUrl.includes('/items') ) {
            this.pageTitle = 'All Products';
            this.pageDescription = 'Manage Product Restocking';
        }
    }

    toggleDropdown() {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    // Close dropdown when clicking outside
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        if (!target.closest('.profile-section')) {
        this.isDropdownOpen = false;
        }
    }
        

    getUser() {
        const userId = this.userService.getUserId();

        if ( userId  ) {
            this.userService.getUser( userId ).subscribe({
              next: (res) => {
                this.userName = res?.name;
                this.userEmail = res?.email;
                this.userShop = res?.shop || '';
              },
              error: (err) => {
                console.error( 'Error fetching user:', err );
              }
            });
        }
    }

    logout() {
        // Clear product cache before logout to prevent showing previous user's data
        this.productDataService.clearCache();
        this.userService.logout();
        this.isDropdownOpen = false;
        
        // Navigate to login
        this.router.navigate(['/']);
    }
}

