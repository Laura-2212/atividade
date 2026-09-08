import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, UsuarioAutenticado } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private auth = inject(AuthService);

  // Retorna os dados do usuario logado para exibicao
  get usuario(): UsuarioAutenticado | null {
    return this.auth.obterUsuario();
  }

  // Executa o logout do usuario
  sair(): void {
    this.auth.logout();
  }
}
