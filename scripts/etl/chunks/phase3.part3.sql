UPDATE operation_days SET daily_goal_units = 12, updated_at = NOW()
        WHERE id = '758f0bc8-d4ae-5298-9be2-47d1db30ac9c';
INSERT INTO diary_entries (
          id, operation_day_id, schema_version, revenue_received, revenue_pending, revenue_total,
          operational_profit, quantity_sold, quantity_lost, observations, manual_insights,
          commercial_intelligence, tags, narrative, created_at, updated_at
        )
        VALUES (
          '1ac80382-7fda-40ad-aca2-b41f0e390f7a',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          1,
          60,
          0,
          60,
          18,
          12,
          0,
          'ROO-0002 — Segundo dia oficial de operação ACAL (17/07/2026).
Sexta-feira. Primeiro aumento de produção (12 unidades — decisão baseada no dia 16).
Todo estoque vendido novamente. Estoque final: 0 em todos os produtos.
Maior concentração de vendas entre 08:50 e 10:00. Vendas também durante a tarde (14:58–15:37).
Cliente recorrente do dia: Raimunda Raimunda Sousa (2 compras).
Forma de pagamento: 100% PIX.

CONTEXTO FINANCEIRO:
- Receita operacional: R$ 60,00
- Investimento (terceiro — pai do operador): R$ 42,00
- Lucro operacional: R$ 18,00
- Custo unitário: R$ 3,50 · Preço: R$ 5,00 · Margem: 30%
- Operador não realizou desembolso financeiro nesta operação

MOVIMENTAÇÃO EXTRAORDINÁRIA (NÃO pertence ao negócio):
- 13:06 — PIX R$ 2,50 de Fernando Martins Cruz
- Destinado ao negócio de outra colaboradora — não é venda, receita ou lucro ACAL',
          'Manter preço de R$ 5,00. Continuar crescimento gradual da produção. Continuar registrando clientes. Não alterar estratégia com apenas dois dias de histórico.',
          '{"whatWeLearnedToday":["100% do estoque vendido (12 unidades).","Janela principal: 08:52–09:59; vendas vespertinas 14:58–15:37.","Raimunda Raimunda Sousa — primeira recorrência no mesmo dia.","Mix produzido: 5 Croissant, 4 Pastel, 3 Misto."],"conclusion":"Segundo dia validado. Estratégia de crescimento gradual confirmada. Histórico ainda insuficiente para mudança de mix."}'::jsonb,
          ARRAY['segundo-dia', 'roo-0002', 'pix-100', 'estoque-zerado', 'raimunda-recorrente']::text[],
          '{"sales":{"paidCount":12,"creditCount":0},"lossReason":null}'::jsonb,
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          revenue_received = EXCLUDED.revenue_received,
          revenue_pending = EXCLUDED.revenue_pending,
          revenue_total = EXCLUDED.revenue_total,
          operational_profit = EXCLUDED.operational_profit,
          quantity_sold = EXCLUDED.quantity_sold,
          quantity_lost = EXCLUDED.quantity_lost,
          observations = EXCLUDED.observations,
          manual_insights = EXCLUDED.manual_insights,
          commercial_intelligence = EXCLUDED.commercial_intelligence,
          tags = EXCLUDED.tags,
          narrative = EXCLUDED.narrative,
          updated_at = EXCLUDED.updated_at;
UPDATE operation_days SET daily_goal_units = 12, updated_at = NOW()
        WHERE id = 'aa267a82-0d59-54a8-8f08-8568b832bd47';
INSERT INTO diary_entries (
          id, operation_day_id, schema_version, revenue_received, revenue_pending, revenue_total,
          operational_profit, quantity_sold, quantity_lost, observations, manual_insights,
          commercial_intelligence, tags, narrative, created_at, updated_at
        )
        VALUES (
          '08183f09-b65f-43b2-a4e8-17469e21f312',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          1,
          70,
          0,
          70,
          17.5,
          14,
          0,
          'Operação oficial 22/07/2026 — primeiro dia pós-Consolidação Histórica.

COMPRA: 15 unidades (5 Croissant · 5 Pastel · 5 Misto). Investimento R$ 52,50.
  · Próprio: R$ 22,50 · Terceiro (Familiar · Henrique): R$ 30,00
DISTRIBUIÇÃO: ACAL 12 un (2C·5P·5M) · Trabalho Henrique 3 Croissant.

VENDAS CONFIRMADAS: 14 unidades · R$ 70,00 · lucro operacional R$ 17,50 · margem 25%.

PENDÊNCIA — 1 pastel em investigação (NÃO contabilizar como perda):
  · Custo R$ 3,50 · potencial venda R$ 5,00 · situação: em investigação.
  · Observação: "Hoje perdi um pastel (em investigação)."

INCERTEZAS REGISTRADAS:
  · 15:55 — 2 salgados em dinheiro (Dona Raimunda recebeu). Cliente e sabores não identificados.
  · 15:58 — Bernardo Ferreira Domingo — sabor não informado.
  · Sabores dos últimos 3 salgados vendidos não puderam ser identificados.

FINANCEIRO: dinheiro em espécie convertido posteriormente em PIX via Henrique — conversão de forma de recebimento, não altera receita.

PLANEJAMENTO FUTURO (não é venda do dia):
  · Encomenda: 2 Mistos com Catupiry para sexta-feira — colega de trabalho do Henrique.

DECISÃO: continuar levando 12 unidades para a ACAL durante esta semana.',
          'Perguntar à Dona Raimunda o nome da cliente que comprou 2 salgados em dinheiro e, se possível, os sabores. Demanda matinal mantida.',
          '{"whatWeLearnedToday":["1 pastel sem identificação — em investigação, não registrar como perda.","2 salgados vendidos em dinheiro — cliente e sabores pendentes.","Sabores dos últimos 3 salgados não identificados."],"conclusion":"Preservar incertezas como eventos operacionais; regularizar quando houver evidência."}'::jsonb,
          ARRAY['pos-consolidacao', 'investigacao-pastel', 'sabor-nao-identificado', 'dinheiro-especie', 'operacao-real']::text[],
          '{"sales":{"paidCount":11,"creditCount":0,"fatherSale":{"units":3,"amount":15,"buyerName":"Trabalho do Henrique"}},"lossReason":null}'::jsonb,
          '2026-07-23T01:44:15.781Z',
          '2026-07-23T01:44:15.781Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          revenue_received = EXCLUDED.revenue_received,
          revenue_pending = EXCLUDED.revenue_pending,
          revenue_total = EXCLUDED.revenue_total,
          operational_profit = EXCLUDED.operational_profit,
          quantity_sold = EXCLUDED.quantity_sold,
          quantity_lost = EXCLUDED.quantity_lost,
          observations = EXCLUDED.observations,
          manual_insights = EXCLUDED.manual_insights,
          commercial_intelligence = EXCLUDED.commercial_intelligence,
          tags = EXCLUDED.tags,
          narrative = EXCLUDED.narrative,
          updated_at = EXCLUDED.updated_at;