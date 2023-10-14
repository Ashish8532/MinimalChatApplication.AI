import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


/**
 * Custom Angular route guard to prevent access to the login page for authenticated users.
 * If the user is already logged in, it redirects to the chat page; otherwise, it allows access to the login page.
 * @param route - The activated route snapshot.
 * @param state - The router state snapshot.
 * @returns `true` if the user is not authenticated and can access the login page, otherwise redirects to the chat page and returns `false`.
 */
export const loggedInAuthGuard: CanActivateFn = (route, state) => {
  // Inject required services
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.isLoggedIn()) {
    router.navigate(['/chat'])
    return false
  } else {
    return true
  }
};
