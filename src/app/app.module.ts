import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Routing Module
import { AppRoutingModule } from './app-routing.module';


// Components
import { AppComponent } from './app.component';
import { ReorderProductComponent } from './components/reorder-product/reorder-product.component';
import { LoginComponent } from './components/home/login/login.component';
import { ForgotPasswordComponent } from './components/home/forgot-password/forgot-password.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { SignupComponent } from './components/home/signup/signup.component';
import { ImagePanelComponent } from './shared/components/image-panel/image-panel.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { RegisterStoreComponent } from './components/register-store/register-store.component';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    ReorderProductComponent,
    LoginComponent,
    ForgotPasswordComponent,
    PaginationComponent,
    SignupComponent,
    ImagePanelComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    MainLayoutComponent,
    ToastComponent,
    RegisterStoreComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
