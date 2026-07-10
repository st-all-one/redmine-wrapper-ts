/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { CreateVersionPayload, UpdateVersionPayload, Version } from "../types/version.ts";

/**
 * Resource de Versions.
 *
 * Endpoints: /projects/:project_id/versions.{format}, /versions/:id.{format}
 * Status: Alpha desde Redmine 1.3
 */
export class VersionsResource extends BaseResource<
    Version,
    CreateVersionPayload,
    UpdateVersionPayload
> {
    protected basePath = "/versions";
    protected listKey = "versions";
    protected singleKey = "version";

    /** Lista versões de um projeto específico. */
    async listByProject(projectId: number): Promise<Version[]> {
        const data = await this.request.get<{ versions: Version[] }>(
            `/projects/${projectId}/versions.json`,
        );
        return data.versions;
    }

    /** Cria uma versão em um projeto específico. */
    async createOnProject(
        projectId: number,
        payload: CreateVersionPayload,
    ): Promise<Version> {
        const data = await this.request.post<{ version: Version }>(
            `/projects/${projectId}/versions.json`,
            { version: payload },
        );
        return data.version;
    }
}
