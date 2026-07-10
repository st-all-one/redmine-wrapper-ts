# RedmineWrapperTS — Agent Guide

## TL;DR

```bash
deno task fmt          # format (4-space indent, sameLine braces, lineWidth 120)
deno task lint         # lint (strict rules: explicit return types, no-non-null-assertion, verbatim-module-syntax, etc.)
deno task test         # all tests
deno task check        # type-check all source
```

Publish: `npx jsr publish` (CI auto-publishes on push to `main`).

## Architecture

- **Factory-based isolation**: `RedmineWrapperTS.create({ baseUrl, apiKey, ... })` — **no global state**
- **Immutability**: Config is frozen after creation. No setters. Create a new instance for different configs.
- **RFC 7807 errors**: `RedmineWrapperError` with `type`, `title`, `status`, `detail`, `instance` (UUIDv7), `context`
- **Error categories**: 12 domain-specific categories (authentication-failed, validation-error, rate-limited, etc.)
- **Logging**: `@logtape/logtape` with namespace-based subloggers
- **Tech stack**: Deno runtime, `@std/uuid` (v7 UUID for error tracking), LogTape 2.0, native `fetch`
- **Pagination**: `PaginationIterator<T>` (AsyncGenerator, auto-fetch pages)

## Entry points

| Path | What |
|------|------|
| `mod.ts` | Public API exports |
| `src/main.ts` | `RedmineWrapperTS` factory (`create()`) |
| `src/http/client.ts` | `HttpClient` — low-level HTTP with rate limiting |
| `src/http/pagination.ts` | `PaginationIterator<T>` — async pagination |
| `src/core/errors.ts` | `RedmineWrapperError` — RFC 7807 error class |
| `src/core/types.ts` | `RedmineWrapperConfig` — configuration interface |
| `src/core/constants.ts` | Library constants (LOG_NAMESPACE, defaults) |

Import-map aliases used: `~sdk`, `~internal-types`.

## Code conventions

- Strict TS: `strict`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`
- `#private` fields for encapsulation
- Explicit return types on all functions/methods (`explicit-function-return-type`, `explicit-module-boundary-types`)
- `verbatim-module-syntax` enabled — use `import type` for type-only imports
- 4-space indent, `sameLine` braces, `nextLine` operators, `lineWidth` 120, no tab
- License header (MPL-2.0) in every `.ts` file

## Important constraints

| Constraint | Detail |
|------------|--------|
| Immutable config | Config is read-only after `create()`. Create new instance to change. |
| Rate limiting | Default 10 req/s, configurable via `maxRps` |
| Timeout | Default 30s, configurable via `timeoutMs` |
| Error format | RFC 7807 with UUIDv7 — always check `instance` for log correlation |

## Directory map

```
src/           — core library
  core/        — errors, types, constants
  http/        — HTTP client, pagination
  resources/   — API resource classes (22 resources)
  types/       — TypeScript type definitions (22 modules)
  utils/       — logger (logtape)
tests/         — unit tests
wiki/          — documentation
  error/       — error category reference (RFC 7807)
```
