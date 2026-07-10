/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ResolvedConfig } from "../core/types.ts";
import { RedmineWrapperError } from "../core/errors.ts";
import { PaginationIterator } from "./pagination.ts";

/** Options for a single HTTP request. */
interface RequestOptions {
    method: "GET" | "POST" | "PUT" | "DELETE";
    path: string;
    body?: unknown | undefined;
    params?: Record<string, string | number | undefined> | undefined;
    isUpload?: boolean | undefined;
}

/** API object passed to resources. */
/** Objeto da API passado para os recursos. */
export interface ResourceApi {
    get: <R>(path: string, params?: Record<string, string | number | undefined>) => Promise<R>;
    post: <R>(path: string, body?: unknown) => Promise<R>;
    put: <R>(path: string, body?: unknown) => Promise<R>;
    delete: (path: string) => Promise<void>;
    upload: (filename: string, data: Uint8Array) => Promise<string>;
    paginate: <R>(
        path: string,
        itemKey: string,
        params?: Record<string, string | number | undefined>,
    ) => PaginationIterator<R>;
}

/**
 * HTTP Client interno — lida com autenticação, rate limiting e parsing de erros.
 * Não exposto publicamente; usado via RedmineWrapperTS.
 */
export class HttpClient {
    readonly #baseUrl: string;
    readonly #apiKey: string;
    readonly #switchUser: string | undefined;
    readonly #timeoutMs: number;
    readonly #maxRps: number;

    #requestTimestamps: number[] = [];

    constructor(config: ResolvedConfig) {
        this.#baseUrl = config.baseUrl.replace(/\/+$/, "");
        this.#apiKey = config.apiKey;
        this.#switchUser = config.switchUser;
        this.#timeoutMs = config.timeoutMs;
        this.#maxRps = config.maxRps;
    }

    /** Executa uma requisição HTTP genérica. */
    async #request<T>(opts: RequestOptions): Promise<T> {
        await this.#acquireSlot();

        const url = this.#buildUrl(opts.path, opts.params);
        const headers = this.#buildHeaders(opts.isUpload);

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.#timeoutMs);

        try {
            const fetchOpts: RequestInit = {
                method: opts.method,
                headers,
                signal: controller.signal,
            };

            if (opts.body !== undefined && !opts.isUpload) {
                fetchOpts.body = JSON.stringify(opts.body);
            } else if (opts.body !== undefined && opts.isUpload) {
                fetchOpts.body = opts.body as BodyInit;
            }

            const response = await fetch(url.toString(), fetchOpts);

            if (!response.ok) {
                await this.#handleError(response, opts.path);
            }

            if (response.status === 204) {
                return undefined as T;
            }

            return (await response.json()) as T;
        } catch (err) {
            if (err instanceof RedmineWrapperError) { throw err; }
            if (err instanceof DOMException && err.name === "AbortError") {
                throw new RedmineWrapperError(
                    "timeout",
                    `Request timed out after ${this.#timeoutMs}ms`,
                    { operation: `${opts.method} ${opts.path}` },
                );
            }
            throw new RedmineWrapperError(
                "network-error",
                (err as Error).message,
                { operation: `${opts.method} ${opts.path}` },
            );
        } finally {
            clearTimeout(timer);
        }
    }

    /** Requisição GET. */
    get<T>(
        path: string,
        params?: Record<string, string | number | undefined>,
    ): Promise<T> {
        return this.#request<T>({ method: "GET", path, params });
    }

    /** Requisição POST. */
    post<T>(path: string, body?: unknown): Promise<T> {
        return this.#request<T>({ method: "POST", path, body });
    }

    /** Requisição PUT. */
    put<T>(path: string, body?: unknown): Promise<T> {
        return this.#request<T>({ method: "PUT", path, body });
    }

    /** Requisição DELETE. */
    delete(path: string): Promise<void> {
        return this.#request<void>({ method: "DELETE", path });
    }

    /**
     * Upload de arquivo (2-step process, step 1).
     * Retorna o token para usar no step 2.
     */
    async upload(filename: string, data: Uint8Array): Promise<string> {
        const result = await this.#request<{ upload: { token: string } }>({
            method: "POST",
            path: `/uploads.json?filename=${encodeURIComponent(filename)}`,
            body: data,
            isUpload: true,
        });
        return result.upload.token;
    }

    /** Cria um iterator paginado para coleções da API. */
    paginate<T>(
        path: string,
        itemKey: string,
        params?: Record<string, string | number | undefined>,
    ): PaginationIterator<T> {
        return new PaginationIterator<T>(
            async (offset: number, limit: number) => {
                const data = await this.get<Record<string, unknown>>(path, {
                    ...params,
                    offset,
                    limit,
                });
                const items = (data[itemKey] ?? []) as T[];
                const total = (data.total_count as number) ?? items.length;
                return { items, total };
            },
        );
    }

    // ── Private ──────────────────────────────────────────────

    #buildUrl(
        path: string,
        params?: Record<string, string | number | undefined>,
    ): URL {
        const url = new URL(`${this.#baseUrl}${path}`);
        if (params) {
            for (const [key, value] of Object.entries(params)) {
                if (value !== undefined) {
                    url.searchParams.set(key, String(value));
                }
            }
        }
        return url;
    }

    #buildHeaders(isUpload?: boolean): Record<string, string> {
        const headers: Record<string, string> = {
            "X-Redmine-API-Key": this.#apiKey,
            "User-Agent": "redmine-wrapper-ts/0.1.0",
        };

        if (isUpload) {
            headers["Content-Type"] = "application/octet-stream";
        } else {
            headers["Content-Type"] = "application/json";
        }

        if (this.#switchUser) {
            headers["X-Redmine-Switch-User"] = this.#switchUser;
        }

        return headers;
    }

    async #handleError(
        response: Response,
        operation: string,
    ): Promise<never> {
        let apiErrors: string[] = [];
        let parsedBody: unknown;

        try {
            parsedBody = await response.json();
            if (
                parsedBody
                && typeof parsedBody === "object"
                && "errors" in parsedBody
            ) {
                const body = parsedBody as { errors: unknown };
                if (Array.isArray(body.errors)) {
                    apiErrors = body.errors.map(String);
                }
            }
        } catch {
            apiErrors = [`HTTP ${response.status}: ${response.statusText}`];
        }

        const status = response.status;
        const category = STATUS_CATEGORY_MAP[status] ?? "internal-error";

        throw new RedmineWrapperError(
            category,
            apiErrors.join("; "),
            {
                operation,
                httpStatus: status,
                apiErrors,
                responseBody: parsedBody,
            },
        );
    }

    /** Rate limiter: aguarda se exceder maxRps. */
    async #acquireSlot(): Promise<void> {
        const now = Date.now();
        const windowMs = 1000;

        this.#requestTimestamps = this.#requestTimestamps.filter(
            (t) => now - t < windowMs,
        );

        if (this.#requestTimestamps.length >= this.#maxRps) {
            const oldest = this.#requestTimestamps[0];
            if (oldest === undefined) { return; }
            const waitMs = windowMs - (now - oldest);
            if (waitMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, waitMs));
            }
        }

        this.#requestTimestamps.push(Date.now());
    }
}

import type { ErrorCategory } from "../core/errors.ts";

const STATUS_CATEGORY_MAP: Record<number, ErrorCategory> = {
    401: "authentication-failed",
    403: "authorization-denied",
    404: "resource-not-found",
    409: "conflict",
    412: "impersonation-failed",
    413: "upload-too-large",
    422: "validation-error",
    429: "rate-limited",
};
