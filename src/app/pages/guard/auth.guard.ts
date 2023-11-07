import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgToastService } from 'ng-angular-popup';
import { ErrorMessages } from 'src/app/shared/constant/toast-message';


/**
 * Custom Angular route guard to check if the user is authenticated before navigating to a route.
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns `true` if the user is authenticated, otherwise redirects to the login page and returns `false`.
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Inject required services
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(NgToastService);
  if (authService.isLoggedIn()) {
    return true;
  }
  else {
    // Display error message and navigate to login page
    toast.error({ detail: "ERROR", summary: ErrorMessages.LoginFirst });
    router.navigate(['login']);
    return false;
  }
};
