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