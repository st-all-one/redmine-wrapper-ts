/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type {
    CreateTimeEntryPayload,
    TimeEntry,
    TimeEntryFilter,
    UpdateTimeEntryPayload,
} from "../types/time-entry.ts";

/**
 * Resource de Time Entries (registro de horas).
 *
 * Endpoints: /time_entries.{format}
 * Status: Stable desde Redmine 1.1
 */
export class TimeEntriesResource extends BaseResource<
    TimeEntry,
    CreateTimeEntryPayload,
    UpdateTimeEntryPayload,
    TimeEntryFilter
> {
    protected basePath = "/time_entries";
    protected listKey = "time_entries";
    protected singleKey = "time_entry";
}
