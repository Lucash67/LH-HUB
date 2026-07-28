# Sprint 1.1 — Checklist de Regressão

## Build

- [ ] `pnpm typecheck`
- [ ] `pnpm build`
- [ ] `pnpm lint`

## Páginas (http://localhost:3001)

- [ ] Dashboard — KPIs e gráficos
- [ ] Vendas — listagem e formulário
- [ ] Produtos — CRUD
- [ ] Estoque — listagem
- [ ] Clientes — CRUD
- [ ] Financeiro
- [ ] Metas
- [ ] Insights
- [ ] Relatórios
- [ ] Calendário
- [ ] Configurações

## API legada

- [ ] `GET /api/dashboard`
- [ ] `POST /api/sales` — criar venda via JSON

## Business Engine

- [ ] `POST /api/operations` — `{ "text": "2 croissant Grazi pix" }`
- [ ] Resposta 201 com `OperationResult`
- [ ] Venda aparece em `/vendas`
- [ ] Dashboard reflete receita

## Persistência

- [ ] `SELECT * FROM operations`
- [ ] `SELECT * FROM domain_events WHERE event_type = 'operation.executed'`
- [ ] `SELECT * FROM effect_records`
