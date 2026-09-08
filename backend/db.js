const mysql = require('mysql2/promise');
require('dotenv').config();

// Pool de conexoes com o banco de dados MySQL otimizado para IPv4
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '2212',
  database: process.env.DB_NAME || 'saep_agendamento_db',
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 800
});

module.exports = pool;
