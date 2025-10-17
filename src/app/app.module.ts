import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ReorderProductComponent } from './components/reorder-product/reorder-product.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatCardModule } from '@angular/material/card';
import { LoginComponent } from './components/home/login/login.component';
import { ForgotPasswordComponent } from './components/home/forgot-password/forgot-password.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { SignupComponent } from './components/home/signup/signup.component';
import { ImagePanelComponent } from './shared/components/image-panel/image-panel.component';

@NgModule({
  declarations: [
    AppComponent,
    ReorderProductComponent,
    LoginComponent,
    ForgotPasswordComponent,
    PaginationComponent,
    SignupComponent,
    ImagePanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
