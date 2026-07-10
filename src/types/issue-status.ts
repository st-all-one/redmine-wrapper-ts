/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RedmineId } from "./base.ts";

/** Status de issue (ex: New, In Progress, Closed). */
export interface IssueStatus {
    id: RedmineId;
    name: string;
    is_closed: boolean;
}
