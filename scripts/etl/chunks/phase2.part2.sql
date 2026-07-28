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