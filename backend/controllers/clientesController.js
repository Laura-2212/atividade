const { pool, memoria, checarMySQL } = require('../store');

// Consulta clientes no banco de dados ou memoria ordenados de forma crescente
async function buscarClientes(busca) {
  const isMysql = await checarMySQL();
  if (isMysql) {
    let sql = 'SELECT * FROM clientes';
    const params = [];
    if (busca) {
      sql += ' WHERE nome LIKE ? OR cpf LIKE ?';
      params.push(`%${busca}%`, `%${busca}%`);
    }
    sql += ' ORDER BY id ASC';
    const [rows] = await pool.query(sql, params);
    return rows;
  }
  const lista = [...memoria.clientes].sort((a, b) => a.id - b.id);
  if (!busca) return lista;
  const termo = busca.toLowerCase();
  return lista.filter(c => c.nome.toLowerCase().includes(termo) || c.cpf.includes(termo));
}

// Endpoint GET: Lista clientes
async function listar(req, res) {
  try {
    const clientes = await buscarClientes(req.query.busca);
    return res.json(clientes);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao listar clientes: ' + err.message });
  }
}

// Verifica se ja existe cliente cadastrado com o mesmo CPF
async function checarCpfExistente(cpf, ignorarId = null) {
  const isMysql = await checarMySQL();
  if (isMysql) {
    let sql = 'SELECT id FROM clientes WHERE cpf = ?';
    const params = [cpf];
    if (ignorarId) {
      sql += ' AND id != ?';
      params.push(ignorarId);
    }
    const [rows] = await pool.query(sql, params);
    return rows.length > 0;
  }
  return memoria.clientes.some(c => c.cpf === cpf && (!ignorarId || c.id !== Number(ignorarId)));
}

// Insere registro de cliente no banco ou memoria gerando ID sequencial logico
async function inserirCliente(dados) {
  const { nome, cpf, telefone, email } = dados;
  const isMysql = await checarMySQL();
  if (isMysql) {
    const [res] = await pool.query(
      'INSERT INTO clientes (nome, cpf, telefone, email) VALUES (?, ?, ?, ?)',
      [nome, cpf, telefone, email]
    );
    return { id: res.insertId, nome, cpf, telefone, email };
  }
  const proximoId = memoria.clientes.reduce((max, c) => Math.max(max, c.id), 0) + 1;
  const novo = { id: proximoId, nome, cpf, telefone, email: email || '' };
  memoria.clientes.push(novo);
  return novo;
}

// Endpoint POST: Cadastra novo cliente com validacao de campos e unicidade de CPF
async function criar(req, res) {
  const { nome, cpf, telefone } = req.body;
  if (!nome || !cpf || !telefone) {
    return res.status(400).json({ message: 'Nome, CPF e Telefone sao obrigatorios.' });
  }
  try {
    const cpfDuplicado = await checarCpfExistente(cpf);
    if (cpfDuplicado) {
      return res.status(400).json({ message: 'Ja existe um cliente cadastrado com este CPF.' });
    }
    const novo = await inserirCliente(req.body);
    return res.status(201).json(novo);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao cadastrar cliente: ' + err.message });
  }
}

// Executa atualizacao do cliente no banco ou memoria
async function salvarEdicaoCliente(id, dados) {
  const { nome, cpf, telefone, email } = dados;
  const isMysql = await checarMySQL();
  if (isMysql) {
    await pool.query(
      'UPDATE clientes SET nome = ?, cpf = ?, telefone = ?, email = ? WHERE id = ?',
      [nome, cpf, telefone, email, id]
    );
    return;
  }
  const idx = memoria.clientes.findIndex(c => c.id === Number(id));
  if (idx !== -1) {
    memoria.clientes[idx] = { id: Number(id), nome, cpf, telefone, email: email || '' };
  }
}

// Endpoint PUT: Atualiza cliente existente com checagem de CPF
async function atualizar(req, res) {
  const { id } = req.params;
  const { nome, cpf, telefone } = req.body;
  if (!nome || !cpf || !telefone) {
    return res.status(400).json({ message: 'Nome, CPF e Telefone sao obrigatorios.' });
  }
  try {
    const cpfDuplicado = await checarCpfExistente(cpf, id);
    if (cpfDuplicado) {
      return res.status(400).json({ message: 'Ja existe outro cliente com este CPF.' });
    }
    await salvarEdicaoCliente(id, req.body);
    return res.json({ message: 'Cliente atualizado com sucesso!' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao atualizar cliente: ' + err.message });
  }
}

// Executa remocao do cliente no banco ou memoria
async function removerCliente(id) {
  const isMysql = await checarMySQL();
  if (isMysql) {
    await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
    return;
  }
  memoria.clientes = memoria.clientes.filter(c => c.id !== Number(id));
}

// Endpoint DELETE: Remove cliente
async function excluir(req, res) {
  try {
    await removerCliente(req.params.id);
    return res.json({ message: 'Cliente removido com sucesso!' });
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao remover cliente: ' + err.message });
  }
}

module.exports = { listar, criar, atualizar, excluir };
