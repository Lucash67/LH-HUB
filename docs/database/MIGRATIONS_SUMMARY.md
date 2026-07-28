# Migrations Summary — Sprint 4.2A

**Data:** 2026-07-22  
**Projeto Supabase:** `Lucash67's Project` (`auyghtmylvkuggugeych`)  
**Região:** `ca-central-1` · PostgreSQL 17  
**Arquitetura:** PostgreSQL V1.1 (Architecture Freeze)

---

## 1. Migrations aplicadas

| Ordem | Versão Supabase | Nome | Arquivo local |
|-------|-----------------|------|---------------|
| 1 | `20260723024606` | `lbo_v1_public_schema` | `drizzle/migrations/0001_lbo_v1_public_schema.sql` |
| 2 | `20260723024614` | `lbo_v1_engine_and_invariants` | `drizzle/migrations/0002_lbo_v1_engine_and_invariants.sql` |

**Extensões:** `pgcrypto` (UUID via `gen_random_uuid()`)

**Schemas:** `public`, `engine`

---

## 2. Tabelas criadas (25)

### Schema `public` (20)

| # | Tabela | PK | Observação |
|---|--------|----|------------|
| 1 | `businesses` | UUID | Multi-negócio |
| 2 | `operation_days` | UUID | Agregado raiz |
| 3 | `products` | UUID | Partial unique `(business_id, name) WHERE active` |
| 4 | `clients` | UUID | Global (sem business_id obrigatório) |
| 5 | `sales` | UUID | + `operation_day_id`, `settlement_date` |
| 6 | `sale_items` | UUID | CASCADE on delete |
| 7 | `daily_purchases` | UUID | 1:1 com `operation_days` |
| 8 | `daily_purchase_items` | UUID | CASCADE |
| 9 | `daily_investments` | UUID | Split capital |
| 10 | `cash_flow_events` | UUID | + `business_id` |
| 11 | `stock_movements` | UUID | |
| 12 | `diary_entries` | UUID | KPIs tipados + JSONB; sem `lessons_learned` |
| 13 | `operational_lessons` | UUID | Canônico (AD-02b) |
| 14 | `product_hypotheses` | UUID | |
| 15 | `operational_actions` | UUID | Partial index `status != done` |
| 16 | `operational_pendings` | UUID | Nova |
| 17 | `operational_losses` | UUID | |
| 18 | `future_orders` | UUID | Nova |
| 19 | `goals` | UUID | |
| 20 | `app_settings` | TEXT (`key`) | JSONB values |

### Schema `engine` (5)

| # | Tabela |
|---|--------|
| 21 | `engine.operations` |
| 22 | `engine.operation_payloads` |
| 23 | `engine.operation_interpretations` |
| 24 | `engine.effect_records` |
| 25 | `engine.domain_events` |

---

## 3. Constraints aplicadas

### CHECK constraints (enums e validações)

- Status enums: `businesses`, `operation_days`, `products`, `sales`, `sale_items.flavor_confidence`
- Financeiro: `daily_investments`, `cash_flow_events`, `daily_purchases`
- Operacional: `operational_actions`, `operational_pendings`, `future_orders`, `goals`
- Engine: `operations.status`, `effect_records.action`, `operation_payloads.payload_type`
- Numéricos: `products.unit_price >= 0`, `sale_items.quantity > 0`, etc.

### UNIQUE constraints

- `businesses.slug`
- `operation_days (business_id, operation_date)`
- `daily_purchases.operation_day_id`
- `diary_entries.operation_day_id`
- `products (business_id, name) WHERE status = 'active'` (partial)

### Foreign Keys

- **Total:** 40+ FKs entre tabelas `public` e `engine → public.businesses`
- **ON DELETE CASCADE:** `sale_items`, `daily_purchase_items`, filhos de `operation_days` (lessons, actions, pendings, losses, hypotheses)

---

## 4. Invariantes (triggers)

| ID | Trigger | Tabela | Função |
|----|---------|--------|--------|
| **INV-01** | `trg_sales_operation_day_validate` | `sales` | `validate_sales_operation_day()` |
| **INV-04** | *(mesmo trigger)* | `sales` | Valida `sale_date = operation_date` |
| **INV-02** | `trg_sale_items_business_validate` | `sale_items` | `validate_sale_item_product_business()` |
| **INV-03** | `trg_daily_purchases_investment_validate` | `daily_purchases` | `validate_daily_purchase_investment_sum()` |
| **INV-03** | `trg_daily_investments_investment_validate` | `daily_investments` | *(mesma função — AFTER I/U/D)* |

---

## 5. Índices criados

### `public`

| Índice | Tabela |
|--------|--------|
| `idx_businesses_status` | `businesses` |
| `idx_operation_days_business_date` | `operation_days` |
| `idx_products_business` | `products` |
| `idx_products_business_status` | `products` |
| `idx_products_business_name_active` | `products` (partial unique) |
| `idx_clients_registered_business` | `clients` |
| `idx_clients_name` | `clients` |
| `idx_sales_business_date` | `sales` |
| `idx_sales_operation_day` | `sales` |
| `idx_sales_client` | `sales` |
| `idx_sale_items_sale` | `sale_items` |
| `idx_sale_items_product` | `sale_items` |
| `idx_daily_purchase_items_purchase` | `daily_purchase_items` |
| `idx_daily_investments_operation_day` | `daily_investments` |
| `idx_daily_investments_source` | `daily_investments` |
| `idx_cash_flow_business_date` | `cash_flow_events` |
| `idx_cash_flow_sale` | `cash_flow_events` |
| `idx_stock_movements_product_created` | `stock_movements` |
| `idx_operational_lessons_operation_day` | `operational_lessons` |
| `idx_operational_actions_status` | `operational_actions` (partial) |
| `idx_future_orders_business_scheduled` | `future_orders` |
| `idx_goals_business_type` | `goals` |

### `engine`

| Índice | Tabela |
|--------|--------|
| `idx_engine_operations_business_created` | `operations` |
| `idx_engine_operations_status` | `operations` |
| `idx_engine_effect_records_entity` | `effect_records` |
| `idx_engine_domain_events_type_occurred` | `domain_events` |

---

## 6. Drizzle (schema local)

Arquivos criados (não conectados ao backend ainda):

```
src/lib/db/postgres/
├── schema.ts          # 20 tabelas public
├── schema-engine.ts   # 5 tabelas engine
└── index.ts

drizzle.config.ts      # dialect: postgresql
drizzle/migrations/    # SQL espelho das migrations Supabase
```

O schema SQLite em `src/lib/db/schema.ts` **não foi alterado** (Sprint 4.2A escopo).

---

## 7. Supabase Advisors (pós-DDL)

### Segurança

| Nível | Issue | Qtd | Ação recomendada |
|-------|-------|-----|------------------|
| **ERROR** | RLS disabled in public | 20 tabelas | **Esperado** — RLS na Sprint 4.3+ com Auth (OPT-06) |
| **WARN** | Function search_path mutable | 3 funções trigger | Fix opcional: `SET search_path = public` nas funções |

### Performance

| Nível | Issue | Nota |
|-------|-------|------|
| **INFO** | Unindexed foreign keys | 19 FKs sem índice dedicado — baixo impacto no volume LBO; opcional Sprint 4.3 |
| **INFO** | Unused index | 24 índices — esperado (banco vazio, recém-criado) |

**Nenhum bloqueador estrutural identificado.**

---

## 8. Validação

| Check | Resultado |
|-------|-----------|
| 25 tabelas criadas | ✔ |
| 2 migrations registradas | ✔ |
| 4 triggers de invariante | ✔ |
| FKs ativas | ✔ |
| CHECK constraints | ✔ |
| UUID defaults (`gen_random_uuid`) | ✔ |
| TIMESTAMPTZ audit fields | ✔ |
| NUMERIC monetário | ✔ |
| JSONB (`diary_entries`, `app_settings`, engine) | ✔ |
| TEXT[] (`tags`) | ✔ |
| Dados migrados | ✘ (fora de escopo 4.2A) |
| Backend alterado | ✘ (fora de escopo 4.2A) |

---

## 9. Próximo passo — Sprint 4.2B

1. ETL SQLite → PostgreSQL (baseline 16–22/07)
2. Adaptar `getDb()` para Postgres
3. RLS policies (quando Auth Supabase)
4. Fix `search_path` nas funções trigger (opcional)
5. Índices em FKs secundárias (opcional)

---

## Referências

- `docs/architecture/POSTGRESQL_ARCHITECTURE_V1.md`
- `docs/architecture/ARCHITECTURE_REVIEW.md`
- `docs/architecture/SUPABASE_ENVIRONMENT_AUDIT.md`
