import "./load-env";
import { parseDayDraft } from "../src/lib/day-registration/draft-parser";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";

const draft = `28/07

Encomendados hoje (Total):

- 4 Pastel 
- 4 Mistao 
- 4 Croissant

Custo total dos salgados: R$42
Minha parte investida: R$42
Parte restante do meu pai (não sai nada de mim) R$

Histórico de vendas: 

1 - Ismael Silva da Paz: 2 Croissant | 09:07 ✅Pix
2 - Vanderson Dias: 1 Pastel | 09:18 ✅Pix
3 - Maria Graziele Santos Oliveira: 1 Mistao | 09:18 ✅Pix
4 - Israel Ferreira de Freitas: 1 Mistao | 09:20 ✅Pix
5 - Jackson Mendes Pinheiro: 2 Pastel | 09:30 ✅Pix
6 - Cícero Carlos Azededo dos Santos: 1 Mistao | 09:42 ✅Pix
7 - Dayanna Kelly Costa Almeida: 1 (Não vi) | 10:06 ✅Pix
8 - Ana Laura Ferreira Pinto: 1 (Não vi) | 10:34 ✅Pix
9 - Não pagou (Pegou quando eu não estava na hora)
10 - Não pagou (Pegou quando eu não estava na hora)

Faturamento, despesa e Lucro
- Meu investimento: R$42
- Faturamento do dia: R$60
- Lucro do dia: R$18`;

const { plan, errors, warnings } = parseDayDraft(draft);
console.log("parse errors", errors);
console.log("parse warnings", warnings.slice(0, 3));

if (!plan) process.exit(1);

const preview = {
  ...plan,
  warnings,
  errors,
  productMatches: [],
  clientMatches: [],
  dayAlreadyRegistered: false,
  existingSalesCount: 0,
};

const { warnings: w, errors: e, productMatches, clientMatches, dayAlreadyRegistered, existingSalesCount, ...planData } =
  preview;

try {
  const plan = sanitizeRegistrationPlan(preview);
  console.log("ZOD OK", plan.sales.length, "sales");
  console.log("revenue", plan.summary.revenue, "profit", plan.summary.profit);
  console.log("investment", plan.purchase?.investment, "own", plan.purchase?.ownInvestment);
} catch (error) {
  console.log("ZOD FAIL:", error);
  console.log("purchase:", JSON.stringify(planData.purchase, null, 2));
  console.log("summary:", JSON.stringify(planData.summary, null, 2));
}
