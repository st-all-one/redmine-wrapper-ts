/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CreateFilePayload, File } from "../types/file.ts";

/**
 * Resource de Files (arquivos de projeto).
 *
 * Endpoints: /projects/:project_id/files.{format}
 * Status: Alpha desde Redmine 3.4
 */
export class FilesResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
            post: <R>(path: string, body?: unknown) => Promise<R>;
        },
    ) {}

    /** Lista arquivos de um projeto. */
    async listByProject(projectId: number): Promise<File[]> {
        const data = await this.request.get<{ files: File[] }>(
            `/projects/${projectId}/files.json`,
        );
        return data.files;
    }

    /** Anexa um arquivo a um projeto (requer token de upload). */
    async attachToProject(
        projectId: number,
        payload: CreateFilePayload,
    ): Promise<File> {
        const data = await this.request.post<{ file: File }>(
            `/projects/${projectId}/files.json`,
            { file: payload },
        );
        return data.file;
    }
}
