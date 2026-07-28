# Auditoria do Ambiente Supabase — Sprint 4.0A

**Data da auditoria:** 2026-07-22  
**Escopo:** Somente leitura — nenhuma alteração realizada  
**Ferramenta:** MCP oficial Supabase (`plugin-supabase-supabase`)  
**Projeto alvo:** Lucas Business OS — Épico 4 (Migração PostgreSQL)

---

## 1. Visão geral

O ambiente Supabase conectado ao Cursor possui **uma organização** e **um projeto**. Trata-se de um projeto **novo**, criado no mesmo dia desta auditoria, em estado **ACTIVE_HEALTHY**, com PostgreSQL **17.6** operacional e **sem schema de aplicação** no schema `public`.

Este perfil é adequado como **ambiente virgem** para receber a migração futura do Lucas Business OS, desde que as limitações do plano Free e da região sejam consideradas no desenho da Sprint 4.0B+.

---

## 2. Organização

| Campo | Valor |
|-------|-------|
| **Nome** | Lucash67's Org |
| **ID** | `pyawwxyewkzglashsnyk` |
| **Slug** | `pyawwxyewkzglashsnyk` |
| **Plano** | **Free** |
| **Release channels permitidos** | `ga`, `preview` |
| **Quantidade de projetos** | **1** |

---

## 3. Projetos

### 3.1 Inventário

| Campo | Valor |
|-------|-------|
| **Nome** | Lucash67's Project |
| **ID / Ref** | `auyghtmylvkuggugeych` |
| **Organização** | Lucash67's Org |
| **Região** | **ca-central-1** (Canadá Central) |
| **Plano** | **Free** (via organização) |
| **Status** | **ACTIVE_HEALTHY** |
| **Criado em** | 2026-07-22T15:05:37Z |
| **URL da API** | `https://auyghtmylvkuggugeych.supabase.co` |
| **Host do banco** | `db.auyghtmylvkuggugeych.supabase.co` |
| **Postgres** | 17.6.1.147 (engine 17, canal GA) |

### 3.2 Projeto recomendado

**Recomendação:** `Lucash67's Project` (`auyghtmylvkuggugeych`)

**Motivo:** É o **único projeto** existente na organização. Não há conflito de escolha nem risco de reutilizar ambiente com dados legados de outra aplicação.

---

## 4. Banco de dados (PostgreSQL)

### 4.1 Estado geral

| Item | Resultado |
|------|-----------|
| PostgreSQL ativo | **Sim** — status healthy, host acessível via plataforma |
| Schema `public` (aplicação) | **Vazio** — 0 tabelas |
| Migrations registradas | **0** (`list_migrations` retornou lista vazia) |
| Branches de desenvolvimento | **Não verificável** — `list_branches` retornou erro de permissão no MCP |

### 4.2 Schemas e tabelas de plataforma (via `list_tables`)

Schemas inspecionados: `public`, `auth`, `storage`, `extensions`, `vault`, `realtime`.

| Schema | Tabelas encontradas | Observação |
|--------|---------------------|------------|
| `public` | **0** | Pronto para schema da aplicação |
| `auth` | **23** | Infraestrutura Auth padrão Supabase |
| `storage` | **8** | Infraestrutura Storage padrão Supabase |
| `vault` | **1** (`secrets`) | Supabase Vault |
| `realtime` | **3** | Infraestrutura Realtime padrão |
| `extensions` | *(não listado como tabelas)* | Extensões via `list_extensions` |

**Schemas personalizados de aplicação:** **Nenhum** identificado além dos schemas de plataforma Supabase.

**Views de aplicação:** **Nenhuma** — schema `public` vazio; views customizadas não detectadas via MCP.

### 4.3 Extensões habilitadas

Extensões com `installed_version` definida (ativas):

| Extensão | Schema | Versão |
|----------|--------|--------|
| `plpgsql` | `pg_catalog` | 1.0 |
| `pgcrypto` | `extensions` | 1.3 |
| `pg_stat_statements` | `extensions` | 1.11 |
| `supabase_vault` | `vault` | 0.3.1 |
| `uuid-ossp` | `extensions` | 1.1 |

Demais extensões disponíveis na plataforma (ex.: `vector`, `pg_cron`, `postgis`) estão **disponíveis mas não instaladas**.

---

## 5. Auth

| Item | Resultado |
|------|-----------|
| Auth habilitado | **Sim** — schema `auth` completo e operacional |
| Usuários registrados | **0** (`auth.users`: 0 linhas) |
| Sessões ativas | **0** |
| Identidades | **0** |
| SSO / SAML providers | **0** configurados |
| OAuth custom providers | **0** |
| Políticas RLS em tabelas Auth | **Majoritariamente habilitadas** nas tabelas inspecionadas |

**Providers configurados:** O MCP **não expõe** leitura direta de providers (email, Google, etc.) fora das tabelas `auth.*`. Pelo inventário de tabelas, **não há SSO/SAML/OAuth custom** configurado. O provider **email/senha** é padrão da plataforma Supabase, mas sua configuração detalhada requer dashboard ou SQL (não executado nesta sprint).

---

## 6. Storage

| Item | Resultado |
|------|-----------|
| Serviço Storage | **Habilitado** — schema `storage` presente |
| Buckets existentes | **0** (`storage.buckets`: 0 linhas) |
| Objetos armazenados | **0** |
| RLS em `storage.buckets` | **Habilitado** |
| RLS em `storage.objects` | **Habilitado** |

**Configuração:** Ambiente padrão, sem buckets criados. Políticas de acesso por bucket ainda não aplicáveis.

---

## 7. Edge Functions

| Item | Resultado |
|------|-----------|
| Edge Functions deployadas | **0** (`list_edge_functions` retornou lista vazia) |

---

## 8. Advisors

Executados via MCP (`get_advisors`):

| Tipo | Alertas | Recomendações | Problemas |
|------|---------|---------------|-----------|
| **Security** | **0** | **0** | Nenhum |
| **Performance** | **0** | **0** | Nenhum |

**Interpretação:** Resultado esperado para projeto sem schema de aplicação. Reexecutar advisors **após** criação de tabelas e políticas RLS na fase de implementação.

---

## 9. Tipagem TypeScript

| Item | Resultado |
|------|-----------|
| Ferramenta MCP `generate_typescript_types` | **Disponível** |
| Tipos gerados nesta sprint | **Não** (conforme escopo) |
| Prontidão | Com schema vazio, a geração retornaria apenas tipos de plataforma; será útil **após** migração do schema |

---

## 10. Chaves e integração (somente inventário)

| Item | Resultado |
|------|-----------|
| URL do projeto | Disponível via MCP |
| Chaves publishable | **2 chaves ativas** — legacy `anon` + publishable `default` |
| Conexão ao Lucas Business OS | **Não realizada** (conforme escopo) |

> **Nota de segurança:** valores completos das chaves **não** são reproduzidos neste documento. Obtê-los via MCP ou dashboard Supabase quando necessário.

---

## 11. Limitações identificadas

1. **Plano Free** — limites de compute, storage, egress e pausa por inatividade.
2. **Região `ca-central-1`** — latência potencial para operação no Brasil (UTC-3); avaliar impacto na Sprint de arquitetura.
3. **MCP parcial** — Auth providers, buckets (detalhes de policy) e branches não totalmente auditáveis sem dashboard/SQL.
4. **`list_branches` falhou** — erro de permissão no MCP; branches não confirmados.
5. **Ambiente zerado** — nenhuma migration, tabela ou função de aplicação; todo schema LBO ainda a criar.
6. **Projeto criado hoje** — ambiente ainda em “warm-up” inicial da plataforma.

---

## 12. Recomendações

### Imediatas (pré-implementação)

1. Concluir **Sprint 4.0B** — auditoria completa do SQLite local antes de desenhar PostgreSQL.
2. Documentar mapeamento tabela-a-tabela (SQLite → Postgres) incluindo tipos, índices e constraints.
3. Definir se Auth Supabase será usado no LBO ou se a aplicação permanece single-user/local-first.
4. Avaliar região — considerar `sa-east-1` (São Paulo) se latência for crítica (exigiria novo projeto).
5. Planejar RLS desde o desenho — obrigatório se schema `public` for exposto via Data API.

### Para implementação futura (pós-auditorias)

1. Usar Drizzle migrations direcionadas ao Postgres Supabase.
2. Habilitar extensões necessárias (`uuid-ossp` já ativa; avaliar `pg_trgm` para buscas).
3. Reexecutar Advisors após DDL.
4. Gerar tipos TypeScript via MCP após schema estável.
5. Configurar backup/point-in-time conforme evolução do plano.

---

## 13. Grau de preparação para receber o Lucas Business OS

| Critério | Avaliação |
|----------|-----------|
| Banco operacional | ✅ |
| Schema limpo | ✅ |
| Conflitos de dados legados | ✅ Nenhum |
| Advisors limpos | ✅ |
| MCP funcional | ✅ |
| Migrations existentes | ⚠️ Nenhuma (a criar) |
| Plano / limites | ⚠️ Free |
| Região | ⚠️ Canadá (latência BR) |
| Auth / Storage configurados | ⚠️ Padrão, sem uso |

### Nota de preparação: **8 / 10**

Ambiente **tecnicamente pronto como lousa em branco**. A nota não é 10 porque faltam decisões de arquitetura (4.0B), região, plano, RLS e estratégia Auth — ainda não endereçadas nesta sprint.

---

## 14. Próxima sprint — 4.0B

Auditoria completa da arquitetura local SQLite do Lucas Business OS:

- Inventário de tabelas, relações e volumes de dados
- Scripts e fluxos que acessam o banco diretamente
- Dependências `better-sqlite3` / Drizzle
- Baseline histórica (dias 16, 17, 20, 21, 22/07) e implicações de migração
- Gap analysis SQLite vs Supabase Postgres

**Somente após 4.0A + 4.0B** iniciar o desenho da arquitetura PostgreSQL definitiva.

---

## Apêndice — Ferramentas MCP utilizadas

| Ferramenta | Uso |
|------------|-----|
| `list_organizations` | Organização e plano |
| `list_projects` | Inventário de projetos |
| `get_project` | Detalhes do projeto |
| `get_organization` | Plano Free |
| `get_project_url` | URL da API |
| `get_publishable_keys` | Confirmação de chaves |
| `list_tables` | Tabelas por schema |
| `list_migrations` | Histórico de migrations |
| `list_extensions` | Extensões Postgres |
| `list_edge_functions` | Edge Functions |
| `get_advisors` | Security + Performance |
| `list_branches` | *(falhou — permissão)* |

**Não utilizadas (conforme escopo):** `execute_sql`, `apply_migration`, `create_project`, `generate_typescript_types`, `deploy_edge_function`.
