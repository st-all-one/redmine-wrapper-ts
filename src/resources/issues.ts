/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { CreateIssuePayload, Issue, IssueFilter, IssueInclude, UpdateIssuePayload } from "../types/issue.ts";
import type { IdName, RedmineId } from "../types/base.ts";

/**
 * Resource de Issues — tarefas, chamados e tickets.
 *
 * Endpoints: /issues.{format}
 * Status: Stable desde Redmine 1.0
 */
export class IssuesResource extends BaseResource<
    Issue,
    CreateIssuePayload,
    UpdateIssuePayload,
    IssueFilter
> {
    protected basePath = "/issues";
    protected listKey = "issues";
    protected singleKey = "issue";

    /**
     * Busca uma issue com includes associados.
     *
     * @example
     * ```ts
     * const issue = await sdk.issues.getWithIncludes(123, ["journals", "attachments"]);
     * ```
     */
    getWithIncludes(
        id: RedmineId,
        include: IssueInclude[],
    ): Promise<Issue> {
        return this.get(Number(id), { include: include.join(",") });
    }

    /**
     * Retorna os status permitidos para transição de uma issue.
     * (desde Redmine 5.0)
     */
    async getAllowedStatuses(id: RedmineId): Promise<IdName[]> {
        const issue = await this.getWithIncludes(id, ["allowed_statuses"]);
        return (issue as unknown as Record<string, unknown>).allowed_statuses as IdName[] ?? [];
    }

    /**
     * Adiciona um watcher à issue.
     * (desde Redmine 2.3.0)
     */
    async addWatcher(issueId: RedmineId, userId: RedmineId): Promise<void> {
        await this.request.post(
            `/issues/${issueId}/watchers.json`,
            { user_id: userId },
        );
    }

    /**
     * Remove um watcher da issue.
     * (desde Redmine 2.3.0)
     */
    async removeWatcher(issueId: RedmineId, userId: RedmineId): Promise<void> {
        await this.request.delete(`/issues/${issueId}/watchers/${userId}.json`);
    }
}
