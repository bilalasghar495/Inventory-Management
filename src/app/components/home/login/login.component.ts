import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { SignupService } from '../../../Services/sign-up-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly signupService = inject(SignupService);
  readonly router        = inject(Router);

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
        next: (response) => {
          console.log('Login successful', response);
          this.router.navigate(['/main']);
        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    }
  }
}
