# Sprint 1.1 — Plano Técnico de Implementação do Business Engine

**Projeto:** Lucas Business OS (LBO)  
**Fase:** 1 — Fundação Técnica  
**Sprint:** 1.1  
**Versão do plano:** 1.0.0  
**Status:** Normativo — guia literal de implementação  
**Pré-requisitos:** Constituição v1.0.0 · Especificação MOI v1.0.0 · Arquitetura aprovada

---

# 1. Objetivo da Sprint

## O que será entregue

Ao final da Sprint 1.1, o LBO terá a **fundação estrutural do Business Engine** — o cérebro único definido na Constituição — sem alterar o comportamento visual da aplicação e sem desativar nenhuma funcionalidade existente.

| # | Entregável | Descrição |
|---|-----------|-----------|
| 1 | **Estrutura de diretórios** | Nova organização em camadas (`core/`, `domains/`, `platform/`, `shared/`) coexistindo com código legado |
| 2 | **Contratos tipados** | Interfaces TypeScript para todo o pipeline de operações |
| 3 | **Business Engine (esqueleto)** | Pipeline `receive → interpret → validate → execute → publish` funcional, com implementações stub |
| 4 | **Event Bus interno** | Barramento in-process desacoplado com publish/subscribe tipado |
| 5 | **Tabelas de fundação** | Schema mínimo para registrar fatos, interpretações e eventos |
| 6 | **Primeiro pipeline** | Uma operação de texto livre trafega do input até persistência + evento publicado |
| 7 | **API paralela** | `POST /api/operations` como nova porta de entrada — rotas legadas intactas |
| 8 | **Bridge de compatibilidade** | Camada que garante que Dashboard, Financeiro, Clientes, Produtos, Metas e Insights continuam lendo os mesmos dados |

## O que NÃO entra

| Exclusão | Motivo | Sprint futura |
|----------|--------|---------------|
| Interpretação com IA | Fora do escopo de fundação | 1.3+ |
| Business Memory funcional | Apenas contrato/reservado | 1.2 |
| Learning Store funcional | Apenas contrato/reservado | 1.2 |
| Derivation Engines reativos | Event Bus existe; listeners são no-op | 1.2 |
| Substituir formulários por campo universal | UI permanece igual | 1.3 |
| Migrar `analytics.ts` para event-driven | Continua on-read | 1.2 |
| Drizzle migrations completas | Apenas novas tabelas via init estendido | 1.2 |
| Auth, multi-tenant, testes automatizados | Fora do escopo mínimo | 1.2+ |
| Refatorar todas as 13 API routes | Apenas `/api/operations` nova | Incremental |
| Remover auto-seed do dashboard | Bug conhecido; não bloqueia fundação | 1.1.1 hotfix |
| Corrigir bug de settings | Fora do escopo estrutural | 1.1.1 hotfix |

## Critérios de sucesso

1. `pnpm build` e `pnpm typecheck` passam sem erros
2. Todas as 13 páginas existentes carregam e exibem dados corretamente
3. `POST /api/sales` continua criando vendas como antes
4. `POST /api/operations` aceita texto livre e retorna `OperationResult` válido
5. Operação processada persiste em `operations` + `operation_payloads`
6. Evento `operation.executed` é publicado e registrado em `domain_events`
7. Nenhum arquivo de página (`src/app/*/page.tsx`) foi alterado visualmente
8. Pipeline completo executável via API e testável isoladamente

## Critérios de conclusão

Sprint considerada **concluída** quando todos os itens da Seção 13 (Critérios de Aceite) estiverem verificados, ADR-001 commitado, e checklist de regressão manual executado contra build de produção local.

---

# 2. Estado Atual

## Arquitetura atual

```
src/
├── app/                    # 13 páginas + 13 API routes (monolito full-stack)
├── components/             # UI + layout (sem lógica de domínio)
├── constants/              # navigation.ts
└── lib/
    ├── analytics.ts        # 465 linhas — monolito de leitura
    ├── insights-engine.ts  # 173 linhas — regras sobre analytics
    ├── utils.ts
    └── db/
        ├── index.ts        # Conexão + raw SQL CREATE TABLE
        ├── schema.ts       # Drizzle schema (13 tabelas)
        └── seed.ts         # Seed idempotente + auto-seed no dashboard
```

**Padrão de dados:** 100% client-side via TanStack Query → fetch inline → API routes → Drizzle/SQLite direto.

## Principais limitações

- Sem camada de serviço — lógica duplicada se migrarmos tudo de uma vez
- `analytics.ts` monolito — Dashboard depende dele; não tocar nesta sprint
- Schema duplicado (Drizzle + raw SQL) — novas tabelas devem ser adicionadas nos dois lugares
- Sem testes — validação manual obrigatória a cada passo
- Vendas não geram `stock_movements` — inconsistência de audit trail — não corrigir agora

## Pontos que NÃO devem ser alterados nesta sprint

- Comportamento visual de qualquer página
- Assinaturas de resposta das 13 API routes existentes
- Conteúdo funcional de `analytics.ts` e `insights-engine.ts`
- Schema das 13 tabelas existentes (apenas adicionar novas)
- `src/components/` (exceto se necessário import path)
- Fluxo de seed existente

---

# 3. Arquitetura Alvo

```
src/
├── app/                          # INALTERADO visualmente
│   ├── */page.tsx
│   └── api/
│       ├── [rotas legadas]/
│       └── operations/route.ts   # NOVA
├── core/
│   ├── engine/
│   ├── contracts/
│   └── event-bus/
├── domains/
│   ├── sales/
│   └── registry/
├── platform/
│   ├── db/
│   └── adapters/
├── shared/
│   ├── errors/
│   └── ids/
└── lib/                          # LEGADO — bridge
```

## Regra de dependência (inviolável)

```
app → core → domains → platform
         ↓
      shared (importado por todos, importa ninguém)
```

---

# 4. Plano de Migração

Estratégia: **Strangler Fig Pattern** — novo caminho paralelo; legado intacto.

| Passo | Objetivo | Risco |
|-------|----------|-------|
| 1 | Scaffold de diretórios e contratos | Baixo |
| 2 | Event Bus in-process | Baixo |
| 3 | Schema de operações (novas tabelas) | Médio |
| 4 | Repositories de operação e evento | Baixo |
| 5 | Business Engine esqueleto (pipeline vazio) | Baixo |
| 6 | Text Input Adapter + interpret stub | Médio |
| 7 | Validate stub + regras mínimas | Baixo |
| 8 | Extrair SaleOperationHandler do legado | **Alto** |
| 9 | Publish + persistência completa | Médio |
| 10 | API `/api/operations` | Baixo |
| 11 | Listeners no-op + registro | Nenhum |
| 12 | Bridge lib/db + path aliases | Médio |
| 13 | ADR + checklist de regressão | Baixo |

---

# 5. Business Engine Foundation

## Pipeline oficial

```
Raw Input → receive() → OperationInput
         → interpret() → OperationInterpretation
         → validate() → ValidationResult
         → execute() → ExecutionResult
         → publish() → OperationResult
```

### Responsabilidades

| Etapa | Faz | Não faz |
|-------|-----|---------|
| `receive()` | Normaliza entrada bruta em OperationInput | Interpretar, acessar banco |
| `interpret()` | Transforma input em intenção estruturada | Validar regras, executar |
| `validate()` | Aplica regras de negócio pré-execução | Interpretar, publicar |
| `execute()` | Materializa efeitos via domain handlers | Interpretar, publicar |
| `publish()` | Persiste operação + emite eventos | Derivar métricas |

---

# 6. Contratos do Engine

Contratos em `src/core/contracts/`:

- `OperationInput` — entrada normalizada pós-receive
- `OperationInterpretation` — intenção estruturada pós-interpret
- `ValidationResult` — resultado da validação
- `ExecutionResult` — efeitos materializados
- `EffectRecord` — rastreio de cada mutação
- `DomainEvent` — evento de domínio publicado
- `OperationContext` — contexto ambiental
- `OperationResult` — resposta final do pipeline

Contratos reservados (Sprint 1.2+): `LearningRecord`, `MemoryPattern`, `DerivationRequest`, `ConfirmationRequest`

---

# 7. Novo Modelo de Diretórios

| Pasta | Motivo |
|-------|--------|
| `src/core/` | Business Engine — isolado de UI e HTTP |
| `src/core/engine/` | Pipeline operacional |
| `src/core/contracts/` | Tipos compartilhados — zero runtime |
| `src/core/event-bus/` | Comunicação interna desacoplada |
| `src/domains/` | Efeitos de negócio por bounded context |
| `src/platform/` | DB, repositories, adapters |
| `src/shared/` | Utilitários puros |
| `docs/decisions/` | ADRs |
| `docs/sprints/` | Checklists e planos |

---

# 8. Primeiras Tabelas

| Tabela | Justificativa |
|--------|---------------|
| `operations` | Registro imutável de operações |
| `operation_payloads` | Preservar intenção original |
| `operation_interpretations` | Separar fato de interpretação |
| `effect_records` | Rastreabilidade de efeitos |
| `domain_events` | Event store append-only |

Ordem: operations → operation_payloads → operation_interpretations → effect_records → domain_events

---

# 9. Event Bus

- In-process, tipado, fail-safe
- Event types Sprint 1.1: `operation.received`, `operation.interpreted`, `operation.validated`, `operation.executed`, `operation.rejected`, `operation.failed`
- Evolução futura: adapter para Redis/Celery sem alterar contratos

---

# 10. Primeiro Pipeline

```
POST /api/operations { "text": "2 croissant Grazi pix" }
  → receive → interpret (regex stub)
  → validate → execute (SaleOperationHandler)
  → publish → OperationResult 201
```

---

# 11. Compatibilidade

**Dual Path, Single Truth** — tabelas legadas permanecem fonte de verdade para leitura via `analytics.ts`.

- POST /api/sales → SaleHandler → sales, products...
- POST /api/operations → Engine → SaleHandler → sales, products...
- analytics.ts ← GET /api/dashboard, /financial, etc.

---

# 12. Estratégia de Refatoração

1. Commits atômicos — um passo = um commit
2. Build verde sempre
3. Strangler, não big bang
4. Extrair, não reescrever
5. Tipos antes de runtime
6. Reversível via revert de commit

---

# 13. Critérios de Aceite

- [ ] Diretórios `core/`, `domains/`, `platform/`, `shared/` criados
- [ ] 8 contratos definidos em `core/contracts/`
- [ ] `BusinessEngine.process()` implementado
- [ ] Event Bus funcional
- [ ] 5 tabelas novas criadas
- [ ] `POST /api/operations` funcional
- [ ] `pnpm build` e `pnpm typecheck` passam
- [ ] 13 páginas carregam sem erro
- [ ] `POST /api/sales` funciona
- [ ] ADR-001 criado

---

# 14. Riscos

| Risco | Prob. | Impacto | Mitigação |
|-------|-------|---------|-----------|
| Schema drift | Alta | Médio | Toda tabela nova em Drizzle + raw SQL |
| Refactor POST /api/sales | Média | Crítico | Passo 8 isolado + checklist manual |
| Import circular | Média | Alto | Contracts isolados |
| Over-engineering | Média | Médio | Pipeline mínimo primeiro |

---

# 15. Próxima Sprint — Sprint 1.2

**Business Memory, Learning Store e Derivation Engines**

- Learning Store + correções humanas
- Business Memory v1 (apelidos, padrões)
- Derivation Engines v1 (MetricInvalidationListener)
- Drizzle migrations
- Testes unitários do pipeline

---

# Apêndice A — Checklist de Regressão Manual

```
1. pnpm build && pnpm typecheck
2. Dashboard → KPIs carregam
3. Vendas → criar venda via formulário
4. curl POST /api/operations → venda via texto
5. Dashboard → revenueToday incrementou
6. Estoque → quantidade decrementada
7. Financeiro, Clientes, Produtos, Metas, Insights intactos
8. sqlite3: SELECT * FROM operations
9. sqlite3: SELECT * FROM domain_events
```

---

**Lucas Business OS · Sprint 1.1 · Plano Técnico v1.0.0**
