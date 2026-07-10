/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { CustomField } from "../types/custom-field.ts";

/**
 * Resource de Custom Fields.
 *
 * Endpoints: /custom_fields.{format}
 * Status: Alpha desde Redmine 2.4
 * Requer privilégios de admin.
 */
export class CustomFieldsResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Lista todos os custom fields configurados. */
    async list(): Promise<CustomField[]> {
        const data = await this.request.get<{ custom_fields: CustomField[] }>(
            "/custom_fields.json",
        );
        return data.custom_fields;
    }
}
