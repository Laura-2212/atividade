import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ClientesComponent } from './components/clientes/clientes.component';
import { AgendamentosComponent } from './components/agendamentos/agendamentos.component';
import { authGuard } from './guards/auth.guard';

// Mapeamento de rotas da aplicacao
export const routes: Routes = [
  { path: '', redirectTo: 'agendamentos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'clientes', component: ClientesComponent, canActivate: [authGuard] },
  { path: 'agendamentos', component: AgendamentosComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'login' }
];
