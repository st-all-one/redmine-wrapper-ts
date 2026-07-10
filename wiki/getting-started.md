# Getting Started

## Instalação

```bash
# Adicionar ao seu projeto Deno
deno add jsr:@st-all-one/redmine-wrapper-ts

# Ou importar diretamente
deno run --allow-net --allow-env seu-script.ts
```

## Configuração Mínima

```ts
import { RedmineWrapperTS } from "@st-all-one/redmine-wrapper-ts";

const sdk = RedmineWrapperTS.create({
    baseUrl: "https://redmine.seu-dominio.com",
    apiKey: "sua-api-key-aqui",
});
```

A chave de API é obtida no Redmine em: **Minha Conta** → `API access key`.

### Via Variáveis de Ambiente

```ts
const sdk = RedmineWrapperTS.create({
    baseUrl: Deno.env.get("REDMINE_URL")!,
    apiKey: Deno.env.get("REDMINE_KEY")!,
});
```

```bash
export REDMINE_URL="https://redmine.seu-dominio.com"
export REDMINE_KEY="sua-chave-aqui"
deno run --allow-net --allow-env app.ts
```

## Configuração Completa

```ts
const sdk = RedmineWrapperTS.create({
    // Obrigatórios
    baseUrl: "https://redmine.seu-dominio.com",
    apiKey: "sua-chave",

    // Opcionais
    timeoutMs: 15_000,      // Timeout por requisição (default: 30s)
    maxRps: 5,              // Requisições por segundo (default: 10)
    switchUser: "joao",     // Impersonação (apenas admin)
});
```

## Imutabilidade

Uma vez criada, a instância é **imutável**. Não há `setApiKey()` ou `setSwitchUser()`.
Para usar configurações diferentes, crie uma nova instância:

```ts
const sdkAdmin = RedmineWrapperTS.create({ baseUrl, apiKey: adminKey });
const sdkUser = RedmineWrapperTS.create({ baseUrl, apiKey: userKey });
```

Isso permite que diferentes partes do sistema operem com credenciais
diferentes sem risco de contaminação de estado global.

## Primeira Chamada

```ts
// Verificar se a conexão está funcionando
const me = await sdk.myAccount.get();
console.log(`Conectado como: ${me.firstname} ${me.lastname}`);

// Listar projetos
const projetos = await sdk.projects.list().toArray();
console.log(`Acesso a ${projetos.length} projetos`);
```

## Tratamento de Erros

Todos os erros seguem o padrão **RFC 7807** com UUIDv7 único para correlação:

```ts
import { RedmineWrapperError } from "@st-all-one/redmine-wrapper-ts";

try {
    await sdk.issues.get(99999);
} catch (err) {
    if (err instanceof RedmineWrapperError) {
        console.error(`Erro [${err.instance}]: ${err.detail}`);
        console.error(`Categoria: ${err.title} (HTTP ${err.status})`);

        // Enviar para sistema de auditoria
        await auditLog(err.toJSON());
    }
}
```

## Paginação Automática

A API do Redmine limita o número de resultados por página (default 25, máximo 100).
O wrapper faz a paginação automaticamente via `AsyncGenerator`:

```ts
// Itera todas as issues abertas — faz fetch página a página
for await (const issue of sdk.issues.list({ status_id: "open" })) {
    process(issue);
}

// Ou coleta tudo em um array
const todas = await sdk.issues.list({ status_id: "open" }).toArray();
```
