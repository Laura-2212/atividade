const { pool, memoria, checarMySQL } = require('../store');

// Consulta todos os agendamentos vinculados a cliente e recurso
async function buscarAgendamentos() {
  const isMysql = await checarMySQL();
  if (isMysql) {
    const sql = `
      SELECT a.id, a.servico, DATE_FORMAT(a.data_agendamento, '%Y-%m-%d') as data_agendamento,
             a.hora_agendamento, c.nome as cliente_nome, r.nome_profissional, r.cadeira_mesa
      FROM agendamentos a
      JOIN clientes c ON a.cliente_id = c.id
      JOIN recursos r ON a.recurso_id = r.id
      ORDER BY a.data_agendamento ASC, a.hora_agendamento ASC`;
    const [rows] = await pool.query(sql);
    return rows;
  }
  return [...memoria.agendamentos]
    .sort((a, b) => a.data_agendamento.localeCompare(b.data_agendamento) || a.hora_agendamento.localeCompare(b.hora_agendamento))
    .map(a => {
      const cli = memoria.clientes.find(c => c.id === Number(a.cliente_id));
      const rec = memoria.recursos.find(r => r.id === Number(a.recurso_id));
      return {
        id: a.id, servico: a.servico, data_agendamento: a.data_agendamento,
        hora_agendamento: a.hora_agendamento,
        cliente_nome: cli ? cli.nome : 'Cliente Desconhecido',
        nome_profissional: rec ? rec.nome_profissional : 'Profissional',
        cadeira_mesa: rec ? rec.cadeira_mesa : 'Cadeira'
      };
    });
}

// Endpoint GET: Lista agendamentos
async function listar(req, res) {
  try {
    const lista = await buscarAgendamentos();
    return res.json(lista);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar agendamentos: ' + err.message });
  }
}

// Verifica se ja existe agendamento para o mesmo recurso, data e horario
async function verificarConflito(recursoId, data, hora) {
  const isMysql = await checarMySQL();
  const horaNorm = hora.length === 5 ? hora + ':00' : hora;
  if (isMysql) {
    const [rows] = await pool.query(
      'SELECT id FROM agendamentos WHERE recurso_id = ? AND data_agendamento = ? AND hora_agendamento = ?',
      [recursoId, data, horaNorm]
    );
    return rows.length > 0;
  }
  return memoria.agendamentos.some(a => {
    const aHora = a.hora_agendamento.length === 5 ? a.hora_agendamento + ':00' : a.hora_agendamento;
    return Number(a.recurso_id) === Number(recursoId) && a.data_agendamento === data && aHora === horaNorm;
  });
}

// Salva o novo agendamento no banco ou memoria gerando ID sequencial
async function salvarAgendamento(dados) {
  const { cliente_id, recurso_id, servico, data_agendamento, hora_agendamento } = dados;
  const isMysql = await checarMySQL();
  const horaNorm = hora_agendamento.length === 5 ? hora_agendamento + ':00' : hora_agendamento;
  if (isMysql) {
    const [res] = await pool.query(
      'INSERT INTO agendamentos (cliente_id, recurso_id, servico, data_agendamento, hora_agendamento) VALUES (?, ?, ?, ?, ?)',
      [cliente_id, recurso_id, servico, data_agendamento, horaNorm]
    );
    return { id: res.insertId };
  }
  const proximoId = memoria.agendamentos.reduce((max, a) => Math.max(max, a.id), 0) + 1;
  const novo = { id: proximoId, cliente_id, recurso_id, servico, data_agendamento, hora_agendamento: horaNorm };
  memoria.agendamentos.push(novo);
  return { id: novo.id };
}

// Endpoint POST: Cria agendamento com validacao de conflito de horario
async function criar(req, res) {
  const { cliente_id, recurso_id, servico, data_agendamento, hora_agendamento } = req.body;
  if (!cliente_id || !recurso_id || !servico || !data_agendamento || !hora_agendamento) {
    return res.status(400).json({ message: 'Todos os campos do agendamento sao obrigatorios!' });
  }
  try {
    const temConflito = await verificarConflito(recurso_id, data_agendamento, hora_agendamento);
    if (temConflito) {
      return res.status(409).json({
        message: 'CONFLITO DE AGENDAMENTO: O Profissional/Cadeira selecionado ja possui um agendamento nesta data e horario!'
      });
    }
    const criado = await salvarAgendamento(req.body);
    return res.status(201).json({ id: criado.id, message: 'Agendamento realizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao salvar agendamento: ' + err.message });
  }
}

module.exports = { listar, criar };
