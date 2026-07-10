/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { CreateGroupPayload, Group, GroupInclude, UpdateGroupPayload } from "../types/group.ts";

/**
 * Resource de Groups.
 *
 * Endpoints: /groups.{format}
 * Status: Alpha desde Redmine 2.1
 * Requer privilégios de admin.
 */
export class GroupsResource extends BaseResource<
    Group,
    CreateGroupPayload,
    UpdateGroupPayload
> {
    protected basePath = "/groups";
    protected listKey = "groups";
    protected singleKey = "group";

    /** Busca grupo com includes. */
    getWithIncludes(id: number, include: GroupInclude[]): Promise<Group> {
        return this.get(id, { include: include.join(",") });
    }

    /** Adiciona um usuário a um grupo. */
    async addUser(groupId: number, userId: number): Promise<void> {
        await this.request.post(`/groups/${groupId}/users.json`, {
            user_id: userId,
        });
    }

    /** Remove um usuário de um grupo. */
    async removeUser(groupId: number, userId: number): Promise<void> {
        await this.request.delete(`/groups/${groupId}/users/${userId}.json`);
    }
}
