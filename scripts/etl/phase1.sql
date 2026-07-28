INSERT INTO businesses (id, slug, name, status, created_at, updated_at)
        VALUES ('00000000-0000-4000-8000-000000000001', 'salgados', 'Salgados', 'active', '2026-07-19T16:18:46.404Z', '2026-07-19T16:18:46.404Z')
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO businesses (id, slug, name, status, created_at, updated_at)
        VALUES ('00000000-0000-4000-8000-000000000002', 'brigadeiros', 'Brigadeiros', 'active', '2026-07-19T16:18:46.404Z', '2026-07-19T16:18:46.404Z')
        ON CONFLICT (id) DO UPDATE SET
          slug = EXCLUDED.slug,
          name = EXCLUDED.name,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('acal.2026-07-16.indicators', '{"initialStock":9,"finalStock":0,"sellThroughRate":100,"minutesToSellOut":47,"operationalWindow":"09:09-09:56","paymentMix":{"pix":100,"card":0,"cash":0},"firstMultiConsumerSale":"09:14 Germana Nataeli de Oliveira"}'::jsonb, '2026-07-17T12:11:11.630Z')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
      

        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('acal.2026-07-16.decision_day2_production', '{"date":"2026-07-17","croissant":5,"pastel":4,"misto":3,"total":12,"basis":"Dados exclusivos do primeiro dia operacional"}'::jsonb, '2026-07-17T12:11:11.630Z')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
      

        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('requirement.payer_consumer_separation', '"REQUISITO FUNCIONAL FUTURO — identificado em operação real ACAL 16/07/2026\n\nSeparação entre PAGADOR e CONSUMIDOR.\n\nO sistema NÃO deve assumir que quem paga é necessariamente quem consome.\n\nEvidência operacional: venda das 09:14 — Germana Nataeli de Oliveira pagou por duas consumidoras.\n\nNão implementar agora. Registrar como requisito oficial para evolução da modelagem."'::jsonb, '2026-07-17T12:11:11.630Z')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
      

        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('operational_intelligence_backfill_v1', '"done"'::jsonb, '2026-07-21T02:36:21.939Z')
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          '66e1aad3-cc3e-54c9-82d0-ab80aae4e6ce',
          '00000000-0000-4000-8000-000000000002',
          'daily',
          0,
          NULL,
          '2026-07-19',
          '2026-07-19',
          '2026-07-19T16:18:46.406Z',
          '2026-07-19T16:18:46.406Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          '8c283c68-c5ae-56ea-8398-989736740f52',
          '00000000-0000-4000-8000-000000000002',
          'weekly',
          0,
          NULL,
          '2026-07-19',
          '2026-07-19',
          '2026-07-19T16:18:46.406Z',
          '2026-07-19T16:18:46.406Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          '7e604a95-288d-5e4c-921a-aba5e925886c',
          '00000000-0000-4000-8000-000000000002',
          'monthly',
          0,
          NULL,
          '2026-07-19',
          '2026-07-19',
          '2026-07-19T16:18:46.406Z',
          '2026-07-19T16:18:46.406Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          'ad31e4f8-172b-5c35-9870-b36424470c46',
          '00000000-0000-4000-8000-000000000002',
          'yearly',
          0,
          NULL,
          '2026-07-19',
          '2026-07-19',
          '2026-07-19T16:18:46.406Z',
          '2026-07-19T16:18:46.406Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          'f7ffdeff-27bf-4bf8-a636-0e05d72a0008',
          '00000000-0000-4000-8000-000000000001',
          'daily',
          0,
          12,
          '2026-07-19',
          '2026-07-19',
          '2026-07-19T23:18:58.215Z',
          '2026-07-23T01:44:15.783Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          'd77f1baf-c7e9-4568-9067-4dfabf35f67e',
          '00000000-0000-4000-8000-000000000001',
          'weekly',
          0,
          NULL,
          '2026-07-13',
          '2026-07-19',
          '2026-07-19T23:18:58.215Z',
          '2026-07-19T23:18:58.215Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          '7b7944eb-6cd2-4f2a-bda1-443384755cf3',
          '00000000-0000-4000-8000-000000000001',
          'monthly',
          0,
          NULL,
          '2026-07-01',
          '2026-07-19',
          '2026-07-19T23:18:58.215Z',
          '2026-07-19T23:18:58.215Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;
      

        INSERT INTO goals (id, business_id, goal_type, target_amount, target_units, period_start, period_end, created_at, updated_at)
        VALUES (
          '7a20996f-e27b-49ec-a9a7-60ec12d47cce',
          '00000000-0000-4000-8000-000000000001',
          'yearly',
          0,
          NULL,
          '2026-01-01',
          '2026-07-19',
          '2026-07-19T23:18:58.215Z',
          '2026-07-19T23:18:58.215Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          target_amount = EXCLUDED.target_amount,
          target_units = EXCLUDED.target_units,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          updated_at = EXCLUDED.updated_at;