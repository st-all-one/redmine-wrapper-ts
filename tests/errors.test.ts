/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RedmineWrapperError } from "../src/core/errors.ts";
import type { ErrorCategory } from "../src/core/errors.ts";
import { assert, assertEquals, assertInstanceOf } from "@std/assert";

Deno.test("RedmineWrapperError creates with category and detail", () => {
    const err = new RedmineWrapperError("validation-error", "Field X is required");
    assertEquals(err.title, "validation-error");
    assertEquals(err.detail, "Field X is required");
    assertEquals(err.status, 422);
    assert(err.instance.startsWith("urn:uuid:"));
    assert(err.type.includes("validation-error.md"));
});

Deno.test("RedmineWrapperError maps correct HTTP status per category", () => {
    const cases: Array<[ErrorCategory, number]> = [
        ["authentication-failed", 401],
        ["authorization-denied", 403],
        ["resource-not-found", 404],
        ["validation-error", 422],
        ["conflict", 409],
        ["rate-limited", 429],
        ["impersonation-failed", 412],
        ["upload-too-large", 413],
        ["timeout", 504],
        ["network-error", 503],
        ["parse-error", 500],
        ["internal-error", 500],
    ];

    for (const [category, expectedStatus] of cases) {
        const err = new RedmineWrapperError(category, "test");
        assertEquals(err.status, expectedStatus, `Status for ${category} should be ${expectedStatus}`);
    }
});

Deno.test("RedmineWrapperError.toJSON returns RFC 7807 shape", () => {
    const err = new RedmineWrapperError(
        "validation-error",
        "Subject can't be blank",
        { operation: "POST /issues.json", httpStatus: 422 },
    );

    const json = err.toJSON();
    assertEquals(json.title, "validation-error");
    assertEquals(json.status, 422);
    assertEquals(json.detail, "Subject can't be blank");
    assertEquals(typeof json.type, "string");
    assertEquals(typeof json.instance, "string");
    assertEquals(json.context, { operation: "POST /issues.json", httpStatus: 422 });
});

Deno.test("RedmineWrapperError includes context", () => {
    const context = {
        operation: "GET /issues/999.json",
        httpStatus: 404,
        apiErrors: ["Resource not found"],
    };
    const err = new RedmineWrapperError("resource-not-found", "Not found", context);
    assertEquals(err.context.operation, "GET /issues/999.json");
    assertEquals(err.context.httpStatus, 404);
});

Deno.test("RedmineWrapperError instanceof checks", () => {
    const err = new RedmineWrapperError("internal-error", "test");
    assertInstanceOf(err, RedmineWrapperError);
    assertInstanceOf(err, Error);
    assert(err instanceof RedmineWrapperError);
});

Deno.test("RedmineWrapperError generates unique instances", () => {
    const err1 = new RedmineWrapperError("timeout", "timeout");
    const err2 = new RedmineWrapperError("timeout", "timeout");
    assert(err1.instance !== err2.instance, "UUIDs should be unique");
});
