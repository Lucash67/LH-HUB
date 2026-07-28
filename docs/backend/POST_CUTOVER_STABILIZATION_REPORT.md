# Post-Cutover Stabilization Report — Sprint 4.X

Relatório de estabilização pós-migração PostgreSQL do Lucas Business OS.

**Data:** 2026-07-28  
**Escopo:** Limpeza, consolidação e validação — sem alteração de arquitetura, schema ou regras de negócio.

---

## Respostas obrigatórias

| Pergunta | Resposta |
|----------|----------|
| Código SQLite removido | `scripts/fix-db-getters.mjs` (script one-shot de migração) |
| Código SQLite mantido | Ver seção [Auditoria SQLite](#auditoria-sqlite) |
| Dependências removidas | Nenhuma (better-sqlite3 ainda necessário para ETL/scripts) |
| Dependências mantidas | `better-sqlite3`, `@types/better-sqlite3`, `postgres`, `drizzle-orm` |
| Smoke test idempotente? | **Sim** — 17/17 em 2 execuções consecutivas |
| Build aprovado? | **Sim** — `pnpm typecheck` + `pnpm build` |
| Runtime aprovado? | **Sim** — APIs principais HTTP 200 via PostgreSQL |
| Há pendências técnicas? | Branches dual-provider SQLite inativas nos repositories (remoção futura) |

---

## Tarefa 1 — Smoke test idempotente

### Alterações

| Arquivo | Mudança |
|---------|---------|
| `scripts/smoke-cleanup.ts` | **Novo** — cleanup de produto/cliente/venda smoke |
| `scripts/smoke-postgres-runtime.ts` | Cleanup no início + `finally`; reutiliza registros; fecha conexão PG |

### Comportamento

1. `cleanupSmokeArtifacts()` antes dos checks (remove resíduos de execuções anteriores)
2. Product/Client CRUD reutiliza registros existentes ou cria temporários
3. Diary CRUD continua com delete explícito
4. `cleanupSmokeArtifacts()` no `finally` (garante estado limpo mesmo em falha)

### Validação

```
Execução 1: 17/17 passed
Execução 2: 17/17 passed
```

---

## Tarefa 2 — Auditoria SQLite

### Classificação

| Grupo | Descrição | Arquivos |
|-------|-----------|----------|
| **A — Removido** | One-shot migration, sem uso | `scripts/fix-db-getters.mjs` ✅ removido |
| **B — Legado necessário** | Schema/init SQLite local | `src/lib/db/schema.ts`, `src/platform/db/sqlite/client.ts`, `src/platform/db/sqlite/backfill-intelligence.ts`, `src/lib/client-business-scope.ts` |
| **C — ETL** | Pipeline e validação | `scripts/etl/*`, `scripts/validate-direct.ts`, `scripts/verify-business-migration.*`, ~60 scripts históricos em `scripts/` |
| **D — Compatibilidade temporária** | Branches `!isPostgres()` inativas com `DB_PROVIDER=postgres` | Repositories dual-provider, `metrics.ts`, `analytics.ts`, `stock/route.ts`, `operation-repository.ts`, `event-repository.ts`, `settings/route.ts` (backup 501) |

### Ocorrências em `src/` (runtime)

| Padrão | Arquivos | Grupo |
|--------|----------|-------|
| `getSqliteDb()` | 14 repositories + analytics + metrics + stock API | D |
| `getDb()` | `platform/db/index.ts` (lança erro se postgres) | D |
| `better-sqlite3` | `platform/db/sqlite/client.ts` only | B |
| `@/lib/db/schema` (sqliteTable) | schema.ts + branches D | B/D |
| `.prepare(` / `.run(` / `.get(` | `sqlite/client.ts` init/migrations only | B |

**Decisão Sprint 4.X:** Grupo D **preservado** — remoção exigiria refactor massivo dos repositories (fora do escopo "sem alterar arquitetura"). Branches são código morto com `DB_PROVIDER=postgres` e documentadas para remoção no próximo épico.

---

## Tarefa 3 — Limpeza do legado

### Removido

- `scripts/fix-db-getters.mjs` — script de refatoração automática da Sprint 4.2B (obsoleto)

### Preservado (justificativa)

| Item | Motivo |
|------|--------|
| Dual-provider repositories | Compatibilidade documentada; inativo em runtime PG |
| `src/platform/db/sqlite/*` | ETL local + fallback dev |
| `src/lib/db/schema.ts` | Schema fonte ETL + tipos mappers |
| Scripts históricos `scripts/*.mjs` | Operações auditadas por sprint |

---

## Tarefa 4 — Dependências

### `package.json` — revisão

| Dependência | Uso | Ação |
|-------------|-----|------|
| `better-sqlite3` | ETL (`scripts/etl/`), scripts históricos, init SQLite legado | **Manter** |
| `@types/better-sqlite3` | Tipos para scripts | **Manter** |
| `postgres` | Runtime PostgreSQL | **Manter** |
| `drizzle-orm` | PG + SQLite schemas | **Manter** |
| `drizzle-kit` | Migrations PG | **Manter** |

**Sugestão futura:** após remoção dos branches D e descontinuação do ETL incremental, `better-sqlite3` poderá ser movido para devDependencies ou removido quando SQLite deixar de ser fonte.

Nenhuma dependência removida nesta sprint (todas ainda referenciadas).

---

## Tarefa 5 — Documentação

### Atualizado

| Arquivo | Mudança |
|---------|---------|
| `README.md` | PostgreSQL como banco oficial; SQLite = legado/ETL |
| `.env.example` | **Recriado** — template postgres + pooler |
| `docs/backend/POSTGRES_BACKEND_MIGRATION.md` | Banner pós-cutover; runtime oficial = PG |
| `src/lib/analytics-engine/index.ts` | Comentário outdated (better-sqlite3 → platform/db) |

### Já corretos (pós Sprint 4.2D)

- `docs/backend/CUTOVER_READINESS_REPORT.md`
- `docs/backend/ETL_VALIDATION_REPORT.md`
- `docs/backend/RUNTIME_READINESS_REPORT.md`

---

## Tarefa 6 — Repositório

### Varredura

| Item | `src/` | `scripts/` |
|------|:------:|:----------:|
| `TODO` / `FIXME` | 0 | 0 |
| `console.log` debug | 0 | Apenas CLI output intencional (ETL, smoke, homologação) |
| Flags temporárias | Nenhuma identificada | — |
| Código morto removido | — | `fix-db-getters.mjs` |

### Git

Repositório ainda sem commits (`No commits yet`). **Pendência operacional:** iniciar versionamento GitHub no próximo épico (fora do escopo técnico desta sprint).

---

## Tarefa 7 — Validação final

| Check | Resultado |
|-------|-----------|
| `pnpm typecheck` | ✅ Passou |
| `pnpm build` | ✅ Passou |
| Smoke test (2×) | ✅ 17/17 + 17/17 |
| APIs PostgreSQL | ✅ HTTP 200 (dashboard, products, clients, sales, financial, diary, insights, smart-goals, reports) |

---

## Parecer

### ☑ REPOSITÓRIO ESTABILIZADO

**Justificativa:** Smoke test idempotente; runtime PostgreSQL validado; build limpo; documentação alinhada ao estado pós-cutover; resíduo de migração one-shot removido. Branches SQLite inativas permanecem como débito técnico **documentado e contido**, sem impacto no runtime oficial.

**Pendências não bloqueantes:**
1. Remover branches dual-provider (Grupo D) em épico futuro
2. Iniciar GitHub / CI
3. Opcional: mover `better-sqlite3` para devDependencies após descontinuar ETL

---

*Gerado na Sprint 4.X — Estabilização Pós-Cutover.*
