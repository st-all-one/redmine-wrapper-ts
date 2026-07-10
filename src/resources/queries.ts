/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Query } from "../types/query.ts";

/**
 * Resource de Queries.
 *
 * Endpoints: /queries.{format}
 * Status: Alpha desde Redmine 1.3
 */
export class QueriesResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Lista todas as queries visíveis ao usuário. */
    async list(): Promise<Query[]> {
        const data = await this.request.get<{ queries: Query[] }>(
            "/queries.json",
        );
        return data.queries;
    }
}
