/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/** Resultado de busca. */
export interface SearchResult {
    id: number;
    title: string;
    type: string;
    url: string;
    description: string;
    datetime: string;
}

/** Filtros para busca. */
export interface SearchFilter {
    q: string;
    offset?: number;
    limit?: number;
    scope?: "all" | "my_project" | "subprojects";
    all_words?: boolean;
    titles_only?: boolean;
    issues?: boolean;
    news?: boolean;
    documents?: boolean;
    changesets?: boolean;
    wiki_pages?: boolean;
    messages?: boolean;
    projects?: boolean;
    open_issues?: boolean;
    attachments?: "0" | "1" | "only";
}
