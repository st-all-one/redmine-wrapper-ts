/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IdName, RedmineId } from "./base.ts";

/** Attachment (arquivo anexo a uma issue). */
export interface Attachment {
    id: RedmineId;
    filename: string;
    filesize: number;
    content_type: string;
    description?: string | null;
    content_url: string;
    author: IdName;
    created_on: string;
}

/** Token retornado pelo upload de arquivo. */
export interface UploadToken {
    upload: { token: string };
}
