/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CustomFieldValue, RedmineId } from "./base.ts";

/** Dados da própria conta (GET /my/account.json). */
export interface MyAccount {
    id: RedmineId;
    login: string;
    admin: boolean;
    firstname: string;
    lastname: string;
    mail: string;
    created_on: string;
    last_login_on?: string;
    api_key: string;
    custom_fields?: CustomFieldValue[];
}
