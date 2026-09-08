const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authCtrl = require('./controllers/authController');
const recursosCtrl = require('./controllers/recursosController');
const clientesCtrl = require('./controllers/clientesController');
const agendamentosCtrl = require('./controllers/agendamentosController');
const { checarMySQL } = require('./store');

const app = express();
app.use(cors());
app.use(express.json());

// 5.1. Autenticacao de usuarios (login)
app.post('/api/login', authCtrl.login);

// 8.3. Listagem dinamica de recursos
app.get('/api/recursos', recursosCtrl.listar);

// 7.1, 7.2, 7.3. CRUD e busca de clientes
app.get('/api/clientes', clientesCtrl.listar);
app.post('/api/clientes', clientesCtrl.criar);
app.put('/api/clientes/:id', clientesCtrl.atualizar);
app.delete('/api/clientes/:id', clientesCtrl.excluir);

// 8.1, 8.2, 8.4. Agendamentos e regra de conflito
app.get('/api/agendamentos', agendamentosCtrl.listar);
app.post('/api/agendamentos', agendamentosCtrl.criar);

const PORT = process.env.PORT || 3000;

// Inicializa o servidor HTTP na porta configurada
app.listen(PORT, async () => {
  console.log(`[BACKEND] Servidor rodando com sucesso na porta ${PORT}`);
  await checarMySQL();
});
