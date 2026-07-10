/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * RedmineWrapperTS — strongly typed wrapper for the Redmine REST API.
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
 * for await (const issue of sdk.issues.list({ status_id: "open" })) {
 *   console.log(issue.subject);
 * }
 * ```
 *
 * @module
 */
export * from "./src/mod.ts";
