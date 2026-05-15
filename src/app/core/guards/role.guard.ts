import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (roles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/login']);
      return false;
    }

    if (authService.hasRole(roles)) {
      return true;
    }

    // ← Redirection intelligente selon le rôle
    const role = authService.getRole();
    if (role === 'ROLE_MANAGER') {
      router.navigate(['/manager-dashboard']);
    } else {
      router.navigate(['/unauthorized']);
    }

    return false;
  };
};
