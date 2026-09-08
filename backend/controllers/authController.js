const { pool, memoria, checarMySQL } = require('../store');

// Consulta usuario no banco ou memoria
async function buscarUsuario(email, senha) {
  const isMysql = await checarMySQL();
  if (isMysql) {
    const [rows] = await pool.query(
      'SELECT id, nome, email FROM usuarios WHERE email = ? AND senha = ?',
      [email, senha]
    );
    return rows[0] || null;
  }
  const u = memoria.usuarios.find(item => item.email === email && item.senha === senha);
  return u ? { id: u.id, nome: u.nome, email: u.email } : null;
}

// Processa a autenticacao de login do usuario
async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ message: 'E-mail e senha sao obrigatorios.' });
  }
  try {
    const usuario = await buscarUsuario(email, senha);
    if (!usuario) {
      return res.status(401).json({ message: 'E-mail ou senha invalidos.' });
    }
    return res.json({ message: 'Login efetuado com sucesso!', usuario });
  } catch (err) {
    return res.status(500).json({ message: 'Erro interno: ' + err.message });
  }
}

module.exports = { login };
