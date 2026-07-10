/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MyAccount } from "../types/my-account.ts";

/**
 * Resource de My Account.
 *
 * Endpoints: /my/account.{format}
 * Status: Alpha desde Redmine 4.1
 */
export class MyAccountResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Retorna os dados da conta autenticada. */
    async get(): Promise<MyAccount> {
        const data = await this.request.get<{ user: MyAccount }>(
            "/my/account.json",
        );
        return data.user;
    }
}
