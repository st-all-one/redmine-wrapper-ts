<div align="center">

# RedmineWrapperTS

**Wrapper fortemente tipado para a API REST do Redmine — Deno 2.0**

[![License: MPL 2.0](https://img.shields.io/badge/License-MPL_2.0-2b3a42?style=for-the-badge)](https://opensource.org/licenses/MPL-2.0)
[![JSR](https://img.shields.io/badge/JSR-F7DF1E?style=for-the-badge&logo=jsr&logoColor=000)](https://jsr.io/@st-all-one/redmine-wrapper-ts)
[![Made in Brazil](https://img.shields.io/badge/Made_in-Brazil-009739?style=for-the-badge)](https://github.com/topics/brazil)

</div>

O **`RedmineWrapperTS`** é um wrapper puramente back-end para a API REST do Redmine, construído para **Deno 2.0** com foco em imutabilidade, rastreabilidade e facilidade de uso. Cada instância é isolada, imutável e pode ser usada simultaneamente em diferentes partes do sistema sem risco de contaminação de estado.

---

## 📖 Documentação

- [Guia de Uso](./wiki/usage-guide.md) — Exemplos completos para todos os 22 recursos
- [Getting Started](./wiki/getting-started.md) — Instalação, configuração, primeira chamada
- [Guia de Integração](./wiki/integration-guide.md) — Padrões de uso no dia-a-dia
- [Particularidades da API](./wiki/particularities.md) — Quirks e observações importantes
- [Referência da API](./wiki/api-reference.md) — Lista completa de métodos e tipos
- [Catálogo de Erros](./wiki/error/errors.md) — Erros RFC 7807 com UUIDv7

## 🚀 Quick-start

### Instalação:

```bash
deno    add jsr:@st-all-one/redmine-wrapper-ts
pnpm      i jsr:@st-all-one/redmine-wrapper-ts
yarn    add jsr:@st-all-one/redmine-wrapper-ts
npx     jsr add @st-all-one/redmine-wrapper-ts
bunx    jsr add @st-all-one/redmine-wrapper-ts
```

### Configuração:

```ts
import { RedmineWrapperTS } from "@st-all-one/redmine-wrapper-ts";

const sdk = RedmineWrapperTS.create({
    baseUrl: Deno.env.get("REDMINE_URL")!,
    apiKey: Deno.env.get("REDMINE_KEY")!,
});
```

### Uso básico:

```ts
// Issues abertas assignadas a mim
for await (const issue of sdk.issues.list({
    assigned_to_id: "me",
    status_id: "open",
})) {
    console.log(`#${issue.id}: ${issue.subject}`);
}

// Buscar com journals + attachments
const issue = await sdk.issues.getWithIncludes(123, [
    "journals",
    "attachments",
]);

// Criar issue com upload
const token = await sdk.attachments.upload("relatorio.pdf", pdfBytes);
await sdk.issues.create({
    project_id: 5,
    subject: "Bug no login",
    tracker_id: 1,
    uploads: [{ token, filename: "relatorio.pdf", content_type: "application/pdf" }],
});
```

### Tratamento de erros (RFC 7807):

```ts
import { RedmineWrapperError } from "@st-all-one/redmine-wrapper-ts";

try {
    await sdk.issues.get(99999);
} catch (err) {
    if (err instanceof RedmineWrapperError) {
        console.error(`[${err.instance}] ${err.detail}`);
        console.error(err.toJSON());
        // { type, title: "resource-not-found", status: 404,
        //   instance: "urn:uuid:0194d...", context: {...} }
    }
}
```

## 🌐 Recursos Cobertos

| Resource | Status | Endpoints |
|----------|--------|-----------|
| Issues | Stable | CRUD, watchers, transições, includes |
| Projects | Stable | CRUD, archive, includes |
| Users | Stable | CRUD, current user, includes |
| Time Entries | Stable | CRUD, filtros por projeto/issue/data |
| Attachments | Beta | Upload 2-step, metadados |
| Journals | Alpha | Atualização e remoção de notas |
| Relations | Alpha | CRUD por issue |
| Wiki Pages | Alpha | CRUD, versionamento, conflito |
| Versions | Alpha | CRUD por projeto |
| Enumerations | Alpha | Prioridades, atividades, categorias |
| Trackers | Alpha | Listagem |
| Issue Statuses | Alpha | Listagem |
| Issue Categories | Alpha | CRUD, reassign ao deletar |
| Memberships | Alpha | CRUD, herança de grupo |
| Roles | Alpha | Listagem com permissões |
| Groups | Alpha | CRUD, gerenciamento de membros |
| Custom Fields | Alpha | Listagem de definições |
| Queries | Alpha | Listagem de consultas salvas |
| Files | Alpha | Listagem e anexo |
| Search | Alpha | Busca multi-recursos |
| News | Alpha | CRUD por projeto |
| My Account | Alpha | Dados da conta autenticada |

## 🎯 Principais Características

### Imutabilidade e Isolamento

Cada instância é criada com `RedmineWrapperTS.create()` e sua configuração é **congelada** — não há `setApiKey()` ou `setSwitchUser()`. Para usar configurações diferentes, crie uma nova instância. Isso permite que múltiplas partes do sistema operem com credenciais e servidores diferentes **simultaneamente** sem risco de contaminação de estado global.

```ts
const sdkAdmin = RedmineWrapperTS.create({ baseUrl, apiKey: adminKey });
const sdkUser = RedmineWrapperTS.create({ baseUrl, apiKey: userKey });
const sdkDev = RedmineWrapperTS.create({ baseUrl: devUrl, apiKey: devKey });
```

### Paginação Automática

A API do Redmine limita resultados a 100 por página. O `PaginationIterator` gerencia isso de forma transparente via `AsyncGenerator`:

```ts
// Streaming — faz fetch página a página
for await (const issue of sdk.issues.list({ status_id: "open" })) {
    process(issue);
}

// Ou coleto tudo em um array
const todas = await sdk.issues.list({ status_id: "*" }).toArray();
```

### Sistema de Erros RFC 7807

Todos os erros seguem o padrão **Problem Details (RFC 7807)** com **UUIDv7** único para correlação em logs, 12 categorias de erro mapeadas para status HTTP, e contexto rico para auditoria:

```json
{
    "type": "https://.../validation-error.md",
    "title": "validation-error",
    "status": 422,
    "detail": "Subject can't be blank; Project can't be blank",
    "instance": "urn:uuid:019db142-f59d-7606-9f20-6ebfa53759e0",
    "context": {
        "operation": "POST /issues.json",
        "httpStatus": 422,
        "apiErrors": ["Subject can't be blank", "Project can't be blank"]
    }
}
```

### Logs Estruturados

Cada erro é automaticamente registrado via `@logtape/logtape` com namespace `["redmine-wrapper-ts", "error"]`, incluindo `error_type`, `instance`, `status`, `detail` e `context`.

### TypeScript Rigoroso

- Strict mode: `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Zero `any` — todos os tipos flexíveis usam `unknown`
- `import type` obrigatório para imports type-only (`verbatim-module-syntax`)
- Retornos explícitos em todas as funções

## 🔍 Testes

```bash
deno task fmt        # formatação
deno task lint       # lint (56 arquivos, 0 problemas)
deno task check      # type check
deno task test       # 21 testes unitários
```

> ```bash
> ❯ deno test
> ok | 21 passed | 0 failed (233ms)
> ```

## 🛠️ Stack

| Componente | Tecnologia |
|------------|-----------|
| Runtime | Deno 2.0+ |
| HTTP | `fetch` nativo |
| Erros | RFC 7807 com UUIDv7 (`@std/uuid`) |
| Logs | `@logtape/logtape` |
| Linguagem | TypeScript 5.x (strict) |
| Licença | MPL-2.0 |

---

<div align="center">

---

Este projeto é Open Source e Licenciado através da **Mozilla Public License v2.0 (MPL-2.0)**

</div>
