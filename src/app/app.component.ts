import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'reorder-product';
  showPassword = false;

  constructor() {}
}
