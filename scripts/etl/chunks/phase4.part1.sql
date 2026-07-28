INSERT INTO sales (
          id, business_id, operation_day_id, client_id, sale_date, sale_time, department,
          payment_method, payment_status, amount_received, settlement_date,
          total_amount, total_cost, profit, notes, created_at, updated_at
        )
        VALUES (
          'c45bba10-e6f4-529c-ab24-e796a7bc1acb',
          '00000000-0000-4000-8000-000000000002',
          '294bcd8c-28ba-59c3-9054-0108e013163e',
          NULL,
          '2026-07-10',
          '00:00:00',
          'Brigadeiros',
          'pix',
          'paid',
          44,
          NULL,
          44,
          0,
          44,
          'LOTE 001 — 10/07/2026
Produto: Brigadeiro | Produção: 15 unidades | Preço unitário: R$ 3,00
Receita: R$ 44,00 | Lucro: R$ 44,00 | Custos: R$ 0,00
Observação: Uma venda foi realizada por R$ 5,00 para duas unidades, reduzindo o faturamento total de R$ 45,00 para R$ 44,00.',
          '2026-07-20T23:50:59.642Z',
          '2026-07-20T23:50:59.642Z'
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
          '81c32556-2af2-5d50-8eaa-f2acbc71e33e',
          '00000000-0000-4000-8000-000000000002',
          'd8dc2632-8967-5081-b775-7027b8f1747e',
          NULL,
          '2026-07-18',
          '00:00:00',
          'Brigadeiros',
          'pix',
          'paid',
          75,
          NULL,
          75,
          0,
          75,
          'LOTE 002 — 18/07/2026
Produto: Brigadeiro | Produção: 30 unidades | Vendidos: 25 | Perdidos: 2
Receita: R$ 75,00 | Lucro: R$ 75,00 | Custos: R$ 0,00
Observação: Os ingredientes foram pagos pelo pai do proprietário. Dois brigadeiros foram perdidos durante o armazenamento.',
          '2026-07-20T23:50:59.642Z',
          '2026-07-20T23:50:59.642Z'
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
          'f028cdad-f165-51d4-884f-76be4025499b',
          '00000000-0000-4000-8000-000000000002',
          '4b0af105-0f48-546f-8097-5228bd61b6b4',
          NULL,
          '2026-07-19',
          '00:00:00',
          'Brigadeiros',
          'pix',
          'paid',
          9,
          NULL,
          9,
          0,
          9,
          'FINALIZAÇÃO LOTE 002 — 19/07/2026
Vendidos: 3 unidades | Receita: R$ 9,00 | Lucro: R$ 9,00 | Custos: R$ 0,00
Observação: Venda das três unidades restantes do lote produzido em 18/07.',
          '2026-07-20T23:50:59.642Z',
          '2026-07-20T23:50:59.642Z'
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
          '414e45b3-e173-4262-83b4-3752a8e92c90',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '5d253d46-a2b3-444f-8d20-ec23a1a3732c',
          '2026-07-16',
          '09:09:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Primeiro dia oficial de operação ACAL (16/07/2026).
Venda: Diego Martins Pinheiro às 09:09.',
          '2026-07-22T20:32:31.109Z',
          '2026-07-22T20:32:31.109Z'
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
          'a14b4563-f088-4c9f-9f28-70bf23d75616',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '5f7272f3-b18f-437a-854f-58a5e6c373f7',
          '2026-07-16',
          '09:09:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-16 — Francisco Ricardo Feijão Pinho.',
          '2026-07-22T20:32:31.110Z',
          '2026-07-22T20:32:31.110Z'
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
          '6fb9383e-c896-4805-b3cd-3f6252e8a641',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '0b83ab66-b4a5-4551-9510-bb3c86c70680',
          '2026-07-16',
          '09:14:00',
          'ACAL',
          'pix',
          'paid',
          10,
          '2026-07-16',
          10,
          7,
          3,
          'Primeira venda múltipla do dia.
Pagador: Germana Nataeli de Oliveira.
Consumidoras: Germana Nataeli de Oliveira e Consumidora ainda não identificada.
A segunda consumidora será identificada futuramente — não cadastrada como cliente definitivo.',
          '2026-07-22T20:32:31.111Z',
          '2026-07-22T20:32:31.111Z'
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
          '81ad3c33-5e93-40ab-aa00-7cb4e6d7cc80',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '8546304d-73e2-40d7-a3e2-02872747ce5b',
          '2026-07-16',
          '09:16:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-16 — Daniele Gomes Silva.',
          '2026-07-22T20:32:31.111Z',
          '2026-07-22T20:32:31.111Z'
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
          '61fdb6fd-8026-42f5-9b93-cb48f82f202b',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '483d90e0-4c8d-4aeb-bede-99f7dbb607b4',
          '2026-07-16',
          '09:26:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-16 — Maria Graziele Santos Oliveira.',
          '2026-07-22T20:32:31.112Z',
          '2026-07-22T20:32:31.112Z'
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
          '2e49bf12-d11e-412e-9b2a-50ce70b80b98',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '4938ad82-55d2-4a8d-9b50-38ff364dba45',
          '2026-07-16',
          '09:29:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-16 — Vanderson Dias.',
          '2026-07-22T20:32:31.112Z',
          '2026-07-22T20:32:31.112Z'
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
          '5a76a718-5011-41bf-8391-0b2d395b7ebd',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '0aa3cfe8-f4f2-424e-8d79-817b326a0b65',
          '2026-07-16',
          '09:55:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-16 — Maria Mikelly Monteiro Coutinho.',
          '2026-07-22T20:32:31.113Z',
          '2026-07-22T20:32:31.113Z'
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
          '2ebe57e9-dd51-4bf2-8f32-165d056d0850',
          '00000000-0000-4000-8000-000000000001',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '6e6ef27c-cd75-41d5-8d72-085d53533b3e',
          '2026-07-16',
          '09:56:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-16',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-16 — Dayanna Kelly Costa Almeida.',
          '2026-07-22T20:32:31.113Z',
          '2026-07-22T20:32:31.113Z'
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
          '78dafea6-3455-4501-beed-c7afa234741f',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '2e620e6c-9e63-4c94-bb93-3c126e953e7a',
          '2026-07-17',
          '08:52:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Paulo André Cavalcante Oliveira.',
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
          '7330d97d-0fc0-4cd1-aa13-5deae5361341',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'a791206a-b10b-41c1-b715-4d0cba448f1b',
          '2026-07-17',
          '08:54:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Raimunda Raimunda Sousa.',
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
          '54294e39-5ab2-4fd4-af60-4b39098c0057',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '6e6ef27c-cd75-41d5-8d72-085d53533b3e',
          '2026-07-17',
          '09:02:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Dayanna Kelly Costa Almeida.',
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
          '2e237be7-db03-4732-8f3a-5c8f446a3d85',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'ae4f21ac-8ff9-435a-ae71-f3f3d54ce40d',
          '2026-07-17',
          '09:10:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Jackson Mendes Pinheiro.',
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
          'f8ee7b3e-db4c-4895-8225-f9dd787fe56e',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '2a17be8e-8066-47ff-86dc-ac407b56539d',
          '2026-07-17',
          '09:10:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Gerb da Silva Maganos.',
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
          '3bfd1a55-3f37-42d6-bf54-340313005a07',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'dfb256dd-af52-4133-860c-04edf71e9fe0',
          '2026-07-17',
          '09:25:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Maria Clara Gomes Mororo.',
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
          'bc4f37ae-558e-40b0-b054-959959269059',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '343d5089-6f19-4f74-8889-c0900d35afcd',
          '2026-07-17',
          '09:47:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Ana Letícia Ferreira dos Santos.',
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
          'e7362046-70a5-421b-b77f-efdd0b266cf6',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '9e73de9b-7d0b-4e38-8ebc-f9c102a75fd3',
          '2026-07-17',
          '09:55:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Maurício de Sá Machado Júnior.',
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
          'e59ae856-14e6-43b5-9675-1141c2dc6ca5',
          '00000000-0000-4000-8000-000000000001',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '19aa6e8e-f97c-4ee9-8a4e-88e8e52f7363',
          '2026-07-17',
          '09:59:00',
          'ACAL',
          'pix',
          'paid',
          5,
          '2026-07-17',
          5,
          3.5,
          1.5,
          'Venda ACAL 2026-07-17 — Lucas Moraes.',
          '2026-07-22T23:09:05.149Z',
          '2026-07-22T23:09:05.149Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          total_amount = EXCLUDED.total_amount,
          total_cost = EXCLUDED.total_cost,
          profit = EXCLUDED.profit,
          updated_at = EXCLUDED.updated_at;