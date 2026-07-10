/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { Journal, UpdateJournalPayload } from "../types/journal.ts";

/**
 * Resource de Journals (histórico/comentários de issues).
 *
 * Journals são lidos embarcados na issue via `?include=journals`.
 * Este resource lida com atualização e deleção.
 * Status: Alpha desde Redmine 5.0
 */
export class JournalsResource extends BaseResource<
    Journal,
    never,
    UpdateJournalPayload
> {
    protected basePath = "/journals";
    protected listKey = "journals";
    protected singleKey = "journal";

    /**
     * Remove um journal (setando notes para vazio).
     * Journals sem details e com notes vazio são deletados.
     */
    async remove(id: number): Promise<void> {
        await this.update(id, { notes: "" });
    }
}
