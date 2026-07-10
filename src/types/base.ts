/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/** ID numérico positivo (int >= 1). */
export type RedmineId = number & { readonly __brand: "RedmineId" };

/** Par nome-id usado em referências da API. */
export interface IdName {
    id: RedmineId;
    name: string;
}

/** Valor de custom field na issue. */
export interface CustomFieldValue {
    id: RedmineId;
    name?: string;
    value: unknown;
}

/** Payload para definir um custom field em criação/atualização. */
export interface CustomFieldPayload {
    id: RedmineId;
    value: unknown;
}

/** Payload de upload para associar a um recurso. */
export interface UploadPayload {
    token: string;
    filename: string;
    content_type?: string;
    description?: string;
}

/** Resposta paginada da API. */
export interface PaginatedResponse<T> {
    /** Lista de items. A chave varia por recurso. */
    [key: string]: T[] | number | undefined;
    total_count: number;
    limit: number;
    offset: number;
}

/** Parâmetros opcionais de paginação. */
export interface PaginationParams {
    offset?: number;
    limit?: number;
}

/** Filtro base para datas com operadores especiais. */
export type DateFilter =
    | string // data literal
    | `>=${string}` // após data
    | `<=${string}` // antes de data
    | `><${string}`; // intervalo
