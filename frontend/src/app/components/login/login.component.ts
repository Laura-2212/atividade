import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  mensagemErro = '';
  carregando = false;

  // Realiza a tentativa de login do usuario
  realizarLogin(): void {
    if (!this.email || !this.senha) {
      this.mensagemErro = 'Preencha o e-mail e a senha.';
      return;
    }
    this.carregando = true;
    this.mensagemErro = '';
    this.api.login(this.email, this.senha).subscribe({
      next: (res) => this.tratarSucesso(res),
      error: (err) => this.tratarErro(err)
    });
  }

  // Processa o sucesso na autenticacao
  private tratarSucesso(res: any): void {
    this.carregando = false;
    this.auth.definirUsuario(res.usuario);
    this.router.navigate(['/agendamentos']);
  }

  // Exibe mensagem de falha em caso de credenciais invalidas ou servidor offline
  private tratarErro(err: any): void {
    this.carregando = false;
    if (err.status === 0 || err.status === 504) {
      this.mensagemErro = 'Servidor backend offline. Inicie o backend na pasta backend (npm start).';
    } else {
      this.mensagemErro = err.error?.message || 'E-mail ou senha inválidos.';
    }
  }
}
