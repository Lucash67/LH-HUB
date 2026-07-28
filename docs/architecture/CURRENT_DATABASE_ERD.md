# ERD — Arquitetura SQLite Atual (Lucas Business OS)

**Sprint 4.0B — Somente documentação**  
**Base:** `data/lucas-business-os.db` + Drizzle schemas  
**Diagrama complementar:** ver também diagrama Mermaid abaixo

---

## 1. Diagrama entidade-relacionamento (textual)

```
┌─────────────────┐
│ business_units  │
│ PK: id          │
└────────┬────────┘
         │ 1
         │
    ┌────┴────────────────────────────────────────────────────────────┐
    │ *                                                               │
    ▼                                                                 ▼
┌───────────────┐              ┌──────────────┐              ┌──────────────┐
│   products    │              │    sales     │              │    goals     │
│ PK: id        │              │ PK: id       │              │ PK: id       │
│ FK: business  │              │ FK: business │              │ FK: business │
│ FK: supplier? │──┐           │ FK: client?  │──┐           └──────────────┘
└───────┬───────┘  │           └──────┬───────┘  │
        │ *        │                  │ 1        │
        │          │           ┌──────┴───────┐  │
        │          │           │ *            │  │
        │          │           ▼              │  │
        │          │    ┌──────────────┐      │  │
        │          └───►│  sale_items  │      │  │
        │               │ PK: id       │      │  │
        │               │ FK: sale     │      │  │
        │               │ FK: product  │◄─────┘  │
        │               └──────────────┘         │
        │                  │ 1                 │
        │                  │ *                 │
        │                  ▼                   │
        │           ┌──────────────┐             │
        │           │   payments   │             │
        │           │ PK: id       │             │
        │           │ FK: sale     │             │
        │           └──────────────┘             │
        │ *                                      │
        ▼                                        │
┌───────────────┐                                │
│stock_movements│                                │
│ FK: product   │                                │
└───────────────┘                                │
                                                 │
┌───────────────┐                                │
│   clients     │◄───────────────────────────────┘
│ PK: id        │
│ FK: business  │
└───────────────┘

┌───────────────┐     ┌─────────────────────┐     ┌──────────────────────┐
│  investments  │     │     cash_flow       │     │      settings        │
│ FK: business  │     │ (sem business_id!)  │     │ PK: key              │
└───────────────┘     └─────────────────────┘     └──────────────────────┘

┌───────────────┐
│   suppliers   │◄── FK opcional products.supplier_id (LEGADO / MORTO)
└───────────────┘

┌───────────────┐
│    reports    │  (MORTO — 0 registros)
└───────────────┘
```

### Bloco — Diário operacional (sync a partir de `notes`)

```
┌──────────────┐
│    notes     │  entity_type = operational_diary
│ PK: id       │  entity_id = {businessId}:{date}
│ content=JSON │
└──────┬───────┘
       │ syncDiaryToRelationalTables()
       ▼
┌──────────────────┐ 1──* ┌───────────────────────┐
│ daily_purchases  │──────►│ daily_purchase_items  │
│ FK: business     │       │ FK: purchase          │
│ UNIQUE(biz,date) │       │ FK: product?          │
└──────────────────┘       └───────────────────────┘

┌────────────────────┐  ┌─────────────────────┐  ┌────────────────────┐
│ operational_losses │  │ operational_actions │  │ product_hypotheses │
│ FK: business       │  │ FK: business        │  │ FK: business       │
└────────────────────┘  └─────────────────────┘  └────────────────────┘

┌────────────────────┐
│ operational_lessons│
│ FK: business         │
└────────────────────┘
```

### Bloco — Business Engine (auditoria / event sourcing)

```
┌──────────────┐ 1──1 ┌─────────────────────┐
│  operations  │──────► operation_payloads │
│ PK: id       │ 1──1 ┌──────────────────────────┐
│ FK: business │──────► operation_interpretations│
└──────┬───────┘
       │ 1
       │ *
       ├──────────────────► effect_records
       │
       └──────────────────► domain_events
```

---

## 2. Diagrama Mermaid (ERD simplificado)

```mermaid
erDiagram
    business_units ||--o{ products : "business_id"
    business_units ||--o{ sales : "business_id"
    business_units ||--o{ goals : "business_id"
    business_units ||--o{ investments : "business_id"
    business_units ||--o{ clients : "business_id"
    business_units ||--o{ daily_purchases : "business_id"
    business_units ||--o{ operational_losses : "business_id"
    business_units ||--o{ operational_actions : "business_id"
    business_units ||--o{ product_hypotheses : "business_id"
    business_units ||--o{ operational_lessons : "business_id"
    business_units ||--o{ operations : "business_id"

    suppliers ||--o{ products : "supplier_id"
    clients ||--o{ sales : "client_id"
    sales ||--|{ sale_items : "sale_id CASCADE"
    sales ||--o{ payments : "sale_id CASCADE"
    products ||--o{ sale_items : "product_id"
    products ||--o{ stock_movements : "product_id"
    products ||--o{ daily_purchase_items : "product_id"

    daily_purchases ||--|{ daily_purchase_items : "purchase_id CASCADE"

    operations ||--|| operation_payloads : "operation_id"
    operations ||--|| operation_interpretations : "operation_id"
    operations ||--o{ effect_records : "operation_id"
    operations ||--o{ domain_events : "operation_id"

    notes }o--|| business_units : "entity_id prefix"

    business_units {
        text id PK
        text name
        text slug
        text status
    }

    products {
        text id PK
        text business_id FK
        text name
        real price
        real cost
        integer stock_quantity
        integer sold_quantity
    }

    clients {
        text id PK
        text business_id FK
        text name
    }

    sales {
        text id PK
        text business_id FK
        text client_id FK
        text date
        text time
        text payment_method
        text payment_status
        real total_amount
        real profit
    }

    sale_items {
        text id PK
        text sale_id FK
        text product_id FK
        integer quantity
        real subtotal
    }

    investments {
        text id PK
        text business_id FK
        real amount
        text source_type
        text source_name
        text date
    }

    cash_flow {
        text id PK
        text type
        text category
        real amount
        text date
    }

    daily_purchases {
        text id PK
        text business_id FK
        text date
        integer total_units
        real investment
    }

    notes {
        text id PK
        text entity_type
        text entity_id
        text content
    }
```

---

## 3. Cardinalidades principais

| Relacionamento | Cardinalidade | On Delete |
|----------------|---------------|-----------|
| business_units → products | 1:N | — |
| business_units → sales | 1:N | — |
| clients → sales | 1:N | — |
| sales → sale_items | 1:N | CASCADE |
| sales → payments | 1:N | CASCADE |
| products → sale_items | 1:N | — |
| products → stock_movements | 1:N | — |
| daily_purchases → daily_purchase_items | 1:N | CASCADE |
| operations → effect_records | 1:N | — |
| notes → operational_* | 1:1 por (business, date) via sync | replace day |

---

## 4. Entidades isoladas (sem FK de saída relevante)

| Entidade | Observação |
|----------|------------|
| `cash_flow` | Sem `business_id`; isolada do grafo multi-operação |
| `settings` | KV global |
| `reports` | Morta |
| `suppliers` | Morta (1 registro seed) |

---

## 5. Dependências de leitura (fluxo de dados)

```
Vendas (sales) ──► Dashboard, CRM, Financeiro, Analytics, Metas
Diário (notes) ──► sync ──► Daily Purchases, Operational Intelligence ──► Dashboard prioridades
Investments + Cash Flow ──► Operator Finance ──► Financeiro
Products + Stock Movements ──► Estoque
Operations Engine ──► (futuro) Vendas via NLP
```

---

## 6. Uso deste ERD na Sprint 4.1

Este diagrama deve servir de base para:

1. Eliminar entidades 🔴 (`reports`, `suppliers`)
2. Corrigir `cash_flow` → adicionar `business_id`
3. Resolver duplicação `notes` ↔ tabelas operacionais
4. Mapear tipos SQLite → PostgreSQL por entidade
5. Definir schemas Postgres (`public` app + `audit` engine)

Ver detalhes completos em `CURRENT_DATABASE_AUDIT.md`.
