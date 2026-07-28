# ADR-001 — Business Engine Foundation

**Status:** Aceito  
**Data:** 2026-07-17  
**Sprint:** 1.1

## Contexto

O Lucas Business OS operava como monolito screen-oriented. A Constituição e a especificação MOI definem um Business Engine como cérebro único do sistema.

## Decisão

1. Introduzir camadas `core/`, `domains/`, `platform/`, `shared/` coexistindo com `lib/` legado.
2. Implementar pipeline `receive → interpret → validate → execute → publish`.
3. Event Bus in-process (`InProcessEventBus`) com interface substituível.
4. Nova API `POST /api/operations` em paralelo às rotas legadas.
5. Extrair `executeSaleOperation` de `/api/sales` para handler compartilhado.
6. Tabelas append-only: `operations`, `operation_payloads`, `operation_interpretations`, `effect_records`, `domain_events`.
7. `lib/db/index.ts` re-exporta `platform/db` como bridge de compatibilidade.

## Consequências

- Dual path temporário: vendas via formulário (`/api/sales`) e via Engine (`/api/operations`).
- `analytics.ts` permanece on-read até Sprint 1.2.
- Interpretação Sprint 1.1 é regex stub — não IA.
- Schema duplicado (Drizzle + raw SQL) mantido até drizzle-kit na Sprint 1.2.

## Alternativas rejeitadas

- Reescrita completa do frontend → viola objetivo de compatibilidade.
- Kafka/RabbitMQ para Event Bus → over-engineering para single-process MVP.
- Migrar analytics nesta sprint → risco alto de regressão.
