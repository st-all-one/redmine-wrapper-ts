/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";

/** Categoria de issue dentro de um projeto. */
export interface IssueCategory {
    id: RedmineId;
    project: IdName;
    name: string;
    assigned_to?: IdName | null;
}

/** Payload para criar uma categoria. */
export interface CreateIssueCategoryPayload {
    name: string;
    assigned_to_id?: RedmineId;
}

/** Payload para atualizar uma categoria. */
export interface UpdateIssueCategoryPayload {
    name?: string;
    assigned_to_id?: RedmineId;
}
