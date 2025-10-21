import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { SignupService } from '../../Services/sign-up-service';


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
      const formData = this.form.value;

      // Build data model
      const dataModel = {
        name            : formData.name ?? '',
        email           : formData.email ?? '',
        password        : formData.password ?? '',
      };

    this.signupService.signup(dataModel).subscribe({
      next: (response) => {
        this.router.navigate(['/']);
      },
      error: (error: any) => {
        console.error('Signup failed', error);
      }
    });
  }
}
}

