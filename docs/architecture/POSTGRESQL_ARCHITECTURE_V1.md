# Arquitetura PostgreSQL V1 — Lucas Business OS

**Sprint 4.1 — Arquitetura Definitiva (somente design)**  
**Sprint 4.1.5 — Architecture Freeze V1.1**  
**Data:** 2026-07-22  
**Status:** **CONGELADA** — pronta para implementação na Sprint 4.2  
**Base:** Auditorias 4.0A/4.0B · DOMAIN_MODEL_V1 · ERD SQLite

---

## 1. Princípios arquiteturais

| Princípio | Decisão |
|-----------|---------|
| Agregado raiz operacional | `operation_days` — um registro por `(business_id, operation_date)` |
| Multi-negócio | `business_id` em entidades operacionais; RLS preparado |
| Dinheiro | `NUMERIC(12,2)` — nunca float |
| Tempo | `DATE` para dia comercial; `TIME` para hora de venda; `TIMESTAMPTZ` para auditoria |
| Identificadores | `UUID` v4 via `gen_random_uuid()` (extensão `pgcrypto` já disponível no Supabase) |
| Diário | Colunas tipadas para KPIs + `JSONB` para narrativa rica (elimina dual storage) |
| Cliente | Global — escopo de operação derivado de `sales`, não duplicado |
| Pagamentos | Sem tabela `payments`; liquidação via colunas da venda + `cash_flow_events` |
| Relatórios | Não persistidos — projeções em runtime |
| Engine | Schema `engine` isolado do domínio operacional |
| Supabase | Tabelas em `public` com RLS futuro; engine em schema dedicado |

### Schemas PostgreSQL

| Schema | Conteúdo |
|--------|----------|
| `public` | Domínio operacional LBO |
| `engine` | Motor de operações (auditoria NLP) |

---

## 2. Inventário de entidades

| # | Tabela | Domínio | Origem SQLite |
|---|--------|---------|---------------|
| 1 | `businesses` | Organização | `business_units` |
| 2 | `products` | Cadastro | `products` (refatorada) |
| 3 | `clients` | Cadastro | `clients` (refatorada) |
| 4 | `operation_days` | Operação Diária | **NOVA** |
| 5 | `sales` | Comercial | `sales` |
| 6 | `sale_items` | Comercial | `sale_items` |
| 7 | `daily_purchases` | Financeiro/Estoque | `daily_purchases` |
| 8 | `daily_purchase_items` | Financeiro/Estoque | `daily_purchase_items` |
| 9 | `daily_investments` | Financeiro | `investments` (refatorada) |
| 10 | `cash_flow_events` | Financeiro | `cash_flow` (refatorada) |
| 11 | `stock_movements` | Estoque | `stock_movements` |
| 12 | `diary_entries` | Inteligência | `notes` (substituída) |
| 13 | `operational_lessons` | Inteligência | mantida |
| 14 | `product_hypotheses` | Inteligência | mantida |
| 15 | `operational_actions` | Inteligência | mantida |
| 16 | `operational_pendings` | Inteligência | **NOVA** |
| 17 | `operational_losses` | Inteligência | mantida |
| 18 | `future_orders` | Inteligência/Comercial | **NOVA** |
| 19 | `goals` | Metas | `goals` |
| 20 | `app_settings` | Configuração | `settings` |
| 21–25 | `engine.*` | Motor | `operations*` |

**Removidas:** `suppliers`, `reports`, `payments`, `notes`

---

## 3. Entidades detalhadas

### 3.1 `businesses`

| | |
|---|---|
| **Objetivo** | Representar uma operação de negócio (Salgados, Brigadeiros) |
| **Responsabilidade** | Escopo multi-tenant lógico |

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK, default `gen_random_uuid()` |
| `slug` | `TEXT` | NOT NULL, UNIQUE |
| `name` | `TEXT` | NOT NULL |
| `status` | `TEXT` | NOT NULL, CHECK `IN ('active','inactive')` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL, default `now()` |

**FKs:** nenhuma  
**Índices:** `UNIQUE(slug)`, `idx_businesses_status`  
**Regras:** slug imutável após criação; soft-delete via `status`  
**Justificativa:** Renomeação semântica de `business_units`; slug estável para URLs/filtros

---

### 3.2 `operation_days`

| | |
|---|---|
| **Objetivo** | Agregado raiz de um dia oficial de operação |
| **Responsabilidade** | Ancorar compra, vendas, diário, investimentos e pendências |

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `business_id` | `UUID` | NOT NULL, FK → `businesses(id)` |
| `operation_date` | `DATE` | NOT NULL |
| `status` | `TEXT` | NOT NULL, default `'open'`, CHECK `IN ('open','closed','homologated')` |
| `daily_goal_units` | `INTEGER` | CHECK `>= 0` |
| `homologated_at` | `TIMESTAMPTZ` | nullable |
| `homologation_ref` | `TEXT` | nullable — ex.: ROO-0002, Sprint A.3.1 |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL |

**FKs:** `business_id → businesses`  
**Constraints:** `UNIQUE(business_id, operation_date)`  
**Índices:** `idx_operation_days_business_date (business_id, operation_date DESC)`  
**Regras:** dias `homologated` são imutáveis salvo evidência documental (ADR baseline)  
**Justificativa:** Elimina fragmentação date+business espalhada; base de auditoria

---

### 3.3 `products`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `business_id` | `UUID` | NOT NULL, FK → `businesses` |
| `name` | `TEXT` | NOT NULL |
| `category` | `TEXT` | NOT NULL |
| `unit_price` | `NUMERIC(12,2)` | NOT NULL, CHECK `>= 0` |
| `unit_cost` | `NUMERIC(12,2)` | NOT NULL, CHECK `>= 0` — referência, não custo do dia |
| `stock_quantity` | `INTEGER` | NOT NULL, default 0, CHECK `>= 0` |
| `min_stock` | `INTEGER` | NOT NULL, default 0 |
| `image_url` | `TEXT` | nullable |
| `status` | `TEXT` | CHECK `IN ('active','inactive')` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL |

**Removido vs SQLite:** `sold_quantity`, `supplier_id`  
**Constraints:** `UNIQUE(business_id, name)` onde `status = 'active'` (partial unique index)  
**Índices:** `idx_products_business`, `idx_products_business_status`  
**Regras:** venda sempre snapshot `unit_price`/`unit_cost` em `sale_items`  
**Justificativa:** estoque derivável; fornecedor descontinuado

---

### 3.4 `clients`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `name` | `TEXT` | NOT NULL |
| `sector` | `TEXT` | nullable — ex.: ACAL |
| `company` | `TEXT` | nullable |
| `phone` | `TEXT` | nullable |
| `notes` | `TEXT` | nullable |
| `registered_business_id` | `UUID` | nullable, FK → `businesses` — contexto de cadastro |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL |

**Removido vs SQLite:** `business_id` obrigatório  
**Índices:** `idx_clients_name_trgm` (GIN pg_trgm futuro), `idx_clients_registered_business`  
**Regras:** cliente é global; histórico multi-operação via `sales`  
**Justificativa:** CRM transversal conforme ADR-003

---

### 3.5 `sales`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `business_id` | `UUID` | NOT NULL, FK → `businesses` |
| `operation_day_id` | `UUID` | NOT NULL, FK → `operation_days` |
| `client_id` | `UUID` | nullable, FK → `clients` |
| `sale_date` | `DATE` | NOT NULL — data comercial |
| `sale_time` | `TIME` | NOT NULL |
| `department` | `TEXT` | nullable — ACAL, Trabalho do Henrique |
| `payment_method` | `TEXT` | CHECK `IN ('pix','card','cash')` |
| `payment_status` | `TEXT` | CHECK `IN ('paid','pending','partial')`, default `'paid'` |
| `amount_received` | `NUMERIC(12,2)` | NOT NULL, default 0 |
| `settlement_date` | `DATE` | nullable — quando dinheiro entrou (≠ sale_date) |
| `total_amount` | `NUMERIC(12,2)` | NOT NULL |
| `total_cost` | `NUMERIC(12,2)` | NOT NULL |
| `profit` | `NUMERIC(12,2)` | NOT NULL |
| `notes` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL |

**FKs:** business, operation_day, client  
**Índices:** `idx_sales_business_date (business_id, sale_date DESC)`, `idx_sales_operation_day`, `idx_sales_client`  
**Regras:** `sale_date` deve igualar `operation_days.operation_date`; receita operacional usa `sale_date`; caixa usa `settlement_date` ou `cash_flow_events`  
**Justificativa:** renomeia `date`/`time`; absorve `payments`; liga ao agregado dia

---

### 3.6 `sale_items`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `sale_id` | `UUID` | NOT NULL, FK → `sales ON DELETE CASCADE` |
| `product_id` | `UUID` | NOT NULL, FK → `products` |
| `quantity` | `INTEGER` | NOT NULL, CHECK `> 0` |
| `unit_price` | `NUMERIC(12,2)` | NOT NULL |
| `unit_cost` | `NUMERIC(12,2)` | NOT NULL — custo alocado do dia |
| `subtotal` | `NUMERIC(12,2)` | NOT NULL |
| `profit` | `NUMERIC(12,2)` | NOT NULL |
| `flavor_confidence` | `TEXT` | nullable, CHECK `IN ('confirmed','unknown','estimated')` |

**Índices:** `idx_sale_items_sale`, `idx_sale_items_product`  
**Regras:** `subtotal = unit_price * quantity` (CHECK ou trigger na 4.2)  
**Justificativa:** `flavor_confidence` formaliza vendas com sabor não identificado (22/07)

---

### 3.7 `daily_purchases`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `operation_day_id` | `UUID` | NOT NULL, UNIQUE, FK → `operation_days` |
| `total_units` | `INTEGER` | NOT NULL, CHECK `> 0` |
| `total_investment` | `NUMERIC(12,2)` | NOT NULL, CHECK `>= 0` |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL |

**Regras:** 1:1 com `operation_days`; soma de `daily_purchase_items.quantity` = `total_units`  
**Justificativa:** remove `business_id+date` duplicado — deriva de `operation_day`

---

### 3.8 `daily_purchase_items`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `daily_purchase_id` | `UUID` | NOT NULL, FK → `daily_purchases ON DELETE CASCADE` |
| `product_id` | `UUID` | nullable, FK → `products` |
| `product_name` | `TEXT` | NOT NULL — snapshot nome |
| `quantity` | `INTEGER` | NOT NULL, CHECK `> 0` |
| `unit_cost` | `NUMERIC(12,4)` | nullable — investimento/unidade do dia |

**Índices:** `idx_daily_purchase_items_purchase`  
**Regras:** `product_name` preservado se produto renomeado depois

---

### 3.9 `daily_investments`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `operation_day_id` | `UUID` | NOT NULL, FK → `operation_days` |
| `amount` | `NUMERIC(12,2)` | NOT NULL, CHECK `> 0` |
| `investment_type` | `TEXT` | CHECK `IN ('initial','additional','withdrawal')` |
| `source_type` | `TEXT` | CHECK `IN ('own_capital','family','partner','investor','supplier','loan','other')` |
| `source_name` | `TEXT` | nullable — ex.: Henrique |
| `description` | `TEXT` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

**Constraints:** múltiplas linhas por dia permitidas (split 22/07: R$ 22,50 + R$ 30,00)  
**Índices:** `idx_daily_investments_operation_day`, `idx_daily_investments_source (source_type, source_name)`  
**Regras:** Operator Finance: `own_capital` = cash out operador; demais = third party  
**Justificativa:** substitui `investments` monolítico

---

### 3.10 `cash_flow_events`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `business_id` | `UUID` | NOT NULL, FK → `businesses` |
| `operation_day_id` | `UUID` | nullable, FK → `operation_days` — dia do evento |
| `sale_id` | `UUID` | nullable, FK → `sales` |
| `event_type` | `TEXT` | CHECK `IN ('income','expense')` |
| `category` | `TEXT` | NOT NULL — ex.: `recebimento_venda_anterior` |
| `description` | `TEXT` | NOT NULL |
| `amount` | `NUMERIC(12,2)` | NOT NULL, CHECK `> 0` |
| `event_date` | `DATE` | NOT NULL |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

**Índices:** `idx_cash_flow_business_date (business_id, event_date DESC)`, `idx_cash_flow_sale`  
**Regras:** recebimentos de vendas anteriores **não** alteram receita do `operation_day` atual  
**Justificativa:** adiciona `business_id` ausente no SQLite; liga a venda quando aplicável

---

### 3.11 `stock_movements`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `product_id` | `UUID` | NOT NULL, FK → `products` |
| `operation_day_id` | `UUID` | nullable, FK → `operation_days` |
| `sale_id` | `UUID` | nullable, FK → `sales` |
| `movement_type` | `TEXT` | CHECK `IN ('entry','exit','adjustment')` |
| `quantity` | `INTEGER` | NOT NULL, CHECK `> 0` |
| `balance_after` | `INTEGER` | NOT NULL, CHECK `>= 0` |
| `reason` | `TEXT` | nullable |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |

**Índices:** `idx_stock_movements_product_created (product_id, created_at DESC)`  
**Regras:** toda saída de venda gera movimento `exit` rastreável

---

### 3.12 `diary_entries`

| Campo | Tipo PG | Constraints |
|-------|---------|-------------|
| `id` | `UUID` | PK |
| `operation_day_id` | `UUID` | NOT NULL, UNIQUE, FK → `operation_days` |
| `schema_version` | `INTEGER` | NOT NULL, default 1 |
| `revenue_received` | `NUMERIC(12,2)` | NOT NULL |
| `revenue_pending` | `NUMERIC(12,2)` | NOT NULL, default 0 |
| `revenue_total` | `NUMERIC(12,2)` | NOT NULL |
| `operational_profit` | `NUMERIC(12,2)` | NOT NULL |
| `quantity_sold` | `INTEGER` | NOT NULL |
| `quantity_lost` | `INTEGER` | NOT NULL, default 0 |
| `observations` | `TEXT` | nullable |
| `manual_insights` | `TEXT` | nullable |
| `commercial_intelligence` | `JSONB` | nullable |
| `tags` | `TEXT[]` | default `'{}'` |
| `narrative` | `JSONB` | nullable — extensões futuras IA |
| `created_at` | `TIMESTAMPTZ` | NOT NULL |
| `updated_at` | `TIMESTAMPTZ` | NOT NULL |

**Removido vs rascunho V1:** `lessons_learned` — conteúdo canônico em `operational_lessons` (AD-02b)  
**Regras:** 1:1 com `operation_days`; KPIs tipados para Dashboard; JSONB para flexibilidade  
**Autoridade (AD-12):** em dias homologados, KPIs desta tabela prevalecem no Dashboard; detalhe transacional prevalece em `sales`  
**Justificativa:** substitui `notes` genérico; elimina parse JSON em toda leitura de KPI

---

### 3.13 `operational_lessons`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_day_id` | `UUID` FK → `operation_days ON DELETE CASCADE` |
| `content` | `TEXT` NOT NULL |
| `tags` | `TEXT[]` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

**Índice:** `idx_operational_lessons_operation_day`

---

### 3.14 `product_hypotheses`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_day_id` | `UUID` FK |
| `flavor` | `TEXT` NOT NULL |
| `hypothesis` | `TEXT` NOT NULL |
| `confirmed` | `BOOLEAN` nullable — null = aguardando |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

---

### 3.15 `operational_actions`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_day_id` | `UUID` FK |
| `external_id` | `TEXT` — ex.: `pastel-investigacao-2207` |
| `title` | `TEXT` NOT NULL |
| `description` | `TEXT` NOT NULL |
| `status` | `TEXT` CHECK `IN ('planned','in_progress','done')` |
| `source` | `TEXT` default `'diary'` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

**Índice:** `idx_operational_actions_status (status) WHERE status != 'done'`

---

### 3.16 `operational_pendings` *(NOVA)*

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_day_id` | `UUID` FK |
| `pending_type` | `TEXT` CHECK `IN ('inventory_investigation','flavor_unknown','client_unknown','payment_pending')` |
| `product_id` | `UUID` nullable FK |
| `client_id` | `UUID` nullable FK |
| `sale_id` | `UUID` nullable FK |
| `quantity` | `INTEGER` default 1 |
| `cost_amount` | `NUMERIC(12,2)` nullable |
| `potential_revenue` | `NUMERIC(12,2)` nullable |
| `status` | `TEXT` CHECK `IN ('open','resolved','converted_to_loss')` |
| `description` | `TEXT` NOT NULL |
| `resolved_at` | `TIMESTAMPTZ` nullable |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

**Regras:** pendência **não** conta como perda até `converted_to_loss`  
**Justificativa:** formaliza caso 22/07 (pastel em investigação)

---

### 3.17 `operational_losses`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_day_id` | `UUID` FK |
| `product_id` | `UUID` nullable FK |
| `product_name` | `TEXT` NOT NULL |
| `quantity` | `INTEGER` NOT NULL |
| `reason` | `TEXT` nullable |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

**Regras:** só registra perda **confirmada**; distinto de `operational_pendings`

---

### 3.18 `future_orders` *(NOVA)*

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `business_id` | `UUID` FK |
| `client_id` | `UUID` nullable FK |
| `product_id` | `UUID` nullable FK |
| `product_name` | `TEXT` nullable |
| `quantity` | `INTEGER` NOT NULL |
| `scheduled_date` | `DATE` NOT NULL |
| `status` | `TEXT` CHECK `IN ('planned','confirmed','fulfilled','cancelled')` |
| `origin_operation_day_id` | `UUID` nullable FK — dia que gerou a encomenda |
| `notes` | `TEXT` nullable |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

**Índice:** `idx_future_orders_business_scheduled (business_id, scheduled_date)`  
**Justificativa:** separa encomenda (2 Mistos sexta) de venda do dia

---

### 3.19 `goals`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `business_id` | `UUID` FK |
| `goal_type` | `TEXT` CHECK `IN ('daily','weekly','monthly','yearly')` |
| `target_amount` | `NUMERIC(12,2)` NOT NULL |
| `target_units` | `INTEGER` nullable |
| `period_start` | `DATE` NOT NULL |
| `period_end` | `DATE` NOT NULL |
| `created_at` / `updated_at` | `TIMESTAMPTZ` |

**Índice:** `idx_goals_business_type (business_id, goal_type, period_start DESC)`

---

### 3.20 `app_settings`

| Campo | Tipo PG |
|-------|---------|
| `key` | `TEXT` PK |
| `value` | `JSONB` NOT NULL |
| `updated_at` | `TIMESTAMPTZ` NOT NULL |

**Regras:** valores estruturados; substituir TEXT opaco do SQLite

---

### 3.21 Schema `engine` — Motor de Operações

#### `engine.operations`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `business_id` | `UUID` FK → `public.businesses` |
| `status` | `TEXT` CHECK `IN ('executed','rejected','failed','pending')` |
| `operation_type` | `TEXT` NOT NULL |
| `source` | `TEXT` NOT NULL |
| `correlation_id` | `TEXT` NOT NULL |
| `confidence` | `NUMERIC(5,4)` nullable |
| `duration_ms` | `INTEGER` nullable |
| `effects_count` | `INTEGER` default 0 |
| `events_count` | `INTEGER` default 0 |
| `error_message` | `TEXT` nullable |
| `completed_at` | `TIMESTAMPTZ` nullable |
| `created_at` | `TIMESTAMPTZ` NOT NULL |

**Índices:** `(business_id, created_at DESC)`, `(status)`

#### `engine.operation_payloads`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_id` | `UUID` FK → `engine.operations` |
| `raw_payload` | `TEXT` NOT NULL |
| `payload_type` | `TEXT` CHECK `IN ('text','structured')` |
| `received_at` | `TIMESTAMPTZ` NOT NULL |

#### `engine.operation_interpretations`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_id` | `UUID` FK |
| `interpretation` | `JSONB` NOT NULL |
| `interpreted_at` | `TIMESTAMPTZ` NOT NULL |

#### `engine.effect_records`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_id` | `UUID` FK |
| `entity_type` | `TEXT` NOT NULL |
| `entity_id` | `UUID` NOT NULL |
| `action` | `TEXT` CHECK `IN ('create','update','delete')` |
| `before_state` | `JSONB` nullable |
| `after_state` | `JSONB` NOT NULL |
| `created_at` | `TIMESTAMPTZ` NOT NULL |

**Índice:** `(entity_type, entity_id)`

#### `engine.domain_events`

| Campo | Tipo PG |
|-------|---------|
| `id` | `UUID` PK |
| `operation_id` | `UUID` nullable FK |
| `event_type` | `TEXT` NOT NULL |
| `aggregate_type` | `TEXT` NOT NULL |
| `aggregate_id` | `UUID` NOT NULL |
| `payload` | `JSONB` NOT NULL |
| `version` | `INTEGER` default 1 |
| `occurred_at` | `TIMESTAMPTZ` NOT NULL |

**Índice:** `(event_type, occurred_at DESC)`

---

## 4. Entidades removidas

| SQLite | Motivo |
|--------|--------|
| `suppliers` | Zero uso; FK órfã em products |
| `reports` | Zero registros; relatórios on-the-fly |
| `payments` | Redundante; settlement em `sales` + `cash_flow_events` |
| `notes` | Substituído por `diary_entries` tipado |
| `products.sold_quantity` | Projeção via `sale_items` |
| `products.supplier_id` | Fornecedor descontinuado |

---

## 5. Novas entidades

| Tabela | Motivo |
|--------|--------|
| `operation_days` | Agregado raiz; unifica dia operacional |
| `operational_pendings` | Incertezas formais sem assumir perda |
| `future_orders` | Encomendas planejadas ≠ vendas do dia |
| `daily_investments` | Split de fontes de capital por dia |

---

## 6. Padrões adotados

| Padrão | Aplicação |
|--------|-----------|
| UUID PK | Todas as tabelas |
| NUMERIC(12,2) | Monetário |
| NUMERIC(12,4) | Custo unitário fracionado |
| DATE / TIME / TIMESTAMPTZ | Separação semântica |
| JSONB | Diário, settings, engine |
| TEXT[] | Tags |
| ON DELETE CASCADE | Itens filhos (sale_items, purchase_items) |
| UNIQUE parcial | Produtos ativos por nome |
| Schema `engine` | Isolamento auditoria |
| `operation_day_id` | FK preferencial vs `(business_id, date)` |
| RLS-ready | `business_id` em entidades escopadas |

---

## 7. Decisões arquiteturais

| # | Decisão | Alternativa rejeitada |
|---|---------|----------------------|
| AD-01 | `operation_days` como agregado | Continuar date espalhado |
| AD-02 | KPIs do diário em colunas + JSONB narrativo | Só JSONB ou só relacional |
| AD-03 | Cliente global | `business_id` obrigatório em clients |
| AD-04 | Múltiplos `daily_investments` por dia | Uma linha monolítica |
| AD-05 | `cash_flow_events.business_id` obrigatório | cash_flow global (SQLite) |
| AD-06 | Sem tabela payments | Manter payments paralelo |
| AD-07 | Engine em schema `engine` | Misturar com public |
| AD-08 | Dias homologados com status + timestamp | Imutabilidade só por processo |
| AD-09 | `flavor_confidence` em sale_items | Ignorar incertezas |
| AD-10 | Relatórios não persistidos | Tabela reports |
| AD-11 | Consistência `business_id` entre sales, operation_days e products | Confiar só na aplicação |
| AD-12 | KPIs homologados em diary; detalhe em sales | Fonte única ambígua |
| AD-02b | `operational_lessons` canônico; sem `lessons_learned` em diary | Duplicar lições em coluna e tabela |

---

## 8. Invariantes de integridade (Sprint 4.2)

| ID | Invariante |
|----|------------|
| **INV-01** | `sales.business_id` = `operation_days.business_id` do `operation_day_id` vinculado |
| **INV-02** | `products.business_id` do item = `sales.business_id` da venda pai |
| **INV-03** | `daily_purchases.total_investment` = `SUM(daily_investments.amount)` no mesmo `operation_day_id` |
| **INV-04** | `sales.sale_date` = `operation_days.operation_date` do `operation_day_id` vinculado |

Implementar via triggers ou constraints na Sprint 4.2. Ver `ARCHITECTURE_REVIEW.md`.

---

## 9. Mapeamento SQLite → PostgreSQL V1

| SQLite | PostgreSQL V1 |
|--------|---------------|
| `business_units` | `businesses` |
| `products` | `products` (−sold_quantity, −supplier_id) |
| `clients` | `clients` (−business_id obrig.) |
| — | `operation_days` |
| `sales` | `sales` (+operation_day_id, +settlement_date) |
| `sale_items` | `sale_items` (+flavor_confidence) |
| `payments` | *(absorvido)* |
| `daily_purchases` | `daily_purchases` (+operation_day_id) |
| `daily_purchase_items` | `daily_purchase_items` |
| `investments` | `daily_investments` |
| `cash_flow` | `cash_flow_events` (+business_id, +sale_id) |
| `stock_movements` | `stock_movements` (+operation_day_id, +sale_id) |
| `notes` | `diary_entries` |
| `operational_*` | mesmas (+operation_day_id substitui business+date) |
| — | `operational_pendings` |
| — | `future_orders` |
| `goals` | `goals` |
| `settings` | `app_settings` (JSONB) |
| `operations*` | `engine.*` |

---

## 10. Preparação Supabase

- Extensões: `pgcrypto` (UUID), `pg_trgm` (busca cliente — opcional Sprint 4.3)
- RLS: política por `business_id` quando Auth for adotado
- Advisors: executar após DDL na Sprint 4.2
- Tipos TS: `generate_typescript_types` pós-migration
- Região/limites: ver SUPABASE_ENVIRONMENT_AUDIT.md

---

## 11. Próximo passo — Sprint 4.2

1. Gerar migrations Drizzle/Supabase a partir deste documento  
2. Script ETL SQLite → PostgreSQL com mapeamento baseline histórica  
3. Adaptar `getDb()` para Postgres  
4. Deprecar scripts de reconstrução  
5. Validar dias 16–22/07 contra schema novo  

---

## Referências

- `DOMAIN_MODEL_V1.md`
- `CURRENT_DATABASE_AUDIT.md`
- `SUPABASE_ENVIRONMENT_AUDIT.md`

**Grau de confiança da arquitetura:** **9,0 / 10** (pós-revisão 4.1.5 — ver `ARCHITECTURE_REVIEW.md`)
