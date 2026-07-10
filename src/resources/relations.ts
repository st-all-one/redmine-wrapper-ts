/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { BaseResource } from "./base-resource.ts";
import type { CreateRelationPayload, Relation } from "../types/relation.ts";

/**
 * Resource de Issue Relations.
 *
 * Endpoints: /issues/:issue_id/relations.{format}, /relations/:id.{format}
 * Status: Alpha desde Redmine 1.3
 *
 * Relations são lidas através da issue ou diretamente por ID.
 */
export class RelationsResource extends BaseResource<
    Relation,
    CreateRelationPayload,
    never
> {
    protected basePath = "/relations";
    protected listKey = "relations";
    protected singleKey = "relation";

    /**
     * Lista relações de uma issue específica.
     */
    async listByIssue(issueId: number): Promise<Relation[]> {
        const data = await this.request.get<{ relations: Relation[] }>(
            `/issues/${issueId}/relations.json`,
        );
        return data.relations;
    }

    /**
     * Cria uma relação em uma issue específica.
     */
    async createOnIssue(
        issueId: number,
        payload: CreateRelationPayload,
    ): Promise<Relation> {
        const data = await this.request.post<{ relation: Relation }>(
            `/issues/${issueId}/relations.json`,
            { relation: payload },
        );
        return data.relation;
    }
}
