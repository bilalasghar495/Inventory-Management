import { Component, inject } from '@angular/core';
import { UserService } from '../../../Services/user-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../Services/toast.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  readonly UserService = inject( UserService );
  readonly router        = inject( Router );
  readonly toastService  = inject( ToastService );


  readonly fc_name        = new FormControl<string>('', Validators.required);
  readonly fc_email       = new FormControl<string>('', [Validators.required, Validators.email]);
  readonly fc_password    = new FormControl<string>('', Validators.required);

  readonly form = new FormGroup({
    name    : this.fc_name,
    email   : this.fc_email,
    password: this.fc_password,

  });

  onFormSubmit() {
      if ( this.form.valid ) {
        // Form is valid - pull the values into a dataModel
        const formData = this.form.value;

        // Build data model
        const dataModel = {
          name            : formData.name ?? '',
          email           : formData.email ?? '',
          password        : formData.password ?? '',
        };

      this.UserService.signUp(dataModel).subscribe({
        next: (response ) => {
          this.toastService.success('Account created successfully! Please login.');
          // After successful signup, you can redirect or show a message
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (error ) => {
          const errorMessage = error.error?.message || 'Signup failed. Please try again.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }
}

