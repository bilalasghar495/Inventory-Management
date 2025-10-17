import { Component, inject } from '@angular/core';
import { SignupService } from '../../../Services/sign-up-service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  readonly signupService = inject( SignupService );
  readonly router        = inject(Router);


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

    console.log('Sending signup data:', dataModel);
    this.signupService.signup(dataModel).subscribe({
      next: (response) => {
        console.log('Signup successful', response);
        // After successful signup, you can redirect or show a message
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Signup failed', error);
        // Handle error response, maybe show a user-friendly message
      }
    });
  }
}
}

