# RedmineWrapperTS — Documentação

**RedmineWrapperTS** é um wrapper fortemente tipado para a API REST do Redmine,
construído para Deno 2.0 com foco em imutabilidade, rastreabilidade e facilidade de uso.

## Índice

| Seção | Descrição |
|-------|-----------|
| [**Getting Started**](./getting-started.md) | Instalação, configuração, primeiro uso |
| [**Guia de Uso**](./usage-guide.md) | Exemplos completos para todos os 22 recursos |
| [**Guia de Integração**](./integration-guide.md) | Padrões de uso no dia-a-dia, boas práticas |
| [**Particularidades da API Redmine**](./particularities.md) | Quirks, limitações e observações importantes |
| [**Referência da API**](./api-reference.md) | Lista completa de recursos, tipos e métodos |
| [**Erros**](./error/errors.md) | Catálogo de erros RFC 7807 |

## Exemplo Rápido

```ts
import { RedmineWrapperTS } from "@st-all-one/redmine-wrapper-ts";

const sdk = RedmineWrapperTS.create({
    baseUrl: "https://redmine.example.com",
    apiKey: Deno.env.get("REDMINE_API_KEY")!,
});

// Issues abertas assignadas a mim, com paginação automática
for await (const issue of sdk.issues.list({
    assigned_to_id: "me",
    status_id: "open",
})) {
    console.log(`#${issue.id}: ${issue.subject}`);
}

// Buscar issue com journals + attachments
const issue = await sdk.issues.getWithIncludes(123, [
    "journals",
    "attachments",
]);

// Criar issue com upload
const token = await sdk.attachments.upload("debug.log", logBytes);
await sdk.issues.create({
    project_id: 1,
    subject: "Bug no login",
    tracker_id: 1,
    uploads: [{ token, filename: "debug.log", content_type: "text/plain" }],
});
```

## Licença

MPL-2.0 — Veja o arquivo `LICENSE` para detalhes.
