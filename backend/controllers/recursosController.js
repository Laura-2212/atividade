const { pool, memoria, checarMySQL } = require('../store');

// Obtem a lista de recursos cadastrados
async function buscarRecursos() {
  const isMysql = await checarMySQL();
  if (isMysql) {
    const [recursos] = await pool.query('SELECT * FROM recursos');
    return recursos;
  }
  return memoria.recursos;
}

// Retorna todos os recursos disponiveis (profissionais/cadeiras)
async function listar(req, res) {
  try {
    const recursos = await buscarRecursos();
    return res.json(recursos);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao obter recursos: ' + err.message });
  }
}

module.exports = { listar };
