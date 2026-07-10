# Guia de Erros (RedmineWrapperTS)

O RedmineWrapperTS utiliza um sistema de erros estrito seguindo a **RFC 7807 (Problem Details)** para garantir que todas as falhas de integração com a API Redmine sejam rastreáveis, auto-explicativas e facilmente integráveis em sistemas de auditoria e observabilidade.

## Anatomia de um `RedmineWrapperError` (RFC 7807)

| Atributo | Exemplo | Descrição |
| :--- | :--- | :--- |
| `type` | `https://.../validation-error.md` | URI única que aponta para a documentação do erro. |
| `title` | `"validation-error"` | Categoria curta do erro. |
| `status` | `422` | Código de status HTTP sugerido. |
| `detail` | `"Subject can't be blank; Project can't be blank"` | Explicação detalhada da ocorrência específica. |
| `instance` | `urn:uuid:019db142-f59d-7606-9f20-6ebfa53759e0` | **Trace ID Único (UUID-V7)** para correlação em logs. |
| `context` | `{ operation: "POST /issues.json", httpStatus: 422, ... }` | Dados técnicos (operação, HTTP status, erros originais da API) para perícia. |

### O Poder do UUID-V7

Diferente de IDs aleatórios, o RedmineWrapperTS utiliza **UUID-V7**, que é ordenado cronologicamente por design. Isso permite que desenvolvedores e auditors ordenem incidentes de erro no tempo de forma precisa, mesmo em ambientes multi-servidor, facilitando a correlação entre logs de aplicação, servidor e rede.

```json
// Exemplo de saída toJSON()
{
    "type": "https://github.com/redmine/sdk/wiki/error/validation-error.md",
    "title": "validation-error",
    "status": 422,
    "detail": "Subject can't be blank",
    "instance": "urn:uuid:019db142-f59d-7606-9f20-6ebfa53759e0",
    "context": {
        "operation": "POST /issues.json",
        "httpStatus": 422,
        "apiErrors": ["Subject can't be blank"],
        "responseBody": { "errors": ["Subject can't be blank"] }
    }
}
```

---

## Resumo de Erros

### Erros de Autenticação e Autorização

| Erro | HTTP | Descrição Curta |
| :--- | :--- | :--- |
| [`authentication-failed`](./authentication-failed.md) | 401 | A API key fornecida é inválida, ausente, ou a API REST não está habilitada no servidor. |
| [`authorization-denied`](./authorization-denied.md) | 403 | O usuário autenticado não tem permissão para acessar o recurso solicitado. |

### Erros de Requisição

| Erro | HTTP | Descrição Curta |
| :--- | :--- | :--- |
| [`resource-not-found`](./resource-not-found.md) | 404 | O recurso solicitado não existe no servidor (ID incorreto, recurso deletado, ou inacessível). |
| [`validation-error`](./validation-error.md) | 422 | A requisição contém dados inválidos — campos obrigatórios ausentes, chaves estrangeiras incorretas, etc. |
| [`conflict`](./conflict.md) | 409 | Conflito de versão, tipicamente ao atualizar uma página wiki com uma versão desatualizada. |
| [`impersonation-failed`](./impersonation-failed.md) | 412 | A impersonação via `X-Redmine-Switch-User` falhou — login alvo inexistente ou inativo. |
| [`upload-too-large`](./upload-too-large.md) | 413 | O arquivo enviado excede o limite de tamanho configurado no servidor Redmine. |

### Erros de Sistema e Rede

| Erro | HTTP | Descrição Curta |
| :--- | :--- | :--- |
| [`rate-limited`](./rate-limited.md) | 429 | Muitas requisições enviadas em curto período — o servidor aplicou rate limiting. |
| [`timeout`](./timeout.md) | 504 | A requisição excedeu o tempo limite configurado sem resposta do servidor. |
| [`network-error`](./network-error.md) | 503 | Falha de rede ao conectar ao servidor Redmine — DNS, firewall, ou servidor offline. |
| [`parse-error`](./parse-error.md) | 500 | A resposta do servidor não pôde ser interpretada — JSON malformado ou estrutura inesperada. |
| [`internal-error`](./internal-error.md) | 500 | Erro interno não categorizado — status HTTP não mapeado ou falha inesperada. |

---

## 💡 Como tratar erros

### Captura Segura

```typescript
import { RedmineWrapperError } from "@st-all-one/redmine-wrapper-ts";

try {
    await sdk.issues.get(123);
} catch (err) {
    if (err instanceof RedmineWrapperError) {
        console.error(`Falha na integração [${err.instance}]: ${err.detail}`);

        // Logar para observabilidade (APM/SIEM)
        await sendToElastic({
            index: "redmine-errors",
            body: err.toJSON(),
        });

        // Extrair contexto para decisão de negócio
        if (err.status === 404) {
            // Recurso não existe — notificar usuário
        } else if (err.status === 429) {
            // Rate limited — agendar retry
        }
    }
}
```

### Retry com Backoff para Erros Transitórios

```typescript
import { RedmineWrapperError } from "@st-all-one/redmine-wrapper-ts";

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (err instanceof RedmineWrapperError) {
                if (err.status === 429 || err.status === 504) {
                    const wait = Math.pow(2, attempt) * 1000;
                    console.warn(
                        `[${err.instance}] Tentativa ${attempt + 1} falhou. Aguardando ${wait}ms...`,
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
```

### Logs Estruturados com o UUID do Erro

O UUIDv7 presente em `err.instance` permite correlação direta entre logs da aplicação, traces do servidor e requisições de rede:

```typescript
// O [instance] permite encontrar este erro específico em qualquer sistema
logger.error({
    msg: "Falha ao buscar issue no Redmine",
    redmineErrorId: err.instance,    // "urn:uuid:019db142-..."
    category: err.title,
    httpStatus: err.status,
    detail: err.detail,
    operation: err.context.operation,
});
```

---

## 🔗 Veja também

- [**Guia de Uso**](../usage-guide.md): Exemplos completos de integração.
- [**Particularidades da API**](../particularities.md): Quirks e observações sobre a API Redmine.
- [**Central de Documentação**](../index.md): Voltar para a página principal.

---

[↑ Voltar ao índice](../index.md)
