/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CreateNewsPayload, News, UpdateNewsPayload } from "../types/news.ts";

/**
 * Resource de News.
 *
 * Endpoints: /news.{format}, /projects/:project_id/news.{format}
 * Status: CRUD completo desde Redmine 4.1
 */
export class NewsResource {
    constructor(
        private readonly request: {
            get: <R>(path: string, params?: Record<string, string | number | undefined>) => Promise<R>;
            post: <R>(path: string, body?: unknown) => Promise<R>;
            put: <R>(path: string, body?: unknown) => Promise<R>;
            delete: (path: string) => Promise<void>;
        },
    ) {}

    /** Lista todas as notícias. */
    async list(params?: { offset?: number; limit?: number }): Promise<News[]> {
        const data = await this.request.get<{ news: News[] }>(
            "/news.json",
            params,
        );
        return data.news;
    }

    /** Lista notícias de um projeto específico. */
    async listByProject(
        projectId: number,
        params?: { offset?: number; limit?: number },
    ): Promise<News[]> {
        const data = await this.request.get<{ news: News[] }>(
            `/projects/${projectId}/news.json`,
            params,
        );
        return data.news;
    }

    /** Obtém uma notícia por ID. */
    async get(id: number, include?: string[]): Promise<News> {
        const data = await this.request.get<{ news: News }>(
            `/news/${id}.json`,
            include ? { include: include.join(",") } : undefined,
        );
        return data.news;
    }

    /** Cria notícia em um projeto. */
    async create(
        projectId: number,
        payload: CreateNewsPayload,
    ): Promise<News> {
        const data = await this.request.post<{ news: News }>(
            `/projects/${projectId}/news.json`,
            { news: payload },
        );
        return data.news;
    }

    /** Atualiza uma notícia. */
    async update(id: number, payload: UpdateNewsPayload): Promise<void> {
        await this.request.put(`/news/${id}.json`, { news: payload });
    }

    /** Remove uma notícia. */
    async delete(id: number): Promise<void> {
        await this.request.delete(`/news/${id}.json`);
    }
}
