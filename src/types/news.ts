/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Attachment } from "./attachment.ts";
import type { IdName, RedmineId, UploadPayload } from "./base.ts";

/** Comentário em notícia. */
export interface NewsComment {
    id: RedmineId;
    author: IdName;
    content: string;
    created_on: string;
}

/** Item de notícia. */
export interface News {
    id: RedmineId;
    project: IdName;
    author: IdName;
    title: string;
    summary?: string;
    description?: string;
    created_on: string;
    attachments?: Attachment[];
    comments?: NewsComment[];
}

/** Payload para criar notícia. */
export interface CreateNewsPayload {
    title: string;
    summary?: string;
    description?: string;
    uploads?: UploadPayload[];
}

/** Payload para atualizar notícia. */
export interface UpdateNewsPayload {
    title?: string;
    summary?: string;
    description?: string;
    uploads?: UploadPayload[];
}
