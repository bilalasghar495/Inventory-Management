import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../Services/toast.service';
import { UserService } from '../../Services/user-service';
import { ImagePanelComponent } from '../../shared/components/image-panel/image-panel.component';

@Component({
    standalone: true,
    selector: 'app-register-store',
    imports: [CommonModule, ReactiveFormsModule, ImagePanelComponent],
    templateUrl: './register-store.component.html',
    styleUrl: './register-store.component.scss'
})
export class RegisterStoreComponent implements OnInit, OnDestroy {
    readonly router       = inject( Router );
    readonly route        = inject( ActivatedRoute );
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

    showFormLoading      : boolean = false;
    showReinstallAppAlert: boolean = false;
    installUrl           : string  = '';

    private alertTimer   : ReturnType<typeof setTimeout> | null = null;

    constructor() {}

    ngOnInit(): void {
        // Check if redirected from app uninstall
        this.route.queryParams.subscribe( params => {
            if ( params['uninstalled'] === 'true' ) {
                this.showReinstallAppAlert = true;
                this.autoHideAlert();
            }
        });
    }

    ngOnDestroy(): void {
        if ( this.alertTimer ) {
            clearTimeout( this.alertTimer );
        }
    }

    private autoHideAlert(): void {
        // Clear any existing timer
        if ( this.alertTimer ) {
            clearTimeout( this.alertTimer );
        }
        // Auto-hide alert after 5 seconds
        this.alertTimer = setTimeout(() => {
            this.showReinstallAppAlert = false;
        }, 5000);
    }

    
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
                this.showReinstallAppAlert = true;
                this.installUrl = `${response.installationUrl}/shopify-oauth/init?shop=${formData.storeUrl}&userId=${response.userId}`;
                this.autoHideAlert();
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




    onSkip() {
        // Optional: Allow users to skip this step
        this.router.navigate(['/main']);
    }

    onBack() {
        this.router.navigate(['/']);
    }
}

