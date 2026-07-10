/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { PaginationIterator } from "../http/pagination.ts";

/**
 * Base abstrata para todos os resources da API.
 * Implementa CRUD genérico com tipagem forte.
 */
export abstract class BaseResource<
    T,
    TCreate = never,
    TUpdate = never,
    TFilter = Record<string, string | number | undefined>,
> {
    constructor(
        protected readonly request: {
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
        },
    ) {}

    /** Path base do resource (ex: "/issues"). */
    protected abstract get basePath(): string;

    /** Chave do array na resposta listada (ex: "issues"). */
    protected abstract get listKey(): string;

    /** Chave do objeto singular na resposta (ex: "issue"). */
    protected abstract get singleKey(): string;

    /** Lista com paginação automática. */
    list(params?: TFilter): PaginationIterator<T> {
        return this.request.paginate<T>(
            `${this.basePath}.json`,
            this.listKey,
            params as Record<string, string | number | undefined>,
        );
    }

    /** Busca por ID. */
    async get(id: number, params?: Record<string, string>): Promise<T> {
        const data = await this.request.get<Record<string, T>>(
            `${this.basePath}/${id}.json`,
            params,
        );
        return data[this.singleKey] as T;
    }

    /** Cria um novo recurso. */
    async create(payload: TCreate): Promise<T> {
        const data = await this.request.post<Record<string, T>>(
            `${this.basePath}.json`,
            { [this.singleKey]: payload },
        );
        return data[this.singleKey] as T;
    }

    /** Atualiza um recurso existente. */
    async update(id: number, payload: TUpdate): Promise<void> {
        await this.request.put(
            `${this.basePath}/${id}.json`,
            { [this.singleKey]: payload },
        );
    }

    /** Remove um recurso. */
    async delete(id: number): Promise<void> {
        await this.request.delete(`${this.basePath}/${id}.json`);
    }
}
