INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            'd5a77858-b682-4eb6-a974-0bfacb9dbb20',
            '3afc5245-2f70-4c14-9cfa-430d0a7a63d8',
            NULL,
            'Pastel de Frango com Presunto',
            4,
            3.6666666666666665
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '7749bb1b-48d3-409c-b2b6-d00c413c447d',
            '3afc5245-2f70-4c14-9cfa-430d0a7a63d8',
            NULL,
            'Misto com Catupiry',
            4,
            3.6666666666666665
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchases (id, operation_day_id, total_units, total_investment, created_at, updated_at)
        VALUES (
          'ec7e9ffd-2f50-45bc-a5cd-288845aa0ff5',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          9,
          31.5,
          '2026-07-22T20:32:31.115Z',
          '2026-07-22T20:32:31.115Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          total_units = EXCLUDED.total_units,
          total_investment = EXCLUDED.total_investment,
          updated_at = EXCLUDED.updated_at;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '2e0cf379-5b1f-44a1-95d7-836fe8459be8',
            'ec7e9ffd-2f50-45bc-a5cd-288845aa0ff5',
            NULL,
            'Croissant',
            3,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '2a4ce129-9b82-4b20-b5a9-4c5b4cdadf56',
            'ec7e9ffd-2f50-45bc-a5cd-288845aa0ff5',
            NULL,
            'Misto com Catupiry',
            3,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            'c2fbd782-f4e6-41b5-8efd-4067bbff0a0e',
            'ec7e9ffd-2f50-45bc-a5cd-288845aa0ff5',
            NULL,
            'Pastel de Frango com Presunto',
            3,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchases (id, operation_day_id, total_units, total_investment, created_at, updated_at)
        VALUES (
          'c5369895-55f8-4362-bf8c-756e372bce19',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          12,
          42,
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          total_units = EXCLUDED.total_units,
          total_investment = EXCLUDED.total_investment,
          updated_at = EXCLUDED.updated_at;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '753079d9-2249-4636-8f63-77606a146037',
            'c5369895-55f8-4362-bf8c-756e372bce19',
            NULL,
            'Croissant',
            5,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '1b94464c-2da8-4aee-a4de-b77b05aeeb3c',
            'c5369895-55f8-4362-bf8c-756e372bce19',
            NULL,
            'Pastel de Frango com Presunto',
            4,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            'a6b99fe2-f8bc-4b3c-a10c-965537dfff9e',
            'c5369895-55f8-4362-bf8c-756e372bce19',
            NULL,
            'Misto com Catupiry',
            3,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchases (id, operation_day_id, total_units, total_investment, created_at, updated_at)
        VALUES (
          'bd76bfb0-a483-4b25-a54f-bdc04cb36778',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          15,
          52.5,
          '2026-07-23T01:44:15.782Z',
          '2026-07-23T01:44:15.782Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          total_units = EXCLUDED.total_units,
          total_investment = EXCLUDED.total_investment,
          updated_at = EXCLUDED.updated_at;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '0f4dc098-f492-4368-b5e7-9447023609c5',
            'bd76bfb0-a483-4b25-a54f-bdc04cb36778',
            '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
            'Croissant',
            5,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            'a05b88be-2d74-40ce-9d57-a721d4305978',
            'bd76bfb0-a483-4b25-a54f-bdc04cb36778',
            'dc23feda-ff94-42b6-9889-aa6ea351a846',
            'Pastel de Frango com Presunto',
            5,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '2447176f-3f64-4ba4-8ccd-7a1da189f141',
            'bd76bfb0-a483-4b25-a54f-bdc04cb36778',
            'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
            'Misto com Catupiry',
            5,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
UPDATE operation_days SET daily_goal_units = 15, updated_at = NOW()
        WHERE id = '58c9044b-48f6-54eb-9149-3aec3040375e';
INSERT INTO diary_entries (
          id, operation_day_id, schema_version, revenue_received, revenue_pending, revenue_total,
          operational_profit, quantity_sold, quantity_lost, observations, manual_insights,
          commercial_intelligence, tags, narrative, created_at, updated_at
        )
        VALUES (
          '87ed9131-909e-44be-813b-6a4f44a43aa4',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          1,
          75,
          0,
          75,
          22.5,
          15,
          0,
          'Operação oficial 20/07/2026.
Compra: 15 unidades (6 Croissant · 5 Pastel · 4 Misto) · Investimento R$ 52,50.
Meta: 15 unidades · Resultado: 15 unidades destinadas · 0 perdas.

Distribuição: 11 unidades vendidas no expediente + 1 fiado (Mikely) + 3 sobras (Henrique 21:00).
Restaram 3 salgados ao final — comprados por Henrique.

Mikely: fiado em 20/07 · PIX recebido 21/07 (cash_flow — não altera receita do dia 21).
Anselmo: consumo 20/07 · PIX recebido 21/07 (venda 20/07 — não altera receita do dia 21).

Receita R$ 75 · Lucro operacional R$ 22,50 · Margem 30%.',
          'Pastel esgotou rápido. Placa/QR sem preço visível gera atrito. Atraso no pagamento ≠ perda operacional.',
          '{"whatWeLearnedToday":["15 unidades compradas e 15 destinadas — 0 desperdício real.","3 sobras vendidas a Henrique às 21:00.","Mikely fiado · Anselmo pago em 21/07.","Placa precisa exibir preço R$ 5,00."],"conclusion":"Meta atingida. Pagamentos atrasados reconciliados sem perda operacional."}'::jsonb,
          ARRAY['meta-atingida', 'fiado-mikely', 'anselmo-recuperado', 'sobras-henrique', 'homologado-hotfix-2007']::text[],
          '{"sales":{"paidCount":11,"creditCount":0,"fatherSale":{"units":3,"amount":15,"buyerName":"Henrique"}},"lossReason":null}'::jsonb,
          '2026-07-21T01:07:29.772Z',
          '2026-07-21T01:07:29.772Z'
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
        WHERE id = '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12';
INSERT INTO diary_entries (
          id, operation_day_id, schema_version, revenue_received, revenue_pending, revenue_total,
          operational_profit, quantity_sold, quantity_lost, observations, manual_insights,
          commercial_intelligence, tags, narrative, created_at, updated_at
        )
        VALUES (
          '32fe6cac-8dd2-46f3-8762-1e7327112d16',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          1,
          60,
          0,
          60,
          16,
          12,
          0,
          'Operação oficial 21/07/2026 (ROO-0002).
Compra: 12 unidades (4 Croissant · 4 Pastel · 4 Misto). Investimento R$ 44,00 (terceiro).
Vendas do dia: 10 transações · 12 unidades · R$ 60,00 receita · R$ 16,00 lucro operacional · margem 26,67%.
100% PIX · 0 pendências · meta atingida.

RECEBIMENTOS DO DIA 20 (NÃO são vendas do dia 21 — apenas liquidação):
• PIX R$ 5,00 — Maria Mikelly Monteiro Coutinho (fiado 20/07)
• PIX R$ 5,00 — Anselmo Gabriel Freire da Silva (venda 20/07)
Esses valores entram apenas como recebimentos (cash_flow), sem alterar receita/lucro/vendas do dia 21.',
          'Demanda forte 08h00–08h30. Terça com demanda alta. Demanda reprimida 15h30–16h00. Boa exposição aumenta conversão.',
          '{"whatWeLearnedToday":["Demanda matinal 08h00–08h30 não capturada.","Demanda reprimida 15h30–16h00.","Meta matinal: 8–9 un até 10h.","Recebimentos do dia 20 separados das vendas do dia 21."],"conclusion":"Antecipar chegada, aumentar compra em dias fortes, separar recebimentos de vendas do dia."}'::jsonb,
          ARRAY['meta-atingida', 'demanda-matinal', 'recebimentos-2007', 'homologado-a32-hotfix']::text[],
          '{"sales":{"paidCount":10,"creditCount":0,"unitsSold":12},"lossReason":null}'::jsonb,
          '2026-07-22T02:35:00.654Z',
          '2026-07-22T02:35:00.654Z'
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
UPDATE operation_days SET daily_goal_units = 9, updated_at = NOW()
        WHERE id = '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7';
INSERT INTO diary_entries (
          id, operation_day_id, schema_version, revenue_received, revenue_pending, revenue_total,
          operational_profit, quantity_sold, quantity_lost, observations, manual_insights,
          commercial_intelligence, tags, narrative, created_at, updated_at
        )
        VALUES (
          '82dce519-5c32-407c-9993-8826710242e5',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          1,
          45,
          0,
          45,
          13.5,
          9,
          0,
          'Primeiro dia oficial de operação ACAL (16/07/2026).
Supervisora Nay autorizou o início. Comercialização apenas salgados (doces sob responsabilidade de Ana — não vendidos).
Objetivo: Validar aceitação dos salgados.
Resultado: 100% do estoque vendido (9 unidades).
Tempo para esgotar estoque: 47 minutos (09:09 às 09:56).
Janela operacional: 09:09 às 09:56.
Forma de pagamento: 100% PIX.
Nenhuma sobra. Nenhum desconto solicitado.
Primeira compra múltipla registrada (Germana — 2 consumidoras).

CONTEXTO FINANCEIRO:
- Receita: R$ 45,00
- Investimento pai do operador: R$ 31,50 (terceiro — não desembolso do operador)
- Lucro operacional: R$ 13,50
- Margem: 30%
- Operador não realizou desembolso financeiro nesta operação',
          'Preço de R$ 5,00 aceito sem objeções. Nenhum pedido de desconto. Nenhum pedido para pagar depois. Todos os pagamentos via PIX. Estoque inicial adequado. Estratégia de começar pequeno mostrou-se correta. Ainda não existem dados suficientes para concluir qual produto possui maior demanda.',
          '{"whatWeLearnedToday":["100% do estoque vendido em 47 minutos.","Janela operacional: 09:09 às 09:56.","Primeira venda múltipla — Germana pagou por 2 consumidoras.","Pagador ≠ consumidor — requisito funcional identificado.","Mix equilibrado: 3 Croissant, 3 Pastel, 3 Misto."],"conclusion":"Validação bem-sucedida. Produção do dia 17 definida em 12 unidades com base exclusiva nos dados deste dia."}'::jsonb,
          ARRAY['primeiro-dia', 'validacao', 'pix-100', 'estoque-zerado', 'germana-multipla']::text[],
          '{"sales":{"paidCount":8,"creditCount":0},"lossReason":null}'::jsonb,
          '2026-07-22T20:32:31.115Z',
          '2026-07-22T20:32:31.115Z'
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