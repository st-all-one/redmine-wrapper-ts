/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";

/** Journal individual dentro de uma issue. */
export interface Journal {
    id: RedmineId;
    user: IdName;
    notes: string;
    created_on: string;
    updated_on?: string;
    private_notes?: boolean;
    details?: JournalDetail[];
    updated_by?: IdName;
}

/** Detalhe de mudança em um campo da issue. */
export interface JournalDetail {
    property: string;
    name: string;
    old_value?: string | null;
    new_value?: string | null;
}

/** Payload para atualizar um journal (notas). */
export interface UpdateJournalPayload {
    notes: string;
    private_notes?: boolean;
}
