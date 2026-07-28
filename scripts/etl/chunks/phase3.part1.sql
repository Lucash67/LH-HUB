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