/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { SearchFilter, SearchResult } from "../types/search.ts";

/**
 * Resource de Search.
 *
 * Endpoints: /search.{format}
 * Status: Alpha desde Redmine 3.3
 */
export class SearchResource {
    constructor(
        private readonly request: {
            get: <R>(path: string, params?: Record<string, string | number | undefined>) => Promise<R>;
        },
    ) {}

    /** Executa uma busca no Redmine. */
    async search(filters: SearchFilter): Promise<SearchResult[]> {
        const data = await this.request.get<{ results: SearchResult[] }>(
            "/search.json",
            filters as unknown as Record<string, string | number | undefined>,
        );
        return data.results;
    }
}
