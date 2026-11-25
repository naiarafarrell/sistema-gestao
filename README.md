# Sistema de Gestão de Tarefas

Sistema para cadastrar **usuários** e **tarefas** e definir quem é o responsável por cada tarefa (**gerenciamento**), acompanhando o status: Pendente, Em andamento ou Concluída.

**Tecnologias:** Node.js, Express, PostgreSQL (`pg`), HTML, CSS e JavaScript.

## Estrutura

```
database.sql      → criação das tabelas
src/db.js         → conexão com o PostgreSQL
src/server.js     → rotas da API
public/           → telas (HTML, CSS e JS)
```

## Como rodar

1. Crie o banco `gestao_tarefas` no PostgreSQL e execute o `database.sql`.
2. Confira usuário e senha do banco em `src/db.js`.
3. No terminal:

```bash
npm install
npm run dev
```

4. Acesse `http://localhost:3000`.

## Rotas

| Método | Rota | Descrição |
|---|---|---|
| GET / POST | `/usuarios` | Lista / cadastra usuários |
| PUT / DELETE | `/usuarios/:id` | Edita / exclui usuário |
| GET / POST | `/tarefas` | Lista / cadastra tarefas |
| PUT / DELETE | `/tarefas/:id` | Edita / exclui tarefa |
| GET / POST | `/gerenciamento` | Lista / atribui tarefa a um usuário |
| PUT | `/gerenciamento/:id` | Muda o status |
| DELETE | `/gerenciamento/:id` | Remove a atribuição |
