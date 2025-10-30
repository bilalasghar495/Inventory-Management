import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../Services/user-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    private router      = inject( Router );
    private userService = inject( UserService );

    userName       : string  = '';
    userEmail      : string  = '';
    userShop       : string  = '';
    
    pageTitle      : string  = 'All Products';
    pageDescription: string  = 'Manage Product Restocking';
    searchQuery    : string  = '';
    isDropdownOpen : boolean = false;


    ngOnInit() {
        this.getUser();
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
        this.userService.logout();
        this.isDropdownOpen = false;
        
        // Navigate to login
        this.router.navigate(['/']);
    }
}

