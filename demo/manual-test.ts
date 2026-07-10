/* Create by Stallone L. S. (@st-all-one) - 2026 - License: MPL-2.0
 *
 * Copyright (c) 2026, Stallone L. S. (@st-all-one)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * ────────────────────────────────────────────────────────────
 *  TESTE MANUAL — RedmineWrapperTS
 * ────────────────────────────────────────────────────────────
 *  Modo de usar:
 *
 *   export REDMINE_URL="https://seu-redmine.com"
 *   export REDMINE_KEY="sua-api-key"
 *   deno run --allow-net --allow-env demo/manual-test.ts
 *
 *  Ou informe inline:
 *   deno run --allow-net demo/manual-test.ts \
 *     --baseUrl="https://..." --apiKey="..."
 *
 *  Para testar impersonação (admin):
 *   deno run --allow-net --allow-env demo/manual-test.ts \
 *     --switchUser="joao"
 *
 * ────────────────────────────────────────────────────────────
 */

import { RedmineWrapperTS, RedmineWrapperError } from "../mod.ts";

// ── Config ─────────────────────────────────────────────────

function getConfig(): { baseUrl: string; apiKey: string; switchUser: string | undefined } {
    const args = Object.fromEntries(
        Deno.args.map((a) => {
            const m = a.match(/^--(\w+)=(.*)$/);
            return m ? [m[1]!, m[2]!] : [];
        }).filter((x) => x.length > 0),
    ) as Record<string, string>;

    const baseUrl = args.baseUrl ?? Deno.env.get("REDMINE_URL");
    const apiKey = args.apiKey ?? Deno.env.get("REDMINE_KEY");
    const switchUser = args.switchUser ?? Deno.env.get("REDMINE_SWITCH_USER");

    if (!baseUrl || !apiKey) {
        console.error("❌ Informe REDMINE_URL e REDMINE_KEY via env ou --baseUrl=/--apiKey=");
        Deno.exit(1);
    }

    return { baseUrl, apiKey, switchUser: switchUser || undefined };
}

// ── Helpers ─────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function heading(title: string): void {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`  ${title}`);
    console.log(`${"─".repeat(60)}`);
}

async function test(name: string, fn: () => Promise<void>): Promise<void> {
    try {
        await fn();
        console.log(`  ✅ ${name}`);
        passed++;
    } catch (err) {
        console.log(`  ❌ ${name}`);
        console.log(`     ${err instanceof Error ? err.message : String(err)}`);
        failed++;
    }
}

function assert(condition: boolean, msg: string): asserts condition {
    if (!condition) throw new Error(msg);
}

// ── Main ────────────────────────────────────────────────────

async function main(): Promise<void> {
    const config = getConfig();
    const sdk = RedmineWrapperTS.create({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        ...(config.switchUser ? { switchUser: config.switchUser } : {}),
        timeoutMs: 15_000,
    });

    console.log(`\n🔌 Conectando a: ${config.baseUrl}`);
    if (config.switchUser) console.log(`   Impersonando: ${config.switchUser}`);
    console.log(`   ${new Date().toISOString()}\n`);

    // ── 1. My Account ────────────────────────────────────
    heading("1. My Account");

    await test("GET /my/account.json", async () => {
        const me = await sdk.myAccount.get();
        assert(typeof me.id === "number", "id deve ser número");
        assert(typeof me.login === "string", "login deve ser string");
        console.log(`     Logado como: ${me.firstname} ${me.lastname} (${me.login})`);
        console.log(`     Admin: ${me.admin}`);
    });

    // ── 2. Issue Statuses ────────────────────────────────
    heading("2. Issue Statuses");

    await test("GET /issue_statuses.json", async () => {
        const list = await sdk.issueStatuses.list();
        assert(list.length > 0, "deve retornar status");
        console.log(`     ${list.length} statuses encontrados`);
        for (const s of list.slice(0, 5)) {
            console.log(`     • #${s.id} ${s.name} (closed: ${s.is_closed})`);
        }
    });

    // ── 3. Trackers ──────────────────────────────────────
    heading("3. Trackers");

    await test("GET /trackers.json", async () => {
        const list = await sdk.trackers.list();
        assert(list.length > 0, "deve retornar trackers");
        console.log(`     ${list.length} trackers encontrados`);
        for (const t of list) {
            console.log(`     • #${t.id} ${t.name}`);
        }
    });

    // ── 4. Enumerations ──────────────────────────────────
    heading("4. Enumerations");

    await test("GET /enumerations/issue_priorities.json", async () => {
        const list = await sdk.enumerations.listIssuePriorities();
        assert(list.length > 0, "deve retornar prioridades");
        console.log(`     ${list.length} prioridades`);
        for (const p of list) {
            console.log(`     • #${p.id} ${p.name} (default: ${p.is_default})`);
        }
    });

    await test("GET /enumerations/time_entry_activities.json", async () => {
        const list = await sdk.enumerations.listTimeEntryActivities();
        assert(list.length > 0, "deve retornar atividades");
        console.log(`     ${list.length} atividades`);
        for (const a of list.slice(0, 5)) {
            console.log(`     • #${a.id} ${a.name}`);
        }
    });

    // ── 5. Projects ──────────────────────────────────────
    heading("5. Projects");

    let projectId: number | undefined;

    await test("GET /projects.json", async () => {
        const list = await sdk.projects.list().toArray();
        assert(list.length > 0, "deve haver ao menos 1 projeto");
        console.log(`     ${list.length} projetos encontrados`);
        for (const p of list.slice(0, 8)) {
            console.log(`     • #${p.id} ${p.name} (${p.identifier})`);
        }
        projectId = list[0]!.id;
    });

    if (projectId) {
        await test("GET /projects/{id}.json with includes", async () => {
            const p = await sdk.projects.getWithIncludes(projectId!, [
                "trackers",
                "issue_categories",
                "enabled_modules",
            ]);
            console.log(`     Nome: ${p.name}`);
            console.log(`     Trackers: ${(p.trackers ?? []).map((t) => t.name).join(", ")}`);
            console.log(`     Módulos: ${(p.enabled_modules ?? []).join(", ")}`);
        });

        // ── 6. Versions ────────────────────────────────
        heading("6. Versions");

        await test("GET /projects/{id}/versions.json", async () => {
            const list = await sdk.versions.listByProject(projectId!);
            console.log(`     ${list.length} versões encontradas`);
            for (const v of list) {
                console.log(`     • #${v.id} ${v.name} (${v.status})`);
            }
        });

        // ── 7. Issue Categories ─────────────────────────
        heading("7. Issue Categories");

        await test("GET /projects/{id}/issue_categories.json", async () => {
            const list = await sdk.issueCategories.listByProject(projectId!);
            console.log(`     ${list.length} categorias`);
            for (const c of list) {
                console.log(`     • #${c.id} ${c.name}`);
            }
        });

        // ── 8. Memberships ──────────────────────────────
        heading("8. Memberships");

        await test("GET /projects/{id}/memberships.json", async () => {
            const list = await sdk.memberships.listByProject(projectId!);
            console.log(`     ${list.length} memberships`);
            for (const m of list) {
                const who = m.user ? `@${m.user.name}` : m.group ? `group:${m.group.name}` : "?";
                const roles = m.roles.map((r) => r.name).join(", ");
                console.log(`     • ${who} → ${roles}`);
            }
        });

        // ── 9. Files ─────────────────────────────────────
        heading("9. Files");

        await test("GET /projects/{id}/files.json", async () => {
            const list = await sdk.files.listByProject(projectId!);
            console.log(`     ${list.length} arquivos`);
            for (const f of list.slice(0, 5)) {
                console.log(`     • ${f.filename} (${f.filesize} bytes)`);
            }
        });

        // ── 10. Wiki ─────────────────────────────────────
        heading("10. Wiki Pages");

        await test("GET /projects/{id}/wiki/index.json", async () => {
            const pages = await sdk.wiki.list(projectId!);
            console.log(`     ${pages.length} páginas wiki`);
            for (const w of pages.slice(0, 5)) {
                console.log(`     • ${w.title} (v${w.version})`);
            }
        });
    }

    // ── 11. Roles ─────────────────────────────────────────
    heading("11. Roles");

    await test("GET /roles.json", async () => {
        const list = await sdk.roles.list();
        assert(list.length > 0, "deve retornar roles");
        console.log(`     ${list.length} roles`);
        for (const r of list) {
            console.log(`     • #${r.id} ${r.name}`);
        }
    });

    // ── 12. Queries ───────────────────────────────────────
    heading("12. Queries");

    await test("GET /queries.json", async () => {
        const list = await sdk.queries.list();
        console.log(`     ${list.length} queries salvas`);
        for (const q of list) {
            console.log(`     • #${q.id} ${q.name} (${q.is_public ? "pública" : "privada"})`);
        }
    });

    // ── 13. Custom Fields ─────────────────────────────────
    heading("13. Custom Fields");

    await test("GET /custom_fields.json", async () => {
        const list = await sdk.customFields.list();
        console.log(`     ${list.length} custom fields`);
        for (const cf of list.slice(0, 5)) {
            console.log(`     • #${cf.id} ${cf.name} (${cf.field_format})`);
        }
    });

    // ── 14. Issues ────────────────────────────────────────
    heading("14. Issues");

    await test("GET /issues.json (filtrado)", async () => {
        const list = await sdk.issues.list({
            status_id: "*",
            limit: 5,
        }).toArray();
        assert(list.length > 0, "deve retornar ao menos 1 issue");
        console.log(`     ${list.length} issues retornadas (limit=5)`);
        for (const i of list) {
            console.log(`     • #${i.id} [${i.status.name}] ${i.subject.slice(0, 60)}`);
        }
    });

    await test("GET /issues.json (apenas abertas, minhas)", async () => {
        const list = await sdk.issues.list({
            assigned_to_id: "me",
            status_id: "open",
            limit: 10,
        }).toArray();
        console.log(`     ${list.length} issues abertas assignadas a mim`);
        for (const i of list) {
            console.log(`     • #${i.id} ${i.subject.slice(0, 60)}`);
        }
    });

    await test("GET /issues.json (com paginação manual)", async () => {
        const page1 = await sdk.issues.list({
            status_id: "*",
            limit: 3,
            offset: 0,
        }).toArray();
        console.log(`     Página 1: ${page1.length} issues`);

        const page2 = await sdk.issues.list({
            status_id: "*",
            limit: 3,
            offset: 3,
        }).toArray();
        console.log(`     Página 2: ${page2.length} issues`);

        assert(page1.length > 0, "page1 deve ter items");
    });

    // ── 15. Users ─────────────────────────────────────────
    heading("15. Users");

    await test("GET /users.json (current)", async () => {
        const me = await sdk.users.getCurrent();
        assert(typeof me.id === "number", "id deve ser número");
        console.log(`     ${me.firstname} ${me.lastname} (${me.login})`);
    });

    // ── 16. Time Entries ──────────────────────────────────
    heading("16. Time Entries");

    await test("GET /time_entries.json", async () => {
        const list = await sdk.timeEntries.list({
            limit: 5,
        }).toArray();
        console.log(`     ${list.length} time entries`);
        for (const te of list) {
            console.log(`     • ${te.hours}h em ${te.spent_on}${te.comments ? ` — ${te.comments}` : ""}`);
        }
    });

    // ── 17. Search ────────────────────────────────────────
    heading("17. Search");

    await test("GET /search.json?q=bug", async () => {
        const results = await sdk.search.search({ q: "bug", limit: 5 });
        console.log(`     ${results.length} resultados para "bug"`);
        for (const r of results.slice(0, 3)) {
            console.log(`     • [${r.type}] ${r.title}`);
        }
    });

    // ── 18. News ─────────────────────────────────────────
    heading("18. News");

    await test("GET /news.json", async () => {
        const list = await sdk.news.list({ limit: 5 });
        console.log(`     ${list.length} notícias`);
        for (const n of list) {
            console.log(`     • ${n.title} — por ${n.author.name}`);
        }
    });

    // ── 19. Attachments (se houver um ID conhecido) ──────
    heading("19. Attachments");

    await test("GET /attachments.json (buscar via issue com include)", async () => {
        const issues = await sdk.issues.list({
            status_id: "*",
            limit: 10,
        }).toArray();

        for (const issue of issues) {
            if (issue.attachments && issue.attachments.length > 0) {
                // Include attachments não funciona em lista, só em GET individual
                break;
            }
        }

        // Tentar pegar uma issue que tenha attachments
        for (const issue of issues.slice(0, 3)) {
            try {
                const full = await sdk.issues.getWithIncludes(issue.id, ["attachments"]);
                if (full.attachments && full.attachments.length > 0) {
                    console.log(`     Issue #${full.id} tem ${full.attachments.length} attachment(s):`);
                    for (const a of full.attachments) {
                        console.log(`     • ${a.filename} (${a.filesize} bytes, ${a.content_type})`);
                    }
                    break;
                }
            } catch {
                // skip
            }
        }
        console.log("     (verificação de attachments concluída)");
    });

    // ── 20. Journals ──────────────────────────────────────
    heading("20. Journals");

    await test("GET /issues/{id}.json?include=journals", async () => {
        const issues = await sdk.issues.list({
            status_id: "*",
            limit: 5,
        }).toArray();

        if (issues.length > 0) {
            const full = await sdk.issues.getWithIncludes(issues[0]!.id, ["journals"]);
            const journals = full.journals ?? [];
            console.log(`     Issue #${full.id} tem ${journals.length} journal(s)`);
            for (const j of journals.slice(0, 3)) {
                const preview = j.notes ? j.notes.slice(0, 80) : "(sem notas)";
                console.log(`     • ${preview}`);
            }
        }
    });

    // ── 21. Relations ─────────────────────────────────────
    heading("21. Relations");

    await test("GET /issues/{id}/relations.json", async () => {
        const issues = await sdk.issues.list({
            status_id: "*",
            limit: 10,
        }).toArray();

        for (const issue of issues.slice(0, 5)) {
            try {
                const rels = await sdk.relations.listByIssue(issue.id);
                if (rels.length > 0) {
                    console.log(`     Issue #${issue.id} tem ${rels.length} relação(ões):`);
                    for (const r of rels) {
                        console.log(`     • #${r.issue_id} → #${r.issue_to_id} (${r.relation_type})`);
                    }
                    break;
                }
            } catch {
                // skip
            }
        }
        console.log("     (verificação de relações concluída)");
    });

    // ── 22. Groups ────────────────────────────────────────
    heading("22. Groups");

    await test("GET /groups.json", async () => {
        try {
            const list = await sdk.groups.list().toArray();
            console.log(`     ${list.length} grupos`);
            for (const g of list) {
                console.log(`     • #${g.id} ${g.name}`);
            }
        } catch (err) {
            // Groups requer admin
            console.log(`     (requer admin: ${err instanceof RedmineWrapperError ? err.title : "erro"})`);
        }
    });

    // ── Resumo ────────────────────────────────────────────
    console.log(`\n${"=".repeat(60)}`);
    console.log(`  ✅ ${passed} testes passaram`);
    if (failed > 0) console.log(`  ❌ ${failed} testes falharam`);
    console.log(`${"=".repeat(60)}\n`);

    Deno.exit(failed > 0 ? 1 : 0);
}

await main();
