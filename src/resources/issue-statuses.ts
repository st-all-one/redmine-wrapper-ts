/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IssueStatus } from "../types/issue-status.ts";

/**
 * Resource de Issue Statuses.
 *
 * Endpoints: /issue_statuses.{format}
 * Status: Alpha desde Redmine 1.3
 */
export class IssueStatusesResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Lista todos os status de issue. */
    async list(): Promise<IssueStatus[]> {
        const data = await this.request.get<{ issue_statuses: IssueStatus[] }>(
            "/issue_statuses.json",
        );
        return data.issue_statuses;
    }
}
