-- =============================================================
-- SAEP 2025 / 2026 - SISTEMA DE AGENDAMENTO (SALÃO / BARBEARIA)
-- ENTREGA 3: SCRIPT DE CRIAÇÃO E POPULAÇÃO DO BANCO DE DADOS
-- =============================================================

-- 3.1. Nome do Banco de Dados
CREATE DATABASE IF NOT EXISTS saep_agendamento_db;
USE saep_agendamento_db;

-- -------------------------------------------------------------
-- Tabela de Usuários (Login no Sistema)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- -------------------------------------------------------------
-- Tabela de Clientes (Cadastro de Clientes do Salão)
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100)
);

-- -------------------------------------------------------------
-- 3.2. Tabela de Recursos (Profissionais / Cadeiras / Mesas)
-- Mínimo de 5 registros diferentes
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_profissional VARCHAR(100) NOT NULL,
    cadeira_mesa VARCHAR(50) NOT NULL,
    especialidade VARCHAR(100) NOT NULL
);

-- -------------------------------------------------------------
-- Tabela de Agendamentos
-- Regra de Conflito: não pode haver 2 agendamentos no mesmo
-- recurso (profissional/cadeira) na mesma data e horário.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    recurso_id INT NOT NULL,
    servico VARCHAR(50) NOT NULL, -- Corte, Coloração, Manicure, Barba
    data_agendamento DATE NOT NULL,
    hora_agendamento TIME NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (recurso_id) REFERENCES recursos(id) ON DELETE CASCADE,
    -- Garante a integridade e unicidade de agendamento por recurso/data/hora
    UNIQUE KEY uq_conflito_agendamento (recurso_id, data_agendamento, hora_agendamento)
);

-- -------------------------------------------------------------
-- POPULAÇÃO INICIAL: Usuário Administrador
-- -------------------------------------------------------------
INSERT INTO usuarios (nome, email, senha) VALUES 
('Administrador', 'admin@salao.com', '2401');

-- -------------------------------------------------------------
-- POPULAÇÃO INICIAL: Clientes
-- -------------------------------------------------------------
INSERT INTO clientes (nome, cpf, telefone, email) VALUES 
('Ana Silva', '111.222.333-44', '(19) 98765-4321', 'ana@email.com'),
('Carlos Oliveira', '222.333.444-55', '(19) 99876-5432', 'carlos@email.com'),
('Mariana Santos', '333.444.555-66', '(19) 97654-3210', 'mariana@email.com');

-- -------------------------------------------------------------
-- 3.2. POPULAÇÃO DOS RECURSOS (5 Registros Variados)
-- -------------------------------------------------------------
INSERT INTO recursos (nome_profissional, cadeira_mesa, especialidade) VALUES 
('Barbeiro Pedro', 'Cadeira 01 - Barbearia', 'Barba e Corte Masculino'),
('Cabeleireira Ana', 'Cadeira 02 - Salão Principal', 'Coloração e Corte Feminino'),
('Manicure Beatriz', 'Mesa 01 - Esmalteria', 'Manicure e Pedicure'),
('Barbeiro Antonio', 'Cadeira 03 - Barbearia', 'Corte Degradê e Barba'),
('Esteticista Carla', 'Sala 01 - Estética', 'Limpeza de Pele e Sobrancelha');

-- -------------------------------------------------------------
-- POPULAÇÃO INICIAL: Agendamentos de Demonstração
-- -------------------------------------------------------------
INSERT INTO agendamentos (cliente_id, recurso_id, servico, data_agendamento, hora_agendamento) VALUES 
(1, 1, 'Corte Masculino', '2026-09-10', '09:00:00'),
(2, 2, 'Coloração', '2026-09-10', '10:00:00'),
(3, 3, 'Manicure', '2026-09-10', '11:00:00');