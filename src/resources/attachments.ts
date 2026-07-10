/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Attachment } from "../types/attachment.ts";

/**
 * Resource de Attachments.
 *
 * Endpoints: /attachments/:id.{format}
 * Upload: POST /uploads.json
 * Status: Beta desde Redmine 1.3
 */
export class AttachmentsResource {
    constructor(
        private readonly request: {
            get: <R>(path: string, params?: Record<string, string | number | undefined>) => Promise<R>;
            delete: (path: string) => Promise<void>;
            upload: (filename: string, data: Uint8Array) => Promise<string>;
        },
    ) {}

    /** Obtém metadados de um attachment. */
    async get(id: number): Promise<Attachment> {
        const data = await this.request.get<{ attachment: Attachment }>(
            `/attachments/${id}.json`,
        );
        return data.attachment;
    }

    /** Remove um attachment. */
    async delete(id: number): Promise<void> {
        await this.request.delete(`/attachments/${id}.json`);
    }

    /**
     * Step 1 do upload: envia o binário e retorna o token.
     *
     * @param filename - Nome do arquivo
     * @param data - Conteúdo binário do arquivo
     * @returns Token para usar no step 2
     */
    upload(filename: string, data: Uint8Array): Promise<string> {
        return this.request.upload(filename, data);
    }
}
