import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../Services/toast.service';
import { UserService } from '../../Services/user-service';

@Component({
  selector: 'app-register-store',
  templateUrl: './register-store.component.html',
  styleUrl: './register-store.component.scss'
})
export class RegisterStoreComponent {
    readonly router       = inject( Router );
    readonly toastService = inject( ToastService );
    readonly UserService  = inject( UserService );

    // URL pattern validator - accepts domain format only (e.g., testapplica.myshopify.com)
    private urlPattern = /^[\w\-]+(\.[\w\-]+)+$/;

    readonly fc_storeUrl     = new FormControl<string>('', [ Validators.required, Validators.pattern( this.urlPattern )]);
    readonly fc_accessToken  = new FormControl<string>('', [ Validators.required ]);
    readonly fc_apiKey       = new FormControl<string>('');
    readonly fc_apiSecretKey = new FormControl<string>('');

    readonly form = new FormGroup({
        storeUrl    : this.fc_storeUrl,
        accessToken : this.fc_accessToken,
        apiKey      : this.fc_apiKey,
        apiSecretKey: this.fc_apiSecretKey,
    });

    showFormLoading  : boolean = false;
    showInstallButton: boolean = false;
    installUrl       : string  = '';

    constructor() {}

    
    onFormSubmit() {
        if ( this.form.valid ) {
            const formData = this.form.value;
            this.showFormLoading = true;
            this.UserService.registerStore( formData.storeUrl ?? '', formData.accessToken ?? '', formData.apiKey ?? '', formData.apiSecretKey ?? '' ).subscribe({
            next: ( response: any ) => {
                this.showFormLoading = false;

                if ( formData.storeUrl ) {
                    this.UserService.saveStoreUrl( formData.storeUrl );
                }
                
                // Check if the app is installed but user is not authorized
                if ( response.isInstalled === true && response.isAuthorized === false ) {
                this.toastService.error( response.message );
                return;
                }
                
                // Check if the app is installed and user is authorized
                if ( response.isInstalled === true && response.isAuthorized === true ) {
                this.toastService.success( 'Congratulations! Your app is successfully registered with us.' );
                this.router.navigate(['/main']);
                } else {
                // App is not installed - show install button with URL
                this.showInstallButton = true;
                this.installUrl = `${response.installationUrl}/shopify-oauth/init?shop=${formData.storeUrl}&userId=${response.userId}`;
                }
            },
            error: ( error ) => {
                this.toastService.error( error.error.message  );
                this.showFormLoading = false;
            }
            });
        }
    }

    onInstallClick() {
        if ( this.installUrl ) {
            window.open( this.installUrl, '_blank' );
        }
    }


    onDismiss() {
        this.showInstallButton = false;
    }


    onSkip() {
        // Optional: Allow users to skip this step
        this.router.navigate(['/main']);
    }

    onBack() {
        this.router.navigate(['/']);
    }
}

