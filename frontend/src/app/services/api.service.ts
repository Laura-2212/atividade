import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Recurso {
  id: number;
  nome_profissional: string;
  cadeira_mesa: string;
  especialidade: string;
}

export interface Cliente {
  id?: number;
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
}

export interface Agendamento {
  id: number;
  cliente_id?: number;
  recurso_id?: number;
  cliente_nome: string;
  nome_profissional: string;
  cadeira_mesa: string;
  servico: string;
  data_agendamento: string;
  hora_agendamento: string;
}

export interface NovoAgendamento {
  cliente_id: number;
  recurso_id: number;
  servico: string;
  data_agendamento: string;
  hora_agendamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api';

  // Autentica o usuario no backend
  login(email: string, senha: string): Observable<{ message: string; usuario: any }> {
    return this.http.post<{ message: string; usuario: any }>(`${this.baseUrl}/login`, { email, senha });
  }

  // Obtem os recursos cadastrados (profissionais e cadeiras)
  listarRecursos(): Observable<Recurso[]> {
    return this.http.get<Recurso[]>(`${this.baseUrl}/recursos`);
  }

  // Lista os clientes com filtro opcional por nome ou documento
  listarClientes(busca?: string): Observable<Cliente[]> {
    let params = new HttpParams();
    if (busca) params = params.set('busca', busca);
    return this.http.get<Cliente[]>(`${this.baseUrl}/clientes`, { params });
  }

  // Cadastra um novo cliente
  criarCliente(cliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.baseUrl}/clientes`, cliente);
  }

  // Atualiza os dados de um cliente existente
  atualizarCliente(id: number, cliente: Cliente): Observable<any> {
    return this.http.put(`${this.baseUrl}/clientes/${id}`, cliente);
  }

  // Remove um cliente do sistema
  excluirCliente(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/clientes/${id}`);
  }

  // Lista todos os agendamentos cadastrados
  listarAgendamentos(): Observable<Agendamento[]> {
    return this.http.get<Agendamento[]>(`${this.baseUrl}/agendamentos`);
  }

  // Registra novo agendamento validando conflitos
  criarAgendamento(dados: NovoAgendamento): Observable<any> {
    return this.http.post(`${this.baseUrl}/agendamentos`, dados);
  }
}
