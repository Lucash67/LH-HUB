# Modelo de Domínio V1 — Lucas Business OS

**Sprint 4.1A — Modelagem Conceitual**  
**Data:** 2026-07-22  
**Status:** Proposta para validação antes da Sprint 4.1B  
**Escopo:** Negócio e responsabilidades — sem implementação de persistência

---

## 1. Visão geral

O Lucas Business OS é um sistema de gestão operacional para múltiplos empreendimentos de alimentação (ex.: Salgados/ACAL, Brigadeiros). O modelo conceitual prioriza:

1. **Operação de negócio** como eixo de escopo (multi-operação).
2. **Dia operacional** como unidade natural de registro e auditoria.
3. **Separação** entre fato comercial (venda), fato financeiro (investimento, recebimento) e inteligência operacional (diário).
4. **Cliente global** capaz de comprar em operações distintas.
5. **Visão dual** operação × operador como interpretação financeira, não como duplicação de vendas.

Este documento **não replica** a estrutura SQLite. Repensa o domínio com base no comportamento real do sistema e nas auditorias 4.0A e 4.0B.

---

## 2. Domínios identificados

| # | Domínio | Propósito |
|---|---------|-----------|
| 1 | **Organização** | Estruturar múltiplas operações de negócio no mesmo painel |
| 2 | **Cadastro** | Entidades mestras reutilizáveis (produtos, clientes) |
| 3 | **Operação Diária** | Unidade de trabalho do operador por dia e por negócio |
| 4 | **Comercial** | Registro de transações de venda |
| 5 | **Estoque** | Movimentação física de unidades |
| 6 | **Financeiro** | Investimento, receita, fluxo de caixa e visão do operador |
| 7 | **Inteligência Operacional** | Diário, aprendizados, hipóteses, ações e pendências |
| 8 | **Metas** | Objetivos quantitativos por período |
| 9 | **Configuração** | Preferências e parâmetros do sistema |
| 10 | **Motor de Operações** | Entrada em linguagem natural e trilha de auditoria |
| 11 | **Análise** *(projeção)* | KPIs, dashboards e relatórios — **não persistidos como entidades** |

---

## 3. Entidades por domínio

### 3.1 Organização

#### Operação de Negócio
- **Objetivo:** Representar um empreendimento distinto (Salgados, Brigadeiros, futuros).
- **Responsabilidade:** Delimitar escopo de produtos, vendas, metas, investimentos e diários.
- **Quem utiliza:** Seletor global da aplicação, Dashboard, Financeiro, Metas, Diário, Analytics.
- **Relaciona-se com:** Produto, Venda, Meta, Dia Operacional, Investimento do Dia, Inteligência Operacional.
- **Dependências:** Nenhuma (raiz organizacional).
- **Fluxo:** Toda leitura/escrita operacional filtra ou associa a uma Operação de Negócio.

---

### 3.2 Cadastro

#### Produto
- **Objetivo:** Catálogo vendável de uma operação (sabor, preço de referência, custo de referência).
- **Responsabilidade:** Identidade comercial do item; base para itens de venda e movimentos de estoque.
- **Quem utiliza:** Produtos, Vendas, Estoque, Compra Diária, CRM (produto favorito), Analytics, Motor de Operações.
- **Relaciona-se com:** Operação de Negócio, Item de Venda, Linha de Compra, Movimento de Estoque.
- **Dependências:** Operação de Negócio.
- **Fluxo:** Cadastrado → entra em estoque via compra → consumido por vendas.

#### Cliente
- **Objetivo:** Pessoa ou identificação comercial que realiza compras.
- **Responsabilidade:** Identidade única no CRM; histórico transversal entre operações.
- **Quem utiliza:** CRM, Vendas, Dashboard (alertas de pendência), Analytics.
- **Relaciona-se com:** Venda, Perfil CRM (projeção).
- **Dependências:** Nenhuma obrigatória (global).
- **Fluxo:** Cadastro ou resolução na venda → acumula histórico → alimenta CRM e inteligência comercial.

#### Canal / Departamento *(conceito implícito hoje)*
- **Objetivo:** Distinguir contexto de venda (ex.: ACAL, Trabalho do Henrique).
- **Responsabilidade:** Segmentar vendas do mesmo dia sem duplicar operação de negócio.
- **Quem utiliza:** Vendas, Diário, Analytics por canal.
- **Relaciona-se com:** Venda, Dia Operacional.
- **Dependências:** Operação de Negócio.
- **Fluxo:** Atribuído no registro da venda; agrega relatórios do dia.

> **Nota:** Hoje existe como atributo da venda; no modelo V1 permanece conceito associado à Venda, não entidade autônoma até haver cadastro próprio.

---

### 3.3 Operação Diária

#### Dia Operacional *(nova entidade agregadora — conceitual)*
- **Objetivo:** Representar um dia de trabalho oficial de uma operação de negócio.
- **Responsabilidade:** Agrupar compra, vendas, investimento, inteligência e pendências de um mesmo `(operação, data)`.
- **Quem utiliza:** Diário, Dashboard contextual, Financeiro do dia, Daily Purchases, validações oficiais.
- **Relaciona-se com:** Compra Diária, Vendas do dia, Registro de Diário, Investimento(s) do Dia, Pendências Operacionais.
- **Dependências:** Operação de Negócio, data calendário.
- **Fluxo:** Abertura do dia (compra) → vendas ao longo do dia → fechamento conceitual (resumo, lucro, pendências) → alimenta Dashboard e Analytics.

> **Motivação:** Hoje o “dia” está fragmentado entre JSON de diário, tabelas operacionais e vendas isoladas. O Dia Operacional unifica o conceito de negócio sem alterar ainda a implementação.

---

### 3.4 Comercial

#### Venda
- **Objetivo:** Registrar uma transação comercial (quem comprou, quando, quanto, forma e status de pagamento).
- **Responsabilidade:** Fato comercial atômico; base de receita operacional e CRM.
- **Quem utiliza:** Vendas, Dashboard, Financeiro, CRM, Metas, Analytics, Motor de Operações.
- **Relaciona-se com:** Cliente, Itens da Venda, Operação de Negócio, Dia Operacional, Liquidação Financeira (quando pagamento ocorre em data diferente).
- **Dependências:** Operação de Negócio, Produto(s), Cliente (opcional em casos especiais).
- **Fluxo:** Registro → itens calculados → impacto estoque → agrega receita/lucro do dia → aparece no CRM.

#### Item de Venda
- **Objetivo:** Detalhar produto e quantidade dentro de uma venda.
- **Responsabilidade:** Granularidade para mix de produtos, margem por item e analytics de sabor.
- **Quem utiliza:** Vendas, Analytics, CRM (produto favorito).
- **Relaciona-se com:** Venda, Produto.
- **Dependências:** Venda, Produto.
- **Fluxo:** Sempre subordinado a uma Venda; nunca existe isolado.

#### Liquidação / Recebimento *(conceito — parcialmente em fluxo de caixa hoje)*
- **Objetivo:** Registrar quando o dinheiro efetivamente entrou, se diferente da data da venda.
- **Responsabilidade:** Separar **receita operacional do dia** de **entrada de caixa** (ex.: PIX recebido no dia seguinte).
- **Quem utiliza:** Financeiro, Operator Finance, Cash Flow.
- **Relaciona-se com:** Venda (referência), Evento de Fluxo de Caixa.
- **Dependências:** Venda ou origem externa documentada.
- **Fluxo:** Venda no dia D → recebimento registrado em D ou D+n → Dashboard distingue receita vs caixa.

> **Consolidação proposta:** Absorver o papel da entidade `Pagamento` redundante hoje — liquidação passa a ser aspecto da Venda ou Evento de Fluxo de Caixa, não terceira entidade paralela.

---

### 3.5 Estoque

#### Movimento de Estoque
- **Objetivo:** Registrar entradas, saídas e ajustes físicos de unidades.
- **Responsabilidade:** Trilha auditável de estoque; explicar saldo atual por produto.
- **Quem utiliza:** Estoque, Compra Diária (entrada), Vendas (saída implícita).
- **Relaciona-se com:** Produto, Compra Diária, Venda.
- **Dependências:** Produto.
- **Fluxo:** Compra → entrada → vendas → saídas → saldo derivável.

#### Saldo de Estoque *(projeção — não entidade persistida)*
- **Objetivo:** Quantidade disponível atual por produto.
- **Responsabilidade:** Estado calculado a partir de movimentos e vendas.
- **Quem utiliza:** Estoque, Dashboard, alertas de estoque baixo.
- **Relaciona-se com:** Produto, Movimento de Estoque.

> **Eliminação conceitual:** `quantidade vendida acumulada` no produto deixa de ser entidade/atributo mestre — passa a projeção analítica.

---

### 3.6 Financeiro

#### Compra Diária
- **Objetivo:** Registrar a aquisição de mercadoria do dia (unidades e mix).
- **Responsabilidade:** Origem do estoque do dia; base de custo unitário da operação diária.
- **Quem utiliza:** Diário, Daily Purchases, Financeiro, Operator Finance.
- **Relaciona-se com:** Dia Operacional, Linha de Compra, Investimento do Dia, Movimento de Estoque.
- **Dependências:** Operação de Negócio, data.
- **Fluxo:** Operador registra compra → gera linhas por sabor → associa investimento → alimenta estoque.

#### Linha de Compra
- **Objetivo:** Detalhar quantidade por produto/sabor na compra diária.
- **Responsabilidade:** Mix de produção do dia.
- **Quem utiliza:** Diário, Daily Purchases, planejamento de compra inteligente.
- **Relaciona-se com:** Compra Diária, Produto.
- **Dependências:** Compra Diária.

#### Investimento do Dia
- **Objetivo:** Registrar capital aplicado na compra diária.
- **Responsabilidade:** Custo total e origem dos recursos (próprio vs terceiro).
- **Quem utiliza:** Financeiro, Operator Finance, Analytics.
- **Relaciona-se com:** Compra Diária, Fonte de Capital, Dia Operacional.
- **Dependências:** Operação de Negócio, data.
- **Fluxo:** Pode ter **múltiplas fontes** no mesmo dia (ex.: R$ 22,50 próprio + R$ 30,00 familiar).

#### Fonte de Capital *(conceito explícito — implícito hoje)*
- **Objetivo:** Identificar quem financiou (operador, familiar Henrique, etc.).
- **Responsabilidade:** Alimentar visão **Operador × Operação** sem distorcer lucro operacional.
- **Quem utiliza:** Operator Finance, Financeiro.
- **Relaciona-se com:** Investimento do Dia.
- **Dependências:** Investimento do Dia.

#### Evento de Fluxo de Caixa
- **Objetivo:** Registrar entradas/saídas monetárias que **não são vendas do dia** ou que **liquidar vendas anteriores**.
- **Responsabilidade:** Caixa real vs receita operacional; recebimentos tardios; despesas extraordinárias.
- **Quem utiliza:** Financeiro, Operator Finance, Analytics.
- **Relaciona-se com:** Operação de Negócio *(deve passar a existir)*, Venda (referência opcional), Dia Operacional.
- **Dependências:** Operação de Negócio, data.
- **Fluxo:** Recebimento de venda anterior → categoria `recebimento_venda_anterior` → não infla receita do dia atual.

#### Visão Financeira Dual *(serviço de domínio — não entidade)*
- **Objetivo:** Interpretar mesmos fatos em camadas **Operação** (negócio) e **Operador** (bolso).
- **Responsabilidade:** Calcular lucro operacional, ganho líquido do operador, reconciliação.
- **Quem utiliza:** Financeiro, Dashboard executivo.
- **Relaciona-se com:** Vendas, Investimentos, Eventos de Fluxo de Caixa.

---

### 3.7 Inteligência Operacional

#### Registro de Diário
- **Objetivo:** Documentar narrativa oficial do dia (observações, resumo, margem, metas).
- **Responsabilidade:** Fonte de verdade qualitativa e números consolidados homologados.
- **Quem utiliza:** Diário Operacional, Dashboard (contexto do dia), validações oficiais.
- **Relaciona-se com:** Dia Operacional, Aprendizado, Hipótese, Ação Sugerida, Pendência, Perda Operacional.
- **Dependências:** Dia Operacional.
- **Fluxo:** Operador registra → consolida inteligência → alimenta prioridades e metas futuras.

> **Consolidação proposta:** Substituir duplicidade atual (JSON em `notes` + tabelas espelho) por **uma canonical story** com projeções derivadas.

#### Aprendizado Operacional
- **Objetivo:** Capturar lições do dia para decisões futuras.
- **Responsabilidade:** Memória organizacional da operação.
- **Quem utiliza:** Diário, Insights, planejamento.
- **Relaciona-se com:** Registro de Diário, Dia Operacional.

#### Hipótese de Produto
- **Objetivo:** Registrar suposições sobre demanda/sabor a confirmar com mais dados.
- **Responsabilidade:** Inteligência comercial em formação.
- **Quem utiliza:** Diário, Analytics de mix.
- **Relaciona-se com:** Registro de Diário, Produto (conceitual).

#### Ação Sugerida
- **Objetivo:** Plano de ação derivado do dia (investigar pastel, identificar cliente, encomenda futura).
- **Responsabilidade:** Ponte entre registro e execução futura; status (planejada, em progresso, concluída).
- **Quem utiliza:** Dashboard prioridades, Diário.
- **Relaciona-se com:** Registro de Diário.

#### Pendência Operacional *(conceito reforçado)*
- **Objetivo:** Representar incerteza formal (sabor não identificado, pastel em investigação, cliente a identificar).
- **Responsabilidade:** Preservar lacunas **sem assumir perda ou dado inventado** — princípio ADR operacional.
- **Quem utiliza:** Diário, Dashboard, validações.
- **Relaciona-se com:** Registro de Diário, Produto, Cliente, Venda.
- **Dependências:** Dia Operacional.
- **Fluxo:** Registrada explicitamente → resolvida posteriormente sem alterar cronologia histórica.

#### Perda Operacional
- **Objetivo:** Registrar unidades não vendidas **confirmadas** como perda.
- **Responsabilidade:** Diferenciar perda confirmada de pendência em investigação.
- **Quem utiliza:** Diário, Dashboard alertas.
- **Relaciona-se com:** Registro de Diário, Produto, Dia Operacional.

#### Encomenda Futura *(entidade ausente hoje — recomendada)*
- **Objetivo:** Planejar venda futura (ex.: 2 Mistos para sexta-feira).
- **Responsabilidade:** Diferenciar **planejamento** de **venda do dia** — hoje misturado em ações do diário.
- **Quem utiliza:** Diário, Metas, CRM (futuro).
- **Relaciona-se com:** Cliente, Produto, Operação de Negócio, data prevista.

---

### 3.8 Metas

#### Meta
- **Objetivo:** Definir alvo quantitativo (receita, unidades) por período e operação.
- **Responsabilidade:** Referência para Dashboard, Metas Inteligentes e comparativos.
- **Quem utiliza:** Metas, Smart Goals, Dashboard, Diário (meta diária de unidades).
- **Relaciona-se com:** Operação de Negócio, Vendas (progresso calculado).
- **Dependências:** Operação de Negócio.

---

### 3.9 Configuração

#### Configuração do Sistema
- **Objetivo:** Armazenar preferências chave-valor (metas padrão, parâmetros UI).
- **Responsabilidade:** Parametrização sem redeploy.
- **Quem utiliza:** Configurações, backfill de metas diárias.
- **Relaciona-se com:** Meta (sincronização de meta diária em unidades).

---

### 3.10 Motor de Operações

#### Execução de Operação
- **Objetivo:** Representar tentativa de registrar negócio via linguagem natural.
- **Responsabilidade:** Orquestrar interpretação → efeitos → eventos.
- **Quem utiliza:** `/api/operations`, `/dev/operacoes`.
- **Relaciona-se com:** Payload, Interpretação, Registro de Efeito, Evento de Domínio, Venda (efeito típico).

#### Payload de Operação
- **Objetivo:** Preservar entrada bruta do operador.
- **Responsabilidade:** Auditoria e replay futuro.

#### Interpretação de Operação
- **Objetivo:** Resultado estruturado da NLP/regras sobre o payload.

#### Registro de Efeito
- **Objetivo:** Rastrear mutações causadas (venda criada, estoque alterado).

#### Evento de Domínio
- **Objetivo:** Trilha event-sourcing para integrações e debug.

> Domínio **transversal de auditoria** — não participa do fluxo operacional diário real hoje (0 execuções), mas permanece no roadmap do Engine.

---

### 3.11 Análise *(projeções — não entidades de negócio)*

| Projeção | Origem conceitual |
|----------|-------------------|
| KPIs do Dashboard | Vendas, Metas, Diário, Investimentos |
| CRM Profile | Cliente + Vendas + Produtos |
| Rankings / Calendário / Projeções | Vendas agregadas |
| Operator Finance Summary | Visão Financeira Dual |
| Relatório exportável | Analytics on-the-fly |

> **Eliminação:** entidade `Relatório` persistido — substituída por geração sob demanda.

---

## 4. Mapa conceitual de relacionamentos

```
                    ┌─────────────────────┐
                    │  Operação de Negócio │
                    └──────────┬──────────┘
           ┌───────────────────┼───────────────────┐
           ▼                   ▼                   ▼
    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐
    │   Produto   │    │     Meta     │    │ Dia Operac. │
    └──────┬──────┘    └──────────────┘    └──────┬──────┘
           │                                      │
           │         ┌────────────────────────────┤
           │         │                            │
           ▼         ▼                            ▼
    ┌─────────────┐  ┌──────────────┐    ┌─────────────────┐
    │ Movimento   │  │ Compra Diária│───►│ Investimento    │
    │ de Estoque  │  │ + Linhas     │    │ + Fonte Capital │
    └─────────────┘  └──────────────┘    └─────────────────┘
           ▲                 │
           │                 │
    ┌──────┴──────┐          │
    │   Cliente   │          │
    └──────┬──────┘          │
           │                 │
           ▼                 ▼
    ┌─────────────┐    ┌──────────────────┐
    │    Venda    │───►│ Registro Diário  │
    │ + Itens     │    │ + Aprendizados   │
    └──────┬──────┘    │ + Hipóteses      │
           │           │ + Ações          │
           │           │ + Pendências     │
           ▼           │ + Perdas         │
    ┌─────────────┐    └────────┬─────────┘
    │ Liquidação /│             │
    │ Fluxo Caixa │             ▼
    └──────┬──────┘    ┌──────────────────┐
           │           │    Dashboard     │
           └──────────►│  Financeiro CRM  │
                       │    Analytics     │
                       └──────────────────┘

    Motor de Operações ──(interpreta)──► Venda / Efeitos
```

---

## 5. Fluxos conceituais principais

### 5.1 Fluxo operacional diário (pós-consolidação histórica)

```
Operação de Negócio
    → Dia Operacional (data)
        → Compra Diária + Investimento(s) + Fonte de Capital
        → Movimentos de Estoque (entrada)
        → Venda(s) + Item(ns) + Cliente
        → Pendências / Perdas (se houver)
        → Registro de Diário (consolidação oficial)
    → Projeções: Dashboard · Financeiro · CRM · Analytics
```

### 5.2 Fluxo comercial → financeiro

```
Cliente → Venda → Itens → Produto
              ↓
    Receita/Lucro operacional do dia
              ↓
    (se pagamento tardio) → Evento Fluxo de Caixa
              ↓
    Visão Financeira Dual (Operação × Operador)
              ↓
    Dashboard / Financeiro
```

### 5.3 Fluxo de inteligência

```
Dia Operacional
    → Registro de Diário
        → Aprendizados · Hipóteses · Ações · Pendências
    → Dashboard Prioridades
    → Metas Inteligentes (Sprint 3.3.3+)
```

### 5.4 Fluxo Motor de Operações (futuro)

```
Texto livre → Execução de Operação
    → Interpretação → Venda (efeito) → Registro de Efeito → Evento de Domínio
```

---

## 6. Análise crítica do modelo

### 6.1 Entidades faltando

| Entidade | Motivo |
|----------|--------|
| **Dia Operacional** | Agregador natural ausente; dia está implícito em várias entidades |
| **Pendência Operacional** | Formalizar incertezas (investigação, sabor não identificado) |
| **Encomenda Futura** | Separar planejamento de venda realizada |
| **Fonte de Capital** | Terceiros (Henrique) hoje embutidos em investimento |
| **Liquidação/Recebimento** | Separar caixa de receita operacional |

### 6.2 Entidades duplicadas

| Duplicação | Resolução proposta |
|------------|-------------------|
| Registro JSON do diário **vs** tabelas operacionais espelho | Uma narrativa canônica (Registro de Diário) + projeções |
| **Pagamento** **vs** atributos de pagamento na Venda | Unificar sob Venda + Liquidação/Fluxo |
| **Quantidade vendida** no Produto **vs** soma de Itens | Eliminar como mestre; manter projeção |
| Meta diária em **Settings** **vs** **Meta** | Definir hierarquia: Meta oficial + config default |

### 6.3 Entidades a dividir

| Entidade atual | Divisão proposta |
|----------------|------------------|
| Investimento monolítico | **Compra Diária** (físico) + **Investimento** (financeiro) + **Fonte de Capital** |
| Venda com pagamento tardio | **Venda** (fato comercial) + **Evento de Fluxo de Caixa** (fato de caixa) |
| Ação sugerida com encomenda | **Ação Sugerida** **vs** **Encomenda Futura** |

### 6.4 Entidades a desaparecer

| Entidade SQLite | Motivo |
|-----------------|--------|
| **Relatório** persistido | Relatórios são projeções; nunca usado |
| **Fornecedor** | Sem CRUD nem uso real; FK órfã |
| **Pagamento** (como entidade paralela) | Redundante; absorvido por Venda/Liquidação |
| **Notas** (como armazenamento genérico) | Substituído por Registro de Diário tipado |

### 6.5 Núcleo do sistema

Entidades **indispensáveis** ao valor do Lucas Business OS:

1. **Operação de Negócio** — multi-tenant lógico  
2. **Dia Operacional** — unidade de auditoria  
3. **Produto** — catálogo  
4. **Cliente** — CRM  
5. **Venda + Item de Venda** — fato comercial central  
6. **Compra Diária + Investimento** — custo e capital do dia  
7. **Registro de Diário** — fonte qualitativa e consolidada homologada  
8. **Evento de Fluxo de Caixa** — caixa vs receita  
9. **Meta** — direção e Smart Goals  

Entidades **satélites importantes:** Movimento de Estoque, Pendência, Perda, Aprendizado, Hipótese, Ação, Encomenda Futura.

Entidades **infraestrutura de evolução:** Motor de Operações (5 entidades de auditoria).

---

## 7. Recomendações arquiteturais

1. **Adotar Dia Operacional como agregado raiz** do domínio operacional — toda escrita oficial passa por `(operação, data)`.
2. **Uma fonte canônica do diário** — eliminar dual storage JSON + relacional na implementação futura (4.1B).
3. **Separar receita operacional de caixa** — reforçar Evento de Fluxo de Caixa escopado por operação.
4. **Cliente permanece global** — histórico CRM unificado; escopo de operação derivado das vendas.
5. **Formalizar pendências** — entidade ou sub-recurso de Dia Operacional, nunca perda silenciosa.
6. **Projeções analíticas fora do núcleo** — Dashboard/Analytics não persistem snapshots (`Relatório` descontinuado).
7. **Motor de Operações como anti-corruption layer** — entrada NL converte para entidades núcleo (Venda), não atalho SQL.
8. **Encomenda Futura** — preparar domínio antes de Smart Goals e CRM avançado.
9. **Fonte de Capital explícita** — suporta Operator Finance sem distorcer lucro operacional.
10. **Validar modelo com baseline histórica** — dias 16, 17, 20, 21, 22/07 devem mapear 1:1 para o agregado Dia Operacional na Sprint 4.1B.

---

## 8. Referências

- `docs/architecture/CURRENT_DATABASE_AUDIT.md` (Sprint 4.0B)
- `docs/architecture/CURRENT_DATABASE_ERD.md` (Sprint 4.0B)
- `docs/architecture/SUPABASE_ENVIRONMENT_AUDIT.md` (Sprint 4.0A)
- `docs/handbook/consolidacao-historica.md`
- `docs/decisions/ADR-002-fluxo-oficial-operacoes.md`

---

## 9. Próximo passo — Sprint 4.1B

Transformar cada entidade deste modelo em estrutura relacional concreta, com cardinalidades, constraints e mapeamento desde o SQLite — **sem ainda aplicar ao ambiente Supabase**.
