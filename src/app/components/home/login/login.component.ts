import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { SignupService } from '../../../Services/sign-up-service';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly signupService = inject(SignupService);
  readonly router        = inject(Router);
  readonly toastService  = inject(ToastService);

  readonly fc_email    = new FormControl<string>('', [Validators.required, Validators.email]);
  readonly fc_password = new FormControl<string>('', Validators.required);

  readonly form = new FormGroup({
    email   : this.fc_email,
    password: this.fc_password,
  });

  onFormSubmit() {
    if ( this.form.valid ) {
      const formData = this.form.value;

      // Build data model
      const dataModel = {
        email: formData.email ?? '',
        password: formData.password ?? '',
      };

      this.signupService.login(dataModel).subscribe({
        next: ( response ) => {
          this.toastService.success('Login successful! Welcome back.');
          this.router.navigate(['/main']);
        },
        error: ( error ) => {
          const errorMessage = error.status === 401 ? 'Invalid email or password. Please try again.' : 'Login failed. Please try again later.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }
}
