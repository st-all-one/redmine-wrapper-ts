/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { CreateUserPayload, UpdateUserPayload, User, UserInclude, UserStatus } from "../types/user.ts";

/** Filtros para listagem de usuários. */
export interface UserFilter {
    status?: UserStatus;
    name?: string;
    group_id?: number;
}

/**
 * Resource de Users.
 *
 * Endpoints: /users.{format}
 * Status: Stable desde Redmine 1.1
 * Requer privilégios de admin na maioria dos endpoints.
 */
export class UsersResource extends BaseResource<
    User,
    CreateUserPayload,
    UpdateUserPayload,
    UserFilter
> {
    protected basePath = "/users";
    protected listKey = "users";
    protected singleKey = "user";

    /** Busca o usuário atual (baseado na API key usada). */
    async getCurrent(): Promise<User> {
        const data = await this.request.get<{ user: User }>(
            "/my/account.json",
        );
        return data.user;
    }

    /** Busca usuário com includes. */
    getWithIncludes(id: number, include: UserInclude[]): Promise<User> {
        return this.get(id, { include: include.join(",") });
    }
}
