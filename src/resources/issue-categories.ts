/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CreateIssueCategoryPayload, IssueCategory, UpdateIssueCategoryPayload } from "../types/issue-category.ts";

/**
 * Resource de Issue Categories.
 *
 * Endpoints: /projects/:project_id/issue_categories.{format}, /issue_categories/:id.{format}
 * Status: Alpha desde Redmine 1.3
 */
export class IssueCategoriesResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
            post: <R>(path: string, body?: unknown) => Promise<R>;
            put: <R>(path: string, body?: unknown) => Promise<R>;
            delete: (path: string) => Promise<void>;
        },
    ) {}

    /** Lista categorias de um projeto. */
    async listByProject(projectId: number): Promise<IssueCategory[]> {
        const data = await this.request.get<{ issue_categories: IssueCategory[] }>(
            `/projects/${projectId}/issue_categories.json`,
        );
        return data.issue_categories;
    }

    /** Obtém uma categoria por ID. */
    async get(id: number): Promise<IssueCategory> {
        const data = await this.request.get<{ issue_category: IssueCategory }>(
            `/issue_categories/${id}.json`,
        );
        return data.issue_category;
    }

    /** Cria categoria em um projeto. */
    async create(
        projectId: number,
        payload: CreateIssueCategoryPayload,
    ): Promise<IssueCategory> {
        const data = await this.request.post<{ issue_category: IssueCategory }>(
            `/projects/${projectId}/issue_categories.json`,
            { issue_category: payload },
        );
        return data.issue_category;
    }

    /** Atualiza uma categoria. */
    async update(
        id: number,
        payload: UpdateIssueCategoryPayload,
    ): Promise<void> {
        await this.request.put(`/issue_categories/${id}.json`, {
            issue_category: payload,
        });
    }

    /**
     * Remove uma categoria.
     * @param reassignToId - Opcional: reassignar issues desta categoria para outra.
     */
    async delete(id: number, reassignToId?: number): Promise<void> {
        const params = reassignToId ? `?reassign_to_id=${reassignToId}` : "";
        await this.request.delete(`/issue_categories/${id}.json${params}`);
    }
}
