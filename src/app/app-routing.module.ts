import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { ReorderProductComponent } from './components/reorder-product/reorder-product.component';
import { ForgotPasswordComponent } from './components/home/forgot-password/forgot-password.component';
import { SignupComponent } from './components/home/signup/signup.component';
import { LoginComponent } from './components/home/login/login.component';
import { MainLayoutComponent } from './components/main-layout/main-layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { RegisterStoreComponent } from './components/register-store/register-store.component';

// Guards
import { authGuard, authGuardChild } from './guards/auth.guard';

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
    path: 'register-store',
    component: RegisterStoreComponent,
    canActivate: [authGuard]
  },
  {
    path: 'main',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuardChild],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'items',
        component: ReorderProductComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
