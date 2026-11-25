// guarda o id de quem está sendo editado (null = cadastro novo)
let usuarioEditando = null
let tarefaEditando = null

// listas carregadas da API (usadas na hora de editar)
let usuarios = []
let tarefas = []

// função que faz as requisições para a API
async function api(url, metodo = "GET", dados) {
    const resposta = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: dados ? JSON.stringify(dados) : undefined
    })

    const json = await resposta.json()

    if (!resposta.ok) {
        alert(json.mensagem)
        return null
    }

    return json
}

/* ------------------------------ USUÁRIOS ------------------------------ */

async function carregarUsuarios() {
    usuarios = await api("/usuarios")
    const tabela = document.getElementById("lista-usuarios")
    const select = document.getElementById("select-usuario")

    if (!usuarios) return

    tabela.innerHTML = ""
    select.innerHTML = `<option value="">Selecione o usuário</option>`

    usuarios.forEach((usuario) => {
        tabela.innerHTML += `
            <tr>
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${usuario.setor || "-"}</td>
                <td>
                    <button onclick="editarUsuario(${usuario.id})">Editar</button>
                    <button class="excluir" onclick="excluirUsuario(${usuario.id})">Excluir</button>
                </td>
            </tr>
        `

        select.innerHTML += `<option value="${usuario.id}">${usuario.nome}</option>`
    })
}

document.getElementById("form-usuario").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const dados = {
        nome: document.getElementById("usuario-nome").value,
        email: document.getElementById("usuario-email").value,
        setor: document.getElementById("usuario-setor").value
    }

    const resultado = usuarioEditando
        ? await api(`/usuarios/${usuarioEditando}`, "PUT", dados)
        : await api("/usuarios", "POST", dados)

    if (resultado) {
        usuarioEditando = null
        document.getElementById("btn-usuario").textContent = "Cadastrar"
        document.getElementById("form-usuario").reset()
        carregarUsuarios()
        carregarGerenciamento()
    }
})

function editarUsuario(id) {
    const usuario = usuarios.find((u) => u.id === id)

    usuarioEditando = id
    document.getElementById("usuario-nome").value = usuario.nome
    document.getElementById("usuario-email").value = usuario.email
    document.getElementById("usuario-setor").value = usuario.setor || ""
    document.getElementById("btn-usuario").textContent = "Salvar"
}

async function excluirUsuario(id) {
    if (!confirm("Excluir este usuário? As tarefas atribuídas a ele também serão removidas.")) return

    await api(`/usuarios/${id}`, "DELETE")
    carregarUsuarios()
    carregarGerenciamento()
}

/* ------------------------------ TAREFAS ------------------------------ */

async function carregarTarefas() {
    tarefas = await api("/tarefas")
    const tabela = document.getElementById("lista-tarefas")
    const select = document.getElementById("select-tarefa")

    if (!tarefas) return

    tabela.innerHTML = ""
    select.innerHTML = `<option value="">Selecione a tarefa</option>`

    tarefas.forEach((tarefa) => {
        const prazo = tarefa.prazo.split("-").reverse().join("/")

        tabela.innerHTML += `
            <tr>
                <td>${tarefa.titulo}</td>
                <td>${tarefa.descricao || "-"}</td>
                <td>${prazo}</td>
                <td>
                    <button onclick="editarTarefa(${tarefa.id})">Editar</button>
                    <button class="excluir" onclick="excluirTarefa(${tarefa.id})">Excluir</button>
                </td>
            </tr>
        `

        select.innerHTML += `<option value="${tarefa.id}">${tarefa.titulo}</option>`
    })
}

document.getElementById("form-tarefa").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const dados = {
        titulo: document.getElementById("tarefa-titulo").value,
        descricao: document.getElementById("tarefa-descricao").value,
        prazo: document.getElementById("tarefa-prazo").value
    }

    const resultado = tarefaEditando
        ? await api(`/tarefas/${tarefaEditando}`, "PUT", dados)
        : await api("/tarefas", "POST", dados)

    if (resultado) {
        tarefaEditando = null
        document.getElementById("btn-tarefa").textContent = "Cadastrar"
        document.getElementById("form-tarefa").reset()
        carregarTarefas()
        carregarGerenciamento()
    }
})

function editarTarefa(id) {
    const tarefa = tarefas.find((t) => t.id === id)

    tarefaEditando = id
    document.getElementById("tarefa-titulo").value = tarefa.titulo
    document.getElementById("tarefa-descricao").value = tarefa.descricao || ""
    document.getElementById("tarefa-prazo").value = tarefa.prazo
    document.getElementById("btn-tarefa").textContent = "Salvar"
}

async function excluirTarefa(id) {
    if (!confirm("Excluir esta tarefa?")) return

    await api(`/tarefas/${id}`, "DELETE")
    carregarTarefas()
    carregarGerenciamento()
}

/* ---------------------------- GERENCIAMENTO ---------------------------- */

async function carregarGerenciamento() {
    const lista = await api("/gerenciamento")
    const tabela = document.getElementById("lista-gerenciamento")

    if (!lista) return

    tabela.innerHTML = ""

    if (lista.length === 0) {
        tabela.innerHTML = `<tr><td colspan="6">Nenhuma tarefa atribuída ainda.</td></tr>`
        return
    }

    lista.forEach((item) => {
        tabela.innerHTML += `
            <tr>
                <td>${item.tarefa}</td>
                <td>${item.usuario}</td>
                <td>${item.prazo}</td>
                <td>${item.data_atribuicao}</td>
                <td>
                    <select onchange="mudarStatus(${item.id}, this.value)">
                        <option ${item.status === "Pendente" ? "selected" : ""}>Pendente</option>
                        <option ${item.status === "Em andamento" ? "selected" : ""}>Em andamento</option>
                        <option ${item.status === "Concluída" ? "selected" : ""}>Concluída</option>
                    </select>
                </td>
                <td>
                    <button class="excluir" onclick="removerAtribuicao(${item.id})">Remover</button>
                </td>
            </tr>
        `
    })
}

document.getElementById("form-gerenciamento").addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const dados = {
        id_usuario: document.getElementById("select-usuario").value,
        id_tarefa: document.getElementById("select-tarefa").value
    }

    const resultado = await api("/gerenciamento", "POST", dados)

    if (resultado) {
        document.getElementById("form-gerenciamento").reset()
        carregarGerenciamento()
    }
})

async function mudarStatus(id, status) {
    await api(`/gerenciamento/${id}`, "PUT", { status })
}

async function removerAtribuicao(id) {
    await api(`/gerenciamento/${id}`, "DELETE")
    carregarGerenciamento()
}

// carrega tudo quando a página abre
carregarUsuarios()
carregarTarefas()
carregarGerenciamento()
