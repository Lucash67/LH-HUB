# PostgreSQL Backend Migration — Sprint 4.2B

> **Status pós-cutover (Sprint 4.X):** PostgreSQL (Supabase) é o **banco oficial de runtime**.  
> SQLite permanece apenas para ETL (`scripts/etl/`), scripts históricos e `data/lucas-business-os.db`.

Documentação da adaptação estrutural do backend para PostgreSQL (Supabase).

## Arquitetura (runtime oficial)

```
Controllers (API routes)
    ↓
Services (analytics, goals, CRM, diary, finance, engine)
    ↓
Repositories + data-access/metrics
    ↓
Database Provider (src/platform/db/)
    ↓
PostgreSQL (postgres.js + Drizzle)  ← runtime oficial
```

Branches SQLite nos repositories são **legado inativo** com `DB_PROVIDER=postgres`.

### Seleção de provider

| Variável | Valores | Runtime oficial |
|----------|---------|-----------------|
| `DB_PROVIDER` | `postgres` | **postgres** |
| `DATABASE_URL` | connection string Supabase (Transaction Pooler :6543) | obrigatório |

## Arquivos alterados / criados

### Database Provider

| Arquivo | Função |
|---------|--------|
| `src/platform/db/config.ts` | `getDbProvider()`, `isPostgres()`, `getDatabaseUrl()` |
| `src/platform/db/index.ts` | `getDbAsync()`, `getPostgresDb()`, `getSqliteDb()`, `runInTransactionAsync()` |
| `src/platform/db/query.ts` | `queryAll`, `queryOne`, `queryRun` — API unificada async |
| `src/platform/db/business-id.ts` | Mapeamento slug ↔ UUID fixo (`salgados`, `brigadeiros`) |
| `src/platform/db/mappers.ts` | Linhas PG/SQLite → shapes legados da API |
| `src/platform/db/postgres/client.ts` | Conexão postgres.js, seed dev (businesses + goals) |
| `src/platform/db/sqlite/client.ts` | Conexão better-sqlite3 (extraído do antigo monolito) |
| `src/platform/db/data-access/metrics.ts` | Fetch unificado de sales/products/clients/goals/items |

### Repositories

| Repository | CRUD |
|------------|------|
| `business-repository.ts` | Listagem de operações |
| `product-repository.ts` | Produtos |
| `client-repository.ts` | Clientes |
| `sale-repository.ts` | Vendas + `executeSaleRecord` |
| `goal-repository.ts` | Metas |
| `settings-repository.ts` | Configurações (`app_settings`) |
| `stock-repository.ts` | Estoque + movimentações |
| `operation-day-repository.ts` | `ensureOperationDayId()` (PG) |
| `operation-repository.ts` | Engine operations (PG `engine.operations`) |
| `event-repository.ts` | Engine events |

### Schemas e tipos

| Arquivo | Descrição |
|---------|-----------|
| `src/lib/db/postgres/schema.ts` | Schema Drizzle public (25 tabelas espelhadas) |
| `src/lib/db/postgres/schema-engine.ts` | Schema Drizzle `engine.*` |
| `src/lib/db/types.ts` | Tipos Postgres inferidos + shapes legados (`LegacyProduct`, `LegacySale`, etc.) |
| `src/lib/db/schema.ts` | Schema SQLite (inalterado como fallback) |

### Services adaptados

- `src/lib/analytics.ts` — async, branches PG/SQLite
- `src/lib/analytics-engine/**` — queries, compute, KPIs async
- `src/lib/goals-service.ts`
- `src/lib/client-crm-service.ts`
- `src/lib/client-business-scope.ts`
- `src/lib/insights-engine.ts`
- `src/lib/diary-service.ts` — stub estrutural PG (leitura vazia)
- `src/lib/finance/operator-finance-service.ts` — PG via `cash_flow_events`
- `src/domains/sales/sale-operation-handler.ts`
- `src/core/engine/**` — pipeline async (interpret, execute, publish, repositories)

### API routes adaptadas

`/api/products`, `/api/clients`, `/api/sales`, `/api/goals`, `/api/settings`, `/api/businesses`, `/api/stock`, `/api/dashboard`, `/api/financial`, `/api/rankings`, `/api/projections`, `/api/calendar`, `/api/reports`, `/api/diary`, `/api/operations`, `/api/insights`, `/api/smart-goals`

### Dependências

- `postgres` ^3.4.5 — driver PostgreSQL
- `drizzle-orm`, `drizzle-kit` — ORM e migrations
- `better-sqlite3` — **mantido** (SQLite fallback)

## Componentes adaptados

| Camada | Status |
|--------|--------|
| getDb / getDbAsync | ✅ Provider desacoplado |
| Conexão PostgreSQL | ✅ Supabase via postgres.js |
| Drizzle | ✅ Schemas PG + queries tipadas |
| Repositories | ✅ CRUD core completo |
| Transactions | ✅ `runInTransactionAsync` |
| Analytics | ✅ Async, banco vazio OK |
| Engine | ✅ Async PG/SQLite |
| Seeds dev PG | ✅ Businesses + goals zerados |

## Pendências (pós-4.2B / pré-ETL)

| Item | Impacto |
|------|---------|
| `operational-data-service.ts` | Ainda usa `getDb()` sync + tabelas SQLite (`notes`, `investments`) |
| `recalculate-sale-amounts.ts` | Sync SQLite only |
| `diary-service.ts` | PG retorna vazio; escrita real requer `diary_entries` + `operation_day_id` |
| Backup SQLite em `/api/settings` | Retorna 501 no Postgres (esperado) |
| `backfillIntelligenceFromDiaries()` | Só roda na init SQLite |
| Smart goals / purchase planning | Parcialmente adaptados; dependem de diary SQLite |
| ESLint | Não configurado no projeto (lint interativo pendente) |

## Pontos de atenção para ETL

1. **Business IDs**: API usa slugs; PG usa UUIDs fixos — ETL deve respeitar `business-id.ts`.
2. **Vendas**: PG exige `operation_day_id` — dias operacionais devem existir antes das vendas.
3. **NUMERIC**: colunas monetárias são `string` no Drizzle PG — mappers usam `Number()`.
4. **TIMESTAMPTZ**: normalizar via `toIsoTimestamp()` na API legada.
5. **Diário**: migrar `notes` (JSON SQLite) → `diary_entries` + tabelas operacionais PG.
6. **Investments**: SQLite `investments` → PG `daily_investments` (via `operation_day_id`).
7. **Payments**: SQLite tem tabela `payments`; PG liquida via colunas em `sales` + `cash_flow_events`.
8. **Engine**: PG usa schema `engine.*` com colunas `interpretation` (JSONB), não `interpretationJson`.
9. **Triggers INV-01..04**: validar integridade após carga de dados reais.
10. **Seeds dev**: limpar ou substituir goals zerados após ETL.

## Checklist de regressão estrutural

Reutilizar após ETL. Validar com `DB_PROVIDER=postgres` e banco vazio (ou pós-carga).

### Inicialização

- [ ] App inicia (`pnpm dev`) sem erro de conexão
- [ ] `pnpm typecheck` sem erros
- [ ] `pnpm build` conclui
- [ ] Seed dev cria `salgados` + `brigadeiros` + metas zeradas

### Páginas (sem crash com banco vazio)

- [ ] Dashboard abre (`/`)
- [ ] CRM abre (`/clientes`)
- [ ] Financeiro abre (`/financeiro`)
- [ ] Produtos carregam (`/produtos`) — lista vazia OK
- [ ] Clientes carregam (`/clientes`) — lista vazia OK
- [ ] Diário abre (`/diario`) — sem dados OK
- [ ] Fluxo de Caixa / Financeiro — zeros OK
- [ ] Analytics (`/insights`, `/rankings`, `/projecoes`) — não quebra
- [ ] Engine (`/dev/operacoes`) — funcional

### CRUD via API

- [ ] `GET/POST/PUT /api/products?businessId=salgados`
- [ ] `GET/POST/PUT /api/clients`
- [ ] `POST /api/sales` (cria venda + operation_day + stock movement)
- [ ] `GET/PUT /api/goals?businessId=salgados`
- [ ] `GET/PUT /api/settings`
- [ ] `GET/POST /api/stock?businessId=salgados`

### Compatibilidade SQLite

- [ ] Com `DB_PROVIDER=sqlite` (ou unset), comportamento anterior preservado
- [ ] Backup SQLite em settings continua funcionando

## Trechos legados temporários

```typescript
// src/platform/db/index.ts — getDb() sync, só SQLite
export function getDb() { ... throw se postgres ... }

// src/lib/diary-service.ts — PG: retorna null/[] até implementação diary_entries
if (isPostgres()) return null;

// src/lib/operational-data-service.ts — inteiro SQLite-only (diary sync, investments)
const db = getDb();
```

## Validação executada (Sprint 4.2B)

| Verificação | Resultado |
|-------------|-----------|
| TypeScript (`tsc --noEmit`) | ✅ 0 erros |
| Build (`pnpm build`) | ✅ Sucesso |
| Lint | ⚠️ ESLint não configurado no repo |

---

## Sprint 4.2B.5 — Runtime PostgreSQL completo

### Alterações

| Arquivo | Mudança |
|---------|---------|
| `src/platform/db/repositories/diary-repository.ts` | **Novo** — CRUD diário via `diary_entries` + `operation_days` |
| `src/lib/diary-service.ts` | Reescrito — delega ao diary-repository (sem SQLite) |
| `src/lib/operational-data-service.ts` | Reescrito — async PostgreSQL only |
| `src/lib/finance/operator-finance-service.ts` | Reescrito — PG (`daily_investments`, `cash_flow_events`) |
| `src/domains/sales/recalculate-sale-amounts.ts` | Async PG + `runInTransactionAsync` |
| `src/platform/db/sqlite/backfill-intelligence.ts` | **Novo** — backfill legado movido do operational-data-service |
| `src/app/api/operational/route.ts` | `await getOperationalDayIntelligence` |
| `scripts/smoke-postgres-runtime.ts` | **Novo** — smoke test estrutural |
| `docs/backend/RUNTIME_READINESS_REPORT.md` | **Novo** — parecer de readiness |

### Pendências resolvidas (4.2B)

- ~~Diário stub vazio no Postgres~~ → CRUD completo
- ~~operational-data-service sync SQLite~~ → async PG
- ~~operator-finance investments vazios~~ → lê `daily_investments`

### Pendências remanescentes (pós-runtime, pré/durante ETL)

- Branches dual-provider SQLite em repositories (Grupo D — inativas com `DB_PROVIDER=postgres`)
- Backup arquivo SQLite em settings (501 no Postgres)
- Popular `daily_investments`, `cash_flow_events` via ETL

### Checklist de regressão (atualizado)

Ver `docs/backend/RUNTIME_READINESS_REPORT.md` e executar:

```bash
DB_PROVIDER=postgres DATABASE_URL=... npx tsx scripts/smoke-postgres-runtime.ts
```

---

## Sprint 4.2C — ETL SQLite → PostgreSQL

### Execução

- Fonte: `data/lucas-business-os.db` (read-only)
- Destino: Supabase `auyghtmylvkuggugeych`
- Script: `scripts/etl/migrate.mjs` (5 fases)
- Homologação: `docs/backend/ETL_VALIDATION_REPORT.md`

### Resultado

| Métrica | SQLite | PostgreSQL |
|---------|-------:|-----------:|
| Vendas | 55 | 55 |
| Receita | 438 | 438 |
| Clientes | 46 | 46 |
| Diários | 5 | 5 |

### Atenção INV-03

Inserir `daily_investments` **antes** de `daily_purchases` (trigger de integridade).

### Cutover

Não realizado nesta sprint — ver Sprint 4.2D.

---

*Sprint 4.2C concluída — ETL homologado.*
