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
      

        INSERT INTO product_hypotheses (id, operation_day_id, flavor, hypothesis, confirmed, created_at, updated_at)
        VALUES (
          '40222d0c-0425-4e82-b280-ba1006aecbeb',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'Geral',
          'Manter 12 unidades na ACAL nesta semana.',
          NULL,
          '2026-07-23T01:44:15.782Z',
          '2026-07-23T01:44:15.782Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO operational_lessons (id, operation_day_id, content, tags, created_at, updated_at)
        VALUES (
          'f5b8ecdf-5976-4e31-a139-119cd79302bd',
          '1147ecd3-30d6-5277-b72d-0d3e1f0cdff7',
          'APRENDIZADO 01 — Preço de R$ 5,00 aceito sem objeções.

APRENDIZADO 02 — Nenhum pedido de desconto.

APRENDIZADO 03 — Nenhum pedido para pagar depois.

APRENDIZADO 04 — Todos os pagamentos via PIX.

APRENDIZADO 05 — Estoque inicial adequado.

APRENDIZADO 06 — Estratégia de começar pequeno mostrou-se correta.

APRENDIZADO 07 — Ainda não existem dados suficientes para concluir qual produto possui maior demanda.

DECISÃO ESTRATÉGICA (final do dia):
Aumentar gradualmente a produção para o dia seguinte (17/07/2026):
- 5 Croissants
- 4 Pastéis de Frango com Presunto
- 3 Mistos com Catupiry
Total: 12 unidades.
Decisão baseada exclusivamente nos dados do primeiro dia.',
          ARRAY['primeiro-dia', 'validacao', 'pix-100', 'estoque-zerado', 'germana-multipla']::text[],
          '2026-07-22T20:32:31.115Z',
          '2026-07-22T20:32:31.115Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO operational_lessons (id, operation_day_id, content, tags, created_at, updated_at)
        VALUES (
          '2d443c34-91c3-48a1-baaf-da8a0ae6d215',
          '758f0bc8-d4ae-5298-9be2-47d1db30ac9c',
          'APRENDIZADO 01 — Primeiro aumento de produção (9→12 un) validado — 100% vendido.

APRENDIZADO 02 — Concentração matinal (08:50–10:00) confirmada; vendas vespertinas também ocorrem.

APRENDIZADO 03 — Primeira recorrência intradiária identificada (Raimunda Raimunda Sousa).

APRENDIZADO 04 — Preço R$ 5,00 mantido sem objeções.

APRENDIZADO 05 — 100% PIX mantido.

APRENDIZADO 06 — Dados insuficientes para alterar mix de produção — manter crescimento gradual.

DECISÕES:
- Manter preço R$ 5,00
- Continuar crescimento gradual da produção
- Continuar registrando clientes
- Não alterar estratégia com apenas dois dias de histórico',
          ARRAY['segundo-dia', 'roo-0002', 'pix-100', 'estoque-zerado', 'raimunda-recorrente']::text[],
          '2026-07-22T23:09:05.150Z',
          '2026-07-22T23:09:05.150Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO operational_lessons (id, operation_day_id, content, tags, created_at, updated_at)
        VALUES (
          '29bdf527-50d6-4f26-8645-c0e1f9702ca4',
          '2b8b52ea-4418-5ccb-8dbe-c1edfb072c12',
          'APRENDIZADO 01 — Forte demanda antes do horário de chegada (08h00–08h30).

APRENDIZADO 02 — Coletar contatos gradualmente para encomendas antecipadas.

APRENDIZADO 03 — Salgado considerado perdido no dia anterior foi recuperado — apenas atraso no pagamento.

APRENDIZADO 04 — Produtos precisam ficar mais visíveis para conversão.

APRENDIZADO 05 — Meta matinal: 8–9 unidades até 10h.

APRENDIZADO 06 — Demanda reprimida 15h30–16h00 após esgotar estoque.

APRENDIZADO 07 — Terças mantêm demanda alta mesmo com menos funcionários.',
          ARRAY['meta-atingida', 'demanda-matinal', 'recebimentos-2007', 'homologado-a32-hotfix']::text[],
          '2026-07-22T23:19:26.971Z',
          '2026-07-22T23:19:26.971Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO operational_lessons (id, operation_day_id, content, tags, created_at, updated_at)
        VALUES (
          '4a7bc521-2086-4511-817a-0c4cf4a72cdc',
          '58c9044b-48f6-54eb-9149-3aec3040375e',
          'APRENDIZADO 01 — Preço não visível na placa (só QR Code zerado).

APRENDIZADO 02 — Pastel tornou-se sabor de maior saída.

APRENDIZADO 03 — Croissant abaixo do esperado no expediente; Henrique comprou 3 sobras às 21:00.

APRENDIZADO 04 — Misto com Catupiry em crescimento.

APRENDIZADO 05 — Fiado/atraso de pagamento não equivale a perda (Mikely + Anselmo).

APRENDIZADO 06 — Mix 6+5+4 validado para meta de 15 unidades.',
          ARRAY['meta-atingida', 'fiado-mikely', 'anselmo-recuperado', 'sobras-henrique', 'homologado-hotfix-2007']::text[],
          '2026-07-22T23:24:59.086Z',
          '2026-07-22T23:24:59.086Z'
        )
        ON CONFLICT (id) DO NOTHING;
      

        INSERT INTO operational_lessons (id, operation_day_id, content, tags, created_at, updated_at)
        VALUES (
          'cb542498-063d-41b8-bdaa-780c4f8250a3',
          'aa267a82-0d59-54a8-8f08-8568b832bd47',
          'APRENDIZADO 01 — Pastel em investigação: não assumir perda antes de confirmar.

APRENDIZADO 02 — Vendas em dinheiro exigem identificação posterior da cliente e dos sabores.

APRENDIZADO 03 — Manter 12 unidades na ACAL nesta semana.',
          ARRAY['pos-consolidacao', 'investigacao-pastel', 'sabor-nao-identificado', 'dinheiro-especie', 'operacao-real']::text[],
          '2026-07-23T01:44:15.782Z',
          '2026-07-23T01:44:15.782Z'
        )
        ON CONFLICT (id) DO NOTHING;