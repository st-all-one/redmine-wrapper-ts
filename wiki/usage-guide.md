# Guia de Uso

## Issues — Tarefas e Chamados

`GET /issues.json` | `POST /issues.json` | `PUT /issues/{id}.json` | `DELETE /issues/{id}.json`

### Listar Issues

```ts
// Todas as abertas (default)
for await (const issue of sdk.issues.list()) {
    console.log(issue.subject);
}

// Apenas minhas, abertas, ordenadas por prioridade
for await (const issue of sdk.issues.list({
    assigned_to_id: "me",
    status_id: "open",
    sort: "priority:desc,updated_on",
})) {
    console.log(`#${issue.id} [${issue.priority.name}] ${issue.subject}`);
}

// Filtros avançados
const bugs = await sdk.issues.list({
    tracker_id: 1,         // Bug tracker
    status_id: "*",        // Todos os status
    limit: 100,
}).toArray();
```

### Buscar Issue Única

```ts
// Dados básicos
const issue = await sdk.issues.get(123);

// Com dados associados
const full = await sdk.issues.getWithIncludes(123, [
    "journals",         // Histórico de alterações
    "attachments",      // Arquivos anexos
    "relations",        // Relações com outras issues
    "watchers",         // Usuários observadores
    "allowed_statuses", // Status permitidos para transição (v5.0+)
    "children",         // Subtarefas
]);
```

### Criar Issue

```ts
const created = await sdk.issues.create({
    project_id: 5,
    tracker_id: 1,          // Bug
    subject: "Erro ao salvar formulário",
    description: "Passos para reproduzir:\n1. Abrir tela X\n2. Clicar em salvar",
    priority_id: 4,         // Normal
    assigned_to_id: 42,     // Assignar para usuário
    category_id: 7,
    fixed_version_id: 15,   // Target version
    estimated_hours: 4,
    custom_fields: [
        { id: 1, value: "1.0.1" },        // cf_1 = Affected version
        { id: 2, value: "Fixed" },        // cf_2 = Resolution
    ],
    watcher_user_ids: [10, 15],
});
```

### Atualizar Issue (Comentário + Transição)

```ts
// Apenas comentar
await sdk.issues.update(123, {
    notes: "Análise concluída, causa identificada.",
});

// Comentar e transicionar status
await sdk.issues.update(123, {
    notes: "Corrigido no commit abc123.",
    status_id: 3,           // Resolved
});

// Reassignar + mudar prioridade
await sdk.issues.update(123, {
    assigned_to_id: 50,
    priority_id: 2,         // Urgent
    notes: "Passando para o especialista.",
});
```

### Watchers

```ts
// Adicionar observador
await sdk.issues.addWatcher(123, 42);

// Remover observador
await sdk.issues.removeWatcher(123, 42);
```

### Status Permitidos

```ts
const statuses = await sdk.issues.getAllowedStatuses(123);
for (const s of statuses) {
    console.log(`Pode transicionar para: ${s.name}`);
}
```

---

## Projects

`GET /projects.json` | `POST /projects.json` | `PUT /projects/{id}.json` | `DELETE /projects/{id}.json`

```ts
// Listar projetos
const projects = await sdk.projects.list().toArray();

// Buscar com includes
const project = await sdk.projects.getWithIncludes(5, [
    "trackers",
    "issue_categories",
    "enabled_modules",
]);

// Criar
await sdk.projects.create({
    name: "Novo Projeto",
    identifier: "novo-projeto",
    description: "Descrição do projeto",
    is_public: false,
    tracker_ids: [1, 2, 3],
    enabled_module_names: ["issue_tracking", "wiki", "time_tracking"],
});

// Arquivar/Desarquivar (v5.0+)
await sdk.projects.archive(5);
await sdk.projects.unarchive(5);
```

---

## Users

`GET /users.json` | `GET /users/{id}.json` | `GET /my/account.json`

```ts
// Usuário atual
const me = await sdk.users.getCurrent();
console.log(`${me.firstname} ${me.lastname} (${me.mail})`);

// Buscar com memberships e grupos
const user = await sdk.users.getWithIncludes(10, ["memberships", "groups"]);

// Listar (admin)
const all = await sdk.users.list({ status: 1 }).toArray();
```

---

## Time Entries — Registro de Horas

`GET /time_entries.json` | `POST /time_entries.json`

```ts
// Registrar horas em uma issue
await sdk.timeEntries.create({
    issue_id: 123,
    hours: 2.5,
    activity_id: 9,    // Development
    spent_on: "2026-07-10",
    comments: "Code review e ajustes",
});

// Listar por projeto
const entries = await sdk.timeEntries.list({
    project_id: 5,
    from: "2026-07-01",
    to: "2026-07-10",
}).toArray();
```

---

## Attachments — Anexos (2-Step Upload)

`POST /uploads.json` → token → `PUT /issues/{id}.json` com token

```ts
// Step 1: Upload do binário
const pdfBytes = await Deno.readFile("relatorio.pdf");
const token = await sdk.attachments.upload("relatorio.pdf", pdfBytes);

// Step 2: Associar a uma issue
await sdk.issues.update(123, {
    notes: "Segue relatório em anexo.",
    uploads: [{
        token,
        filename: "relatorio.pdf",
        content_type: "application/pdf",
        description: "Relatório mensal",
    }],
});

// Upload múltiplo
const token1 = await sdk.attachments.upload("foto1.png", img1);
const token2 = await sdk.attachments.upload("foto2.png", img2);

await sdk.issues.create({
    project_id: 1,
    subject: "Evidências",
    uploads: [
        { token: token1, filename: "foto1.png", content_type: "image/png" },
        { token: token2, filename: "foto2.png", content_type: "image/png" },
    ],
});
```

---

## Wiki Pages

`GET /projects/{id}/wiki/{title}.json` | `PUT /projects/{id}/wiki/{title}.json` | `DELETE ...`

```ts
// Listar páginas
const pages = await sdk.wiki.list(5);
for (const p of pages) {
    console.log(`${p.title} (v${p.version})`);
}

// Criar/atualizar página
await sdk.wiki.createOrUpdate(5, "GuiaDeUso", {
    text: "h1. Guia de Uso\n\nBem-vindo ao guia...",
    comments: "Versão inicial",
    parent_title: "Documentação",
});

// Buscar conteúdo atual
const page = await sdk.wiki.get(5, "GuiaDeUso");
console.log(page.text);

// Buscar versão antiga
const old = await sdk.wiki.getVersion(5, "GuiaDeUso", 3);

// Atualizar com prevenção de conflito
const current = await sdk.wiki.get(5, "GuiaDeUso");
await sdk.wiki.createOrUpdate(5, "GuiaDeUso", {
    text: current.text + "\n\nNovo conteúdo...",
    version: current.version,  // Se mudou desde a leitura, retorna 409
    comments: "Adicionando seção",
});
```

---

## Versions — Versões

```ts
// Listar versões de um projeto
const versions = await sdk.versions.listByProject(5);

// Criar versão
const v = await sdk.versions.createOnProject(5, {
    name: "v2.0",
    status: "open",
    due_date: "2026-12-31",
    description: "Release principal",
    sharing: "descendants",
});
```

---

## Issue Relations — Relações

```ts
// Listar relações de uma issue
const rels = await sdk.relations.listByIssue(123);
for (const r of rels) {
    console.log(`#${r.issue_id} ${r.relation_type} #${r.issue_to_id}`);
}

// Criar relação
await sdk.relations.createOnIssue(123, {
    issue_to_id: 456,
    relation_type: "blocks",
    delay: 3,   // dias para "precedes"/"follows"
});
```

---

## Enumerations

```ts
// Prioridades disponíveis
const priorities = await sdk.enumerations.listIssuePriorities();
for (const p of priorities) {
    console.log(`#${p.id} ${p.name} (default: ${p.is_default})`);
}

// Atividades de apontamento de horas
const activities = await sdk.enumerations.listTimeEntryActivities();
```

---

## Trackers e Issue Statuses

```ts
// Tipos de issue configurados
const trackers = await sdk.trackers.list();

// Status possíveis
const statuses = await sdk.issueStatuses.list();
```

---

## Issue Categories

```ts
// Listar categorias de um projeto
const cats = await sdk.issueCategories.listByProject(5);

// Criar categoria
await sdk.issueCategories.create(5, {
    name: "Frontend",
    assigned_to_id: 42,
});

// Deletar e reassignar issues para outra categoria
await sdk.issueCategories.delete(10, { reassignToId: 15 });
```

---

## Memberships

```ts
// Membros de um projeto
const members = await sdk.memberships.listByProject(5);
for (const m of members) {
    const quem = m.user?.name ?? m.group?.name ?? "?";
    console.log(`${quem} → ${m.roles.map(r => r.name).join(", ")}`);
}

// Adicionar membro
await sdk.memberships.create(5, {
    user_id: 42,
    role_ids: [3],  // Reporter
});

// Alterar papel
await sdk.memberships.update(10, {
    role_ids: [2],  // Developer
});
```

---

## Roles

```ts
// Listar papéis
const roles = await sdk.roles.list();

// Papel com permissões
const role = await sdk.roles.get(5);
console.log(role.permissions?.join(", "));
```

---

## Groups

```ts
// Listar grupos (admin)
const groups = await sdk.groups.list().toArray();

// Adicionar/remover usuário
await sdk.groups.addUser(20, 42);
await sdk.groups.removeUser(20, 42);
```

---

## Custom Fields

```ts
const fields = await sdk.customFields.list();
for (const cf of fields) {
    console.log(`#${cf.id} ${cf.name} (${cf.field_format})`);
    if (cf.possible_values) {
        for (const pv of cf.possible_values) {
            console.log(`  → ${pv.value}`);
        }
    }
}
```

---

## Queries — Consultas Salvas

```ts
const queries = await sdk.queries.list();
for (const q of queries) {
    console.log(`#${q.id} ${q.name} (${q.is_public ? "pública" : "privada"})`);
}

// Usar query_id como filtro nas issues
for await (const issue of sdk.issues.list({ query_id: 15 })) {
    console.log(issue.subject);
}
```

---

## Search

```ts
const results = await sdk.search.search({
    q: "performance database",
    issues: true,
    wiki_pages: true,
    limit: 20,
});
```

---

## News — Notícias

```ts
// Todas as notícias
const news = await sdk.news.list({ limit: 10 });

// De um projeto específico
const projectNews = await sdk.news.listByProject(5);

// Criar notícia
await sdk.news.create(5, {
    title: "Release v2.0",
    summary: "Novidades da versão",
    description: "Detalhes completos da release...",
});
```

---

## Files — Arquivos do Projeto

```ts
const files = await sdk.files.listByProject(5);
for (const f of files) {
    console.log(`${f.filename} (${f.filesize} bytes)`);
    console.log(`  Download: ${f.content_url}`);
}
```

---

## My Account

```ts
const me = await sdk.myAccount.get();
console.log(`${me.firstname} ${me.lastname}`);
console.log(`Login: ${me.login}`);
console.log(`Email: ${me.mail}`);
console.log(`Admin: ${me.admin}`);
```
