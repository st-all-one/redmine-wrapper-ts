/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * RedmineWrapperTS — Wrapper fortemente tipado para a API REST do Redmine.
 *
 * @module
 *
 * @example
 * ```ts
 * import { RedmineWrapperTS } from "@st-all-one/redmine-wrapper-ts";
 *
 * const sdk = RedmineWrapperTS.create({
 *   baseUrl: "https://redmine.example.com",
 *   apiKey: Deno.env.get("REDMINE_API_KEY")!,
 * });
 *
 * // Listar issues com paginação automática
 * for await (const issue of sdk.issues.list({ status_id: "open" })) {
 *   console.log(issue.subject);
 * }
 * ```
 */
export { RedmineWrapperTS } from "./main.ts";
export type { RedmineWrapperConfig } from "./core/types.ts";

// Errors
export { RedmineWrapperError } from "./core/errors.ts";
export type { ErrorCategory, ErrorContext } from "./core/errors.ts";

// Resource classes
export {
    AttachmentsResource,
    CustomFieldsResource,
    EnumerationsResource,
    FilesResource,
    GroupsResource,
    IssueCategoriesResource,
    IssuesResource,
    IssueStatusesResource,
    JournalsResource,
    MembershipsResource,
    MyAccountResource,
    NewsResource,
    ProjectsResource,
    QueriesResource,
    RelationsResource,
    RolesResource,
    SearchResource,
    TimeEntriesResource,
    TrackersResource,
    UsersResource,
    VersionsResource,
    WikiResource,
} from "./resources/mod.ts";

// Types
export type * from "./types/mod.ts";
