/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";
import type { Membership } from "./membership.ts";

/** Grupo de usuários. */
export interface Group {
    id: RedmineId;
    name: string;
    users?: IdName[];
    memberships?: Membership[];
}

/** Payload para criar um grupo. */
export interface CreateGroupPayload {
    name: string;
    user_ids?: RedmineId[];
}

/** Payload para atualizar um grupo. */
export interface UpdateGroupPayload {
    name?: string;
    user_ids?: RedmineId[];
}

/** Includes para GET /groups/:id. */
export type GroupInclude = "users" | "memberships";
