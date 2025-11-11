import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ImagePanelComponent } from '../../../shared/components/image-panel/image-panel.component';

// Services
import { UserService } from '../../../Services/user-service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, ImagePanelComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  readonly UserService  = inject(UserService);
  readonly router       = inject(Router);
  readonly toastService = inject(ToastService);

  readonly fc_email    = new FormControl<string>('', [Validators.required, Validators.email]);
  readonly fc_password = new FormControl<string>('', Validators.required);

  readonly form = new FormGroup({
    email   : this.fc_email,
    password: this.fc_password,
  });

  showFormLoading: boolean = false;
  showPassword   : boolean = false;

  onFormSubmit() {
    if ( this.form.valid ) {
      const formData = this.form.value;

      // Build data model
      const dataModel = {
        email: formData.email ?? '',
        password: formData.password ?? '',
      };

      this.showFormLoading = true;

      this.UserService.login( dataModel?.email, dataModel?.password ).subscribe({
        next: ( response ) => {
          this.toastService.success('Login successful!');
          this.showFormLoading = false;
          
          // Check if there's a redirect URL
          const redirectUrl = this.UserService.getRedirectUrl();
          
          if ( redirectUrl ) {
            // Clear the stored redirect URL
            this.UserService.clearRedirectUrl();
            // Navigate to the originally requested URL
            this.router.navigateByUrl( redirectUrl );
          } else {
            // Navigate based on app registration status
            if( response.appStatus === true ) {
              this.router.navigate(['/main']);
            } else {
              this.router.navigate(['/register-store']);
            }
          }
        },
        error: ( error ) => {
          const errorMessage = error.status === 401 ? 'Invalid email or password. Please try again.' : 'Login failed. Please try again later.';
          this.toastService.error(errorMessage);
          this.showFormLoading = false;
        }
      });
    }
  }

  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
