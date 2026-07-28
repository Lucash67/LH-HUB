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
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '048dfd84-3468-41c1-8c23-d931a174cfb9',
          '6fb9383e-c896-4805-b3cd-3f6252e8a641',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          2,
          5,
          3.5,
          10,
          3
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '77a7778f-a4e3-4622-8eff-a1847a4e8c06',
          '81ad3c33-5e93-40ab-aa00-7cb4e6d7cc80',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '25132c98-6ee7-4636-b68b-6cd33cec69cb',
          '61fdb6fd-8026-42f5-9b93-cb48f82f202b',
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
          'fd16f3d4-a6c9-484b-a833-7f19683f6867',
          '2e49bf12-d11e-412e-9b2a-50ce70b80b98',
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
          '62441af2-e2c9-40b4-8f2c-47e8a223f6c6',
          '5a76a718-5011-41bf-8391-0b2d395b7ebd',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'c8eb9648-8c50-44cb-8142-5252bbcbaff4',
          '2ebe57e9-dd51-4bf2-8f32-165d056d0850',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '87195152-cc77-4684-af68-d59a0d7b952c',
          '78dafea6-3455-4501-beed-c7afa234741f',
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
          '134db2f2-2c4b-490a-9511-58c717cd7b70',
          '7330d97d-0fc0-4cd1-aa13-5deae5361341',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '5b02a09a-5a2c-4749-8d0d-2d771c2e217a',
          '54294e39-5ab2-4fd4-af60-4b39098c0057',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'cd338017-7e50-4185-9ea4-668c6b4174cf',
          '2e237be7-db03-4732-8f3a-5c8f446a3d85',
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
          'e4414f43-9207-4f6a-b5dd-c324d89799e7',
          'f8ee7b3e-db4c-4895-8225-f9dd787fe56e',
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
          '71ae5cd0-8fe3-49b3-8356-9843eb2cde98',
          '3bfd1a55-3f37-42d6-bf54-340313005a07',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'fd49b500-a9c8-4446-93c5-a03a531311a4',
          'bc4f37ae-558e-40b0-b054-959959269059',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'd49142ec-b897-4852-8be3-bafdc9bd75df',
          'e7362046-70a5-421b-b77f-efdd0b266cf6',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '840964a9-0075-41af-9cb1-50504a8f9f5e',
          'e59ae856-14e6-43b5-9675-1141c2dc6ca5',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'b8c33fb9-d2ff-4e59-8231-241252351f6a',
          'aaa82e7a-5206-43fb-9cd3-e5b4dc4b4d79',
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
          '8252f2a2-1d05-46e9-af22-718522a4e723',
          '4c084c44-cdce-4af8-a23a-e2c9eb943f4d',
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
          'eaee6c02-0e38-451a-9860-fbbd5b7f9e26',
          '8bb50151-74ac-457d-a8d0-74ccc448360e',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'e628c50b-449d-42c6-8b62-72741450c852',
          '94363142-f299-4331-9963-e76398478d72',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '69111339-7f55-48f6-8acd-7aaa4d9f9e6c',
          '94363142-f299-4331-9963-e76398478d72',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '6c99d6b1-df2d-4cbc-af53-98868d5a8aff',
          'a6c8c11a-6991-49bc-8003-9687f87311ab',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '9883f9a8-557c-488d-92c5-54416a42737e',
          'e88c1f24-4481-47d8-aed3-74c9d133a113',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'de10c832-39bb-4cb2-8ece-cca07fa7aea8',
          '33101dc5-2354-4865-921c-caf5ee09557f',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '084d89e9-0ddd-4d22-aa9e-c7b6815b432b',
          '0fd152b5-0c17-46d4-bab1-28744cac0e6b',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'f6c89421-044c-46b8-af87-4362d2fe0a97',
          '1dd08455-8585-4ff1-a5d1-94518debe767',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'd89c4950-6860-4ec1-80cb-249a21143b74',
          '080e399d-1444-4aec-89af-e59e1bd168a3',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'c07a4fa6-a1e3-42de-96dc-321a2092a95a',
          '080e399d-1444-4aec-89af-e59e1bd168a3',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'ce1c6ed4-e9de-4dc2-8fa4-275f64b57bf2',
          'f1b15333-b0b7-4838-b625-f2b824f05128',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '0e9169d2-be74-451f-ad29-35c2bcaefaa6',
          '7438eb66-108c-4e9d-a3ed-bb2400fd0a14',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '7156d5ad-3700-444e-aaa3-3e756a5eaefc',
          '3aa79941-d6f3-4dd9-989c-eeb9a0bbc82f',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.6666666666666665,
          5,
          1.3333333333333335
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '396c07d1-47ac-4474-839a-7615a43aa680',
          '9f2354d1-ccde-4422-81c0-5641951a2a90',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '2e1fae29-7bb0-401a-85d5-282836bb2197',
          '90d90e4d-2069-487e-8375-87a0da01d994',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'ec2210ad-8c67-4e87-a975-977df52a70b0',
          '51e33796-8296-408d-9329-f19d190da122',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          2,
          5,
          3.5,
          10,
          3
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '53580901-4f9c-438e-9fbf-8b6d82371640',
          '46d44125-82b8-4d89-9826-3af3877390b2',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '86af7e17-8917-4304-957e-c199d0b0824a',
          'e2ae20b7-9824-47b1-a42a-58c9075d0810',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          2,
          5,
          3.5,
          10,
          3
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'fa73e3a8-3c31-4b56-a550-2a5f67e794d0',
          '3cb65572-9adf-448f-a070-614c482411dd',
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
          'f629d7fb-8a2a-4ce4-a8f8-2784b0989167',
          'e81cf434-ccd4-4034-b669-f7e390c9080d',
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
          '14147318-99ed-4bde-a7cd-82370a1cfb87',
          'e5a46c54-8734-409e-8c99-d9ef2fc28c0f',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'c7dcfccc-3774-4b92-8554-8ae7b2e77ff7',
          '2070f725-2e2d-41ad-9dc7-34b5d9343ffa',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.5,
          5,
          1.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '04c96f9c-43d8-46f4-aa46-6f4d586aef73',
          '123b0afe-3290-43d0-906c-102dfb92f3d0',
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
          '9eaded2b-8411-487a-b3ac-4f5a59b84aaa',
          '8804b8e7-fd82-49de-aa92-4e6f2c389500',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          3,
          5,
          3.5,
          15,
          4.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'aa608866-02b3-4eb0-af95-331f3dc6bba7',
          'cd92a70e-5221-4520-a471-37a483b9e07a',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          3,
          5,
          3.75,
          15,
          3.75
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '33106b55-9d59-4a42-9f9f-97147cf49bf9',
          '7e8a34f6-22d2-4f36-b03f-65714c33da65',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '5e9828e3-4b73-4cff-9b26-f402b3fdea20',
          '622780e6-6963-4f44-91db-2570e6e6266b',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'f594bf97-22ef-4478-b5c2-119753c0a643',
          '6b503bdb-d2d7-4a3b-9edf-8d47b74e180d',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '1e3cc6ec-d0bb-49e9-8632-4e0c837b50c6',
          '1db2939a-2b68-40f7-a08f-aaefc796d94d',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'e62d9cc7-58cd-451f-a132-2e7a303d6cbb',
          '5e3abb71-1363-4ee5-88fd-a896ce410267',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '8ea7f98b-8bd6-4957-bc16-0999c5bab1db',
          'f434a198-c485-4c4a-a4c3-3b5f3a7b77dc',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '1e2aee8f-fe4c-4c62-8a5d-87e7fd9ec935',
          '010213ce-0741-4c01-8dd1-392048edcbac',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          'c74315b5-98a7-4a12-abf2-ebe26bf265e7',
          'ade95db6-2a70-4df3-875e-7f2f9a1f95cf',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '1c424868-10b9-4844-a8cd-e65dbef16a3b',
          'ccc884b0-83b7-403e-aade-bd37b6d0be12',
          '4da6e5b2-86ad-4f3e-8e71-9492f43f8291',
          2,
          5,
          3.75,
          10,
          2.5
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, unit_cost, subtotal, profit)
        VALUES (
          '6e4f6c2c-109f-43ee-bb76-829e967ecd1f',
          'f23f8546-3a77-4660-b128-fbd481673adc',
          '4da6e5b2-86ad-4f3e-8e71-9492f43f8291',
          1,
          5,
          3.75,
          5,
          1.25
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO cash_flow_events (id, business_id, operation_day_id, event_type, category, description, amount, event_date, created_at)
        VALUES (
          '6d5ec7e1-b7a7-4df7-9135-69e36a2d78c3',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'income',
          'recebimento_venda_anterior',
          'PIX recebido — Maria Mikelly Monteiro Coutinho — venda 20/07/2026',
          5,
          '2026-07-21',
          '2026-07-22T20:22:48.546Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO cash_flow_events (id, business_id, operation_day_id, event_type, category, description, amount, event_date, created_at)
        VALUES (
          'b0e05195-962b-4c88-a3d6-062cf2476edd',
          '00000000-0000-4000-8000-000000000001',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'income',
          'recebimento_venda_anterior',
          'PIX recebido — Anselmo Gabriel Freire da Silva — venda 20/07/2026',
          5,
          '2026-07-21',
          '2026-07-22T20:22:48.559Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '5b22dced-9adc-4593-9141-fde1d2cdc562',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          'entry',
          5,
          5,
          'Produção ACAL 2026-07-17 — ROO-0002',
          '2026-07-19T14:48:58.831Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '0e582a99-268a-4ae3-92b2-985d5c3efcf2',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          'entry',
          4,
          4,
          'Produção ACAL 2026-07-17 — ROO-0002',
          '2026-07-19T14:48:58.850Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '717794ce-7bfc-4b83-be51-6e6af21880da',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          'entry',
          3,
          3,
          'Produção ACAL 2026-07-17 — ROO-0002',
          '2026-07-19T14:48:58.863Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '97e28112-2f2d-416b-8940-b7c85d9eda1e',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          'entry',
          15,
          15,
          'LOTE 001 — produção 2026-07-10 (15 unidades).',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '734da9e6-5611-4c87-b3cb-0d08236a1b52',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          'exit',
          15,
          0,
          'LOTE 001 — venda agregada 2026-07-10 (15 unidades, 44.00).',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '47cf94b7-8805-495f-a407-cfb9142567d9',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          'entry',
          30,
          30,
          'LOTE 002 — produção 2026-07-18 (30 unidades).',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '82e7c7f7-b32b-4ad9-a8af-a8c06c4cf3b3',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          'adjustment',
          2,
          28,
          'LOTE 002 — 2 unidades perdidas no armazenamento.',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          'cffeaca5-11ee-4213-a9ff-86b1767262f5',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          'exit',
          25,
          3,
          'LOTE 002 — venda agregada 2026-07-18 (25 unidades, 75.00).',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          'de955735-8336-4ac0-82a1-02df37e043f1',
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          'exit',
          3,
          0,
          'FINALIZAÇÃO LOTE 002 — venda agregada 2026-07-19 (3 unidades, 9.00).',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '672d3417-5498-4392-a16d-7c5b4659d022',
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          'entry',
          5,
          5,
          'Compra diária 2026-07-22 — 15 unidades (5+5+5)',
          '2026-07-23T01:44:14.858Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '5f54c52b-321f-4418-abf8-be926007297e',
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          'entry',
          5,
          5,
          'Compra diária 2026-07-22 — 15 unidades (5+5+5)',
          '2026-07-23T01:44:14.871Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO stock_movements (id, product_id, movement_type, quantity, balance_after, reason, created_at)
        VALUES (
          '46943d22-206c-4052-a265-16c4cf4192aa',
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          'entry',
          5,
          5,
          'Compra diária 2026-07-22 — 15 unidades (5+5+5)',
          '2026-07-23T01:44:14.883Z'
        )
        ON CONFLICT (id) DO NOTHING;