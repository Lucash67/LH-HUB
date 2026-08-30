# Backlog futuro — Lucas Business OS

Ideias para implementar **depois** da entrega atual.

Consulte também o módulo **Ideias** no app (`/ideias`) — ali ficam demandas e observações do dia a dia para lembrar e priorizar.

---

## 1. Módulo de Projeções por Período (ambição & motivação)

**Status:** Completo (semana/mês/2 meses/trimestre + cenários + banner de ciclo) · 2026-08-09  
**Prioridade sugerida:** evoluções finas após uso real

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
- [x] Cenários (conservador · base · otimista) baseados no histórico
- [x] Projeção automática ao completar semana / mês / N meses (derive-on-read + badge ciclo fechado)
- [x] Notificação ou destaque no Dashboard quando um ciclo fecha
- [x] Períodos longos (2–3 meses, trimestre)

### Notas

- Rota `/projecoes` · serviço `src/lib/period-projections-service.ts`
- Respeita calendário operacional ACAL (seg–sex)
- Lucro/receita usam diário homologado quando existir (`buildOperationalDayMetrics`)
- Banner: `ProjectionCycleBanner` · API `?mode=cycle-banner`

---

## 2. Novo cardápio + estratégias para vender mais

**Status:** Aberto · registrado em `/ideias` (demanda) · 2026-08-23  
**Prioridade sugerida:** alta (crescimento de volume)

### Contexto

Observação operacional: revisar o cardápio e definir novas estratégias de venda (mix, preço, canais ACAL / Henrique / Unifor) para aumentar unidades vendidas sem perder o ritmo do cofrinho.

### Entregáveis sugeridos

- [ ] Definir cardápio alvo (sabores e quantidades típicas por canal)
- [ ] Estratégias de venda (manhã ACAL, upsell, redução de perdas)
- [ ] Atualizar modelo de rascunho / produtos no sistema se o mix mudar

### Onde consultar

- App: **Ideias** → demanda “Novo cardápio + estratégias para vender mais”
- Este arquivo (seção 2)

---

## 3. Integração Mercado Pago → Registro do Dia (automático)

**Status:** Pausado para retomar depois · intenção confirmada 2026-08-24  
**Prioridade sugerida:** alta (reduz atrito diário do PIX)

### Contexto

Vendas de salgados por PIX caem no Mercado Pago. Hoje o operador anota nome/valor no rascunho à mão (ex.: OBS 24/08). Objetivo: integrar o MP ao OMNI Business e tornar o fluxo **realmente automático** — sem inventar venda sozinho, mas eliminando a digitação do PIX.

### Visão do fluxo

1. OMNI busca/recebe PIX do dia (API + webhook)
2. Lista candidata (nome · valor · hora)
3. Confirmação rápida (sabor, canal Acal/Unifor/Henrique; espécie/fiado/perda continuam manuais)
4. Grava no Registro do Dia / diário como hoje

### Fases sugeridas

- [ ] Fase 1 — Só leitura + conciliação do dia (bater PIX com rascunho)
- [ ] Fase 2 — Pré-preencher vendas pagas no Registro do Dia
- [ ] Fase 3 — Webhook em tempo real (aviso quando cair PIX)
- [ ] Fase 4 (opcional) — QR/checkout OMNI

### Invariantes

- MP **não cria venda** sem confirmação humana
- Espécie, fiado, perda e sabor continuam no fluxo operacional atual
- Credenciais MP só em secrets (nunca no repo)

### Onde consultar

- App: **Ideias** → “Integrar Mercado Pago (PIX automático)”
- Este arquivo (seção 3)
- Conversa: intenção de avançar e automatizar de verdade

---

## 4. Continuação OMNI Schedule + Hub (pausado)

**Status:** Pausado para retomar depois · 2026-08-24  
**Prioridade sugerida:** alta (segundo produto do ecossistema)

### Onde paramos

- Fundação entregue: schema `schedule.*`, shell `/schedule`, Hub `/hub`, onboarding, sessão OMNI única
- Business preservado; Schedule ainda sem CRUD completo

### Próximo ao retomar

1. Organização · 2. Serviços/equipe/horários · 3. Appointments · 4. Agenda · 5. Booking público · 6. Presets Barbearia

### Onde consultar

- `docs/sprints/future-backlog.md` (esta seção) · código `src/app/schedule/**`

---

_Última atualização: 2026-08-24_
