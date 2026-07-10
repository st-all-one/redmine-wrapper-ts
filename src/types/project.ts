/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CustomFieldValue, IdName, RedmineId } from "./base.ts";

/** Status de um projeto: 1=Active, 2=Archived. */
export type ProjectStatus = 1 | 2;

/** Projeto do Redmine. */
export interface Project {
    id: RedmineId;
    name: string;
    identifier: string;
    description?: string | null;
    parent?: IdName | null;
    status?: ProjectStatus;
    is_public?: boolean;
    inherit_members?: boolean;
    created_on: string;
    updated_on: string;
    homepage?: string | null;
    default_version?: IdName | null;
    default_assignee?: IdName | null;
    trackers?: IdName[];
    issue_categories?: IssueCategorySummary[];
    enabled_modules?: string[];
    time_entry_activities?: IdName[];
    issue_custom_fields?: CustomFieldValue[];
}

/** Sumário de categoria (embarcado em project). */
export interface IssueCategorySummary {
    id: RedmineId;
    name: string;
}

/** Includes para GET /projects/:id. */
export type ProjectInclude =
    | "trackers"
    | "issue_categories"
    | "enabled_modules"
    | "time_entry_activities"
    | "issue_custom_fields";

/** Payload para criar um projeto. */
export interface CreateProjectPayload {
    name: string;
    identifier: string;
    description?: string;
    homepage?: string;
    is_public?: boolean;
    parent_id?: RedmineId;
    inherit_members?: boolean;
    default_assigned_to_id?: RedmineId;
    default_version_id?: RedmineId;
    tracker_ids?: RedmineId[];
    enabled_module_names?: string[];
    issue_custom_field_ids?: RedmineId[];
    custom_field_values?: Record<string, string>;
}

/** Payload para atualizar um projeto. */
export interface UpdateProjectPayload {
    name?: string;
    description?: string;
    homepage?: string;
    is_public?: boolean;
    parent_id?: RedmineId;
    inherit_members?: boolean;
    default_assigned_to_id?: RedmineId;
    default_version_id?: RedmineId;
    tracker_ids?: RedmineId[];
    enabled_module_names?: string[];
    issue_custom_field_ids?: RedmineId[];
    custom_field_values?: Record<string, string>;
}
