import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Agendamento, Recurso, Cliente, NovoAgendamento } from '../../services/api.service';

@Component({
  selector: 'app-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendamentos.component.html',
  styleUrl: './agendamentos.component.css'
})
export class AgendamentosComponent implements OnInit {
  private api = inject(ApiService);

  agendamentos: Agendamento[] = [];
  recursos: Recurso[] = [];
  clientes: Cliente[] = [];

  novoAgendamento: NovoAgendamento = {
    cliente_id: 0,
    recurso_id: 0,
    servico: '',
    data_agendamento: '',
    hora_agendamento: ''
  };

  alertaConflito = '';
  mensagemSucesso = '';
  submetido = false;
  carregando = false;

  servicosDisponiveis = [
    'Corte Masculino',
    'Barba e Acabamento',
    'Coloração e Luzes',
    'Corte Feminino',
    'Manicure e Pedicure',
    'Limpeza de Pele e Sobrancelha'
  ];

  ngOnInit(): void {
    this.carregarAgendamentos();
    this.carregarRecursos();
    this.carregarClientes();
  }

  // 8.1: Lista os agendamentos ja cadastrados
  carregarAgendamentos(): void {
    this.api.listarAgendamentos().subscribe({
      next: (res) => (this.agendamentos = res),
      error: (err) => console.error('Erro ao buscar agendamentos:', err)
    });
  }

  // 8.3: Carrega os recursos dinamicamente da API
  carregarRecursos(): void {
    this.api.listarRecursos().subscribe({
      next: (res) => (this.recursos = res),
      error: (err) => console.error('Erro ao carregar recursos:', err)
    });
  }

  // Carrega a lista de clientes para selecao no formulario
  carregarClientes(): void {
    this.api.listarClientes().subscribe({
      next: (res) => (this.clientes = res),
      error: (err) => console.error('Erro ao carregar clientes:', err)
    });
  }

  // Valida campos obrigatorios do agendamento
  isValido(): boolean {
    const a = this.novoAgendamento;
    return Boolean(a.cliente_id && a.recurso_id && a.servico && a.data_agendamento && a.hora_agendamento);
  }

  // 8.4: Salva o agendamento tratando a regra de conflito com bloqueio
  salvar(): void {
    this.submetido = true;
    this.alertaConflito = '';
    this.mensagemSucesso = '';
    if (!this.isValido()) return;

    this.carregando = true;
    this.api.criarAgendamento(this.novoAgendamento).subscribe({
      next: () => this.tratarSucesso(),
      error: (err) => this.tratarConflitoOuErro(err)
    });
  }

  // Trata retorno positivo de agendamento
  private tratarSucesso(): void {
    this.carregando = false;
    this.mensagemSucesso = 'Agendamento realizado com sucesso!';
    this.submetido = false;
    this.resetarFormulario();
    this.carregarAgendamentos();
    setTimeout(() => { this.mensagemSucesso = ''; }, 4000);
  }

  // 8.4: Trata o erro 409 de conflito exibindo alerta bloqueador
  private tratarConflitoOuErro(err: any): void {
    this.carregando = false;
    if (err.status === 409) {
      this.alertaConflito = err.error?.message ||
        'CONFLITO DE AGENDAMENTO: O Profissional/Cadeira selecionado já possui um agendamento nesta data e horário!';
    } else {
      this.alertaConflito = err.error?.message || 'Ocorreu um erro ao salvar o agendamento.';
    }
  }

  // Limpa os campos do formulario apos salvar
  private resetarFormulario(): void {
    this.novoAgendamento = {
      cliente_id: 0,
      recurso_id: 0,
      servico: '',
      data_agendamento: '',
      hora_agendamento: ''
    };
  }
}
