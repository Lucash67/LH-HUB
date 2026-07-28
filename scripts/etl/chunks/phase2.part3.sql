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