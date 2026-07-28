# ADR-003 — Arquitetura de Múltiplas Operações

**Status:** Aceito  
**Data:** 2026-07-19  
**Contexto:** Sprint 2.2 — preparação do Lucas Business OS para múltiplos empreendimentos

## Contexto

O Lucas Business OS iniciou com uma única operação (Salgados / ACAL). A Sprint 2.1 introduziu o Contexto Temporal no Dashboard. O próximo passo é permitir que o mesmo painel e os mesmos módulos atendam múltiplos negócios sem duplicar telas ou dashboards.

## Decisão

1. **O Lucas Business OS administrará várias operações de negócio** (ex.: Salgados, Brigadeiros, futuras operações).

2. **Dashboard, Financeiro, Clientes, Produtos, Relatórios e demais módulos permanecem únicos.** Não existirão dashboards separados por negócio.

3. **Toda informação operacional pertence a uma Operação:**
   - Produto → `business_id`
   - Venda → `business_id`
   - Meta → `business_id`
   - Indicadores → filtráveis por operação

4. **Operação consolidada "Todos"** (`all`) permite visualizar o negócio inteiro sem persistir em banco.

5. **Clientes permanecem globais.** Um cliente pode comprar de operações diferentes; não há duplicação de cadastro.

6. **Registro de catálogo de operações** na tabela `business_units` com seed inicial: `salgados`, `brigadeiros`.

7. **Estado de UI:** Zustand store `lbo-business-context` com `activeBusinessId` (padrão: `all`), composição independente do Contexto Temporal (`lbo-temporal-context`).

8. **APIs de leitura** aceitam query param opcional `?businessId=` (`all` ou id da operação). Sem param = visão consolidada (retrocompatível).

9. **Escritas** herdam `business_id` do produto (vendas) ou usam `salgados` como padrão (cadastros legados).

## Migração de dados existentes

- Coluna `business_id` adicionada em `products`, `sales`, `goals` via `ALTER TABLE` com default `salgados`.
- Backfill automático na inicialização do banco: todos os registros existentes → `salgados`.
- Engine `operations.business_id`: valor `default` migrado para `salgados`.
- Metas zeradas criadas para `brigadeiros` na primeira inicialização pós-migração.

## Consequências

### Positivas
- Crescimento horizontal sem novos módulos ou dashboards.
- Combinação natural: **Operação × Período** (ex.: Geral + Todos, Hoje + Salgados).
- Arquitetura alinhada ao Business Engine (`businessId` nos contratos).

### Negativas / limitações (Sprint 2.2)
- Filtro de operação implementado no Dashboard; demais telas ainda carregam dados globais (próximas sprints).
- `investments`, `cash_flow`, `stock_movements` ainda sem `business_id` (escopo futuro).
- Configuração de metas por operação na UI de Metas ainda usa fluxo legado (primeira operação ao editar em modo "Todos").

## Referências

- ADR-001 — Business Engine Foundation
- ADR-002 — Fluxo Oficial para Operações de Negócio
- Sprint 2.1 — Contexto Temporal
