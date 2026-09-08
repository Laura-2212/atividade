import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface UsuarioAutenticado {
  id: number;
  nome: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private readonly storageKey = 'saep_usuario_logado';

  // Verifica se o codigo esta sendo executado no navegador
  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Verifica se existe um usuario autenticado
  isAutenticado(): boolean {
    return this.obterUsuario() !== null;
  }

  // Retorna os dados do usuario logado
  obterUsuario(): UsuarioAutenticado | null {
    if (!this.isBrowser()) return null;
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  // Salva o usuario autenticado no localStorage
  definirUsuario(usuario: UsuarioAutenticado): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.storageKey, JSON.stringify(usuario));
    }
  }

  // Finaliza a sessao do usuario e redireciona para o login
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.storageKey);
    }
    this.router.navigate(['/login']);
  }
}
