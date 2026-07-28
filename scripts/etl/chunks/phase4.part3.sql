INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'e5a46c54-8734-409e-8c99-d9ef2fc28c0f',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '5c8d7159-c08c-4b3d-8c4c-06d43e2a5231',
          '2026-07-20',
          '15:30:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-20',
          5,
          3.5,
          1.5,
          'Venda oficial 2026-07-20 — Bruno Medeiros Silva às 15:30.',
          '2026-07-22T23:24:59.085Z',
          '2026-07-22T23:24:59.085Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '2070f725-2e2d-41ad-9dc7-34b5d9343ffa',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'b6d20f20-adc8-4afb-8dc2-f6f759332527',
          '2026-07-20',
          '15:30:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-20',
          5,
          3.5,
          1.5,
          'Venda oficial 2026-07-20 — Leonardo De Sousa Sena às 15:30.',
          '2026-07-22T23:24:59.085Z',
          '2026-07-22T23:24:59.085Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '123b0afe-3290-43d0-906c-102dfb92f3d0',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'af0b5773-e615-4bdc-87d4-f80ae7a784df',
          '2026-07-20',
          '00:00:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.5,
          1.5,
          'Consumo em 20/07/2026 — salgado antes considerado perdido. PIX recebido em 21/07/2026.',
          '2026-07-22T23:24:59.085Z',
          '2026-07-22T23:24:59.085Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '8804b8e7-fd82-49de-aa92-4e6f2c389500',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '69a076ba-8b4a-491f-bf42-06d4e334cee8',
          '2026-07-20',
          '21:00:00',
          'ACAL',
          'pix',
          'paid',
          15,
          '2026-07-20',
          15,
          10.5,
          4.5,
          'Compra das sobras do dia — 3 Croissants.',
          '2026-07-22T23:24:59.085Z',
          '2026-07-22T23:24:59.085Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'cd92a70e-5221-4520-a471-37a483b9e07a',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'f940fbc9-f7a5-4245-9156-5cfe0d2e7d2b',
          '2026-07-22',
          '07:09:00',
          'Trabalho do Henrique',
          'pix',
          'paid',
          15,
          NULL,
          15,
          11.25,
          3.75,
          'Trabalho do Henrique — 07:09 às 08:54. 3 Croissant. Parte da operação do dia.',
          '2026-07-23T01:44:15.459Z',
          '2026-07-23T01:44:15.459Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '7e8a34f6-22d2-4f36-b03f-65714c33da65',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'ae4f21ac-8ff9-435a-ae71-f3f3d54ce40d',
          '2026-07-22',
          '08:58:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.477Z',
          '2026-07-23T01:44:15.477Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '622780e6-6963-4f44-91db-2570e6e6266b',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '5d253d46-a2b3-444f-8d20-ec23a1a3732c',
          '2026-07-22',
          '09:36:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.490Z',
          '2026-07-23T01:44:15.490Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '6b503bdb-d2d7-4a3b-9edf-8d47b74e180d',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '4d179b24-0fc2-45be-8e2f-71e3f3cfa54e',
          '2026-07-22',
          '09:44:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.502Z',
          '2026-07-23T01:44:15.502Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '1db2939a-2b68-40f7-a08f-aaefc796d94d',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '78fa224a-a00b-414a-94c3-824be5191482',
          '2026-07-22',
          '09:47:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.514Z',
          '2026-07-23T01:44:15.514Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '5e3abb71-1363-4ee5-88fd-a896ce410267',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '78fa224a-a00b-414a-94c3-824be5191482',
          '2026-07-22',
          '09:56:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.527Z',
          '2026-07-23T01:44:15.527Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'f434a198-c485-4c4a-a4c3-3b5f3a7b77dc',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'c0dd1d2b-f5de-498b-806a-57c8201336c8',
          '2026-07-22',
          '12:03:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.540Z',
          '2026-07-23T01:44:15.540Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          '010213ce-0741-4c01-8dd1-392048edcbac',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'd79e8a37-d8d9-4379-be3e-53aeac9a0939',
          '2026-07-22',
          '12:03:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.551Z',
          '2026-07-23T01:44:15.551Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'ade95db6-2a70-4df3-875e-7f2f9a1f95cf',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '409bdd64-0595-4e16-b1ef-62416b1a1242',
          '2026-07-22',
          '12:05:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          NULL,
          '2026-07-23T01:44:15.563Z',
          '2026-07-23T01:44:15.563Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'ccc884b0-83b7-403e-aade-bd37b6d0be12',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'fb9a9df8-8b0c-416c-bdc7-cbf6f0d677bf',
          '2026-07-22',
          '15:55:00',
          'ACAL',
          'cash',
          'paid',
          10,
          NULL,
          10,
          7.5,
          2.5,
          '2 salgados em dinheiro. Sabores NÃO INFORMADOS. Recebimento por Dona Raimunda. Aguardando identificação da cliente e dos sabores.',
          '2026-07-23T01:44:15.574Z',
          '2026-07-23T01:44:15.574Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'f23f8546-3a77-4660-b128-fbd481673adc',
          '00000000-0000-4000-8000-000000000001',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          '173d1b7d-b39c-4305-9b90-c12744f35f81',
          '2026-07-22',
          '15:58:00',
          'ACAL',
          'pix',
          'paid',
          5,
          NULL,
          5,
          3.75,
          1.25,
          '1 salgado vendido. Sabor NÃO INFORMADO.',
          '2026-07-23T01:44:15.586Z',
          '2026-07-23T01:44:15.586Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '24f81cce-077f-59c0-9224-31f6e785523c',
          'c45bba10-e6f4-529c-ab24-e796a7bc1acb',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          15,
          2.933333333333333,
          0,
          44,
          44
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'c67eb7d1-a0de-5005-9647-19cfad40fbb5',
          '81c32556-2af2-5d50-8eaa-f2acbc71e33e',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          25,
          3,
          0,
          75,
          75
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '6fb6817b-b7fb-593b-8a09-52c0c1aedbc5',
          'f028cdad-f165-51d4-884f-76be4025499b',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          3,
          3,
          0,
          9,
          9
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '3fbf0be0-23fc-456b-8f4d-cd62c19ddcd9',
          '414e45b3-e173-4262-83b4-3752a8e92c90',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'c9f98c4c-4c19-4c7e-8737-3eb5322d4813',
          'a14b4563-f088-4c9f-9f28-70bf23d75616',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;