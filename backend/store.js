const pool = require('./db');

// Dados iniciais para fallback caso o banco MySQL nao esteja ativo
const memoria = {
  usuarios: [{ id: 1, nome: 'Administrador', email: 'admin@salao.com', senha: '123456' }],
  recursos: [
    { id: 1, nome_profissional: 'Barbeiro Pedro', cadeira_mesa: 'Cadeira 01 - Barbearia', especialidade: 'Barba e Corte Masculino' },
    { id: 2, nome_profissional: 'Cabeleireira Ana', cadeira_mesa: 'Cadeira 02 - Salao Principal', especialidade: 'Coloracao e Corte Feminino' },
    { id: 3, nome_profissional: 'Manicure Beatriz', cadeira_mesa: 'Mesa 01 - Esmalteria', especialidade: 'Manicure e Pedicure' },
    { id: 4, nome_profissional: 'Barbeiro Antonio', cadeira_mesa: 'Cadeira 03 - Barbearia', especialidade: 'Corte Degrade e Barba' },
    { id: 5, nome_profissional: 'Esteticista Carla', cadeira_mesa: 'Sala 01 - Estetica', especialidade: 'Limpeza de Pele e Sobrancelha' }
  ],
  clientes: [
    { id: 1, nome: 'Ana Silva', cpf: '111.222.333-44', telefone: '(19) 98765-4321', email: 'ana@email.com' },
    { id: 2, nome: 'Carlos Oliveira', cpf: '222.333.444-55', telefone: '(19) 99876-5432', email: 'carlos@email.com' },
    { id: 3, nome: 'Mariana Santos', cpf: '333.444.555-66', telefone: '(19) 97654-3210', email: 'mariana@email.com' }
  ],
  agendamentos: [
    { id: 1, cliente_id: 1, recurso_id: 1, servico: 'Corte Masculino', data_agendamento: '2026-09-10', hora_agendamento: '09:00:00' },
    { id: 2, cliente_id: 2, recurso_id: 2, servico: 'Coloracao', data_agendamento: '2026-09-10', hora_agendamento: '10:00:00' },
    { id: 3, cliente_id: 3, recurso_id: 3, servico: 'Manicure', data_agendamento: '2026-09-10', hora_agendamento: '11:00:00' }
  ]
};

let mysqlDisponivel = null;

// Testa a conexao com o banco de dados MySQL
async function checarMySQL() {
  if (mysqlDisponivel !== null) return mysqlDisponivel;
  try {
    const conn = await pool.getConnection();
    conn.release();
    mysqlDisponivel = true;
    console.log('[BANCO] Conectado ao MySQL com sucesso!');
    return true;
  } catch (err) {
    mysqlDisponivel = false;
    console.warn('[AVISO] Conexao com MySQL indisponivel. Usando dados em memoria para demonstracao:', err.message);
    return false;
  }
}

module.exports = { pool, memoria, checarMySQL };
