/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";

/** Membership de usuário/grupo em um projeto. */
export interface Membership {
    id: RedmineId;
    project: IdName;
    user?: IdName;
    group?: IdName;
    roles: Array<{ id: RedmineId; name: string; inherited?: boolean }>;
}

/** Payload para criar um membership. */
export interface CreateMembershipPayload {
    user_id: RedmineId;
    role_ids: RedmineId[];
}

/** Payload para atualizar um membership (só roles). */
export interface UpdateMembershipPayload {
    role_ids: RedmineId[];
}
