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