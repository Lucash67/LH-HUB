INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          'b688e50f-4f9e-4f43-8634-447f02d8582b',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'b688e50f-4f9e-4f43-8634-447f02d8582b',
          'Nova placa com QR Code e preço visível',
          'Criar placa contendo: QR Code, valor unitário, sabores disponíveis, mensagem chamativa e Pix pré-preenchido com R$ 5,00.',
          'planned',
          'diary',
          '2026-07-22T02:36:09.197Z',
          '2026-07-22T02:36:09.197Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '7b652e6e-37e9-4a99-821c-86f6d984b144',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '7b652e6e-37e9-4a99-821c-86f6d984b144',
          'Antecipar horário de chegada',
          'Hipótese: chegar antes das 08h30 pode capturar demanda atualmente perdida. Testar por 3 dias úteis e medir impacto.',
          'planned',
          'diary',
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '97a2e35a-8601-4b2a-bbae-63182d7f7ed2',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '97a2e35a-8601-4b2a-bbae-63182d7f7ed2',
          'Coletar contatos gradualmente',
          'Iniciar cadastro de telefone/WhatsApp dos clientes recorrentes para encomendas antecipadas.',
          'planned',
          'diary',
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '90cc4ade-2c1c-4421-b139-0b2f81f973f1',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '90cc4ade-2c1c-4421-b139-0b2f81f973f1',
          'Meta matinal até 10h',
          'Objetivo operacional: vender entre 8 e 9 unidades até 10h da manhã.',
          'planned',
          'diary',
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '30c47c03-1ad6-4f21-8df6-5c4452ac642f',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          '30c47c03-1ad6-4f21-8df6-5c4452ac642f',
          'Aumentar compra em dias de maior movimento',
          'Demanda reprimida após esgotar estoque (15h30–16h00). Considerar +2 a +4 unidades em terças/quintas.',
          'planned',
          'diary',
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          'e585196a-3392-410e-869e-b5dad8836e8b',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'e585196a-3392-410e-869e-b5dad8836e8b',
          'Melhorar exposição visual dos produtos',
          'Produtos mais visíveis aumentam conversão de clientes novos e facilitam acesso de recorrentes.',
          'planned',
          'diary',
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '0991ee79-c983-4efd-9f97-95fdc25e6535',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          '0991ee79-c983-4efd-9f97-95fdc25e6535',
          'Aumentar produção para 12 unidades (17/07)',
          '5 Croissants · 4 Pastéis · 3 Mistos — decisão baseada no primeiro dia.',
          'planned',
          'diary',
          '2026-07-22T20:32:31.115Z',
          '2026-07-22T20:32:31.115Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          'f027e6c1-3734-4f8f-9b86-ed930dc6ce68',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          'f027e6c1-3734-4f8f-9b86-ed930dc6ce68',
          'Modelar separação pagador/consumidor (futuro)',
          'Evidência: venda Germana 09:14 — pagador diferente de uma consumidora. Requisito arquitetural.',
          'planned',
          'diary',
          '2026-07-22T20:32:31.115Z',
          '2026-07-22T20:32:31.115Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '17ce0fac-38fd-44a3-9a65-ea97c72b9b35',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          '17ce0fac-38fd-44a3-9a65-ea97c72b9b35',
          'Continuar crescimento gradual da produção',
          'Manter preço R$ 5,00 e registrar clientes — decisão com base em 2 dias de histórico.',
          'planned',
          'diary',
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          '12bb6adc-fc32-56d8-a43f-be86c811c1fc',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'identificar-cliente-dinheiro-2207',
          'Identificar cliente dos 2 salgados em dinheiro',
          'Perguntar à Dona Raimunda nome da cliente e sabores (15:55).',
          'in_progress',
          'diary',
          '2026-07-23T01:44:15.782Z',
          '2026-07-23T01:44:15.782Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          'fa0e2f54-3714-5eb8-a064-82d46ca0ec28',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'pastel-investigacao-2207',
          'Pastel em investigação',
          '1 pastel (R$ 3,50 custo / R$ 5,00 potencial). Não contabilizar como perda.',
          'in_progress',
          'diary',
          '2026-07-23T01:44:15.782Z',
          '2026-07-23T01:44:15.782Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO operational_actions (id, operation_day_id, external_id, title, description, status, source, created_at, updated_at)
        VALUES (
          'fa161b72-a986-5905-9bd1-c04591fc3804',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'encomenda-misto-sexta',
          'Encomenda — 2 Mistos para sexta-feira',
          'Colega de trabalho do Henrique. Planejamento futuro — não é venda do dia.',
          'planned',
          'diary',
          '2026-07-23T01:44:15.782Z',
          '2026-07-23T01:44:15.782Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          'a33992ff-4cd0-493f-b3b1-804727402160',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'Pastel',
          'Pastel tornou-se o sabor de maior saída.',
          NULL,
          '2026-07-22T02:36:09.197Z',
          '2026-07-22T02:36:09.197Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          'd0131561-f7c0-430b-b77d-b3aef0cf23e3',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'Croissant',
          'Croissant perdeu força.',
          NULL,
          '2026-07-22T02:36:09.197Z',
          '2026-07-22T02:36:09.197Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          'eac9b2fe-f3ba-4e9b-a669-7a94df3dcd8c',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'Misto com Catupiry',
          'Misto com Catupiry apresentou crescimento.',
          NULL,
          '2026-07-22T02:36:09.197Z',
          '2026-07-22T02:36:09.197Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          '6c64bd23-f547-43e8-aeff-012fe0ed1f56',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'Geral',
          'Chegar mais cedo (antes de 08h30) pode aumentar significativamente o faturamento diário.',
          NULL,
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          '60e43b18-749b-417d-b5ff-7dece1b88701',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'Geral',
          'Terças e quintas mantêm demanda alta mesmo com menos funcionários — não reduzir compra nesses dias.',
          NULL,
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          'dcb60742-d606-41a2-a696-0377a4d62ecd',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'Pastel',
          'Pastel mantém alta demanda matinal.',
          NULL,
          '2026-07-22T02:36:09.204Z',
          '2026-07-22T02:36:09.204Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          '31d62b59-5e59-4f7c-ab59-ad10fda20ad4',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          'Geral',
          'Mix equilibrado (3+3+3) funcionou — dados insuficientes para favorito.',
          NULL,
          '2026-07-22T20:32:31.115Z',
          '2026-07-22T20:32:31.115Z'
        )
        ON CONFLICT (id) DO NOTHING;
INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          'd4b851f7-b24a-4fd9-ae8a-fd0c3f98af49',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'Geral',
          'Mix 5+4+3 executado conforme plano do dia 16 — dados insuficientes para favorito.',
          NULL,
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
        )
        ON CONFLICT (id) DO NOTHING;