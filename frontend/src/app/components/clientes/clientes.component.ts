import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Cliente } from '../../services/api.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.css'
})
export class ClientesComponent implements OnInit {
  private api = inject(ApiService);

  todosClientes: Cliente[] = [];
  clientes: Cliente[] = [];
  termoBusca = '';
  exibirModal = false;
  editando = false;
  formularioSubmetido = false;
  mensagemAlerta = '';
  tipoAlerta: 'sucesso' | 'erro' = 'sucesso';

  clienteAtual: Cliente = { nome: '', cpf: '', telefone: '', email: '' };

  ngOnInit(): void {
    this.carregarClientes();
  }

  // 7.1 & 7.2: Carrega clientes da API
  carregarClientes(): void {
    this.api.listarClientes().subscribe({
      next: (res) => {
        this.todosClientes = res;
        this.filtrarClientes();
      },
      error: () => this.exibirAviso('Erro ao carregar clientes.', 'erro')
    });
  }

  // Filtra clientes instantaneamente em memoria com zero delay
  filtrarClientes(): void {
    if (!this.termoBusca || !this.termoBusca.trim()) {
      this.clientes = [...this.todosClientes];
      return;
    }
    const termo = this.termoBusca.toLowerCase().trim();
    this.clientes = this.todosClientes.filter(c =>
      c.nome.toLowerCase().includes(termo) || c.cpf.includes(termo)
    );
  }

  // Abre modal para cadastro de novo cliente
  abrirModalNovo(): void {
    this.editando = false;
    this.formularioSubmetido = false;
    this.clienteAtual = { nome: '', cpf: '', telefone: '', email: '' };
    this.exibirModal = true;
  }

  // Abre modal com dados preenchidos para edicao
  abrirModalEditar(cliente: Cliente): void {
    this.editando = true;
    this.formularioSubmetido = false;
    this.clienteAtual = { ...cliente };
    this.exibirModal = true;
  }

  // Fecha a janela modal
  fecharModal(): void {
    this.exibirModal = false;
  }

  // 7.4: Verifica se o campo obrigatorio esta invalido para feedback visual
  isCampoInvalido(valor?: string): boolean {
    return this.formularioSubmetido && (!valor || valor.trim() === '');
  }

  // 7.3: Salva novo cliente ou atualiza existente
  salvar(): void {
    this.formularioSubmetido = true;
    if (this.isCampoInvalido(this.clienteAtual.nome) ||
        this.isCampoInvalido(this.clienteAtual.cpf) ||
        this.isCampoInvalido(this.clienteAtual.telefone)) {
      return;
    }
    if (this.editando && this.clienteAtual.id) {
      this.api.atualizarCliente(this.clienteAtual.id, this.clienteAtual).subscribe({
        next: () => this.tratarSalvo('Cliente atualizado com sucesso!'),
        error: (err) => this.exibirAviso(err.error?.message || 'Erro ao atualizar.', 'erro')
      });
    } else {
      this.api.criarCliente(this.clienteAtual).subscribe({
        next: () => this.tratarSalvo('Cliente cadastrado com sucesso!'),
        error: (err) => this.exibirAviso(err.error?.message || 'Erro ao cadastrar.', 'erro')
      });
    }
  }

  // Finaliza operacao de salvamento fechando o modal e recarregando lista
  private tratarSalvo(mensagem: string): void {
    this.fecharModal();
    this.exibirAviso(mensagem, 'sucesso');
    this.carregarClientes();
  }

  // 7.3: Exclui cliente com confirmacao
  excluir(cliente: Cliente): void {
    if (!cliente.id) return;
    if (confirm(`Deseja realmente excluir o cliente "${cliente.nome}"?`)) {
      this.api.excluirCliente(cliente.id).subscribe({
        next: () => {
          this.exibirAviso('Cliente removido com sucesso!', 'sucesso');
          this.carregarClientes();
        },
        error: (err) => this.exibirAviso(err.error?.message || 'Erro ao remover cliente.', 'erro')
      });
    }
  }

  // Exibe aviso temporario na tela
  private exibirAviso(msg: string, tipo: 'sucesso' | 'erro'): void {
    this.mensagemAlerta = msg;
    this.tipoAlerta = tipo;
    setTimeout(() => { this.mensagemAlerta = ''; }, 4000);
  }
}
