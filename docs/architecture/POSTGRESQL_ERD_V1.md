# ERD PostgreSQL V1 — Lucas Business OS

**Sprint 4.1 — Arquitetura Definitiva**  
**Complemento:** `POSTGRESQL_ARCHITECTURE_V1.md`

---

## 1. Visão geral

- **25 tabelas** em `public` (20) + `engine` (5)
- **Agregado central:** `operation_days`
- **Cliente global** — relacionado via `sales`
- **4 entidades novas:** `operation_days`, `operational_pendings`, `future_orders`, reestruturação `daily_investments`
- **4 entidades removidas:** `suppliers`, `reports`, `payments`, `notes`

---

## 2. Diagrama ER (Mermaid)

```mermaid
erDiagram
    businesses ||--o{ operation_days : "has"
    businesses ||--o{ products : "catalogs"
    businesses ||--o{ goals : "targets"
    businesses ||--o{ future_orders : "plans"
    businesses ||--o{ cash_flow_events : "scopes"

    operation_days ||--|| daily_purchases : "1:1"
    operation_days ||--o{ daily_investments : "funds"
    operation_days ||--o{ sales : "contains"
    operation_days ||--|| diary_entries : "1:1"
    operation_days ||--o{ operational_lessons : "has"
    operation_days ||--o{ product_hypotheses : "has"
    operation_days ||--o{ operational_actions : "has"
    operation_days ||--o{ operational_pendings : "has"
    operation_days ||--o{ operational_losses : "has"
    operation_days ||--o{ stock_movements : "tracks"
    operation_days ||--o{ future_orders : "origin"

    daily_purchases ||--|{ daily_purchase_items : "lines"

    clients ||--o{ sales : "buys"
    clients ||--o{ future_orders : "orders"
    clients ||--o{ operational_pendings : "may reference"

    sales ||--|{ sale_items : "contains"
    sales ||--o{ cash_flow_events : "settles"
    sales ||--o{ stock_movements : "exit"
    sales ||--o{ operational_pendings : "may reference"

    products ||--o{ sale_items : "sold as"
    products ||--o{ daily_purchase_items : "purchased"
    products ||--o{ stock_movements : "moves"
    products ||--o{ operational_losses : "lost"
    products ||--o{ operational_pendings : "investigation"
    products ||--o{ future_orders : "ordered"

    businesses ||--o{ engine_operations : "audits"
    engine_operations ||--|| engine_operation_payloads : "1:1"
    engine_operations ||--|| engine_operation_interpretations : "1:1"
    engine_operations ||--o{ engine_effect_records : "effects"
    engine_operations ||--o{ engine_domain_events : "events"

    businesses {
        uuid id PK
        text slug UK
        text name
        text status
    }

    operation_days {
        uuid id PK
        uuid business_id FK
        date operation_date UK
        text status
        int daily_goal_units
    }

    products {
        uuid id PK
        uuid business_id FK
        text name
        numeric unit_price
        int stock_quantity
    }

    clients {
        uuid id PK
        text name
        uuid registered_business_id FK
    }

    sales {
        uuid id PK
        uuid business_id FK
        uuid operation_day_id FK
        uuid client_id FK
        date sale_date
        time sale_time
        numeric total_amount
        numeric profit
    }

    sale_items {
        uuid id PK
        uuid sale_id FK
        uuid product_id FK
        int quantity
        text flavor_confidence
    }

    daily_purchases {
        uuid id PK
        uuid operation_day_id FK_UK
        int total_units
        numeric total_investment
    }

    daily_investments {
        uuid id PK
        uuid operation_day_id FK
        numeric amount
        text source_type
        text source_name
    }

    cash_flow_events {
        uuid id PK
        uuid business_id FK
        uuid operation_day_id FK
        uuid sale_id FK
        date event_date
        numeric amount
    }

    diary_entries {
        uuid id PK
        uuid operation_day_id FK_UK
        numeric operational_profit
        jsonb narrative
    }

    operational_pendings {
        uuid id PK
        uuid operation_day_id FK
        text pending_type
        text status
    }

    future_orders {
        uuid id PK
        uuid business_id FK
        date scheduled_date
        int quantity
    }
```

---

## 3. Cardinalidades

| De | Para | Cardinalidade | Observação |
|----|------|---------------|------------|
| `businesses` | `operation_days` | 1:N | UNIQUE(business, date) |
| `operation_days` | `daily_purchases` | 1:1 | Compra única por dia |
| `operation_days` | `diary_entries` | 1:1 | Diário único por dia |
| `operation_days` | `daily_investments` | 1:N | Split capital (ex.: 22/07) |
| `operation_days` | `sales` | 1:N | Todas vendas do dia |
| `operation_days` | `operational_*` | 1:N | Inteligência do dia |
| `sales` | `sale_items` | 1:N | CASCADE delete |
| `clients` | `sales` | 1:N | Global multi-operação |
| `products` | `sale_items` | 1:N | |
| `sales` | `cash_flow_events` | 1:N | Liquidação tardia opcional |
| `businesses` | `clients` | 1:N | opcional via `registered_business_id` |
| `engine.operations` | payloads/interpretations | 1:1 | |

---

## 4. Fluxo de dados

### 4.1 Operação diária oficial

```
businesses
    └── operation_days (business_id + operation_date)
            ├── daily_purchases → daily_purchase_items → products
            ├── daily_investments (source_type × source_name)
            ├── stock_movements (entry)
            ├── sales → sale_items → products
            │         └── clients
            ├── operational_pendings (incertezas)
            ├── operational_losses (perdas confirmadas)
            ├── diary_entries (KPIs + narrativa)
            │       ├── operational_lessons
            │       ├── product_hypotheses
            │       └── operational_actions
            └── future_orders (planejamento derivado)
                    └── Dashboard · Financeiro · CRM · Analytics (projeções)
```

### 4.2 Comercial → Financeiro

```
Cliente
    ↓
Venda (operation_day_id, sale_date)
    ↓
Itens da Venda (flavor_confidence)
    ↓
Produto
    ↓
Receita/Lucro operacional (diary_entries + sales aggregates)
    ↓
(settlement_date ≠ sale_date) → cash_flow_events
    ↓
daily_investments (Operator Finance: own vs third party)
    ↓
Visão Dual Operação × Operador (serviço — não persistida)
    ↓
Dashboard / Financeiro
```

### 4.3 Pendência → Resolução (sem alterar cronologia)

```
operational_pendings (status: open)
    ↓ investigação
    ├── resolved (identificado)
    └── converted_to_loss → operational_losses
```

### 4.4 Motor de Operações

```
Texto livre
    ↓
engine.operations
    ├── operation_payloads
    ├── operation_interpretations
    ├── effect_records → sales / products (public)
    └── domain_events
```

---

## 5. Dependências entre domínios

```
                    ┌─────────────┐
                    │  businesses │
                    └──────┬──────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌─────────────┐   ┌─────────┐
   │ products  │    │operation_days│   │  goals  │
   └─────┬─────┘    └──────┬──────┘   └─────────┘
         │                 │
         │    ┌────────────┼────────────┐
         │    ▼            ▼            ▼
         │  purchase    sales      diary + intel
         │    │            │            │
         └────┴────────────┴────────────┘
                           │
                    ┌──────┴──────┐
                    │   clients   │ (global)
                    └─────────────┘
```

**Ordem de criação lógica (Sprint 4.2 ETL):**

1. `businesses`
2. `products`, `clients`, `goals`, `app_settings`
3. `operation_days` (por dia histórico)
4. `daily_purchases` + items + `daily_investments`
5. `stock_movements` (entries)
6. `sales` + `sale_items`
7. `cash_flow_events`
8. `diary_entries` + filhos operacionais
9. `operational_pendings`, `future_orders`
10. `engine.*` (vazio inicialmente)

---

## 6. Comparação ERD SQLite → PostgreSQL V1

| Aspecto | SQLite (atual) | PostgreSQL V1 |
|---------|----------------|---------------|
| Centro do grafo | `business_id + date` implícito | `operation_days` explícito |
| Diário | `notes` JSON + tabelas espelho | `diary_entries` + filhos via FK |
| Investimento | 1 linha/dia típica | N linhas (`daily_investments`) |
| Cash flow | Sem business scope | `business_id` + FKs |
| Pagamentos | Tabela `payments` | Absorvido |
| Pendências | Implícitas em notas | `operational_pendings` |
| Encomendas | Em `operational_actions` | `future_orders` |
| Engine | Schema `public` | Schema `engine` |

---

## 7. Índices críticos (resumo)

| Tabela | Índice | Motivo |
|--------|--------|--------|
| `operation_days` | `(business_id, operation_date DESC)` | Dashboard por dia |
| `sales` | `(business_id, sale_date DESC)` | Analytics |
| `sales` | `(operation_day_id)` | Agregado dia |
| `sale_items` | `(product_id)` | Mix produtos |
| `cash_flow_events` | `(business_id, event_date DESC)` | Financeiro |
| `daily_investments` | `(operation_day_id)` | Operator Finance |
| `clients` | GIN `name` (pg_trgm) | CRM dedup |
| `operational_pendings` | `(status) WHERE open` | Prioridades |
| `future_orders` | `(business_id, scheduled_date)` | Planejamento |

---

## Referências

- `POSTGRESQL_ARCHITECTURE_V1.md` — campos, constraints, regras
- `DOMAIN_MODEL_V1.md` — modelo conceitual
- `CURRENT_DATABASE_ERD.md` — ERD legado SQLite
