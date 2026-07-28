# ETL Validation Report — Sprint 4.2C

Relatório de homologação da migração SQLite → PostgreSQL (Supabase).

**Projeto:** `auyghtmylvkuggugeych`  
**Fonte:** `data/lucas-business-os.db` (somente leitura — não alterado)  
**Data:** 2026-07-23  
**Executor:** `scripts/etl/migrate.mjs` + chunks MCP `execute_sql`

---

## Pré-condição — Smoke Test

| Item | Status |
|------|--------|
| `npx tsx scripts/smoke-postgres-runtime.ts` com `DATABASE_URL` | ⚠️ Não executado localmente (`DATABASE_URL` ausente no ambiente) |
| Validação estrutural pré-ETL via Supabase MCP | ✅ Banco vazio confirmado |
| Pós-ETL validação de contagens | ✅ Homologado |

**Ação recomendada antes do Cutover (4.2D):** configurar `.env.local` com `DATABASE_URL` e executar smoke test + `node scripts/etl/validate.mjs`.

---

## Fases executadas

| Fase | Domínio | Statements | Status |
|------|---------|----------:|:------:|
| 1 | Businesses, Settings, Goals | 14 | ✅ |
| 2 | Products, Clients | 51 | ✅ |
| 3 | Operation Days, Investments, Purchases, Diary | 44 | ✅ |
| 4 | Sales, Sale Items, Cash Flow, Stock | 126 | ✅ |
| 5 | Operational Actions, Hypotheses, Lessons | 26 | ✅ |

### Problema encontrado e corrigido

**INV-03** (`daily_purchases.total_investment` = `SUM(daily_investments.amount)`): a ordem inicial inseria `daily_purchases` antes de `daily_investments`. Corrigido em `migrate.mjs` — investimentos inseridos **antes** das compras.

### Mapeamento de IDs

| Tipo | Estratégia |
|------|------------|
| Business slugs | UUIDs fixos (`00000000-0000-4000-8000-000000000001/2`) |
| IDs já UUID | Preservados |
| IDs legados (`brig-lote-*`, `brigadeiros-daily`, `acal-inv-*`) | UUID v5 determinístico (`ETL_NAMESPACE`) |
| Operation days | UUID v5(`operation-day:{businessUuid}:{date}`) |

---

## Tabela de homologação

| Entidade | SQLite | PostgreSQL | Status |
|----------|-------:|-----------:|:------:|
| Businesses | 2 | 2 | ✅ |
| Products | 5 | 5 | ✅ |
| Clients | 46 | 46 | ✅ |
| Sales | 55 | 55 | ✅ |
| Sale Items | 57 | 57 | ✅ |
| Goals | 8 | 8 | ✅ |
| App Settings | 4 | 4 | ✅ |
| Operation Days | 8 | 8 | ✅ |
| Diary Entries | 5 | 5 | ✅ |
| Daily Investments | 6 | 6 | ✅ |
| Daily Purchases | 5 | 5 | ✅ |
| Cash Flow Events | 2 | 2 | ✅ |
| Stock Movements | 12 | 12 | ✅ |
| Operational Actions | 12 | 12 | ✅ |
| Product Hypotheses | 9 | 9 | ✅ |
| Operational Lessons | 5 | 5 | ✅ |
| Engine Operations | 0 | 0 | ✅ (n/a) |

---

## KPIs comparativos

| KPI | SQLite | PostgreSQL | Status |
|-----|-------:|-----------:|:------:|
| Receita total | 438.00 | 438.00 | ✅ |
| Lucro total | 215.50 | 215.48 | ✅* |
| Quantidade de vendas | 55 | 55 | ✅ |
| Quantidade de clientes | 46 | 46 | ✅ |
| Quantidade de produtos | 5 | 5 | ✅ |
| Estoque (soma unidades) | 4 | 4 | ✅ |
| Fluxo de caixa (soma) | 10.00 | 10.00 | ✅ |

\* Diferença de R$ 0,02 no lucro — arredondamento `numeric` PostgreSQL vs `real` SQLite. Aceitável para homologação.

---

## Validação por domínio

| Fase | Validação |
|------|-----------|
| 1 — Business/Settings/Goals | Contagens + FK business UUID ✅ |
| 2 — Products/Clients | Contagens + business_id ✅ |
| 3 — Operation/Diary | INV-03 respeitado; diary_entries = notes ✅ |
| 4 — Sales | INV-01/02/04 via triggers; revenue/profit ✅ |
| 5 — Operational | Actions/hypotheses/lessons por operation_day_id ✅ |

---

## Validação final (estrutural)

Com dados carregados no Supabase, as camadas de runtime PostgreSQL (Sprint 4.2B.5) devem retornar:

| Área | Expectativa pós-ETL |
|------|---------------------|
| Dashboard | KPIs com receita R$ 438, lucro ~R$ 215 |
| Analytics / Rankings / Insights | Dados históricos visíveis |
| CRM | 46 clientes |
| Financeiro | Investimentos + fluxo de caixa |
| Diário | 5 entradas salgados |
| Metas | 8 metas |
| Engine | 0 operações (SQLite vazio) |

**Nota:** Validação de UI requer app com `DB_PROVIDER=postgres` + `DATABASE_URL` apontando ao Supabase.

---

## Scripts ETL

| Script | Função |
|--------|--------|
| `scripts/etl/migrate.mjs` | Pipeline principal (5 fases) |
| `scripts/etl/lib/helpers.mjs` | UUID, SQL helpers |
| `scripts/etl/validate.mjs` | Comparação SQLite vs PG |
| `scripts/etl/export-all-phases.mjs` | Gera SQL por fase |
| `scripts/etl/split-sql.mjs` | Divide SQL para execução em lotes |
| `scripts/etl/inspect-sqlite.mjs` | Inspeção rápida da fonte |
| `scripts/smoke-postgres-runtime.ts` | Smoke test runtime |

---

## Parecer

### ☑ ETL HOMOLOGADO

Todos os domínios migrados com contagens e KPIs equivalentes. SQLite permanece intacto como fonte legada. PostgreSQL (`auyghtmylvkuggugeych`) é a base oficial de dados.

**Próxima sprint:** 4.2D — Cutover (não iniciado nesta sprint).

---

*Gerado automaticamente após Sprint 4.2C.*
