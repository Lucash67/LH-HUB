# Auditoria da Arquitetura Local — SQLite (Sprint 4.0B)

**Data:** 2026-07-22  
**Escopo:** Somente leitura — nenhuma alteração em código ou banco  
**Banco:** `data/lucas-business-os.db` (não versionado)  
**ORM:** Drizzle ORM + `better-sqlite3`  
**Baseline histórica:** dias 16, 17, 20, 21 e 22/07/2026 (Salgados/ACAL)

---

## Resumo executivo

O Lucas Business OS possui **25 tabelas**, **~305 registros** totais e **0 views/triggers**. A aplicação combina **Drizzle** (runtime) com **DDL/migrations inline** em `src/platform/db/index.ts` e **~45 scripts** de manutenção com SQL direto.

A arquitetura suporta bem a operação local atual (multi-business Salgados + Brigadeiros, CRM, financeiro dual operação×operador, diário operacional), mas apresenta **duplicação de dados**, **tabelas mortas**, **campos sem API oficial** e **tipos frágeis para PostgreSQL** (TEXT para datas, REAL para dinheiro).

**Nota da arquitetura atual:** **6,5 / 10** — funcional e auditável, porém acumulando dívida técnica pré-migração.

---

## 1. Inventário do banco

### 1.1 Visão quantitativa

| Métrica | Valor |
|---------|-------|
| Tabelas | **25** |
| Registros totais | **~305** |
| Views | **0** |
| Triggers | **0** |
| Índices (não-PK) | **19** |
| Foreign keys declaradas | **~15 relações** |
| Seeds/migrations formais | **Nenhum** (DDL inline + scripts) |

### 1.2 Registros por tabela

| Tabela | Registros | Dados reais? | Temporário? |
|--------|-----------|--------------|-------------|
| `business_units` | 2 | Sim (seed) | Não |
| `products` | 5 | Sim | Não |
| `clients` | 46 | Sim | Não |
| `sales` | 55 | Sim | Não |
| `sale_items` | 57 | Sim | Não |
| `payments` | 55 | Sim | Não |
| `stock_movements` | 12 | Sim | Não |
| `investments` | 6 | Sim | Não |
| `cash_flow` | 2 | Sim | Não |
| `goals` | 8 | Sim (4 Brigadeiros seed) | Parcial |
| `notes` | 6 | Sim (diários JSON) | Não |
| `daily_purchases` | 5 | Sim | Não |
| `daily_purchase_items` | 15 | Sim | Não |
| `operational_actions` | 12 | Sim | Não |
| `operational_lessons` | 5 | Sim | Não |
| `product_hypotheses` | 9 | Sim | Não |
| `operational_losses` | 0 | — | — |
| `settings` | 4 | Sim | Não |
| `suppliers` | 1 | Seed legado | Quase morto |
| `reports` | 0 | — | Morto |
| `operations` | 0 | — | Engine vazio |
| `operation_payloads` | 0 | — | Engine vazio |
| `operation_interpretations` | 0 | — | Engine vazio |
| `effect_records` | 0 | — | Engine vazio |
| `domain_events` | 0 | — | Engine vazio |

### 1.3 Tipos de dados predominantes

| Padrão SQLite atual | Uso | Risco PostgreSQL |
|---------------------|-----|------------------|
| `TEXT` | PKs (UUID), datas (`YYYY-MM-DD`), timestamps ISO | Migrar PK → `UUID`, datas → `DATE`, timestamps → `TIMESTAMPTZ` |
| `REAL` | Valores monetários (`price`, `profit`, `amount`) | Migrar → `NUMERIC(12,2)` |
| `INTEGER` | Quantidades, flags booleanos (`confirmed`) | `BOOLEAN` nativo em PG |
| `TEXT` (JSON) | Diário em `notes.content`, tags em `operational_lessons` | `JSONB` |

### 1.4 Índices existentes

```
idx_clients_business
idx_daily_purchases_business_date
idx_daily_purchases_business_date_unique   ← UNIQUE (business_id, date)
idx_domain_events_type_occurred
idx_effect_records_entity
idx_goals_business
idx_investments_business
idx_operational_actions_business_date
idx_operational_lessons_business_date
idx_operational_losses_business_date
idx_operations_business_created
idx_operations_status
idx_product_hypotheses_business_date
idx_products_business
idx_sale_items_product
idx_sale_items_sale
idx_sales_business
idx_sales_date
idx_stock_product
```

**Ausentes recomendados:** `(sales.business_id, date)`, `(investments.business_id, date)`, `(cash_flow.date)`, `(clients.name)` para deduplicação CRM.

### 1.5 Seeds e scripts

| Origem | Descrição |
|--------|-----------|
| `src/platform/db/index.ts` | Seeds: `business_units`, metas Brigadeiros, investimento 17/07 legado |
| `src/lib/diary/official-seed.ts` | Referência TypeScript (não auto-carregada) |
| `scripts/register-operation-*.mjs` | Registro oficial pós-consolidação (API + SQL gap) |
| `scripts/reconstruct-salgados-*.mjs` | Reconstruções históricas (baseline congelada) |
| `scripts/validate-*.mjs` | Validação read-only |
| `backups/baseline-acal-2026-07-16-homologacao.sqlite` | Backup administrativo |

---

## 2. Inventário por tabela (finalidade e classificação)

### Núcleo operacional

| Tabela | Finalidade | Quem utiliza | Manter? |
|--------|------------|--------------|---------|
| `business_units` | Catálogo de operações (Salgados, Brigadeiros) | API `/api/businesses`, filtros globais | 🟢 Manter |
| `products` | Catálogo por operação, estoque, custo | Produtos, Estoque, Vendas, Analytics, Engine | 🟡 Refatorar (`sold_quantity` denormalizado) |
| `clients` | CRM global com `business_id` | CRM, Vendas, Dashboard | 🟡 Refatorar (escopo global vs operação) |
| `sales` | Transações comerciais | Vendas, Dashboard, Financeiro, CRM, Metas | 🟢 Manter |
| `sale_items` | Itens por venda | Vendas, Analytics, CRM | 🟢 Manter |
| `payments` | Pagamentos por venda | Escrita em `sale-operation-handler` | 🟡 Refatorar (nunca lido; redundante com `sales`) |
| `stock_movements` | Ledger de movimentação | API `/api/stock` | 🟢 Manter |

### Financeiro

| Tabela | Finalidade | Quem utiliza | Manter? |
|--------|------------|--------------|---------|
| `investments` | Investimento diário + fonte operador | Financeiro, Operator Finance, Analytics | 🟡 Refatorar (sem API write; múltiplas linhas/dia) |
| `cash_flow` | Recebimentos/despesas fora de vendas | Financeiro, Operator Finance | 🟡 Refatorar (**sem `business_id`**) |

### Inteligência operacional (Diário)

| Tabela | Finalidade | Quem utiliza | Manter? |
|--------|------------|--------------|---------|
| `notes` | Diário JSON canônico (`operational_diary`) | `diary-service`, backfill | 🟡 Refatorar (duplicação com tabelas abaixo) |
| `daily_purchases` | Compra diária agregada | Sync via `operational-data-service` | 🟢 Manter |
| `daily_purchase_items` | Linhas de compra | Sync via diário | 🟢 Manter |
| `operational_losses` | Perdas operacionais | Diário, Dashboard alertas | 🟢 Manter |
| `operational_actions` | Ações sugeridas | Diário, Dashboard prioridades | 🟢 Manter |
| `product_hypotheses` | Hipóteses de produto | Diário | 🟢 Manter |
| `operational_lessons` | Aprendizados | Diário | 🟢 Manter |

### Metas e configuração

| Tabela | Finalidade | Quem utiliza | Manter? |
|--------|------------|--------------|---------|
| `goals` | Metas por operação/período | Metas, Dashboard, Settings | 🟢 Manter |
| `settings` | KV config (metas diárias etc.) | Settings, backfill diário | 🟢 Manter |

### Business Engine (auditoria)

| Tabela | Finalidade | Quem utiliza | Manter? |
|--------|------------|--------------|---------|
| `operations` | Execuções do Engine | `/api/operations`, repos | 🟢 Manter (futuro) |
| `operation_payloads` | Payload bruto | `operation-repository` | 🟢 Manter |
| `operation_interpretations` | Interpretação NLP | `operation-repository` | 🟢 Manter |
| `effect_records` | Efeitos colaterais | `operation-repository` | 🟢 Manter |
| `domain_events` | Event sourcing | `operation-repository` | 🟢 Manter |

### Legado / morto

| Tabela | Finalidade | Quem utiliza | Manter? |
|--------|------------|--------------|---------|
| `suppliers` | Fornecedores | Schema apenas; FK em `products` | 🔴 Descontinuar (ou implementar de fato) |
| `reports` | Snapshots de relatório | Ninguém (UI calcula on-the-fly) | 🔴 Descontinuar |

---

## 3. Mapeamento da aplicação

### 3.1 Camada de acesso

```
Componentes (React) → fetch("/api/*")
        ↓
API Routes (Next.js App Router)
        ↓
Services / Domains / Drizzle getDb()
        ↓
better-sqlite3 (singleton em platform/db/index.ts)
        ↓
data/lucas-business-os.db
```

**Exceção:** ~45 scripts em `scripts/` acessam `better-sqlite3` diretamente (reconstrução, validação, seeds).

### 3.2 Fluxo por módulo

#### Dashboard (`/api/dashboard` → `analytics.ts`, `insights-engine.ts`, `dashboard-view.ts`)
```
sales + sale_items + products + clients + goals + investments + cash_flow
→ KPIs, gráficos, comparativos temporais, prioridades (via diary context)
```

#### CRM (`/api/clients` → `client-crm-service.ts`)
```
clients ← sales ← sale_items → products
→ perfil, timeline, recorrência, pendências de pagamento
```

#### Financeiro (`/api/financial` → `analytics.ts` → `operator-finance-service.ts`)
```
sales (receita/lucro operacional)
investments (investimento + source_type/source_name)
cash_flow (recebimentos atrasados, ex.: recebimento_venda_anterior)
→ visão dual: operation × operator
```

#### Vendas (`/api/sales` → `sale-operation-handler.ts`)
```
POST: products → sales + sale_items + payments + stock update
GET: enrich sales com clients/products
```

#### Diário (`/api/diary` PUT → `diary-service.ts` → `operational-data-service.ts`)
```
notes (JSON OperationalDiaryEntry)
  ↓ syncDiaryToRelationalTables()
daily_purchases, daily_purchase_items, operational_*, goals (dailyGoalUnits)
```

#### Daily Purchases
```
Escrita: apenas via sync do diário
Leitura: /api/operational, dashboard diary context
```

#### Analytics Engine (`src/lib/analytics-engine/*`)
```
Agregações sobre sales, sale_items, products, clients, goals
Usado por: rankings, calendar, projections, reports API
```

#### Operations Engine (`/api/operations`)
```
POST texto → interpret → executeSaleOperation → operation-repository
Tabelas engine: operations*, effect_records, domain_events
Estado atual: 0 registros (não usado em produção real)
```

### 3.3 APIs mapeadas

| Rota | Tabelas principais |
|------|-------------------|
| `/api/dashboard` | sales, products, goals, diary (notes) |
| `/api/sales` | sales, sale_items, payments, products, clients |
| `/api/clients` | clients, sales, sale_items |
| `/api/products` | products |
| `/api/stock` | products, stock_movements |
| `/api/financial` | sales, investments, cash_flow |
| `/api/diary` | notes + sync operational_* |
| `/api/operational` | daily_*, operational_*, notes |
| `/api/goals`, `/api/smart-goals` | goals, sales |
| `/api/settings` | settings, goals |
| `/api/businesses` | business_units |
| `/api/operations` | operations* + legacy sales |

---

## 4. Auditoria crítica

### 4.1 Normalização

| Problema | Impacto |
|----------|---------|
| Diário em JSON (`notes`) **e** tabelas relacionais espelhadas | Risco de divergência; dupla fonte |
| `products.sold_quantity` denormalizado | Pode dessincronizar de `sale_items` |
| `payments` separado mas não consultado | Redundância com `sales.payment_*` |
| `cash_flow` sem `business_id` | Impossível filtrar por operação nativamente |
| Metas Brigadeiros com seed zerado | Dados placeholder |

### 4.2 Integridade referencial

- FKs declaradas no Drizzle/schema, mas SQLite exige `PRAGMA foreign_keys = ON` (verificar se ativo no init).
- `investments` e `cash_flow` **sem FK** para `business_units` no DDL legado (coluna `business_id` adicionada via migration inline em investments apenas).
- `clients.business_id` backfilled em runtime a partir de vendas (`backfillClientBusinessIds`).

### 4.3 Performance (escala atual: baixa)

Volume ~305 registros — performance adequada. Gargalos futuros:
- Agregações em `analytics.ts` carregam datasets inteiros em memória
- Ausência de índice composto `(sales.business_id, date DESC)`
- JSON parse do diário a cada request de dashboard

### 4.4 Classificação final

| Classificação | Tabelas |
|---------------|---------|
| 🟢 **Manter** (17) | `business_units`, `sales`, `sale_items`, `stock_movements`, `goals`, `settings`, `daily_purchases`, `daily_purchase_items`, `operational_losses`, `operational_actions`, `product_hypotheses`, `operational_lessons`, `operations`, `operation_payloads`, `operation_interpretations`, `effect_records`, `domain_events` |
| 🟡 **Refatorar** (8) | `products`, `clients`, `payments`, `investments`, `cash_flow`, `notes`, `sales` (tipos/constraints), `suppliers` (se mantido) |
| 🔴 **Descontinuar** (2) | `reports`, `suppliers` (atual estado morto) |

---

## 5. Riscos da migração

| Risco | Nível | Detalhe |
|-------|-------|---------|
| Dependência `better-sqlite3` (native addon) | **Alto** | Trocar driver por `@supabase/supabase-js` + Postgres ou `postgres.js`/`pg` |
| ~45 scripts com SQL SQLite direto | **Alto** | Reescrever ou deprecar; baseline histórica não reexecutável |
| Migrations inline em `platform/db/index.ts` | **Alto** | Sem histórico versionado; precisa exportar schema Drizzle → PG migrations |
| `TEXT` para datas/horas | **Médio** | Converter para `DATE`, `TIME`, `TIMESTAMPTZ` |
| `REAL` para dinheiro | **Médio** | Precisão em centavos; usar `NUMERIC` |
| `INSERT OR IGNORE`, `datetime('now')` em scripts | **Médio** | Sintaxe SQLite-specific |
| `INTEGER` como boolean (`product_hypotheses.confirmed`) | **Baixo** | `BOOLEAN` em PG |
| Diário JSON + sync relacional | **Médio** | Decidir fonte única antes da migração |
| `cash_flow` sem `business_id` | **Médio** | Modelagem incompleta multi-operação |
| Engine tables vazias | **Baixo** | Schema pode migrar vazio |
| WAL mode / file-based backup | **Baixo** | Supabase backup gerenciado |

---

## 6. Oportunidades (pré/desenho PostgreSQL)

1. **Fonte única do diário** — JSONB em PG ou só tabelas relacionais; eliminar sync dual.
2. **`business_id` em `cash_flow`** — consistência multi-operação.
3. **APIs para `investments` e `cash_flow`** — eliminar gap SQL em scripts.
4. **Remover `reports` e `suppliers`** ou implementar de fato.
5. **Consolidar pagamentos** — unificar `payments` com `sales` ou passar a ler `payments`.
6. **Migrations versionadas** — Drizzle Kit + Supabase MCP `apply_migration`.
7. **Constraints** — `UNIQUE(business_id, date)` em investments por tipo; CHECK em enums.
8. **Índices compostos** — `(business_id, date)` em sales, investments.
9. **RLS por `business_id`** — preparação Supabase Auth futura.
10. **Remover `sold_quantity` denormalizado** — view/materialized view em PG.
11. **Separar schema `app` vs `audit`** — Engine tables em schema dedicado.
12. **Tipos gerados** — `generate_typescript_types` via MCP Supabase pós-schema.

---

## 7. Grau de preparação para PostgreSQL

| Aspecto | Situação |
|---------|----------|
| Modelo de domínio | Claro e documentado |
| Volume de dados | Pequeno (~305 rows) — migração trivial |
| Scripts legados | Alto acoplamento SQLite |
| Tipos de dados | Requer conversão sistemática |
| Tabelas mortas | Limpeza recomendada no desenho |
| Multi-business | Parcialmente implementado |
| Baseline histórica | Congelada — migrar como snapshot |

**Nota:** **6,5 / 10**

---

## 8. Recomendação para Sprint 4.1 — Arquitetura PostgreSQL

1. **Congelar** baseline SQLite atual (`backups/` pós-22/07).
2. **Produzir schema alvo** mapeando cada tabela 🟢/🟡/🔴 com tipos PG.
3. **Decidir** arquitetura diário (JSONB vs relacional puro).
4. **Definir** estratégia de scripts (deprecar reconstructions; manter validates adaptados).
5. **Planejar** dual-write ou cutover único (volume pequeno favorece cutover).
6. **Configurar** Drizzle `postgresql` driver + Supabase connection pooler.
7. **Documentar** RLS mínima mesmo sem Auth imediato.
8. **Usar** MCP Supabase para advisors pós-DDL de staging.

---

## Apêndice A — DDL dual (Drizzle vs inline)

O schema Drizzle (`src/lib/db/schema.ts`) é a **fonte conceitual**, mas o banco real é criado/evoluído por funções imperativas em `src/platform/db/index.ts` (`initLegacyTables`, `migrateLegacyBusinessIdColumns`, `migrateSalesPaymentColumns`, etc.). Isso cria **drift potencial** entre schema TypeScript e SQLite físico.

---

## Apêndice B — Referências

- `docs/architecture/SUPABASE_ENVIRONMENT_AUDIT.md` (Sprint 4.0A)
- `docs/handbook/consolidacao-historica.md`
- `docs/decisions/ADR-002-fluxo-oficial-operacoes.md`
- `src/lib/db/schema.ts`
- `src/platform/db/schema-operations.ts`
- `src/platform/db/index.ts`
