-- Execute este script dentro do banco "gestao_tarefas"

CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    setor VARCHAR(50)
);

CREATE TABLE tarefas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT,
    prazo DATE NOT NULL
);

-- liga uma tarefa a um usuário responsável
CREATE TABLE gerenciamento (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    id_tarefa INT NOT NULL REFERENCES tarefas(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    data_atribuicao DATE NOT NULL DEFAULT CURRENT_DATE,
    UNIQUE (id_usuario, id_tarefa)
);
