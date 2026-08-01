# Backlog futuro — Lucas Business OS

Ideias para implementar **depois** da entrega atual.

---

## 1. Módulo de Projeções por Período (ambição & motivação)

**Status:** MVP entregue (semana/mês + ritmo + meta + “o que falta”) · 2026-08-01  
**Prioridade sugerida:** evoluções após uso real

### Visão

Módulo focado em **projeções da semana, do mês e de outros períodos** (2 meses, 3 meses, trimestre, etc.), combinando:

- Resultados **históricos** (médias, tendências, sazonalidade seg–sex)
- Resultados do **presente** (ritmo atual, dias já operados no período)
- Metas e padrões recorrentes (ex.: toda vez que completa 1 semana, 1 mês…)

### Objetivo do usuário

Gerar **faturamento, lucro, unidades e margem projetados** ao fechar cada “ciclo” de tempo — para usar como **motivação e ambição** consciente, não só número frio.

### Entregáveis

- [x] Projeção da semana e do mês atuais (ritmo × dias úteis)
- [x] Comparativo: projetado vs. realizado vs. meta
- [x] Painel “O que falta para bater a projeção” (unidades/dia restantes)
- [x] Entrada no menu + simulador estático como secundário
- [ ] Cenários (conservador · base · otimista) baseados no histórico
- [ ] Projeção automática ao completar semana / mês / N meses
- [ ] Notificação ou destaque no Dashboard quando um ciclo fecha
- [ ] Períodos longos (2–3 meses, trimestre)

### Notas

- Rota `/projecoes` · serviço `src/lib/period-projections-service.ts`
- Respeita calendário operacional ACAL (seg–sex)
- Lucro/receita usam diário homologado quando existir (`buildOperationalDayMetrics`)

---

_Última atualização: 2026-08-01_
