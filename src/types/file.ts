/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";

/** Arquivo de projeto (Files). */
export interface File {
    id: RedmineId;
    filename: string;
    filesize: number;
    content_type: string;
    description?: string;
    content_url: string;
    author: IdName;
    created_on: string;
    version?: IdName;
    digest: string;
    downloads: number;
}

/** Payload para anexar arquivo a um projeto. */
export interface CreateFilePayload {
    token: string;
    filename: string;
    description?: string;
    version_id?: RedmineId;
}
