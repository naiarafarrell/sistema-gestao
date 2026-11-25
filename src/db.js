import pg from "pg"

const { Pool } = pg

// altere de acordo com o seu PostgreSQL
const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "postgres",
    database: "gestao_tarefas"
})

export default pool
