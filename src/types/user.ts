/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CustomFieldPayload, CustomFieldValue, RedmineId } from "./base.ts";

/** Usuário do Redmine. */
export interface User {
    id: RedmineId;
    login: string;
    firstname: string;
    lastname: string;
    mail: string;
    created_on: string;
    updated_on?: string;
    last_login_on?: string;
    api_key?: string;
    status?: UserStatus;
    admin?: boolean;
    avatar_url?: string;
    custom_fields?: CustomFieldValue[];
    memberships?: UserMembership[];
    groups?: UserGroup[];
}

/** Membership embarcado no user. */
export interface UserMembership {
    project: { id: RedmineId; name: string };
    roles: Array<{ id: RedmineId; name: string }>;
}

/** Grupo embarcado no user. */
export interface UserGroup {
    id: RedmineId;
    name: string;
}

/** Includes para GET /users/:id. */
export type UserInclude = "memberships" | "groups";

/** Status do usuário para filtro. */
export type UserStatus = 1 | 2 | 3;
// 1 = Active, 2 = Registered, 3 = Locked

/** Payload para criar um usuário. */
export interface CreateUserPayload {
    login: string;
    firstname: string;
    lastname: string;
    mail: string;
    password?: string;
    auth_source_id?: RedmineId;
    mail_notification?: string;
    must_change_passwd?: boolean;
    generate_password?: boolean;
    custom_fields?: CustomFieldPayload[];
    send_information?: boolean;
}

/** Payload para atualizar um usuário. */
export interface UpdateUserPayload {
    login?: string;
    firstname?: string;
    lastname?: string;
    mail?: string;
    password?: string;
    auth_source_id?: RedmineId;
    mail_notification?: string;
    must_change_passwd?: boolean;
    generate_password?: boolean;
    custom_fields?: CustomFieldPayload[];
    admin?: boolean;
}
