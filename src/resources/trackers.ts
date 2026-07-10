/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { Tracker } from "../types/tracker.ts";

/**
 * Resource de Trackers.
 *
 * Endpoints: /trackers.{format}
 * Status: Alpha desde Redmine 1.3
 */
export class TrackersResource {
    constructor(
        private readonly request: {
            get: <R>(path: string) => Promise<R>;
        },
    ) {}

    /** Lista todos os trackers disponíveis. */
    async list(): Promise<Tracker[]> {
        const data = await this.request.get<{ trackers: Tracker[] }>(
            "/trackers.json",
        );
        return data.trackers;
    }
}
