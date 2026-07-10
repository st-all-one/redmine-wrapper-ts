/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { DocumentCategory, IssuePriority, TimeEntryActivity } from "../types/enumeration.ts";

/**
 * Resource de Enumerations.
 *
 * Endpoints:
 * - /enumerations/issue_priorities.{format}
 * - /enumerations/time_entry_activities.{format}
 * - /enumerations/document_categories.{format}
 * Status: Alpha desde Redmine 2.2
 */
export class EnumerationsResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Lista prioridades de issue. */
    async listIssuePriorities(): Promise<IssuePriority[]> {
        const data = await this.request.get<{ issue_priorities: IssuePriority[] }>(
            "/enumerations/issue_priorities.json",
        );
        return data.issue_priorities;
    }

    /** Lista atividades de time entry. */
    async listTimeEntryActivities(): Promise<TimeEntryActivity[]> {
        const data = await this.request.get<{ time_entry_activities: TimeEntryActivity[] }>(
            "/enumerations/time_entry_activities.json",
        );
        return data.time_entry_activities;
    }

    /** Lista categorias de documento. */
    async listDocumentCategories(): Promise<DocumentCategory[]> {
        const data = await this.request.get<{ document_categories: DocumentCategory[] }>(
            "/enumerations/document_categories.json",
        );
        return data.document_categories;
    }
}
