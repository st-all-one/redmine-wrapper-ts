/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";

/** Versão alvo de um projeto. */
export interface Version {
    id: RedmineId;
    project: IdName;
    name: string;
    description?: string;
    status: VersionStatus;
    sharing: VersionSharing;
    due_date?: string | null;
    wiki_page_title?: string;
    estimated_hours?: number;
    spent_hours?: number;
    created_on: string;
    updated_on: string;
}

/** Status de uma versão. */
export type VersionStatus = "open" | "locked" | "closed";

/** Nível de compartilhamento de uma versão. */
export type VersionSharing = "none" | "descendants" | "hierarchy" | "tree" | "system";

/** Payload para criar uma versão. */
export interface CreateVersionPayload {
    name: string;
    status?: VersionStatus;
    sharing?: VersionSharing;
    due_date?: string;
    description?: string;
    wiki_page_title?: string;
}

/** Payload para atualizar uma versão. */
export interface UpdateVersionPayload {
    name?: string;
    status?: VersionStatus;
    sharing?: VersionSharing;
    due_date?: string;
    description?: string;
    wiki_page_title?: string;
}
