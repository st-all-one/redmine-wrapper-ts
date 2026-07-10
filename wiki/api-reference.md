# Referência da API

## RedmineWrapperTS — Factory

`RedmineWrapperTS.create(config: RedmineWrapperConfig): RedmineWrapperTS`

### `RedmineWrapperConfig`

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `baseUrl` | `string` | Sim | — | URL base do Redmine |
| `apiKey` | `string` | Sim | — | Chave de API |
| `timeoutMs` | `number` | Não | `30_000` | Timeout por requisição (ms) |
| `switchUser` | `string` | Não | — | Login para impersonação (admin) |
| `maxRps` | `number` | Não | `10` | Requisições por segundo |

## Resources

### IssuesResource

| Método | Descrição |
|--------|-----------|
| `list(filter?)` | Lista issues com paginação automática |
| `get(id, params?)` | Busca issue por ID |
| `getWithIncludes(id, include[])` | Busca com dados associados |
| `create(payload)` | Cria nova issue |
| `update(id, payload)` | Atualiza issue (comentário, status, etc.) |
| `delete(id)` | Remove issue |
| `addWatcher(issueId, userId)` | Adiciona observador |
| `removeWatcher(issueId, userId)` | Remove observador |
| `getAllowedStatuses(issueId)` | Status permitidos para transição (v5.0+) |

### ProjectsResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista projetos |
| `get(id, params?)` | Busca projeto por ID |
| `getWithIncludes(id, include[])` | Busca com trackers, categorias, módulos |
| `create(payload)` | Cria projeto |
| `update(id, payload)` | Atualiza projeto |
| `delete(id)` | Remove projeto |
| `archive(id)` | Arquiva projeto (v5.0+) |
| `unarchive(id)` | Desarquiva projeto (v5.0+) |

### UsersResource

| Método | Descrição |
|--------|-----------|
| `list(filter?)` | Lista usuários (admin) |
| `get(id, params?)` | Busca usuário por ID |
| `getWithIncludes(id, include[])` | Busca com memberships e grupos |
| `getCurrent()` | Usuário atual |
| `create(payload)` | Cria usuário (admin) |
| `update(id, payload)` | Atualiza usuário (admin) |
| `delete(id)` | Remove usuário (admin) |

### TimeEntriesResource

| Método | Descrição |
|--------|-----------|
| `list(filter?)` | Lista time entries |
| `get(id)` | Busca time entry |
| `create(payload)` | Registra horas |
| `update(id, payload)` | Atualiza registro |
| `delete(id)` | Remove registro |

### AttachmentsResource

| Método | Descrição |
|--------|-----------|
| `get(id)` | Metadados do attachment |
| `delete(id)` | Remove attachment |
| `upload(filename, data)` | Upload de arquivo (retorna token) |

### JournalsResource

| Método | Descrição |
|--------|-----------|
| `get(id)` | Busca journal |
| `update(id, payload)` | Atualiza notas |
| `remove(id)` | Remove journal (seta notes para vazio) |

### RelationsResource

| Método | Descrição |
|--------|-----------|
| `get(id)` | Busca relação por ID |
| `listByIssue(issueId)` | Lista relações de uma issue |
| `createOnIssue(issueId, payload)` | Cria relação em uma issue |
| `delete(id)` | Remove relação |

### WikiResource

| Método | Descrição |
|--------|-----------|
| `list(projectId)` | Lista páginas wiki do projeto |
| `get(projectId, title, include?)` | Conteúdo da página |
| `getVersion(projectId, title, version)` | Versão antiga |
| `createOrUpdate(projectId, title, payload)` | Cria/atualiza página |
| `delete(projectId, title)` | Remove página |

### VersionsResource

| Método | Descrição |
|--------|-----------|
| `get(id)` | Busca versão |
| `listByProject(projectId)` | Lista versões do projeto |
| `createOnProject(projectId, payload)` | Cria versão no projeto |
| `update(id, payload)` | Atualiza versão |
| `delete(id)` | Remove versão |

### EnumerationsResource

| Método | Descrição |
|--------|-----------|
| `listIssuePriorities()` | Prioridades de issue |
| `listTimeEntryActivities()` | Atividades de time entry |
| `listDocumentCategories()` | Categorias de documento |

### TrackersResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista trackers (tipos de issue) |

### IssueStatusesResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista status de issue |

### IssueCategoriesResource

| Método | Descrição |
|--------|-----------|
| `get(id)` | Busca categoria |
| `listByProject(projectId)` | Lista categorias do projeto |
| `create(projectId, payload)` | Cria categoria no projeto |
| `update(id, payload)` | Atualiza categoria |
| `delete(id, reassignToId?)` | Remove categoria (opcional: reassignar issues) |

### MembershipsResource

| Método | Descrição |
|--------|-----------|
| `get(id)` | Busca membership |
| `listByProject(projectId)` | Lista membros do projeto |
| `create(projectId, payload)` | Adiciona membro ao projeto |
| `update(id, payload)` | Atualiza roles do membro |
| `delete(id)` | Remove membro do projeto |

### RolesResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista papéis |
| `get(id)` | Papel com permissões |

### GroupsResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista grupos (admin) |
| `get(id, params?)` | Busca grupo |
| `getWithIncludes(id, include[])` | Busca com usuários e memberships |
| `create(payload)` | Cria grupo (admin) |
| `update(id, payload)` | Atualiza grupo (admin) |
| `delete(id)` | Remove grupo (admin) |
| `addUser(groupId, userId)` | Adiciona usuário ao grupo |
| `removeUser(groupId, userId)` | Remove usuário do grupo |

### CustomFieldsResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista custom fields (admin) |

### QueriesResource

| Método | Descrição |
|--------|-----------|
| `list()` | Lista queries salvas |

### FilesResource

| Método | Descrição |
|--------|-----------|
| `listByProject(projectId)` | Arquivos do projeto |
| `attachToProject(projectId, payload)` | Anexa arquivo ao projeto |

### SearchResource

| Método | Descrição |
|--------|-----------|
| `search(filters)` | Busca no Redmine |

### NewsResource

| Método | Descrição |
|--------|-----------|
| `list(params?)` | Lista notícias |
| `listByProject(projectId, params?)` | Notícias de um projeto |
| `get(id, include?)` | Busca notícia |
| `create(projectId, payload)` | Cria notícia |
| `update(id, payload)` | Atualiza notícia |
| `delete(id)` | Remove notícia |

### MyAccountResource

| Método | Descrição |
|--------|-----------|
| `get()` | Dados da conta autenticada |

## Tipos Principais

### Issue (parcial)

```typescript
interface Issue {
    id: RedmineId;
    project: IdName;
    tracker: IdName;
    status: IdName;
    priority: IdName;
    author: IdName;
    subject: string;
    description?: string | null;
    done_ratio?: number;
    estimated_hours?: number | null;
    created_on: string;
    updated_on: string;
    closed_on?: string | null;
    assigned_to?: IdName | null;
    journals?: Journal[];
    attachments?: Attachment[];
    relations?: Relation[];
    allowed_statuses?: AllowedStatus[];
    watchers?: IdName[];
    children?: Issue[];
}
```

### RedmineWrapperError (RFC 7807)

```typescript
class RedmineWrapperError extends Error {
    readonly type: string;      // URL da wiki de erro
    readonly title: string;     // Categoria (ex: "validation-error")
    readonly status: number;    // HTTP status sugerido
    readonly detail: string;    // Descrição detalhada
    readonly instance: string;  // UUIDv7: "urn:uuid:..."
    readonly context: ErrorContext;

    toJSON(): Record<string, unknown>;
}
```

## Erros (RedmineWrapperError)

| Category | HTTP | Criado quando |
|----------|------|---------------|
| `authentication-failed` | 401 | API key inválida |
| `authorization-denied` | 403 | Sem permissão |
| `resource-not-found` | 404 | Recurso não existe |
| `validation-error` | 422 | Dados inválidos |
| `conflict` | 409 | Conflito de versão (wiki) |
| `impersonation-failed` | 412 | Switch-User inválido |
| `upload-too-large` | 413 | Arquivo muito grande |
| `rate-limited` | 429 | Muitas requisições |
| `timeout` | 504 | Timeout da requisição |
| `network-error` | 503 | Falha de rede |
| `parse-error` | 500 | Resposta inesperada |
| `internal-error` | 500 | Erro interno não categorizado |

## PaginationIterator

```typescript
class PaginationIterator<T> implements AsyncIterableIterator<T> {
    [Symbol.asyncIterator](): AsyncIterableIterator<T>;
    next(): Promise<IteratorResult<T>>;
    toArray(): Promise<T[]>;  // Coleta todos os items
}
```
