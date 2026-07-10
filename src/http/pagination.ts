/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Iterator paginado que faz fetch automático página a página.
 *
 * @example
 * ```ts
 * for await (const issue of sdk.issues.list({ status_id: "open" })) {
 *   console.log(issue.subject);
 * }
 * ```
 */
export class PaginationIterator<T> implements AsyncIterableIterator<T> {
    private offset = 0;
    private limit: number;
    private buffer: T[] = [];
    private bufferIndex = 0;
    private totalCount = 0;
    private exhausted = false;

    constructor(
        private fetchPage: (offset: number, limit: number) => Promise<{ items: T[]; total: number }>,
        limit = 100,
    ) {
        this.limit = limit;
    }

    /** Obtém o próximo item, fazendo fetch de mais páginas se necessário. */
    async next(): Promise<IteratorResult<T>> {
        if (this.bufferIndex < this.buffer.length) {
            const value = this.buffer[this.bufferIndex];
            this.bufferIndex++;
            return { value, done: false } as IteratorResult<T>;
        }

        if (this.exhausted) {
            return { value: undefined, done: true };
        }

        const page = await this.fetchPage(this.offset, this.limit);
        this.totalCount = page.total;
        this.buffer = page.items;
        this.bufferIndex = 0;
        this.offset += this.limit;

        if (this.buffer.length === 0 || this.offset >= this.totalCount) {
            this.exhausted = true;
        }

        if (this.buffer.length === 0) {
            return { value: undefined, done: true };
        }

        const value = this.buffer[this.bufferIndex];
        this.bufferIndex++;
        return { value, done: false } as IteratorResult<T>;
    }

    /** Retorna o próprio iterador para uso com for-await-of. */
    [Symbol.asyncIterator](): AsyncIterableIterator<T> {
        return this;
    }

    /** Coleta todos os items em um array (força paginação completa). */
    async toArray(): Promise<T[]> {
        const all: T[] = [];
        for await (const item of this) {
            all.push(item);
        }
        return all;
    }
}
