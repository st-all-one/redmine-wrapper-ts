/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RedmineId } from "./base.ts";

/** Tipo de relação entre issues. */
export type RelationType =
    | "relates"
    | "duplicates"
    | "duplicated"
    | "blocks"
    | "blocked"
    | "precedes"
    | "follows"
    | "copied_to"
    | "copied_from";

/** Relação entre duas issues. */
export interface Relation {
    id: RedmineId;
    issue_id: RedmineId;
    issue_to_id: RedmineId;
    relation_type: RelationType;
    delay?: number | null;
}

/** Payload para criar uma relação. */
export interface CreateRelationPayload {
    issue_to_id: RedmineId;
    relation_type: RelationType;
    delay?: number;
}
