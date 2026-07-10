/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CreateMembershipPayload, Membership, UpdateMembershipPayload } from "../types/membership.ts";

/**
 * Resource de Project Memberships.
 *
 * Endpoints: /projects/:project_id/memberships.{format}, /memberships/:id.{format}
 * Status: Alpha desde Redmine 1.4
 */
export class MembershipsResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
            post: <R>(path: string, body?: unknown) => Promise<R>;
            put: <R>(path: string, body?: unknown) => Promise<R>;
            delete: (path: string) => Promise<void>;
        },
    ) {}

    /** Lista memberships de um projeto. */
    async listByProject(projectId: number): Promise<Membership[]> {
        const data = await this.request.get<{ memberships: Membership[] }>(
            `/projects/${projectId}/memberships.json`,
        );
        return data.memberships;
    }

    /** Obtém um membership por ID. */
    async get(id: number): Promise<Membership> {
        const data = await this.request.get<{ membership: Membership }>(
            `/memberships/${id}.json`,
        );
        return data.membership;
    }

    /** Adiciona membro a um projeto. */
    async create(
        projectId: number,
        payload: CreateMembershipPayload,
    ): Promise<Membership> {
        const data = await this.request.post<{ membership: Membership }>(
            `/projects/${projectId}/memberships.json`,
            { membership: payload },
        );
        return data.membership;
    }

    /** Atualiza roles de um membership (só roles são alteráveis). */
    async update(id: number, payload: UpdateMembershipPayload): Promise<void> {
        await this.request.put(`/memberships/${id}.json`, {
            membership: payload,
        });
    }

    /** Remove um membro do projeto. */
    async delete(id: number): Promise<void> {
        await this.request.delete(`/memberships/${id}.json`);
    }
}
