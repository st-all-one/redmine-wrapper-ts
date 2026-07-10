/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RedmineId } from "./base.ts";

/** Time entry (registro de horas). */
export interface TimeEntry {
    id: RedmineId;
    issue_id?: RedmineId;
    project_id?: RedmineId;
    project?: { id: RedmineId; name: string };
    user?: { id: RedmineId; name: string };
    activity?: { id: RedmineId; name: string };
    hours: number;
    comments?: string;
    spent_on: string;
    created_on: string;
    updated_on: string;
}

/** Filtros para listagem de time entries. */
export interface TimeEntryFilter {
    offset?: number;
    limit?: number;
    user_id?: RedmineId;
    project_id?: RedmineId | string;
    issue_id?: RedmineId;
    spent_on?: string;
    from?: string;
    to?: string;
}

/** Payload para criar um time entry. */
export interface CreateTimeEntryPayload {
    issue_id: RedmineId;
    hours: number;
    activity_id: RedmineId;
    spent_on?: string;
    comments?: string;
    user_id?: RedmineId;
}

/** Payload para atualizar um time entry. */
export interface UpdateTimeEntryPayload {
    hours?: number;
    activity_id?: RedmineId;
    spent_on?: string;
    comments?: string;
    user_id?: RedmineId;
}
