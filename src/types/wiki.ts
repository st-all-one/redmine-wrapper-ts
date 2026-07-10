/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Attachment } from "./attachment.ts";
import type { IdName, UploadPayload } from "./base.ts";

/** Sumário de página wiki (listagem). */
export interface WikiPageSummary {
    title: string;
    version: number;
    created_on: string;
    updated_on: string;
    parent?: { title: string };
}

/** Página wiki completa. */
export interface WikiPage {
    title: string;
    text: string;
    version: number;
    author?: IdName;
    comments?: string;
    parent?: { title: string };
    created_on: string;
    updated_on: string;
    attachments?: Attachment[];
}

/** Payload para criar ou atualizar página wiki. */
export interface CreateWikiPagePayload {
    text: string;
    comments?: string;
    parent_title?: string;
    version?: number;
    uploads?: UploadPayload[];
}
