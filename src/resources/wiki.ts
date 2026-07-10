/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CreateWikiPagePayload, WikiPage, WikiPageSummary } from "../types/wiki.ts";

/**
 * Resource de Wiki Pages.
 *
 * Endpoints: /projects/:project_id/wiki/{title}.{format}
 * Status: Alpha desde Redmine 2.2
 */
export class WikiResource {
    constructor(
        private readonly request: {
            get: <R>(path: string, params?: Record<string, string | number | undefined>) => Promise<R>;
            put: <R>(path: string, body?: unknown) => Promise<R>;
            delete: (path: string) => Promise<void>;
        },
    ) {}

    /** Lista todas as páginas wiki de um projeto. */
    async list(projectId: number): Promise<WikiPageSummary[]> {
        const data = await this.request.get<{ wiki_pages: WikiPageSummary[] }>(
            `/projects/${projectId}/wiki/index.json`,
        );
        return data.wiki_pages;
    }

    /** Obtém conteúdo de uma página wiki. */
    async get(
        projectId: number,
        title: string,
        include?: string[],
    ): Promise<WikiPage> {
        const data = await this.request.get<{ wiki_page: WikiPage }>(
            `/projects/${projectId}/wiki/${encodeURIComponent(title)}.json`,
            include ? { include: include.join(",") } : undefined,
        );
        return data.wiki_page;
    }

    /** Obtém versão antiga de uma página wiki. */
    async getVersion(
        projectId: number,
        title: string,
        version: number,
    ): Promise<WikiPage> {
        const data = await this.request.get<{ wiki_page: WikiPage }>(
            `/projects/${projectId}/wiki/${encodeURIComponent(title)}/${version}.json`,
        );
        return data.wiki_page;
    }

    /**
     * Cria ou atualiza uma página wiki (PUT idempotente).
     *
     * Se `payload.version` coincidir com a versão atual no servidor,
     * a atualização é garantida livre de conflitos.
     * Caso contrário, retorna 409 Conflict.
     */
    async createOrUpdate(
        projectId: number,
        title: string,
        payload: CreateWikiPagePayload,
    ): Promise<void> {
        await this.request.put(
            `/projects/${projectId}/wiki/${encodeURIComponent(title)}.json`,
            { wiki_page: payload },
        );
    }

    /** Remove uma página wiki. */
    async delete(projectId: number, title: string): Promise<void> {
        await this.request.delete(
            `/projects/${projectId}/wiki/${encodeURIComponent(title)}.json`,
        );
    }
}
