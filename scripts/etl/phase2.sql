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
      

        INSERT INTO clients (id, name, sector, company, phone, notes, registered_business_id, created_at, updated_at)
        VALUES (
          '3fd8972d-1a05-4b02-a124-ce546992b7df',
          'José Inácio Silva da Cruz',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 2026-07-17.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T14:48:58.974Z',
          '2026-07-19T14:48:58.974Z'
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
          'b23f8d2f-0d1c-4c03-885c-140568889754',
          'Sandra',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.746Z',
          '2026-07-19T22:34:19.746Z'
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
          'cbc5d44e-636c-46a1-a62a-37874ee1eeca',
          'Gabi',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.765Z',
          '2026-07-19T22:34:19.765Z'
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
          '5d15a02e-0a7b-4581-bce5-f86380db2eb4',
          'Pai',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.786Z',
          '2026-07-19T22:34:19.786Z'
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
          'b08fe712-9ca1-479d-b0c7-4d45c5260943',
          'Levi',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.808Z',
          '2026-07-19T22:34:19.808Z'
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
          '45d5be45-d56d-4cae-a78b-53d98b2a3a7c',
          'Maria Luiza Pinheiro',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.834Z',
          '2026-07-19T22:34:19.834Z'
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
          '4813dcf2-a9c5-4a31-8fd2-738263b8bab1',
          'Ryan Mateus',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.854Z',
          '2026-07-19T22:34:19.854Z'
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
          'ac779dae-820e-45b5-ad03-57f9752d2c45',
          'Manuela',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.873Z',
          '2026-07-19T22:34:19.873Z'
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
          'd10044ab-525b-4e04-9785-2f6bcf730b1f',
          'Lara',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.896Z',
          '2026-07-19T22:34:19.896Z'
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
          '688828d9-b5f4-4065-a783-1a4b5908a4b8',
          'Morgana',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.917Z',
          '2026-07-19T22:34:19.917Z'
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
          '980164b2-eaac-49eb-8c96-321fd352425a',
          'Maria Clara',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.937Z',
          '2026-07-19T22:34:19.937Z'
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
          'f1f7a5d3-5487-4f01-a6e8-f92ed64390d9',
          'Maria Luiza Marinho',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:19.960Z',
          '2026-07-19T22:34:19.960Z'
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
          'c0f6406e-aba0-4706-914f-21fbe4fee413',
          'Luiz Davi',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:20.059Z',
          '2026-07-19T22:34:20.059Z'
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
          '8f8d485c-35a8-4201-9870-2c73435cc4cf',
          'Maria Luiza',
          'Brigadeiros',
          NULL,
          NULL,
          'Cliente identificado — operação Brigadeiros.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-19T22:34:20.220Z',
          '2026-07-19T22:34:20.220Z'
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
          '69a076ba-8b4a-491f-bf42-06d4e334cee8',
          'Henrique',
          'ACAL',
          NULL,
          NULL,
          'Comprador — operação Salgados.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-21T02:19:35.328Z',
          '2026-07-21T02:19:35.328Z'
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
          '4938ad82-55d2-4a8d-9b50-38ff364dba45',
          'Vanderson Dias',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados 2026-07-20.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-21T02:25:20.848Z',
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
          '0606d23a-6fb4-4a72-b1c7-6cff6f292c2c',
          'Francisca Laize De Oliveira Ribeiro',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados 2026-07-20.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-21T02:25:20.848Z',
          '2026-07-21T02:25:20.848Z'
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
          '5c8d7159-c08c-4b3d-8c4c-06d43e2a5231',
          'Bruno Medeiros Silva',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados 2026-07-20.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-21T02:25:20.848Z',
          '2026-07-21T02:25:20.848Z'
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
          'b6d20f20-adc8-4afb-8dc2-f6f759332527',
          'Leonardo De Sousa Sena',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados 2026-07-20.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-21T02:25:20.849Z',
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
          'af0b5773-e615-4bdc-87d4-f80ae7a784df',
          'Anselmo Gabriel Freire da Silva',
          'ACAL',
          NULL,
          NULL,
          'Cliente — unidade 20/07 paga via PIX em 21/07.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-22T02:35:00.638Z',
          '2026-07-22T02:35:00.638Z'
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
          '5fcd906d-d489-449a-9f9d-d0d8f5ccc5cb',
          'Ana Raquel Lima de Araújo',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-22T02:35:00.653Z',
          '2026-07-22T02:35:00.653Z'
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
          'b8bc9c04-95d3-4e03-854a-887d6ef8962a',
          'Iury Guilherme',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-22T02:35:00.653Z',
          '2026-07-22T02:35:00.653Z'
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
          '583b49ef-1244-4c15-824c-a3ea7d3b5f24',
          'Francisco de Assis Soares Pereira',
          'ACAL',
          NULL,
          NULL,
          'Cliente — operação Salgados.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-22T02:35:00.654Z',
          '2026-07-22T02:35:00.654Z'
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
          'f940fbc9-f7a5-4245-9156-5cfe0d2e7d2b',
          'Trabalho do Henrique',
          'Trabalho do Henrique',
          NULL,
          NULL,
          'Vendas no período 07:09–08:54 — operação 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.894Z',
          '2026-07-23T01:44:14.894Z'
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
          '4d179b24-0fc2-45be-8e2f-71e3f3cfa54e',
          'Alexandre Soares de Souza',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.904Z',
          '2026-07-23T01:44:14.904Z'
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
          '78fa224a-a00b-414a-94c3-824be5191482',
          'Francisco Anderson das Chagas',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.914Z',
          '2026-07-23T01:44:14.914Z'
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
          'c0dd1d2b-f5de-498b-806a-57c8201336c8',
          'Ismael Silva da Paz',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.926Z',
          '2026-07-23T01:44:14.926Z'
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
          'd79e8a37-d8d9-4379-be3e-53aeac9a0939',
          'Jonas Ferreira dos Santos',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — operação ACAL 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.937Z',
          '2026-07-23T01:44:14.937Z'
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
          '409bdd64-0595-4e16-b1ef-62416b1a1242',
          'PA',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado como PA — nome completo pendente. Operação ACAL 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.951Z',
          '2026-07-23T01:44:14.951Z'
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
          'fb9a9df8-8b0c-416c-bdc7-cbf6f0d677bf',
          'Cliente Não Identificado (22/07/2026)',
          'ACAL',
          NULL,
          NULL,
          '2 salgados em dinheiro às 15:55 — recebimento por Dona Raimunda. Sabores não informados. Aguardando identificação.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.962Z',
          '2026-07-23T01:44:14.962Z'
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
          '173d1b7d-b39c-4305-9b90-c12744f35f81',
          'Bernardo Ferreira Domingo',
          'ACAL',
          NULL,
          NULL,
          'Cliente identificado — sabor não informado. Operação ACAL 22/07/2026.',
          '00000000-0000-4000-8000-000000000001',
          '2026-07-23T01:44:14.980Z',
          '2026-07-23T01:44:14.980Z'
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          sector = EXCLUDED.sector,
          company = EXCLUDED.company,
          phone = EXCLUDED.phone,
          notes = EXCLUDED.notes,
          updated_at = EXCLUDED.updated_at;