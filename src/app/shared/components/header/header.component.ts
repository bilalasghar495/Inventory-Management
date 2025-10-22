import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../Services/user-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

    private router      = inject( Router );
    private userService = inject( UserService );

    userName       : string  = 'Mathias';
    userRole       : string  = 'Store Manager';
    pageTitle      : string  = 'All Products';
    pageDescription: string  = 'Products detail Information';
    searchQuery    : string  = '';
    isDropdownOpen : boolean = false;

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

    logout() {
        this.userService.logout();
        this.isDropdownOpen = false;
        
        // Navigate to login
        this.router.navigate(['/']);
    }
}

