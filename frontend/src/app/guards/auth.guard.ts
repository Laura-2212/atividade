import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Guarda de rota para proteger telas que exigem autenticacao
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // No servidor (SSR), permite renderizacao inicial para o browser hidratar
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // No navegador, valida a sessao persistida
  if (authService.isAutenticado()) {
    return true;
  }
  router.navigate(['/login']);
  return false;
};
