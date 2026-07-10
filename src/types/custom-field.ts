/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { RedmineId } from "./base.ts";

/** Definição de um custom field. */
export interface CustomField {
    id: RedmineId;
    name: string;
    customized_type: CustomizedType;
    field_format: FieldFormat;
    regexp?: string;
    min_length?: number;
    max_length?: number;
    is_required: boolean;
    is_filter: boolean;
    searchable?: boolean;
    multiple?: boolean;
    default_value?: string;
    visible?: boolean;
    possible_values?: Array<{ value: string }>;
}

/** Tipos de objeto que podem ter custom fields. */
export type CustomizedType = "issue" | "project" | "user" | "time_entry" | "group";

/** Formatos de campo suportados. */
export type FieldFormat =
    | "string"
    | "text"
    | "int"
    | "float"
    | "list"
    | "date"
    | "bool"
    | "user"
    | "version"
    | "link";
