/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { v7 as uuidV7 } from "@std/uuid";
import { getSubLogger } from "../utils/logger.ts";

const logger = getSubLogger("error");

/** Categorias de erro suportadas pelo wrapper Redmine. */
export type ErrorCategory =
    | "authentication-failed"
    | "authorization-denied"
    | "resource-not-found"
    | "validation-error"
    | "conflict"
    | "rate-limited"
    | "impersonation-failed"
    | "upload-too-large"
    | "timeout"
    | "network-error"
    | "parse-error"
    | "internal-error";

/** Contexto técnico da falha para fins de auditoria. */
export type ErrorContext = {
    operation?: string;
    httpStatus?: number;
    apiErrors?: string[];
    responseBody?: unknown;
    requestParams?: unknown;
    [key: string]: unknown;
};

/**
 * RedmineWrapperError — Classe de erro personalizada seguindo `RFC 7807 (Problem Details)`.
 *
 * Fornece um contexto rico para falhas, incluindo IDs de rastreio únicos (UUIDv7)
 * e metadados técnicos para auditabilidade e depuração.
 */
export class RedmineWrapperError extends Error {
    /** URI identifying the error type (pointer to wiki). */
    public readonly type: string;
    /** Short, human-readable summary of the error (the category). */
    public readonly title: string;
    /** Suggested HTTP status code. */
    public readonly status: number;
    /** Detailed explanation of the specific error occurrence. */
    public readonly detail: string;
    /** Unique occurrence UUIDv7 for log correlation. */
    public readonly instance: string;
    /** Technical contextual data (operation, HTTP status, API errors). */
    public readonly context: ErrorContext;

    public constructor(
        category: ErrorCategory,
        detail: string,
        // deno-lint-ignore default-param-last
        context: ErrorContext = {},
        options?: ErrorOptions,
    ) {
        super(detail, options);

        this.type = `https://github.com/st-all-one/redmine-wrapper-ts/tree/main/wiki/error/${category}.md`;
        this.title = category;
        this.detail = detail;
        this.context = context;
        this.instance = `urn:uuid:${uuidV7.generate()}`;

        const statusMap: Record<ErrorCategory, number> = {
            "authentication-failed": 401,
            "authorization-denied": 403,
            "resource-not-found": 404,
            "validation-error": 422,
            "conflict": 409,
            "rate-limited": 429,
            "impersonation-failed": 412,
            "upload-too-large": 413,
            "timeout": 504,
            "network-error": 503,
            "parse-error": 500,
            "internal-error": 500,
        };

        this.status = statusMap[category];
        this.name = "RedmineWrapperError";

        logger.error("RedmineWrapperError triggered", {
            errorType: this.type,
            instance: this.instance,
            status: this.status,
            detail: this.detail,
            cause: options?.cause,
            context: this.context,
        });
    }

    /**
     * Converte o erro em um objeto simples pronto para serialização JSON
     * seguindo RFC 7807 Problem Details.
     */
    public toJSON(): Record<string, unknown> {
        return {
            type: this.type,
            title: this.title,
            status: this.status,
            detail: this.detail,
            instance: this.instance,
            context: this.context,
        };
    }
}
