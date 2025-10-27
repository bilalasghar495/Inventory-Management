import { inject } from '@angular/core';
import { Router, CanActivateFn, CanActivateChildFn } from '@angular/router';
import { UserService } from '../Services/user-service';

const checkLogin = (url?: string): boolean => {
  const router      = inject( Router );
  const userService = inject( UserService );

  if ( userService.isAuthenticated() ) {
    return true;
  }

  if ( url ) {
    // Store the attempted URL for redirecting after login
    userService.setRedirectUrl( url );
  }

  // Navigate to the login page
  router.navigate(['/']);

  return false;
};

export const authGuard: CanActivateFn = ( route, state ) => {
  return checkLogin( state.url );
};

export const authGuardChild: CanActivateChildFn = ( route, state ) => {
  return checkLogin( state.url );
};

