# Backups — Lucas Business OS

## Marco oficial — Homologação ACAL

| Arquivo | Data | Descrição |
|---------|------|-----------|
| `baseline-acal-2026-07-16-homologacao.sqlite` | 2026-07-17 | **Base Histórica Oficial ACAL** — pós-homologação do dia operacional 16/07/2026. Primeiro marco da operação real. |

### Conteúdo esperado deste baseline

- 3 produtos · 8 clientes · 8 vendas · R$ 45,00 receita
- Investimento R$ 31,50 · estoque zerado
- Diário operacional, indicadores, aprendizados e decisão estratégica preservados

### Restaurar (somente administrativo)

```bash
# Parar o servidor antes de restaurar
cp backups/baseline-acal-2026-07-16-homologacao.sqlite data/lucas-business-os.db
```

Ver ADR-002: operações rotineiras devem usar UI/API, não SQL direto.
