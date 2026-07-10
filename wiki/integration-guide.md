# Guia de Integração — Dia a Dia

## Estrutura Recomendada de Projeto

```
meu-app/
├── deno.jsonc
├── src/
│   ├── main.ts              ← Configuração do SDK
│   ├── services/
│   │   ├── redmine.ts       ← Instância centralizada do SDK
│   │   ├── ticket-pipeline.ts ← Lógica de automação
│   │   └── reporting.ts     ← Geração de relatórios
│   └── scripts/
│       └── sync-issues.ts   ← Scripts pontuais
```

### `src/services/redmine.ts` — Instância Centralizada

```ts
import { RedmineWrapperTS } from "@st-all-one/redmine-wrapper-ts";

let sdk: RedmineWrapperTS | undefined;

export function getRedmineSDK(): RedmineWrapperTS {
    if (sdk) return sdk;

    sdk = RedmineWrapperTS.create({
        baseUrl: Deno.env.get("REDMINE_URL")!,
        apiKey: Deno.env.get("REDMINE_KEY")!,
        timeoutMs: 30_000,
        maxRps: 10,
    });

    return sdk;
}

// Teste de conexão na inicialização
export async function healthCheck(): Promise<boolean> {
    try {
        await getRedmineSDK().myAccount.get();
        return true;
    } catch {
        return false;
    }
}
```

### Uso em Diferentes Partes

```ts
// src/services/ticket-pipeline.ts
import { getRedmineSDK } from "./redmine.ts";

export async function processNewTickets() {
    const sdk = getRedmineSDK();

    for await (const issue of sdk.issues.list({
        status_id: "open",
        assigned_to_id: "me",
    })) {
        await autoClassify(issue);
    }
}
```

## Padrões Comuns

### Pipeline de Automação (Polling)

```ts
import { getRedmineSDK } from "./redmine.ts";

async function main() {
    const sdk = getRedmineSDK();

    while (true) {
        const issues = await sdk.issues.list({
            assigned_to_id: "me",
            status_id: "open",
        }).toArray();

        for (const issue of issues) {
            const full = await sdk.issues.getWithIncludes(
                issue.id,
                ["journals", "allowed_statuses"],
            );

            const decision = await decideAction(full);
            await executeDecision(sdk, full.id, decision);
        }

        await new Promise(r => setTimeout(r, 60_000));
    }
}
```

### Webhook-style (Servidor HTTP)

```ts
import { serve } from "https://deno.land/std/http/server.ts";
import { getRedmineSDK } from "./services/redmine.ts";

serve(async (req) => {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/webhook/issue") {
        const body = await req.json();
        const sdk = getRedmineSDK();

        await sdk.issues.update(body.issue_id, {
            notes: `Processado via webhook: ${body.action}`,
        });

        return new Response(JSON.stringify({ ok: true }), {
            headers: { "content-type": "application/json" },
        });
    }

    return new Response("Not found", { status: 404 });
});
```

### Múltiplas Instâncias (Diferentes Projetos)

```ts
import { RedmineWrapperTS } from "@st-all-one/redmine-wrapper-ts";

// Cada instância é independente e imutável
const sdkAlpha = RedmineWrapperTS.create({
    baseUrl: "https://redmine.alpha.com",
    apiKey: Deno.env.get("KEY_ALPHA")!,
});

const sdkBeta = RedmineWrapperTS.create({
    baseUrl: "https://redmine.beta.com",
    apiKey: Deno.env.get("KEY_BETA")!,
});

// Usar simultaneamente
for await (const issue of sdkAlpha.issues.list({ status_id: "open" })) {
    console.log(`Alpha: #${issue.id}`);
}

for await (const issue of sdkBeta.issues.list({ status_id: "open" })) {
    console.log(`Beta: #${issue.id}`);
}
```

## Tratamento de Erros Robusto

### Retry com Backoff

```ts
import { RedmineWrapperError } from "@st-all-one/redmine-wrapper-ts";

async function withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (err instanceof RedmineWrapperError) {
                // Rate-limited: esperar e tentar novamente
                if (err.status === 429 || err.status === 504) {
                    const wait = Math.pow(2, attempt) * 1000;
                    console.warn(
                        `[${err.instance}] Tentativa ${attempt + 1} falhou.`
                        + ` Aguardando ${wait}ms...`,
                    );
                    await new Promise(r => setTimeout(r, wait));
                    continue;
                }
            }
            throw err;
        }
    }
    throw new Error(`Falha após ${maxRetries} tentativas`);
}

// Uso
const issue = await withRetry(() => sdk.issues.get(123));
```

### Log Estruturado com o UUID do Erro

```ts
try {
    await sdk.issues.get(99999);
} catch (err) {
    if (err instanceof RedmineWrapperError) {
        // O UUIDv7 permite correlacionar logs entre sistemas
        logger.error({
            msg: "Falha ao buscar issue",
            redmineError: err.instance,   // urn:uuid:...
            status: err.status,
            detail: err.detail,
            operation: err.context.operation,
        });

        // Enviar para SIEM/APM
        await sendToElastic({
            index: "redmine-errors",
            body: err.toJSON(),
        });
    }
}
```

## Cache de Dados Mestre

A ordem recomendada para carregar dados de configuração (bootstrap):

```ts
export async function loadMasterData() {
    const sdk = getRedmineSDK();

    const [
        statuses,
        trackers,
        priorities,
        activities,
        customFields,
    ] = await Promise.all([
        sdk.issueStatuses.list(),
        sdk.trackers.list(),
        sdk.enumerations.listIssuePriorities(),
        sdk.enumerations.listTimeEntryActivities(),
        sdk.customFields.list(),
    ]);

    return {
        statusById: new Map(statuses.map(s => [s.id, s])),
        trackerById: new Map(trackers.map(t => [t.id, t])),
        priorityById: new Map(priorities.map(p => [p.id, p])),
        activityById: new Map(activities.map(a => [a.id, a])),
        customFieldById: new Map(customFields.map(cf => [cf.id, cf])),
    };
}
```

## Considerações de Performance

1. **Use `toArray()` com moderação**: Coletar todas as issues de um projeto grande
   pode fazer MUITAS requisições. Prefira `for-await-of` para processamento streaming.

2. **Includes são por requisição**: `getWithIncludes` faz apenas UMA chamada,
   mas a listagem NÃO suporta includes — evite N+1 chamadas.

3. **Limite o `limit`**: O máximo é 100 por página. Para coleções grandes,
   o `PaginationIterator` gerencia isso automaticamente.

4. **Rate limiting interno**: O wrapper já limita a 10 req/s por padrão.
   Ajuste `maxRps` se o servidor tiver limites mais restritivos.

5. **Upload de arquivos grandes**: Faça upload de uma vez só. O limite
   é configurado no servidor Redmine (Admin → Settings → Attachment size).
