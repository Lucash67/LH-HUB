# ADR-002 — Fluxo Oficial para Operações de Negócio

**Status:** Aceito  
**Data:** 2026-07-17  
**Contexto:** Encerramento da homologação da Base Histórica Oficial ACAL (16/07/2026)

## Contexto

A consolidação do primeiro dia operacional real exigiu scripts SQL diretos para enriquecimento histórico e correções pontuais. A auditoria identificou que esse caminho bypassa validações, Business Engine, `stock_movements` e trilha de efeitos.

Para a fase de **operação real** (a partir de 17/07/2026), é necessário formalizar como as operações rotineiras devem ser registradas.

## Decisão

**Toda operação de negócio deverá utilizar obrigatoriamente o fluxo oficial da aplicação (UI/API)**, respeitando:

- regras de negócio da camada de domínio;
- validações Zod e schemas de request;
- atualização consistente de estoque, pagamentos e entidades relacionadas;
- Business Engine quando aplicável (`POST /api/operations` ou handlers compartilhados invocados pelas rotas oficiais).

### Scripts SQL diretos — uso restrito

Scripts SQL diretos (incluindo `better-sqlite3` fora das rotas oficiais) ficam **restritos exclusivamente** a:

| Categoria | Exemplos |
|-----------|----------|
| Migrações | Alembic, alterações de schema |
| Correções históricas | Reconstituição de base já encerrada (ex.: enriquecimento dia 16/07) |
| Manutenção | Purge de dados de teste, vacuum, reindex |
| Recuperação de dados | Restore a partir de backup |
| Procedimentos administrativos | Investigação read-only, auditoria, backup |

**Proibido:** registrar vendas, clientes, produtos ou movimentações rotineiras do dia a dia via insert SQL direto.

## Marco de referência

Backup oficial pós-homologação:

```
backups/baseline-acal-2026-07-16-homologacao.sqlite
```

Representa a Base Histórica Oficial da ACAL — primeiro marco da operação real.

## Consequências

- Operações do dia 17/07/2026 em diante: UI (`/vendas`, `/produtos`, `/clientes`) ou `POST /api/*`.
- Scripts em `scripts/` existentes de registro histórico (`register-acal-day1.mjs`, `enrich-acal-day1.mjs`) permanecem como referência, **não como modelo operacional**.
- Backups antes de operações críticas continuam recomendados (`backups/` ou `POST /api/settings` backup).

## Alternativas rejeitadas

- Continuar registrando via scripts ad hoc → reproduz bypass do Engine e ausência de trilha.
- Bloquear SQL direto no código → inviável para manutenção e recovery; restrição é **operacional**, não técnica.
