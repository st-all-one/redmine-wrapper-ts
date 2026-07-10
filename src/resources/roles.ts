/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Role } from "../types/role.ts";

/**
 * Resource de Roles.
 *
 * Endpoints: /roles.{format}
 * Status: Alpha desde Redmine 1.4
 */
export class RolesResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Lista todos os papéis. */
    async list(): Promise<Role[]> {
        const data = await this.request.get<{ roles: Role[] }>("/roles.json");
        return data.roles;
    }

    /** Obtém um papel com suas permissões. */
    async get(id: number): Promise<Role> {
        const data = await this.request.get<{ role: Role }>(
            `/roles/${id}.json`,
        );
        return data.role;
    }
}
