# Architecture Review — Sprint 4.1.5

**Data:** 2026-07-22  
**Papel:** Revisão crítica pré-implementação (Architecture Freeze)  
**Artefatos revisados:** DOMAIN_MODEL_V1 · POSTGRESQL_ARCHITECTURE_V1 · POSTGRESQL_ERD_V1 · auditorias 4.0A/4.0B

---

## 1. Veredito executivo

| Item | Resultado |
|------|-----------|
| **Arquitetura aprovada?** | **Sim — com emendas documentadas** |
| **Architecture Freeze** | **Congelada a partir desta revisão** (versão V1.1) |
| **Bloqueadores para Sprint 4.2?** | **Nenhum estrutural** — emendas são constraints e regras de implementação |
| **Recomendação** | **Iniciar Sprint 4.2** |

A arquitetura V1 está **adequada, coerente com o domínio real do LBO** e **superior ao SQLite legado**. Não foram identificadas entidades desnecessárias que exijam remoção antes da implementação. As emendas abaixo **refinam integridade e clareza**, sem expandir escopo.

**Nota final:** **9,0 / 10** (V1 original: 8,5)

---

## 2. Respostas à revisão crítica

### 2.1 Tabela desnecessária?

| Tabela | Veredito |
|--------|----------|
| `future_orders` | **Manter** — caso real 22/07 (encomenda sexta); volume zero hoje não invalida modelagem |
| `operational_pendings` | **Manter** — princípio operacional ADR (incertezas formais) |
| `operational_lessons` / `hypotheses` / `actions` | **Manter** — consultas e Dashboard prioridades |
| `engine.*` (5 tabelas) | **Manter** — roadmap Engine; schema isolado; zero custo operacional hoje |
| `daily_purchases` separada de `operation_days` | **Manter** — separação físico (compra) vs agregado (dia) é clara |

**Nenhuma tabela removida.**

### 2.2 Entidade a dividir?

| Entidade | Análise |
|----------|---------|
| `diary_entries` | **Não dividir** — KPIs tipados + JSONB é equilíbrio correto |
| `sales` | **Não dividir** — settlement_date + cash_flow cobre liquidação |
| `daily_investments` | **Já dividida** corretamente vs monolito SQLite |

### 2.3 Responsabilidade excessiva?

| Entidade | Risco | Mitigação |
|----------|-------|-----------|
| `operation_days` | Agregado grande (muitos filhos) | **Aceitável** — padrão DDD; filhos têm FK clara |
| `diary_entries` | KPIs + narrativa + campos textuais | **Emenda AD-12** — hierarquia de autoridade definida |
| `products` | Catálogo + `stock_quantity` | **Aceitável** no curto prazo; projeção futura opcional |

### 2.4 Duplicidade?

| Duplicação | Severidade | Decisão |
|------------|------------|---------|
| `diary_entries.lessons_learned` **vs** `operational_lessons` | Média | **Emenda AD-02b** — `operational_lessons` canônico; coluna `lessons_learned` removida do desenho |
| `diary_entries.quantity_lost` **vs** `operational_losses` | Baixa | **Manter ambos** — coluna = resumo homologado; tabela = detalhe por produto |
| `sales.business_id` **vs** `operation_days.business_id` | Intencional | **Denormalização controlada** — constraint AD-11 |
| `daily_purchases.total_investment` **vs** `sum(daily_investments)` | Média | **Invariante INV-03** na implementação |
| KPIs em `diary_entries` **vs** `sum(sales)` | Intencional | **Emenda AD-12** — fontes de autoridade distintas |

### 2.5 Relacionamento inadequado?

| Relacionamento | Problema | Emenda |
|----------------|----------|--------|
| `sale_items.product_id` sem validação de business | Produto de outra operação na venda | **INV-02** |
| `sales.business_id` + `operation_day_id` sem amarração | business_id inconsistente | **INV-01** |
| `cash_flow_events` sem FK composta para business | Mitigado por `business_id` obrigatório | **OK** |

### 2.6 Risco de performance?

| Risco | Nível | Nota |
|-------|-------|------|
| Volume atual (~305 rows) | **Baixo** | Índices propostos suficientes |
| Dashboard lê diary + agrega sales | **Baixo** | KPIs tipados evitam parse JSON |
| Muitas tabelas filhas por dia | **Baixo** | ~5 dias históricos; escala linear |
| UUID PK em todas tabelas | **Baixo** | Adequado Supabase; volume pequeno |
| `pg_trgm` não obrigatório na 4.2 | **Opcional** | CRM dedup pode esperar |

### 2.7 Risco para evoluções futuras?

| Evolução | Preparação |
|----------|------------|
| Supabase Auth + RLS | **Boa** — `business_id` presente; clients global requer política específica |
| Smart Goals 3.3.3 | **Boa** — `goals` + `operation_days.daily_goal_units` |
| Multi-operador | **Parcial** — `source_name` textual; suficiente hoje |
| Engine NLP | **Boa** — schema `engine` isolado |
| Encomendas CRM | **Boa** — `future_orders` |

---

## 3. Validação de padrões

| Padrão | Atende? | Observação |
|--------|---------|------------|
| PostgreSQL Best Practices | **Sim** | NUMERIC, TIMESTAMPTZ, CHECK enums, partial indexes |
| Supabase Best Practices | **Sim** | RLS-ready, JSONB, schema separado engine, sem expor engine via API |
| Modelagem Relacional | **Sim** | 3NF na maior parte; denormalizações justificadas e constrainted |
| Integridade dos dados | **Com emendas** | INV-01 a INV-04 na Sprint 4.2 |
| Escalabilidade | **Sim** | Para escala LBO (single operator, multi-business) |
| Baixo acoplamento | **Sim** | Engine isolado; analytics não persistido |
| Alta coesão | **Sim** | Agregado `operation_days` coeso |
| Evolução futura | **Sim** | Sem overengineering detectado |

---

## 4. Architecture Decisions — revisão

| AD | Decisão | Status | Justificativa |
|----|---------|--------|---------------|
| **AD-01** | `operation_days` agregado raiz | ✔ **Manter** | Centraliza auditoria; elimina date espalhado |
| **AD-02** | KPIs colunas + JSONB narrativo | ✔ **Manter** | Performance Dashboard + flexibilidade |
| **AD-02b** | `operational_lessons` canônico; sem `lessons_learned` em diary | ⚠ **Revisado** | Elimina duplicidade residual; ver V1.1 |
| **AD-03** | Cliente global | ✔ **Manter** | ADR-003; CRM transversal comprovado |
| **AD-04** | Múltiplos `daily_investments`/dia | ✔ **Manter** | Caso real 22/07 (split capital) |
| **AD-05** | `cash_flow_events.business_id` | ✔ **Manter** | Corrige lacuna SQLite |
| **AD-06** | Sem tabela `payments` | ✔ **Manter** | Redundância eliminada; audit confirmou write-only |
| **AD-07** | Schema `engine` | ✔ **Manter** | Isolamento PostgREST e RLS |
| **AD-08** | Dias `homologated` imutáveis | ✔ **Manter** | Baseline histórica ADR-004 |
| **AD-09** | `flavor_confidence` | ✔ **Manter** | Caso real 22/07 |
| **AD-10** | Relatórios não persistidos | ✔ **Manter** | Tabela morta confirmada |
| **AD-11** | Consistência `business_id` cross-FK | ✔ **Novo — Manter** | Integridade multi-negócio |
| **AD-12** | Hierarquia de autoridade KPIs | ✔ **Novo — Manter** | Evita divergência diary vs sales |

**Nenhum AD removido.**

---

## 5. Melhorias

### 5.1 Obrigatórias (implementar na Sprint 4.2)

| ID | Melhoria |
|----|----------|
| **INV-01** | `sales.business_id` MUST equal `operation_days.business_id` (trigger ou FK composta via validação) |
| **INV-02** | `sale_items.product_id` MUST belong to same `business_id` as parent sale |
| **INV-03** | `daily_purchases.total_investment` MUST equal `SUM(daily_investments.amount)` for same operation_day |
| **INV-04** | `sales.sale_date` MUST equal `operation_days.operation_date` for linked operation_day |
| **AD-02b** | Remover campo `lessons_learned` de `diary_entries`; usar apenas `operational_lessons` |
| **AD-12** | Documentar: KPIs homologados em `diary_entries` são autoridade para Dashboard; `sales` é autoridade para detalhe transacional |

### 5.2 Opcionais (Sprint 4.3+)

| ID | Melhoria |
|----|----------|
| OPT-01 | `pg_trgm` + deduplicação CRM por nome |
| OPT-02 | Triggers `updated_at` automáticos |
| OPT-03 | Trigger imutabilidade dias `homologated` |
| OPT-04 | View materializada analytics (se volume crescer) |
| OPT-05 | Derivar `products.stock_quantity` de movimentos (remover persistência) |
| OPT-06 | RLS policies quando Auth Supabase for adotado |

---

## 6. Checklist final

| Pergunta | Resposta |
|----------|----------|
| Arquitetura pronta para implementação? | **Sim** |
| Bloqueador técnico? | **Não** |
| Risco crítico? | **Não** — riscos médios mitigados por INV-* |
| Recomendável iniciar migrations? | **Sim** |

---

## 7. Architecture Freeze

A partir de **2026-07-22**, a arquitetura **PostgreSQL V1.1** está **oficialmente congelada**.

Alterações permitidas apenas via:
- ADR formal numerado
- Nova sprint de revisão arquitetural (4.x)

Implementação na Sprint 4.2 deve seguir `POSTGRESQL_ARCHITECTURE_V1.md` (seções 7–8 — ADs e invariantes V1.1).

---

## Referências

- `POSTGRESQL_ARCHITECTURE_V1.md`
- `POSTGRESQL_ERD_V1.md`
- `DOMAIN_MODEL_V1.md`
