import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReorderProductComponent } from './components/reorder-product/reorder-product.component';
import { ForgotPasswordComponent } from './components/home/forgot-password/forgot-password.component';
import { SignupComponent } from './components/home/signup/signup.component';
import { LoginComponent } from './components/home/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reorder-product',
    component: ReorderProductComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
