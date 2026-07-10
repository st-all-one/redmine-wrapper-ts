# Particularidades da API Redmine

## 1. Includes Não Funcionam em Listagens

O parâmetro `?include=journals,attachments` **só funciona** em requisições
individuais (`GET /issues/{id}.json`). Em listagens (`GET /issues.json`),
o include é ignorado.

```ts
// ✅ Funciona: dados associados inclusos
const issue = await sdk.issues.getWithIncludes(123, ["journals", "attachments"]);

// ❌ Não funciona: include ignorado em lista
for await (const issue of sdk.issues.list({ status_id: "open" })) {
    issue.journals;  // undefined
}
```

**Solução**: Se precisar dos dados associados em lote, faça uma chamada
individual para cada issue, ou use cache de dados mestre.

## 2. Wrapper de Resposta (Singular vs Lista)

A API do Redmine tem dois formatos de resposta diferentes:

```json
// Singular: objeto dentro de chave
GET /issues/123.json
{ "issue": { "id": 123, ... } }

// Lista: array dentro de chave + metadados
GET /issues.json
{ "issues": [...], "total_count": 100, "limit": 25, "offset": 0 }
```

O wrapper lida com isso automaticamente via `singleKey` e `listKey`
em cada resource. Você nunca precisa se preocupar com isso.

## 3. Filtros de Data Usam Operadores Especiais

O Redmine usa prefixos para filtros de data que precisam ser URL-encoded:

| Intenção | Filtro (decodificado) | URL Encoded |
|----------|----------------------|-------------|
| Após data | `>=2014-01-02T08:12:32Z` | `%3E%3D2014-01-02T08%3A12%3A32Z` |
| Antes de data | `<=2012-03-07` | `%3C%3D2012-03-07` |
| Intervalo | `><2012-03-01\|2012-03-07` | `%3E%3C2012-03-01%7C2012-03-07` |

O wrapper usa `URLSearchParams` que codifica automaticamente, então
você pode passar os filtros diretamente:

```ts
// Funciona — o encoding é automático
for await (const issue of sdk.issues.list({
    created_on: ">=2026-01-01",
    updated_on: "<=2026-06-30",
})) {
    console.log(issue.subject);
}
```

## 4. Campos Personalizados (Custom Fields)

Custom fields têm IDs numéricos. Para filtrar por eles em listagens:

```ts
// Filtrar por custom field #4 contendo "urgente"
for await (const issue of sdk.issues.list({
    cf_4: "~urgente",
})) {
    console.log(issue.subject);
}
```

Para criar/atualizar, use o array `custom_fields` com `id` e `value`:

```ts
await sdk.issues.create({
    project_id: 1,
    subject: "Teste",
    custom_fields: [
        { id: 1, value: "1.0.1" },      // cf_1 = string
        { id: 2, value: "5" },            // cf_2 = integer (usar string)
        { id: 3, value: "2026-07-10" },   // cf_3 = date
        { id: 4, value: "1" },            // cf_4 = boolean (1/0)
    ],
});
```

## 5. Projeto por Identifier vs ID

O Redmine aceita tanto o ID numérico quanto o identifier string em alguns
endpoints de projeto:

```ts
// Ambos funcionam para projetos
sdk.projects.get(5);              // ID numérico
sdk.projects.listByProject(5);     // ID numérico

// Mas para membroships, apenas o ID numérico é confiável
sdk.memberships.create(5, payload);  // project_id = 5
```

O wrapper sempre usa ID numérico para consistência.

## 6. Paginação: Limite Máximo de 100

A API do Redmine tem um limite máximo de **100 itens por página**.
O `PaginationIterator` usa 100 como padrão e gerencia multiplas páginas
automaticamente:

```ts
// Itera todas as issues (faz N chamadas de 100 em 100)
for await (const issue of sdk.issues.list({ status_id: "open" })) {
    process(issue);
}
```

Para coleções muito grandes, considere usar filtros mais específicos
para reduzir o número de páginas.

## 7. Impersonação Requer Admin

O `X-Redmine-Switch-User` (usado via `switchUser` na config) **só funciona**
com uma conta de administrador. Se o login alvo não existir ou estiver
inativo, retorna **412 Precondition Failed**.

```ts
// Apenas administradores podem impersonar
const sdk = RedmineWrapperTS.create({
    baseUrl,
    apiKey: adminKey,       // ← Precisa ser admin
    switchUser: "joao",     // Login do usuário alvo
});
```

## 8. Wiki: PUT Idempotente com Version Guard

A wiki do Redmine usa `PUT` para criar ou atualizar (não `POST` + `PUT`).
Se você incluir o campo `version` com o número da versão atual, a
atualização só ocorre se ninguém mais alterou a página desde sua leitura:

```ts
const page = await sdk.wiki.get(5, "MinhaPagina");
// page.version = 7

// Se outra pessoa alterou para versão 8 antes de você:
await sdk.wiki.createOrUpdate(5, "MinhaPagina", {
    text: "Novo conteúdo",
    version: 7,   // → 409 Conflict (versão desatualizada)
});
```

## 9. Time Entries: Issue ou Project (Mutualmente Exclusivos)

Um time entry deve estar vinculado a **uma issue OU a um projeto**,
nunca aos dois:

```ts
// ✅ Correto: vinculado a uma issue
await sdk.timeEntries.create({
    issue_id: 123,
    hours: 2,
    activity_id: 9,
});

// ❌ Incorreto: ambos preenchidos (a API ignora project_id)
```

## 10. Deleção de Journal é na Verdade Atualização

O Redmine não tem `DELETE /journals/{id}`. Para "deletar" um journal,
você atualiza as notas para vazio. O servidor automaticamente remove
o journal se ele não tiver detalhes e notas estiverem vazias:

```ts
await sdk.journals.update(5, { notes: "" });
// Equivalente a deletar (se journal não tiver detalhes)
```

## 11. Categories: Reassign ao Deletar

Ao deletar uma issue category, você pode reassignar todas as issues
da categoria deletada para outra categoria:

```ts
// Deletar categoria #10 e reassignar issues para #15
await sdk.issueCategories.delete(10, { reassignToId: 15 });
```

## 12. Rate Limiting do Servidor

Além do rate limiting interno do wrapper (10 req/s por padrão),
o servidor Redmine pode ter sua própria política de rate limiting.
Se receber `429 Too Many Requests`, o wrapper lança um
`RedmineWrapperError` com category `rate-limited`.

Considere reduzir `maxRps` na configuração se o servidor for
restritivo ou compartilhado com outras integrações.
