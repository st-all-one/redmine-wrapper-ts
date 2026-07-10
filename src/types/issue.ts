/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CustomFieldPayload, CustomFieldValue, DateFilter, IdName, RedmineId, UploadPayload } from "./base.ts";
import type { Journal } from "./journal.ts";
import type { Attachment } from "./attachment.ts";
import type { Relation } from "./relation.ts";

/** Status permitido para transição de uma issue. */
export interface AllowedStatus {
    id: RedmineId;
    name: string;
}

/** Issue completa (resposta da API). */
export interface Issue {
    id: RedmineId;
    project: IdName;
    tracker: IdName;
    status: IdName;
    priority: IdName;
    author: IdName;
    subject: string;
    description?: string | null;
    start_date?: string | null;
    due_date?: string | null;
    done_ratio?: number;
    estimated_hours?: number | null;
    is_private?: boolean;
    custom_fields?: CustomFieldValue[];
    created_on: string;
    updated_on: string;
    closed_on?: string | null;
    assigned_to?: IdName | null;
    parent?: { id: RedmineId } | null;
    category?: IdName | null;
    fixed_version?: IdName | null;
    journals?: Journal[];
    attachments?: Attachment[];
    relations?: Relation[];
    allowed_statuses?: AllowedStatus[];
    watchers?: IdName[];
    children?: Issue[];
}

/** Filtros para listagem de issues. */
export interface IssueFilter {
    issue_id?: string;
    project_id?: RedmineId;
    subproject_id?: RedmineId | "!*";
    tracker_id?: RedmineId;
    status_id?: "open" | "closed" | "*" | RedmineId;
    assigned_to_id?: "me" | RedmineId;
    parent_id?: RedmineId;
    priority_id?: RedmineId;
    category_id?: RedmineId;
    fixed_version_id?: RedmineId;
    author_id?: RedmineId;
    created_on?: DateFilter;
    updated_on?: DateFilter;
    sort?: string;
    offset?: number;
    limit?: number;
    query_id?: RedmineId;
    [cf: `cf_${number}`]: string | undefined;
}

/** Payload para criar uma nova issue. */
export interface CreateIssuePayload {
    project_id: RedmineId;
    subject: string;
    tracker_id?: RedmineId;
    status_id?: RedmineId;
    priority_id?: RedmineId;
    description?: string;
    category_id?: RedmineId;
    assigned_to_id?: RedmineId | null;
    parent_issue_id?: RedmineId;
    fixed_version_id?: RedmineId;
    estimated_hours?: number;
    done_ratio?: number;
    is_private?: boolean;
    custom_fields?: CustomFieldPayload[];
    uploads?: UploadPayload[];
    watcher_user_ids?: RedmineId[];
}

/** Payload para atualizar uma issue. */
export interface UpdateIssuePayload {
    project_id?: RedmineId;
    tracker_id?: RedmineId;
    status_id?: RedmineId;
    priority_id?: RedmineId;
    subject?: string;
    description?: string;
    category_id?: RedmineId;
    assigned_to_id?: RedmineId | null;
    parent_issue_id?: RedmineId;
    fixed_version_id?: RedmineId;
    estimated_hours?: number;
    done_ratio?: number;
    is_private?: boolean;
    custom_fields?: CustomFieldPayload[];
    uploads?: UploadPayload[];
    notes?: string;
    private_notes?: boolean;
    watcher_user_ids?: RedmineId[];
}

/** Includes disponíveis para GET /issues/:id. */
export type IssueInclude =
    | "children"
    | "attachments"
    | "relations"
    | "changesets"
    | "journals"
    | "watchers"
    | "allowed_statuses";
