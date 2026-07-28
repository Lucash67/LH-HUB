INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          '294bcd8c-28ba-59c3-9054-0108e013163e',
          '00000000-0000-4000-8000-000000000002',
          '2026-07-10',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          'd8dc2632-8967-5081-b775-7027b8f1747e',
          '00000000-0000-4000-8000-000000000002',
          '2026-07-18',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          '4b0af105-0f48-546f-8097-5228bd61b6b4',
          '00000000-0000-4000-8000-000000000002',
          '2026-07-19',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-16',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-20',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-21',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO operation_days (id, business_id, operation_date, status, created_at, updated_at)
        VALUES (
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-22',
          'open',
          NOW(),
          NOW()
        )
        ON CONFLICT (business_id, operation_date) DO UPDATE SET updated_at = NOW();
      

        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          'f6794bb8-5970-48ef-b193-9dbbad66603e',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          31.5,
          'initial',
          'family',
          'Henrique',
          'Investimento pai do operador — aquisição dos produtos (R$ 31,50). Não desembolsado pela ACAL nem pelo operador. Dia 16/07/2026. Base histórica oficial homologada A.3.1.',
          '2026-07-17T10:17:00.349Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          '783e9990-42d6-558a-a3e7-2dc844b11a25',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          42,
          'additional',
          'family',
          'Henrique',
          'Investimento pai do operador — aquisição dos produtos (R$ 42,00). Não desembolsado pela ACAL nem pelo operador. Dia 17/07/2026. Base histórica oficial homologada A.3.2.',
          '2026-07-20T15:45:20.529Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          '05482072-6424-4659-8cce-6e33b41cc139',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          52.5,
          'additional',
          'family',
          'Henrique',
          'Investimento pai do operador — aquisição dos produtos (R$ 52,50). 15 unidades (6 Croissant · 5 Pastel · 4 Misto). Dia 20/07/2026. Homologado hotfix.',
          '2026-07-21T01:26:33.256Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          '43d39eeb-92eb-4711-950d-3a930ce4116b',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          44,
          'additional',
          'family',
          'Henrique',
          'Investimento pai do operador — aquisição dos produtos (R$ 44,00). Não desembolsado pela ACAL nem pelo operador. Dia 21/07/2026. Homologado hotfix A.3.2.',
          '2026-07-22T02:35:00.654Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          '705b282d-4077-4401-b88b-8f28f664b7ab',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          22.5,
          'additional',
          'own_capital',
          NULL,
          'Investimento próprio do operador — compra diária 2026-07-22. R$ 22,50 (3 unidades alocadas ao operador).',
          '2026-07-23T01:44:15.789Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO daily_investments (id, operation_day_id, amount, investment_type, source_type, source_name, description, created_at)
        VALUES (
          '51f19816-238c-4696-ac34-103108f86c90',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          30,
          'additional',
          'family',
          'Henrique',
          'Investimento Familiar · Henrique — compra diária 2026-07-22. R$ 30,00.',
          '2026-07-23T01:44:15.789Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO daily_purchases (id, operation_day_id, total_units, total_investment, created_at, updated_at)
        VALUES (
          'cb2b4640-97f4-4ba5-bbd3-77e20cd76f8d',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          15,
          52.5,
          '2026-07-21T02:34:09.717Z',
          '2026-07-22T23:24:59.086Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          total_units = EXCLUDED.total_units,
          total_investment = EXCLUDED.total_investment,
          updated_at = EXCLUDED.updated_at;
      

          INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            'd28cdeee-cecc-440a-bb1e-bf2a29d48ccd',
            'cb2b4640-97f4-4ba5-bbd3-77e20cd76f8d',
            NULL,
            'Croissant',
            6,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
        

          INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '1085fd18-0ad8-4024-bb52-042430d403c8',
            'cb2b4640-97f4-4ba5-bbd3-77e20cd76f8d',
            NULL,
            'Pastel de Frango com Presunto',
            5,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
        

          INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            'a50c3759-a3ea-4dcf-ba38-ea0ac32f33f9',
            'cb2b4640-97f4-4ba5-bbd3-77e20cd76f8d',
            NULL,
            'Misto com Catupiry',
            4,
            3.5
          )
          ON CONFLICT (id) DO NOTHING;
        

        INSERT INTO daily_purchases (id, operation_day_id, total_units, total_investment, created_at, updated_at)
        VALUES (
          '3afc5245-2f70-4c14-9cfa-430d0a7a63d8',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          12,
          44,
          '2026-07-22T02:35:00.655Z',
          '2026-07-22T23:19:26.971Z'
        )
        ON CONFLICT (operation_day_id) DO UPDATE SET
          total_units = EXCLUDED.total_units,
          total_investment = EXCLUDED.total_investment,
          updated_at = EXCLUDED.updated_at;
      

          INSERT INTO daily_purchase_items (id, daily_purchase_id, product_id, product_name, quantity, unit_cost)
          VALUES (
            '9ce0a141-8413-415f-9c6a-8ec5f7e64442',
            '3afc5245-2f70-4c14-9cfa-430d0a7a63d8',
            NULL,
            'Croissant',
            4,
            3.6666666666666665
          )
          ON CONFLICT (id) DO NOTHING;
        

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