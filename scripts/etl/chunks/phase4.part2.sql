INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'aaa82e7a-5206-43fb-9cd3-e5b4dc4b4d79',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'a791206a-b10b-41c1-b715-4d0cba448f1b',
          '2026-07-17',
          '14:58:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Segunda compra realizada pelo mesmo cliente no mesmo dia.',
          '2026-07-22T23:09:05.149Z',
          '2026-07-22T23:09:05.149Z'
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
          '4c084c44-cdce-4af8-a23a-e2c9eb943f4d',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '3fd8972d-1a05-4b02-a124-ce546992b7df',
          '2026-07-17',
          '15:35:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — José Inácio Silva da Cruz.',
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
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
          '8bb50151-74ac-457d-a8d0-74ccc448360e',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'b6d20f20-adc8-4afb-8dc2-f6f759332527',
          '2026-07-17',
          '15:37:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Leonardo De Sousa Sena.',
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
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
          '94363142-f299-4331-9963-e76398478d72',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '5fcd906d-d489-449a-9f9d-d0d8f5ccc5cb',
          '2026-07-21',
          '09:14:00',
          'ACAL',
          'pix',
          'paid',
          10,
          '2026-07-21',
          10,
          7.333333333333333,
          2.666666666666667,
          'Venda oficial 2026-07-21 — Ana Raquel Lima de Araújo às 09:14.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          'a6c8c11a-6991-49bc-8003-9687f87311ab',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'dfb256dd-af52-4133-860c-04edf71e9fe0',
          '2026-07-21',
          '09:24:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Maria Clara Gomes Mororo às 09:24.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          'e88c1f24-4481-47d8-aed3-74c9d133a113',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '0aa3cfe8-f4f2-424e-8d79-817b326a0b65',
          '2026-07-21',
          '09:24:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Maria Mikelly Monteiro Coutinho às 09:24.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          '33101dc5-2354-4865-921c-caf5ee09557f',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '2a17be8e-8066-47ff-86dc-ac407b56539d',
          '2026-07-21',
          '09:47:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Gerb da Silva Maganos às 09:47.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          '0fd152b5-0c17-46d4-bab1-28744cac0e6b',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '483d90e0-4c8d-4aeb-bede-99f7dbb607b4',
          '2026-07-21',
          '09:48:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Maria Graziele Santos Oliveira às 09:48.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          '1dd08455-8585-4ff1-a5d1-94518debe767',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '4938ad82-55d2-4a8d-9b50-38ff364dba45',
          '2026-07-21',
          '09:48:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Vanderson Dias às 09:48.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          '080e399d-1444-4aec-89af-e59e1bd168a3',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'b8bc9c04-95d3-4e03-854a-887d6ef8962a',
          '2026-07-21',
          '09:49:00',
          'ACAL',
          'pix',
          'paid',
          10,
          '2026-07-21',
          10,
          7.333333333333333,
          2.666666666666667,
          'Venda oficial 2026-07-21 — Iury Guilherme às 09:49.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          'f1b15333-b0b7-4838-b625-f2b824f05128',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '6e6ef27c-cd75-41d5-8d72-085d53533b3e',
          '2026-07-21',
          '10:03:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Dayanna Kelly Costa Almeida às 10:03.',
          '2026-07-22T23:19:26.970Z',
          '2026-07-22T23:19:26.970Z'
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
          '7438eb66-108c-4e9d-a3ed-bb2400fd0a14',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '583b49ef-1244-4c15-824c-a3ea7d3b5f24',
          '2026-07-21',
          '11:28:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Francisco de Assis Soares Pereira às 11:28.',
          '2026-07-22T23:19:26.971Z',
          '2026-07-22T23:19:26.971Z'
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
          '3aa79941-d6f3-4dd9-989c-eeb9a0bbc82f',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'af0b5773-e615-4bdc-87d4-f80ae7a784df',
          '2026-07-21',
          '15:21:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-21',
          5,
          3.6666666666666665,
          1.3333333333333335,
          'Venda oficial 2026-07-21 — Anselmo Gabriel Freire da Silva às 15:21.',
          '2026-07-22T23:19:26.971Z',
          '2026-07-22T23:19:26.971Z'
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
          '9f2354d1-ccde-4422-81c0-5641951a2a90',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'a791206a-b10b-41c1-b715-4d0cba448f1b',
          '2026-07-20',
          '09:34:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-20',
          5,
          3.5,
          1.5,
          'Venda oficial 2026-07-20 — Raimunda Raimunda Sousa às 09:34.',
          '2026-07-22T23:24:59.084Z',
          '2026-07-22T23:24:59.084Z'
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
          '90d90e4d-2069-487e-8375-87a0da01d994',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '19aa6e8e-f97c-4ee9-8a4e-88e8e52f7363',
          '2026-07-20',
          '09:40:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-20',
          5,
          3.5,
          1.5,
          'Venda oficial 2026-07-20 — Lucas Moraes às 09:40.',
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
          '51e33796-8296-408d-9329-f19d190da122',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '4938ad82-55d2-4a8d-9b50-38ff364dba45',
          '2026-07-20',
          '09:50:00',
          'ACAL',
          'pix',
          'paid',
          10,
          '2026-07-20',
          10,
          7,
          3,
          'Venda oficial 2026-07-20 — Vanderson Dias às 09:50.',
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
          '46d44125-82b8-4d89-9826-3af3877390b2',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '6e6ef27c-cd75-41d5-8d72-085d53533b3e',
          '2026-07-20',
          '10:04:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-20',
          5,
          3.5,
          1.5,
          'Venda oficial 2026-07-20 — Dayanna Kelly Costa Almeida às 10:04.',
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
          'e2ae20b7-9824-47b1-a42a-58c9075d0810',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'ae4f21ac-8ff9-435a-ae71-f3f3d54ce40d',
          '2026-07-20',
          '10:48:00',
          'ACAL',
          'pix',
          'paid',
          10,
          '2026-07-20',
          10,
          7,
          3,
          'Venda oficial 2026-07-20 — Jackson Mendes Pinheiro às 10:48.',
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
          '3cb65572-9adf-448f-a070-614c482411dd',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '0aa3cfe8-f4f2-424e-8d79-817b326a0b65',
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
          'FIADO — horário não registrado oficialmente. PIX recebido em 21/07/2026.',
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
          'e81cf434-ccd4-4034-b669-f7e390c9080d',
          '00000000-0000-4000-8000-000000000001',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          '0606d23a-6fb4-4a72-b1c7-6cff6f292c2c',
          '2026-07-20',
          '12:10:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-20',
          5,
          3.5,
          1.5,
          'Venda oficial 2026-07-20 — Francisca Laize De Oliveira Ribeiro às 12:10.',
          '2026-07-22T23:24:59.085Z',
          '2026-07-22T23:24:59.085Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;