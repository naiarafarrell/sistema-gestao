import express from "express"
import pool from "./db.js"

const app = express()
const PORT = 3000

app.use(express.json())
app.use(express.static("public"))

/* ------------------------------ USUÁRIOS ------------------------------ */

app.get("/usuarios", async (req, res) => {
    try {
        const resultado = await pool.query("SELECT * FROM usuarios ORDER BY nome")
        res.json(resultado.rows)
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao listar usuários" })
    }
})

app.post("/usuarios", async (req, res) => {
    const { nome, email, setor } = req.body

    if (!nome || !email) {
        return res.status(400).json({ mensagem: "Nome e email são obrigatórios" })
    }

    try {
        const resultado = await pool.query(
            "INSERT INTO usuarios (nome, email, setor) VALUES ($1, $2, $3) RETURNING *",
            [nome, email, setor]
        )
        res.status(201).json(resultado.rows[0])
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({ mensagem: "Já existe um usuário com esse email" })
        }
        res.status(500).json({ mensagem: "Erro ao cadastrar usuário" })
    }
})

app.put("/usuarios/:id", async (req, res) => {
    const { id } = req.params
    const { nome, email, setor } = req.body

    if (!nome || !email) {
        return res.status(400).json({ mensagem: "Nome e email são obrigatórios" })
    }

    try {
        const resultado = await pool.query(
            "UPDATE usuarios SET nome = $1, email = $2, setor = $3 WHERE id = $4 RETURNING *",
            [nome, email, setor, id]
        )

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        res.json(resultado.rows[0])
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({ mensagem: "Já existe um usuário com esse email" })
        }
        res.status(500).json({ mensagem: "Erro ao atualizar usuário" })
    }
})

app.delete("/usuarios/:id", async (req, res) => {
    try {
        const resultado = await pool.query("DELETE FROM usuarios WHERE id = $1", [req.params.id])

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        res.json({ mensagem: "Usuário removido" })
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao remover usuário" })
    }
})

/* ------------------------------ TAREFAS ------------------------------ */

app.get("/tarefas", async (req, res) => {
    try {
        const resultado = await pool.query(
            "SELECT id, titulo, descricao, TO_CHAR(prazo, 'YYYY-MM-DD') AS prazo FROM tarefas ORDER BY prazo"
        )
        res.json(resultado.rows)
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao listar tarefas" })
    }
})

app.post("/tarefas", async (req, res) => {
    const { titulo, descricao, prazo } = req.body

    if (!titulo || !prazo) {
        return res.status(400).json({ mensagem: "Título e prazo são obrigatórios" })
    }

    try {
        const resultado = await pool.query(
            "INSERT INTO tarefas (titulo, descricao, prazo) VALUES ($1, $2, $3) RETURNING *",
            [titulo, descricao, prazo]
        )
        res.status(201).json(resultado.rows[0])
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao cadastrar tarefa" })
    }
})

app.put("/tarefas/:id", async (req, res) => {
    const { id } = req.params
    const { titulo, descricao, prazo } = req.body

    if (!titulo || !prazo) {
        return res.status(400).json({ mensagem: "Título e prazo são obrigatórios" })
    }

    try {
        const resultado = await pool.query(
            "UPDATE tarefas SET titulo = $1, descricao = $2, prazo = $3 WHERE id = $4 RETURNING *",
            [titulo, descricao, prazo, id]
        )

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada" })
        }

        res.json(resultado.rows[0])
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao atualizar tarefa" })
    }
})

app.delete("/tarefas/:id", async (req, res) => {
    try {
        const resultado = await pool.query("DELETE FROM tarefas WHERE id = $1", [req.params.id])

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Tarefa não encontrada" })
        }

        res.json({ mensagem: "Tarefa removida" })
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao remover tarefa" })
    }
})

/* ---------------------------- GERENCIAMENTO ---------------------------- */

app.get("/gerenciamento", async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT g.id, g.status,
                   TO_CHAR(g.data_atribuicao, 'DD/MM/YYYY') AS data_atribuicao,
                   u.nome AS usuario,
                   t.titulo AS tarefa,
                   TO_CHAR(t.prazo, 'DD/MM/YYYY') AS prazo
            FROM gerenciamento g
            JOIN usuarios u ON u.id = g.id_usuario
            JOIN tarefas t ON t.id = g.id_tarefa
            ORDER BY t.prazo
        `)
        res.json(resultado.rows)
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao listar atribuições" })
    }
})

app.post("/gerenciamento", async (req, res) => {
    const { id_usuario, id_tarefa } = req.body

    if (!id_usuario || !id_tarefa) {
        return res.status(400).json({ mensagem: "Escolha o usuário e a tarefa" })
    }

    try {
        const resultado = await pool.query(
            "INSERT INTO gerenciamento (id_usuario, id_tarefa) VALUES ($1, $2) RETURNING *",
            [id_usuario, id_tarefa]
        )
        res.status(201).json(resultado.rows[0])
    } catch (erro) {
        if (erro.code === "23505") {
            return res.status(409).json({ mensagem: "Essa tarefa já foi atribuída a esse usuário" })
        }
        if (erro.code === "23503") {
            return res.status(400).json({ mensagem: "Usuário ou tarefa não existe" })
        }
        res.status(500).json({ mensagem: "Erro ao atribuir tarefa" })
    }
})

app.put("/gerenciamento/:id", async (req, res) => {
    const { status } = req.body
    const statusValidos = ["Pendente", "Em andamento", "Concluída"]

    if (!statusValidos.includes(status)) {
        return res.status(400).json({ mensagem: "Status inválido" })
    }

    try {
        const resultado = await pool.query(
            "UPDATE gerenciamento SET status = $1 WHERE id = $2 RETURNING *",
            [status, req.params.id]
        )

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Atribuição não encontrada" })
        }

        res.json(resultado.rows[0])
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao atualizar status" })
    }
})

app.delete("/gerenciamento/:id", async (req, res) => {
    try {
        const resultado = await pool.query("DELETE FROM gerenciamento WHERE id = $1", [req.params.id])

        if (resultado.rowCount === 0) {
            return res.status(404).json({ mensagem: "Atribuição não encontrada" })
        }

        res.json({ mensagem: "Atribuição removida" })
    } catch (erro) {
        res.status(500).json({ mensagem: "Erro ao remover atribuição" })
    }
})

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})
