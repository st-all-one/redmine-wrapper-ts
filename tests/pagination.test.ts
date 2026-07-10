/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { PaginationIterator } from "../src/http/pagination.ts";
import { assertEquals } from "@std/assert";

Deno.test("PaginationIterator yields items from single page", async () => {
    const iter = new PaginationIterator<number>(
        async (_offset: number, _limit: number) => {
            return {
                items: [1, 2, 3],
                total: 3,
            };
        },
        100,
    );

    const results: number[] = [];
    for await (const item of iter) {
        results.push(item);
    }

    assertEquals(results, [1, 2, 3]);
});

Deno.test("PaginationIterator yields items from multiple pages", async () => {
    let callCount = 0;

    const iter = new PaginationIterator<number>(
        async (_offset: number, _limit: number) => {
            callCount++;
            if (callCount === 1) {
                return { items: [1, 2], total: 5 };
            }
            if (callCount === 2) {
                return { items: [3, 4], total: 5 };
            }
            return { items: [5], total: 5 };
        },
        2,
    );

    const results: number[] = [];
    for await (const item of iter) {
        results.push(item);
    }

    assertEquals(results, [1, 2, 3, 4, 5]);
    assertEquals(callCount, 3);
});

Deno.test("PaginationIterator stops when server returns empty page", async () => {
    const iter = new PaginationIterator<number>(
        async (_offset: number, _limit: number) => {
            return { items: [], total: 0 };
        },
        100,
    );

    const results: number[] = [];
    for await (const item of iter) {
        results.push(item);
    }

    assertEquals(results, []);
});

Deno.test("PaginationIterator.toArray returns all items", async () => {
    const iter = new PaginationIterator<number>(
        async (_offset: number, _limit: number) => {
            return { items: [10, 20, 30], total: 3 };
        },
        100,
    );

    const results = await iter.toArray();
    assertEquals(results, [10, 20, 30]);
});

Deno.test("PaginationIterator passes correct offset and limit", async () => {
    const offsets: number[] = [];
    const limits: number[] = [];

    const iter = new PaginationIterator<number>(
        async (offset: number, limit: number) => {
            offsets.push(offset);
            limits.push(limit);
            return { items: [1], total: 3 };
        },
        2,
    );

    await iter.toArray();

    assertEquals(offsets, [0, 2]);
    assertEquals(limits, [2, 2]);
});
