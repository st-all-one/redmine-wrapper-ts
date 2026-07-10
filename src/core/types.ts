/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Configuração para criar uma instância do RedmineWrapperTS.
 * Imutável após a criação — use `RedmineWrapperTS.create()`.
 */
export interface RedmineWrapperConfig {
    /** URL base do servidor Redmine (ex: https://redmine.example.com). */
    readonly baseUrl: string;

    /** Chave de API do Redmine (obtida em /my/account). */
    readonly apiKey: string;

    /** Timeout em milissegundos para requisições (default: 30_000). */
    readonly timeoutMs?: number;

    /**
     * Login para impersonação via X-Redmine-Switch-User.
     * Requer conta de administrador (desde Redmine 2.2.0).
     */
    readonly switchUser?: string;

    /** Número máximo de requisições por segundo (default: 10). */
    readonly maxRps?: number;
}

/** Configuração resolvida com valores padrão aplicados. */
export interface ResolvedConfig {
    readonly baseUrl: string;
    readonly apiKey: string;
    readonly timeoutMs: number;
    readonly switchUser: string | undefined;
    readonly maxRps: number;
}
