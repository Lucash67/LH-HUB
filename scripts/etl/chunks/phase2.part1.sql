INSERT INTO products (id, business_id, name, category, unit_price, unit_cost, stock_quantity, min_stock, image_url, status, created_at, updated_at)
        VALUES (
          '5e4599bd-bf1a-45b8-90ef-29b7b1845a13',
          '00000000-0000-4000-8000-000000000001',
          'Croissant',
          'Salgados',
          5,
          3.75,
          0,
          0,
          NULL,
          'active',
          '2026-07-17T10:17:00.246Z',
          '2026-07-23T01:44:15.540Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          unit_price = EXCLUDED.unit_price,
          unit_cost = EXCLUDED.unit_cost,
          stock_quantity = EXCLUDED.stock_quantity,
          min_stock = EXCLUDED.min_stock,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
INSERT INTO products (id, business_id, name, category, unit_price, unit_cost, stock_quantity, min_stock, image_url, status, created_at, updated_at)
        VALUES (
          'b02d3653-0a5a-49ba-9ba0-2effb2f96f94',
          '00000000-0000-4000-8000-000000000001',
          'Misto com Catupiry',
          'Salgados',
          5,
          3.75,
          2,
          0,
          NULL,
          'active',
          '2026-07-17T10:17:00.271Z',
          '2026-07-23T01:44:15.551Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          unit_price = EXCLUDED.unit_price,
          unit_cost = EXCLUDED.unit_cost,
          stock_quantity = EXCLUDED.stock_quantity,
          min_stock = EXCLUDED.min_stock,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
INSERT INTO products (id, business_id, name, category, unit_price, unit_cost, stock_quantity, min_stock, image_url, status, created_at, updated_at)
        VALUES (
          'dc23feda-ff94-42b6-9889-aa6ea351a846',
          '00000000-0000-4000-8000-000000000001',
          'Pastel de Frango com Presunto',
          'Salgados',
          5,
          3.75,
          2,
          0,
          NULL,
          'active',
          '2026-07-17T10:17:00.290Z',
          '2026-07-23T01:44:15.563Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          unit_price = EXCLUDED.unit_price,
          unit_cost = EXCLUDED.unit_cost,
          stock_quantity = EXCLUDED.stock_quantity,
          min_stock = EXCLUDED.min_stock,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
INSERT INTO products (id, business_id, name, category, unit_price, unit_cost, stock_quantity, min_stock, image_url, status, created_at, updated_at)
        VALUES (
          'be61396e-a8b6-4db2-9d90-d68fbcefc972',
          '00000000-0000-4000-8000-000000000002',
          'Brigadeiro',
          'Brigadeiros',
          3,
          0,
          0,
          5,
          NULL,
          'active',
          '2026-07-19T22:34:17.507Z',
          '2026-07-20T23:50:59.642Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          unit_price = EXCLUDED.unit_price,
          unit_cost = EXCLUDED.unit_cost,
          stock_quantity = EXCLUDED.stock_quantity,
          min_stock = EXCLUDED.min_stock,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
INSERT INTO products (id, business_id, name, category, unit_price, unit_cost, stock_quantity, min_stock, image_url, status, created_at, updated_at)
        VALUES (
          '4da6e5b2-86ad-4f3e-8e71-9492f43f8291',
          '00000000-0000-4000-8000-000000000001',
          'Salgado (sabor não identificado)',
          'Salgados',
          5,
          3.75,
          0,
          0,
          NULL,
          'active',
          '2026-07-23T01:43:49.094Z',
          '2026-07-23T01:44:15.586Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          unit_price = EXCLUDED.unit_price,
          unit_cost = EXCLUDED.unit_cost,
          stock_quantity = EXCLUDED.stock_quantity,
          min_stock = EXCLUDED.min_stock,
          status = EXCLUDED.status,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '5d253d46-a2b3-444f-8d20-ec23a1a3732c',
          'Diego Martins Pinheiro',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-17T12:11:11.630Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '5f7272f3-b18f-437a-854f-58a5e6c373f7',
          'Francisco Ricardo Feijão Pinho',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-17T12:11:11.630Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '0b83ab66-b4a5-4551-9510-bb3c86c70680',
          'Germana Nataeli de Oliveira',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-17T12:11:11.630Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '8546304d-73e2-40d7-a3e2-02872747ce5b',
          'Daniele Gomes Silva',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-17T12:11:11.630Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '483d90e0-4c8d-4aeb-bede-99f7dbb607b4',
          'Maria Graziele Santos Oliveira',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-17T12:11:11.630Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '0aa3cfe8-f4f2-424e-8d79-817b326a0b65',
          'Maria Mikelly Monteiro Coutinho',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-17T12:11:11.630Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '6e6ef27c-cd75-41d5-8d72-085d53533b3e',
          'Dayanna Kelly Costa Almeida',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-16.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-17T12:11:11.630Z',
          '2026-07-21T06:01:16.000Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '2e620e6c-9e63-4c94-bb93-3c126e953e7a',
          'Paulo André Cavalcante Oliveira',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.880Z',
          '2026-07-19T14:48:58.880Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          'a791206a-b10b-41c1-b715-4d0cba448f1b',
          'Raimunda Raimunda Sousa',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.891Z',
          '2026-07-19T14:48:58.891Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          'ae4f21ac-8ff9-435a-ae71-f3f3d54ce40d',
          'Jackson Mendes Pinheiro',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.908Z',
          '2026-07-19T14:48:58.908Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '2a17be8e-8066-47ff-86dc-ac407b56539d',
          'Gerb da Silva Maganos',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.920Z',
          '2026-07-19T14:48:58.920Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          'dfb256dd-af52-4133-860c-04edf71e9fe0',
          'Maria Clara Gomes Mororo',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.932Z',
          '2026-07-19T14:48:58.932Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '343d5089-6f19-4f74-8889-c0900d35afcd',
          'Ana Letícia Ferreira dos Santos',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.942Z',
          '2026-07-19T14:48:58.942Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '9e73de9b-7d0b-4e38-8ebc-f9c102a75fd3',
          'Maurício de Sá Machado Júnior',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.953Z',
          '2026-07-19T14:48:58.953Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;
INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '19aa6e8e-f97c-4ee9-8a4e-88e8e52f7363',
          'Lucas Moraes',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.964Z',
          '2026-07-19T14:48:58.964Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;