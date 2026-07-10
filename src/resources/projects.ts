/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { CreateProjectPayload, Project, ProjectInclude, UpdateProjectPayload } from "../types/project.ts";

/**
 * Resource de Projects.
 *
 * Endpoints: /projects.{format}
 * Status: Stable desde Redmine 1.0
 */
export class ProjectsResource extends BaseResource<
    Project,
    CreateProjectPayload,
    UpdateProjectPayload
> {
    protected basePath = "/projects";
    protected listKey = "projects";
    protected singleKey = "project";

    /** Busca projeto com includes. */
    getWithIncludes(
        id: number,
        include: ProjectInclude[],
    ): Promise<Project> {
        return this.get(id, { include: include.join(",") });
    }

    /** Arquiva um projeto (desde Redmine 5.0). */
    async archive(id: number): Promise<void> {
        await this.request.put(`/projects/${id}/archive.json`);
    }

    /** Desarquiva um projeto (desde Redmine 5.0). */
    async unarchive(id: number): Promise<void> {
        await this.request.put(`/projects/${id}/unarchive.json`);
    }
}
