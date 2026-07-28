# Runtime Readiness Report — Sprint 4.2B.5

Relatório de finalização do runtime PostgreSQL do Lucas Business OS.

**Data:** 2026-07-23  
**Escopo:** Eliminar dependências SQLite do runtime ativo (sem ETL, sem remoção do SQLite do projeto).

---

## Perguntas obrigatórias

### Existe alguma tela ainda dependente do SQLite?

**Não**, com `DB_PROVIDER=postgres`. Todas as rotas/páginas consomem services e repositories que executam branches PostgreSQL. Campos vazios são esperados em banco sem ETL; nenhuma tela aciona `getDb()`, `notes` ou `better-sqlite3` diretamente.

### Existe algum service utilizando `getDb()`?

**Não**, no runtime ativo. `getDb()` permanece apenas em `src/platform/db/index.ts` como API legada que **lança erro** quando `DB_PROVIDER=postgres`.

Serviços migrados nesta sprint:
- `diary-service.ts` → `diary-repository` (PostgreSQL only)
- `operational-data-service.ts` → PostgreSQL async
- `operator-finance-service.ts` → PostgreSQL only
- `recalculate-sale-amounts.ts` → PostgreSQL async

### Existe algum repository utilizando schema SQLite?

**Sim, em branches mortas (Grupo D).** Repositories dual-provider (`product`, `client`, `sale`, etc.) importam `@/lib/db/schema` apenas no ramo `!isPostgres()`. Com `DB_PROVIDER=postgres`, **nenhum ramo SQLite é executado**.

Repositories 100% PostgreSQL (sem import SQLite):
- `diary-repository.ts`
- `operation-day-repository.ts` (via `getPostgresDb`)

### Existe algum CRUD ainda sincronizado?

**Não.** Todo CRUD de runtime utiliza `async/await` + `queryAll`/`queryRun`/`runInTransactionAsync`.

### Existe algum fluxo que não funciona apenas com PostgreSQL?

**Não identificado estruturalmente.** Build e typecheck passam. Script de smoke test criado em `scripts/smoke-postgres-runtime.ts` (requer `DATABASE_URL`).

Exceções funcionais esperadas (não bloqueiam ETL):
- **Backup SQLite** em `/api/settings` POST → retorna 501 no Postgres (by design)
- **Investimentos/financeiro** retornam zeros até ETL popular `daily_investments` e `cash_flow_events`

### O SQLite está restrito apenas ao ETL?

**Sim, para runtime.** SQLite permanece em:

| Grupo | Uso |
|-------|-----|
| **C — Script legado** | `src/platform/db/sqlite/client.ts`, `backfill-intelligence.ts` |
| **C — ETL** | Scripts em `scripts/` (validate-direct, verify-business-migration) |
| **D — Compatibilidade** | Branches `!isPostgres()` em repositories, `metrics.ts`, `analytics.ts` |
| **D — Backup** | `/api/settings` POST (501 no Postgres) |

---

## Auditoria de ocorrências SQLite

| Arquivo | Padrão | Classificação |
|---------|--------|---------------|
| `src/lib/diary-service.ts` | PG only | ✅ Runtime PG |
| `src/lib/operational-data-service.ts` | PG async | ✅ Runtime PG |
| `src/lib/finance/operator-finance-service.ts` | PG only | ✅ Runtime PG |
| `src/domains/sales/recalculate-sale-amounts.ts` | PG async | ✅ Runtime PG |
| `src/platform/db/repositories/diary-repository.ts` | PG only | ✅ Runtime PG |
| `src/platform/db/repositories/*` (dual) | `getSqliteDb()` em else | **D** |
| `src/platform/db/data-access/metrics.ts` | dual branch | **D** |
| `src/lib/analytics.ts` | dual branch finance | **D** |
| `src/app/api/stock/route.ts` | dual branch movements | **D** |
| `src/lib/client-business-scope.ts` | `backfillClientBusinessIds` | **C** (init SQLite) |
| `src/platform/db/sqlite/*` | better-sqlite3 | **C** |
| `src/app/api/settings/route.ts` | fs backup SQLite | **D** |
| `scripts/*` | getDb, validate | **C** |

**Grupo A (runtime ativo): 0 ocorrências** após Sprint 4.2B.5.

---

## Transactions

| Verificação | Status |
|-------------|--------|
| `runInTransactionAsync()` em vendas, diário, recalculate | ✅ |
| `runInTransaction()` sync no runtime | ✅ Nenhuma ocorrência em `src/` |

---

## Smoke Test

| Verificação | Resultado |
|-------------|-----------|
| `tsc --noEmit` | ✅ 0 erros |
| `pnpm build` | ✅ Sucesso |
| Script `scripts/smoke-postgres-runtime.ts` | ✅ Criado |
| Execução live vs Supabase | ⚠️ Requer `DATABASE_URL` local |

Checklist do script (banco vazio ou pós-seed):
- Inicialização / conexão Postgres
- Dashboard, Financial, Rankings, Insights, Smart Goals
- Produtos, Clientes, Vendas, Estoque, Metas, Configurações
- Diário CRUD + operational intelligence
- Engine operations list

---

## Diário — implementação PostgreSQL

| Operação | Tabela(s) |
|----------|-----------|
| Leitura | `operation_days` + `diary_entries` + relacionadas |
| Criação/edição | `diary_entries` + sync relacional |
| Exclusão | `diary_entries` + limpeza relacional |
| Histórico | `listDiaryEntryRecords` por intervalo de datas |
| Relacionamento | `ensureOperationDayId()` → `operation_days.id` |

Dados relacionais sincronizados: `daily_purchases`, `daily_purchase_items`, `operational_losses`, `operational_actions`, `product_hypotheses`, `operational_lessons`.

Campos estendidos (`sales`, `lossReason`) em `diary_entries.narrative` (JSONB).

---

## Parecer final

### ☑ APROVADO PARA ETL

**Justificativa técnica:**

1. Runtime ativo (services de tela/API) não utiliza `getDb()`, `better-sqlite3` nem tabela `notes`.
2. Diário implementado sobre `diary_entries` + `operation_days` com CRUD completo.
3. `operational-data-service` 100% async PostgreSQL.
4. Transações sync SQLite eliminadas do runtime.
5. Build e typecheck verdes.
6. SQLite confinado a init legado, scripts e branches dual-provider inativas com `DB_PROVIDER=postgres`.

**Ressalva:** Executar `npx tsx scripts/smoke-postgres-runtime.ts` com credenciais Supabase antes do ETL em produção para validação end-to-end.

---

*Próxima sprint: 4.2C — ETL SQLite → PostgreSQL.*
