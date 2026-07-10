/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { DEFAULT_MAX_RPS, DEFAULT_TIMEOUT_MS } from "./core/constants.ts";
import type { RedmineWrapperConfig, ResolvedConfig } from "./core/types.ts";
import { HttpClient, type ResourceApi } from "./http/client.ts";
import { IssuesResource } from "./resources/issues.ts";
import { ProjectsResource } from "./resources/projects.ts";
import { UsersResource } from "./resources/users.ts";
import { TimeEntriesResource } from "./resources/time-entries.ts";
import { JournalsResource } from "./resources/journals.ts";
import { RelationsResource } from "./resources/relations.ts";
import { AttachmentsResource } from "./resources/attachments.ts";
import { WikiResource } from "./resources/wiki.ts";
import { VersionsResource } from "./resources/versions.ts";
import { EnumerationsResource } from "./resources/enumerations.ts";
import { TrackersResource } from "./resources/trackers.ts";
import { IssueStatusesResource } from "./resources/issue-statuses.ts";
import { IssueCategoriesResource } from "./resources/issue-categories.ts";
import { MembershipsResource } from "./resources/memberships.ts";
import { RolesResource } from "./resources/roles.ts";
import { GroupsResource } from "./resources/groups.ts";
import { CustomFieldsResource } from "./resources/custom-fields.ts";
import { QueriesResource } from "./resources/queries.ts";
import { FilesResource } from "./resources/files.ts";
import { SearchResource } from "./resources/search.ts";
import { NewsResource } from "./resources/news.ts";
import { MyAccountResource } from "./resources/my-account.ts";

/**
 * RedmineWrapperTS — Factory principal para acesso à API do Redmine.
 *
 * Cria uma instância isolada com configuração imutável.
 * Todas as instâncias são independentes e podem ser usadas
 * simultaneamente em diferentes partes da aplicação.
 *
 * @example
 * ```ts
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
export class RedmineWrapperTS {
    readonly #http: HttpClient;

    private constructor(config: ResolvedConfig) {
        this.#http = new HttpClient(config);
    }

    /**
     * Cria uma nova instância isolada do wrapper.
     *
     * @param config - Configuração imutável (baseUrl, apiKey, etc.)
     * @returns Uma nova instância de RedmineWrapperTS
     */
    static create(config: RedmineWrapperConfig): RedmineWrapperTS {
        const resolved: ResolvedConfig = {
            baseUrl: config.baseUrl.replace(/\/+$/, ""),
            apiKey: config.apiKey,
            timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
            switchUser: config.switchUser,
            maxRps: config.maxRps ?? DEFAULT_MAX_RPS,
        };

        return new RedmineWrapperTS(resolved);
    }

    // ── Resource API ─────────────────────────────────────────

    get #api(): ResourceApi {
        return {
            get: <R>(path: string, params?: Record<string, string | number | undefined>) =>
                this.#http.get<R>(path, params),
            post: <R>(path: string, body?: unknown) => this.#http.post<R>(path, body),
            put: <R>(path: string, body?: unknown) => this.#http.put<R>(path, body),
            delete: (path: string) => this.#http.delete(path),
            upload: (filename: string, data: Uint8Array) => this.#http.upload(filename, data),
            paginate: <R>(
                path: string,
                itemKey: string,
                params?: Record<string, string | number | undefined>,
            ) => this.#http.paginate<R>(path, itemKey, params),
        };
    }

    // ── Resource Accessors (lazy) ─────────────────────────────

    #_issues?: IssuesResource;
    /** Recurso de issues. */
    get issues(): IssuesResource {
        return this.#_issues ??= new IssuesResource(this.#api);
    }

    #_projects?: ProjectsResource;
    /** Recurso de projetos. */
    get projects(): ProjectsResource {
        return this.#_projects ??= new ProjectsResource(this.#api);
    }

    #_users?: UsersResource;
    /** Recurso de usuários. */
    get users(): UsersResource {
        return this.#_users ??= new UsersResource(this.#api);
    }

    #_timeEntries?: TimeEntriesResource;
    /** Recurso de apontamentos de horas. */
    get timeEntries(): TimeEntriesResource {
        return this.#_timeEntries ??= new TimeEntriesResource(this.#api);
    }

    #_journals?: JournalsResource;
    /** Recurso de diários (histórico de issues). */
    get journals(): JournalsResource {
        return this.#_journals ??= new JournalsResource(this.#api);
    }

    #_relations?: RelationsResource;
    /** Recurso de relações entre issues. */
    get relations(): RelationsResource {
        return this.#_relations ??= new RelationsResource(this.#api);
    }

    #_attachments?: AttachmentsResource;
    /** Recurso de anexos. */
    get attachments(): AttachmentsResource {
        return this.#_attachments ??= new AttachmentsResource(this.#api);
    }

    #_wiki?: WikiResource;
    /** Recurso de wiki. */
    get wiki(): WikiResource {
        return this.#_wiki ??= new WikiResource(this.#api);
    }

    #_versions?: VersionsResource;
    /** Recurso de versões. */
    get versions(): VersionsResource {
        return this.#_versions ??= new VersionsResource(this.#api);
    }

    #_enumerations?: EnumerationsResource;
    /** Recurso de enumerações (prioridades, atividades). */
    get enumerations(): EnumerationsResource {
        return this.#_enumerations ??= new EnumerationsResource(this.#api);
    }

    #_trackers?: TrackersResource;
    /** Recurso de trackers (tipos de issue). */
    get trackers(): TrackersResource {
        return this.#_trackers ??= new TrackersResource(this.#api);
    }

    #_issueStatuses?: IssueStatusesResource;
    /** Recurso de status de issues. */
    get issueStatuses(): IssueStatusesResource {
        return this.#_issueStatuses ??= new IssueStatusesResource(this.#api);
    }

    #_issueCategories?: IssueCategoriesResource;
    /** Recurso de categorias de issues. */
    get issueCategories(): IssueCategoriesResource {
        return this.#_issueCategories ??= new IssueCategoriesResource(this.#api);
    }

    #_memberships?: MembershipsResource;
    /** Recurso de membros de projetos. */
    get memberships(): MembershipsResource {
        return this.#_memberships ??= new MembershipsResource(this.#api);
    }

    #_roles?: RolesResource;
    /** Recurso de papéis (roles). */
    get roles(): RolesResource {
        return this.#_roles ??= new RolesResource(this.#api);
    }

    #_groups?: GroupsResource;
    /** Recurso de grupos. */
    get groups(): GroupsResource {
        return this.#_groups ??= new GroupsResource(this.#api);
    }

    #_customFields?: CustomFieldsResource;
    /** Recurso de campos personalizados. */
    get customFields(): CustomFieldsResource {
        return this.#_customFields ??= new CustomFieldsResource(this.#api);
    }

    #_queries?: QueriesResource;
    /** Recurso de consultas salvas. */
    get queries(): QueriesResource {
        return this.#_queries ??= new QueriesResource(this.#api);
    }

    #_files?: FilesResource;
    /** Recurso de arquivos. */
    get files(): FilesResource {
        return this.#_files ??= new FilesResource(this.#api);
    }

    #_search?: SearchResource;
    /** Recurso de busca. */
    get search(): SearchResource {
        return this.#_search ??= new SearchResource(this.#api);
    }

    #_news?: NewsResource;
    /** Recurso de notícias. */
    get news(): NewsResource {
        return this.#_news ??= new NewsResource(this.#api);
    }

    #_myAccount?: MyAccountResource;
    /** Recurso de minha conta. */
    get myAccount(): MyAccountResource {
        return this.#_myAccount ??= new MyAccountResource(this.#api);
    }
}
