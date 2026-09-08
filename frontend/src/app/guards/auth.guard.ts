import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guarda de rota para proteger telas que exigem autenticacao
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAutenticado()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
