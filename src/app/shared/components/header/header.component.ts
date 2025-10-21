import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  userName: string = 'Mathias';
  userRole: string = 'Store Manager';
  searchQuery: string = '';

}

