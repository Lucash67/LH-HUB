# ADR-004 — Baseline Histórico Oficial ACAL (Encerramento Sprint A.4)

**Status:** Aceito  
**Data:** 2026-07-22  
**Contexto:** Encerramento da Consolidação Histórica após auditorias, reconstruções e homologações dos dias oficiais

## Decisão

A Consolidação Histórica do Lucas Business OS (operação Salgados / ACAL) está **oficialmente concluída**.

A **Baseline Oficial** da operação histórica compreende exclusivamente:

- 16/07/2026
- 17/07/2026
- 20/07/2026
- 21/07/2026

Esses dias são imutáveis salvo nova evidência documental do operador.

## Consequências

- Scripts de reconstrução em `scripts/` permanecem como referência histórica; não devem ser reexecutados sobre a base atual.
- Próximo trabalho de produto: **Sprint 3.3.3 — Metas Inteligentes** (roadmap principal).
- Detalhes operacionais: `docs/handbook/consolidacao-historica.md`.

## Relacionado

- ADR-002 — Fluxo oficial para operações de negócio
- `backups/README.md` — procedimentos de restore administrativo
