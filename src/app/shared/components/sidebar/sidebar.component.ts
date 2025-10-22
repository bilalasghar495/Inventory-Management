import { Component, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private router = inject( Router );
  
  selectedMenu: string = 'dashboard';

  constructor() {}

  ngOnInit(): void {
    // Update selected menu based on current route
    this.updateSelectedMenu( this.router.url );
    
    // Listen to route changes
    this.router.events.pipe(
      filter( event => event instanceof NavigationEnd )
    ).subscribe(( event: any ) => {
      this.updateSelectedMenu( event.url );
    });
  }

  selectMenu( menu: string ): void {
    this.selectedMenu = menu;
    this.router.navigate([`/main/${menu}`]);
  }

  private updateSelectedMenu( url: string ): void {
    this.selectedMenu = url.split('/').pop() ?? 'dashboard';
  }
}

