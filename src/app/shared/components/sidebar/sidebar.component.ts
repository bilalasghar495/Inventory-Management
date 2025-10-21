import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  selectedMenu: string = 'dashboard';

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Update selected menu based on current route
    this.updateSelectedMenu(this.router.url);
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateSelectedMenu(event.url);
    });
  }

  selectMenu(menu: string): void {
    this.selectedMenu = menu;
    
    // Navigate to the corresponding route
    if (menu === 'dashboard') {
      this.router.navigate(['/main/dashboard']);
    } else if (menu === 'items') {
      this.router.navigate(['/main/items']);
    } else if (menu === 'apps') {
      // Add apps route later
      this.router.navigate(['/main/apps']);
    }
  }

  private updateSelectedMenu(url: string): void {
    if (url.includes('dashboard')) {
      this.selectedMenu = 'dashboard';
    } else if (url.includes('items')) {
      this.selectedMenu = 'items';
    } else if (url.includes('apps')) {
      this.selectedMenu = 'apps';
    }
  }
}

