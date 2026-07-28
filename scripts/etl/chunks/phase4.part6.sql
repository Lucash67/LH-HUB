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