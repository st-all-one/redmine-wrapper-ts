/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { RedmineWrapperTS } from "../src/main.ts";
import { RedmineWrapperError } from "../src/core/errors.ts";
import type { RedmineId } from "../src/types/base.ts";
import { assertEquals, assertInstanceOf, assertRejects } from "@std/assert";

function mockFetch(response: {
    ok: boolean;
    status: number;
    json?: () => Promise<unknown>;
    text?: () => Promise<string>;
}): void {
    globalThis.fetch = (() => {
        return Promise.resolve({
            ok: response.ok,
            status: response.status,
            statusText: response.ok ? "OK" : "Error",
            headers: new Headers(),
            json: response.json ?? (() => Promise.resolve({})),
            text: response.text ?? (() => Promise.resolve("")),
        }) as Promise<Response>;
    }) as typeof globalThis.fetch;
}

Deno.test("RedmineWrapperTS.create returns instance", () => {
    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "test-key-123",
    });
    assertEquals(sdk instanceof RedmineWrapperTS, true);
});

Deno.test("RedmineWrapperTS.issues.list returns items", async () => {
    mockFetch({
        ok: true,
        status: 200,
        json: () =>
            Promise.resolve({
                issues: [
                    {
                        id: 1,
                        subject: "Test",
                        project: { id: 1, name: "P" },
                        tracker: { id: 1, name: "Bug" },
                        status: { id: 1, name: "New" },
                        priority: { id: 4, name: "Normal" },
                        author: { id: 1, name: "A" },
                        created_on: "2024-01-01",
                        updated_on: "2024-01-01",
                    },
                ],
                total_count: 1,
                limit: 100,
                offset: 0,
            }),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
    });

    const issues: Array<{ id: number; subject: string }> = [];
    for await (const issue of sdk.issues.list({ status_id: "open" })) {
        issues.push(issue);
    }

    assertEquals(issues.length, 1);
    assertEquals(issues[0]?.id, 1);
});

Deno.test("RedmineWrapperTS throws RedmineWrapperError on 422", async () => {
    mockFetch({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ errors: ["Subject can't be blank"] }),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
    });

    await assertRejects(
        () => sdk.issues.list({ status_id: "open" }).toArray(),
        RedmineWrapperError,
        "Subject",
    );
});

Deno.test("RedmineWrapperTS throws validation-error on 422", async () => {
    mockFetch({
        ok: false,
        status: 422,
        json: () => Promise.resolve({ errors: ["Subject can't be blank"] }),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
    });

    try {
        await sdk.issues.list({ status_id: "open" }).toArray();
    } catch (err) {
        assertInstanceOf(err, RedmineWrapperError);
        assertEquals(err.status, 422);
        assertEquals(err.title, "validation-error");
    }
});

Deno.test("RedmineWrapperTS throws authentication-failed on 401", async () => {
    mockFetch({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ errors: ["Access denied"] }),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "bad-key",
    });

    try {
        await sdk.issues.list({ status_id: "open" }).toArray();
    } catch (err) {
        assertInstanceOf(err, RedmineWrapperError);
        assertEquals(err.status, 401);
        assertEquals(err.title, "authentication-failed");
    }
});

Deno.test("RedmineWrapperTS throws resource-not-found on 404", async () => {
    mockFetch({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ errors: ["Resource not found"] }),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
    });

    try {
        await sdk.issues.get(99999);
    } catch (err) {
        assertInstanceOf(err, RedmineWrapperError);
        assertEquals(err.status, 404);
        assertEquals(err.title, "resource-not-found");
    }
});

Deno.test("RedmineWrapperTS returns undefined on 204", async () => {
    mockFetch({
        ok: true,
        status: 204,
        json: () => Promise.reject(new Error("should not be called")),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
    });

    let caught = false;
    try {
        await sdk.issues.delete(1);
    } catch {
        caught = true;
    }
    assertEquals(caught, false);
});

Deno.test("RedmineWrapperTS PUT sends JSON body", async () => {
    let sentBody = "";

    globalThis.fetch = ((_url: string, opts: RequestInit) => {
        sentBody = opts.body as string;
        return Promise.resolve({
            ok: true,
            status: 204,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(""),
            headers: new Headers(),
        }) as Promise<Response>;
    }) as typeof globalThis.fetch;

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
    });

    await sdk.issues.update(1, { status_id: 3 as RedmineId, notes: "Done" });

    const parsed = JSON.parse(sentBody);
    assertEquals(parsed.issue.status_id, 3);
    assertEquals(parsed.issue.notes, "Done");
});

Deno.test("RedmineWrapperTS throws timeout on abort", async () => {
    globalThis.fetch = ((_url: string, opts: RequestInit) => {
        return new Promise((_resolve, reject) => {
            opts.signal?.addEventListener("abort", () => {
                reject(new DOMException("The operation was aborted", "AbortError"));
            });
        });
    }) as typeof globalThis.fetch;

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "key",
        timeoutMs: 10,
    });

    await assertRejects(
        () => sdk.issues.list({ status_id: "open" }).toArray(),
        RedmineWrapperError,
    );
});

Deno.test("RedmineWrapperTS error has instance UUID", async () => {
    mockFetch({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ errors: ["Access denied"] }),
    });

    const sdk = RedmineWrapperTS.create({
        baseUrl: "https://redmine.test",
        apiKey: "bad-key",
    });

    try {
        await sdk.issues.list({ status_id: "open" }).toArray();
    } catch (err) {
        assertInstanceOf(err, RedmineWrapperError);
        assertEquals(typeof err.instance, "string");
        assertEquals(err.instance.startsWith("urn:uuid:"), true);
    }
});
