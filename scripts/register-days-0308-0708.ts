/**
 * Registra 03–07/08/2026 — Salgados (validado com Lucas).
 * Uso: pnpm tsx scripts/register-days-0308-0708.ts
 */
import "./load-env";
import { and, eq } from "drizzle-orm";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { deriveDiaryTotalProfit } from "../src/lib/diary/types";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { getPostgresDb } from "../src/platform/db/postgres/client";
import { toDbBusinessId } from "../src/platform/db/business-id";
import { dailyInvestments, operationDays, saleItems, sales } from "../src/lib/db/postgres/schema";
import { queryAll, queryRun } from "../src/platform/db/query";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";
import { generateId } from "../src/shared/ids/generate-id";

const BUSINESS = "salgados";
const DEPT_ACAL = "Acal";
const DEPT_UNIFOR = "Unifor";
const DEPT_HENRIQUE = "Colegas do Henrique";

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  croissant: "Croissant",
  pastelCarne: "Pastel de Carne",
  carneFrito: "Carne Frito",
  carneCheddarForno: "Carne com Cheddar de Forno",
  unknown: UNIDENTIFIED_FLAVOR_PRODUCT_NAME,
} as const;

type DaySpec = {
  date: string;
  label: string;
  plan: DayRegistrationPlan;
  bonusIncome: number;
  bonusIncomeDescription?: string;
  /** Lucro operacional dos salgados (sem bônus). */
  profitSalgados: number;
  paidUnitsExpected: number;
  pendingUnitsExpected: number;
  familyExtraInvestments?: Array<{ name: string; amount: number }>;
  diaryExtras?: Partial<{
    observations: string;
    manualInsights: string;
    lessonsLearned: string;
    quantitySold: number;
    quantityLost: number;
    lossReason: string;
    creditCount: number;
    fatherSale: { units: number; amount: number; buyerName?: string };
  }>;
};

function sale(
  partial: Omit<DraftSale, "paymentMethod" | "paymentStatus" | "department"> &
    Partial<Pick<DraftSale, "paymentMethod" | "paymentStatus" | "department">>,
): DraftSale {
  return {
    paymentMethod: "pix",
    paymentStatus: "paid",
    department: DEPT_ACAL,
    ...partial,
  };
}

function clientsFromSales(salesList: DraftSale[]) {
  const seen = new Set<string>();
  const out: DayRegistrationPlan["newClients"] = [];
  for (const s of salesList) {
    const key = s.clientName.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name: s.clientName, sector: s.department, notes: `Cliente — ${s.department}` });
  }
  return out;
}

function buildDays(): DaySpec[] {
  // ——— 03/08 ———
  const sales03: DraftSale[] = [
    sale({
      time: "10:00",
      clientName: "Nathan Nael",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Deu R$10 em cédula; troco R$5 no Pix Itaú.",
    }),
    sale({
      time: "10:00",
      clientName: "André",
      productName: P.croissant,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Hora desconhecida — pago em cédula no expediente.",
    }),
    sale({ time: "12:44", clientName: "Iury", productName: P.mistaoFrito, quantity: 1 }),
    sale({
      time: "15:13",
      clientName: "Leonardo de Sousa Sena",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({ time: "15:54", clientName: "Vanderson Dias", productName: P.mistaoForno, quantity: 1 }),
    sale({
      time: "15:56",
      clientName: "Francisco Bruno Ribeiro Almeida",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "15:00",
      clientName: "João Pedro de Souza Pereira Marques",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "15:00",
      clientName: "João Pedro de Souza Pereira Marques",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({
      time: "15:00",
      clientName: "Dayanna Kelly Costa Almeida",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "15:00",
      clientName: "Maria Mikelly Monteiro de Oliveira Araujo",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    // Jackson fiado (conta como vendido; quita no 04)
    sale({
      time: "15:56",
      clientName: "Jackson Mendes Pinheiro",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 03/08 — quitação no dia 04/08 (não era perda).",
    }),
    // Colegas do Henrique: 2
    sale({
      time: "10:00",
      clientName: "Colegas do Henrique",
      productName: P.unknown,
      quantity: 2,
      department: DEPT_HENRIQUE,
      notes: "2 vendas a colegas no trabalho do Henrique.",
    }),
    // Henrique comprou 6
    sale({
      time: "10:30",
      clientName: "Henrique",
      productName: P.unknown,
      quantity: 6,
      department: DEPT_HENRIQUE,
      notes: "Compra própria do Henrique — faturamento/lucro do operador.",
    }),
  ];

  // ——— 04/08 ———
  const sales04: DraftSale[] = [
    sale({
      time: "09:10",
      clientName: "João Victor dos Santos Carvalho",
      productName: P.mistaoFrito,
      quantity: 2,
      department: DEPT_UNIFOR,
      notes: "Unifor — 2 unidades.",
    }),
    sale({ time: "09:48", clientName: "Iury Guilherme", productName: P.mistaoFrito, quantity: 1 }),
    sale({
      time: "09:50",
      clientName: "Bernardo Ferreira Domingo",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "10:06",
      clientName: "Dayanna Kelly Costa Almeida",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({ time: "10:06", clientName: "Lucas Moraes", productName: P.mistaoForno, quantity: 1 }),
    sale({
      time: "10:14",
      clientName: "Maria Clara Gomes Mororo",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({
      time: "10:51",
      clientName: "João Pedro Pereira de Souza Marques",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "11:07",
      clientName: "Davi Oliveira da Silva",
      productName: P.mistaoForno,
      quantity: 2,
    }),
    sale({
      time: "11:07",
      clientName: "Davi Oliveira da Silva",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "11:12",
      clientName: "Davi Oliveira da Silva",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "12:50",
      clientName: "Francisco de Assis Soares Pereira",
      productName: P.mistaoFrito,
      quantity: 1,
      notes: "Pastel mistão (encomenda da tarde).",
    }),
    sale({
      time: "13:10",
      clientName: "Rapaz que incentivou as vendas",
      productName: P.mistaoFrito,
      quantity: 1,
      paymentMethod: "cash",
      notes: "Espécie convertida em Pix.",
    }),
    sale({
      time: "13:28",
      clientName: "Ana Laura Ferreira Pinto",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({
      time: "13:28",
      clientName: "Ana Laura Ferreira Pinto",
      productName: P.croissant,
      quantity: 1,
    }),
    sale({
      time: "13:49",
      clientName: "Francisco Bruno Ribeiro Almeida",
      productName: P.pastelCarne,
      quantity: 1,
    }),
    // Quitação Jackson (caixa do 04; estoque do 03)
    sale({
      time: "15:56",
      clientName: "Jackson Mendes Pinheiro",
      productName: P.mistaoFrito,
      quantity: 1,
      notes:
        "QUITACAO fiado 03/08 — entra no caixa de 04/08; não saiu do estoque encomendado em 04/08.",
    }),
  ];

  // ——— 05/08 ———
  const sales05: DraftSale[] = [
    sale({
      time: "10:00",
      clientName: "João Victor dos Santos Carvalho",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_UNIFOR,
      notes: "Unifor",
    }),
    sale({
      time: "10:00",
      clientName: "Maria Clara Gomes Mororo",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({ time: "10:00", clientName: "Ana Angélica", productName: P.mistaoFrito, quantity: 1 }),
    sale({
      time: "10:00",
      clientName: "Francisco Vanderson Dias",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Francisco Anderson das Chagas Oliveira",
      productName: P.croissant,
      quantity: 1,
      notes: "Antecipado R$5 em 04/08 — faturamento no 05/08.",
    }),
    sale({
      time: "10:00",
      clientName: "Dayanna Kelly Costa Almeida",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Ana Laura Ferreira",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Francisco de Assis Soares Pereira",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Juan Vasco Menezes Ferreira",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Anselmo Gabriel Freire da Silva",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Raimunda Souza",
      productName: P.mistaoFrito,
      quantity: 1,
    }),
    sale({
      time: "10:00",
      clientName: "Raimunda Souza",
      productName: P.mistaoForno,
      quantity: 1,
    }),
    sale({
      time: "15:00",
      clientName: "Francisco Anderson das Chagas Oliveira",
      productName: P.croissant,
      quantity: 1,
      paymentMethod: "cash",
      notes: "2º croissant do dia — espécie.",
    }),
    // Moça: contabilizada no 05 (pago) mesmo tendo quitado no 06
    sale({
      time: "15:00",
      clientName: "Moça (nome não identificado)",
      productName: P.croissant,
      quantity: 1,
      notes: "Fiado 05/08 quitado em 06/08 — faturamento lançado no 05/08 por decisão operacional.",
    }),
  ];

  // ——— 06/08 ———
  const sales06: DraftSale[] = [
    sale({
      time: "10:00",
      clientName: "Francisco Ricardo",
      productName: P.carneFrito,
      quantity: 1,
    }),
    sale({ time: "10:00", clientName: "Jackson", productName: P.carneFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Iury", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Ismael Silva", productName: P.croissant, quantity: 1 }),
    sale({ time: "10:00", clientName: "Dayanna Kelly", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Ana Laura", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:00", clientName: "Ana Angélica", productName: P.unknown, quantity: 1 }),
    sale({
      time: "10:00",
      clientName: "Maria Clara Gomes",
      productName: P.mistaoFrito,
      quantity: 1,
      notes: "Registrado como Pastel; sabor pode ter variação não vista.",
    }),
    sale({ time: "10:00", clientName: "Davi Oliveira", productName: P.unknown, quantity: 2 }),
    sale({ time: "10:00", clientName: "João Pedro de Souza", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:00", clientName: "José Mclaurem", productName: P.unknown, quantity: 2 }),
    sale({
      time: "10:00",
      clientName: "Cristiano Messias Lopes",
      productName: P.unknown,
      quantity: 1,
    }),
    sale({ time: "15:00", clientName: "Anselmo Gabriel", productName: P.unknown, quantity: 1 }),
    sale({ time: "15:00", clientName: "Francisco Bruno", productName: P.unknown, quantity: 1 }),
    sale({ time: "15:00", clientName: "Francisco de Assis", productName: P.unknown, quantity: 1 }),
    sale({ time: "15:00", clientName: "Danilo Duarte", productName: P.mistaoForno, quantity: 1 }),
  ];

  // ——— 07/08 ———
  const sales07Acal: DraftSale[] = [
    sale({ time: "10:00", clientName: "Ismael", productName: P.croissant, quantity: 1 }),
    sale({ time: "10:00", clientName: "Leonardo", productName: P.croissant, quantity: 1 }),
    sale({ time: "10:00", clientName: "Joelma", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Davi", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Davi", productName: P.pastelCarne, quantity: 1 }),
    sale({ time: "10:00", clientName: "Davi", productName: P.carneCheddarForno, quantity: 1 }),
    sale({
      time: "10:00",
      clientName: "Ricardo Feijão",
      productName: P.carneCheddarForno,
      quantity: 1,
    }),
    sale({ time: "10:00", clientName: "Maria Clara", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Israel", productName: P.carneCheddarForno, quantity: 1 }),
    sale({ time: "10:00", clientName: "Iury", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Igor Silva", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Lucas Moraes", productName: P.pastelCarne, quantity: 1 }),
    sale({ time: "10:00", clientName: "Dayanna", productName: P.mistaoFrito, quantity: 1 }),
    sale({ time: "10:00", clientName: "Ana Angelica", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:00", clientName: "Ana Laura", productName: P.unknown, quantity: 1 }),
    sale({ time: "10:00", clientName: "José MacLaurem", productName: P.croissant, quantity: 1 }),
    sale({ time: "10:00", clientName: "José MacLaurem", productName: P.mistaoFrito, quantity: 1 }),
    sale({
      time: "10:00",
      clientName: "Francisco Nazareno",
      productName: P.unknown,
      quantity: 1,
      notes: "1 unidade — sabor não detalhado no rascunho.",
    }),
    sale({
      time: "10:00",
      clientName: "Francisco Anderson",
      productName: P.unknown,
      quantity: 1,
      notes: "1 unidade — sabor não detalhado no rascunho.",
    }),
    sale({
      time: "10:00",
      clientName: "Moça não identificada",
      productName: P.carneCheddarForno,
      quantity: 1,
    }),
  ];
  const sales07Pai: DraftSale[] = [
    sale({
      time: "11:00",
      clientName: "Clientes do Henrique (cota pai)",
      productName: P.croissant,
      quantity: 2,
      department: DEPT_HENRIQUE,
      notes: "4 un separados para o pai — vendidos; fat./lucro do operador.",
    }),
    sale({
      time: "11:00",
      clientName: "Clientes do Henrique (cota pai)",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_HENRIQUE,
      notes: "Cota pai — sem mistão de forno neste dia.",
    }),
    sale({
      time: "11:00",
      clientName: "Clientes do Henrique (cota pai)",
      productName: P.mistaoFrito,
      quantity: 1,
      department: DEPT_HENRIQUE,
      notes: "Cota pai — 1 pastel/mistão frito.",
    }),
  ];
  const sales07 = [...sales07Acal, ...sales07Pai];

  return [
    {
      date: "2026-08-03",
      label: "03/08",
      paidUnitsExpected: 18,
      pendingUnitsExpected: 1,
      profitSalgados: 55,
      bonusIncome: 0,
      plan: {
        businessId: BUSINESS,
        date: "2026-08-03",
        purchase: {
          totalUnits: 20,
          investment: 70,
          ownInvestment: 35,
          thirdParty: { name: "Henrique", amount: 35 },
          products: [
            { name: P.mistaoFrito, quantity: 7 },
            { name: P.mistaoForno, quantity: 7 },
            { name: P.croissant, quantity: 6 },
          ],
        },
        summary: {
          revenue: 90,
          profit: 55,
          quantitySold: 19,
          quantityLost: 1,
          lossReason: "1 salgado perdido na Acal (o 2º 'sumiço' era Jackson fiado).",
        },
        sales: sales03,
        newClients: clientsFromSales(sales03),
        observations: [
          "Volta às aulas — atraso na manhã; aniversário na empresa prejudicou vendas matinais.",
          "Comecei a levar para a faculdade; ainda sem venda lá.",
          "Pai/Henrique: canal Colegas do Henrique (2 colegas + 6 compra própria).",
          "Estratégia pós-faculdade necessária para não perder volume.",
        ].join("\n"),
      },
      diaryExtras: {
        quantitySold: 19,
        quantityLost: 1,
        creditCount: 1,
        lossReason: "1 salgado perdido na Acal (responsável não identificado).",
        fatherSale: { units: 8, amount: 40, buyerName: "Colegas do Henrique" },
      },
    },
    {
      date: "2026-08-04",
      label: "04/08",
      paidUnitsExpected: 18, // 17 do dia + quitação Jackson
      pendingUnitsExpected: 0,
      // Lucro total R$79 (= 60+19) mantido no diário/cofrinho; investimentos refletem o caixa real.
      profitSalgados: 60,
      bonusIncome: 19,
      bonusIncomeDescription: "Bonificação do Henrique: R$19,00.",
      plan: {
        businessId: BUSINESS,
        date: "2026-08-04",
        purchase: {
          totalUnits: 17,
          investment: 59.5,
          // INV-03: soma investimentos = compra (35 + 24,50)
          ownInvestment: 35,
          thirdParty: {
            name: "Henrique + Flaviana",
            amount: 24.5, // Henrique 17,50 + Flaviana 7
          },
          products: [
            { name: P.mistaoFrito, quantity: 7 }, // 5 manhã pastel + 2 tarde pastel mistão
            { name: P.mistaoForno, quantity: 5 }, // 4 manhã + 1 tarde
            { name: P.croissant, quantity: 4 }, // 3 manhã + 1 tarde
            { name: P.pastelCarne, quantity: 1 },
          ],
        },
        summary: {
          revenue: 90, // 85 vendas do dia + 5 quitação
          profit: 60,
          quantitySold: 17,
          quantityLost: 0,
        },
        sales: sales04,
        newClients: clientsFromSales(sales04),
        observations: [
          "Primeiras vendas na Unifor (João Victor — 2 un).",
          "Anderson antecipou R$5 para croissant em 05/08 — NÃO entra no fat. de 04.",
          "Investimentos reais: próprio R$35 + Flaviana R$7 + Henrique R$17,50 = R$59,50.",
          "Lucro/cofrinho mantidos em R$79 (como se custo próprio fosse R$30) — decisão para não retratar o banco.",
          "Pastel esgota rápido; ideia fidelidade; porteiro como possível revendedor.",
        ].join("\n"),
        manualInsights:
          "Lucro total do dia R$79 = R$60 salgados + R$19 bônus (cofrinho). Desembolso próprio real da compra: R$35.",
      },
      diaryExtras: {
        quantitySold: 17,
        quantityLost: 0,
        creditCount: 0,
      },
    },
    {
      date: "2026-08-05",
      label: "05/08",
      paidUnitsExpected: 14,
      pendingUnitsExpected: 0,
      profitSalgados: 17.5, // 70 - 52.50
      bonusIncome: 15,
      bonusIncomeDescription: "Bonificação do Henrique: R$15,00.",
      plan: {
        businessId: BUSINESS,
        date: "2026-08-05",
        purchase: {
          totalUnits: 15,
          investment: 52.5,
          ownInvestment: 52.5,
          products: [
            { name: P.mistaoFrito, quantity: 8 },
            { name: P.croissant, quantity: 4 },
            { name: P.mistaoForno, quantity: 3 },
          ],
        },
        summary: {
          revenue: 70,
          profit: 17.5,
          quantitySold: 14,
          quantityLost: 1,
          lossReason:
            "1 un não paga (responsável não confirmado — possivelmente Davi ou outra pessoa). Baixada como perda ('ficou por isso').",
        },
        sales: sales05,
        newClients: clientsFromSales(sales05),
        observations: [
          "Pico de compras após 16h (lanche da tarde).",
          "Vendeu 14 pagos + 1 perda; demanda residual — aumentar volume.",
          "Moça do croissant: quitou em 06/08, faturamento no 05/08.",
        ].join("\n"),
      },
      diaryExtras: {
        quantitySold: 14,
        quantityLost: 1,
        lossReason:
          "1 un não paga (responsável não confirmado). Baixada como perda — não entra no cofrinho.",
      },
    },
    {
      date: "2026-08-06",
      label: "06/08",
      paidUnitsExpected: 18,
      pendingUnitsExpected: 0,
      profitSalgados: 27, // 90 - 63
      bonusIncome: 30,
      bonusIncomeDescription: "Bonificação do Henrique: R$30,00.",
      plan: {
        businessId: BUSINESS,
        date: "2026-08-06",
        purchase: {
          totalUnits: 18,
          investment: 63,
          ownInvestment: 63,
          products: [
            { name: P.mistaoFrito, quantity: 8 },
            { name: P.croissant, quantity: 3 },
            { name: P.mistaoForno, quantity: 3 },
            { name: P.pastelCarne, quantity: 2 },
            { name: P.carneCheddarForno, quantity: 2 },
          ],
        },
        summary: {
          revenue: 90,
          profit: 27,
          quantitySold: 18,
          quantityLost: 0,
        },
        sales: sales06,
        newClients: clientsFromSales(sales06),
        observations: [
          "Recorde Acal 18 un até ~15h.",
          "Carne com cheddar forte; mistão frito mínimo ~8.",
          "Controle de sabores falhando quando não vê a venda — vários 'não identificados'.",
          "Ana Laura: 1 un (corrigido de 2).",
          "R$5 da moça do 05 NÃO entram aqui (já no 05).",
        ].join("\n"),
      },
      diaryExtras: { quantitySold: 18, quantityLost: 0 },
    },
    {
      date: "2026-08-07",
      label: "07/08",
      paidUnitsExpected: 24,
      pendingUnitsExpected: 0,
      profitSalgados: 120, // 120 - 0
      bonusIncome: 0,
      plan: {
        businessId: BUSINESS,
        date: "2026-08-07",
        purchase: {
          totalUnits: 24,
          investment: 84,
          ownInvestment: 0,
          thirdParty: {
            name: "Henrique + Flaviana",
            amount: 84, // Henrique 30 + Flaviana 54
          },
          products: [
            { name: P.mistaoFrito, quantity: 10 }, // 8 meus + 1 pastel pai + 1 mistão pai
            { name: P.croissant, quantity: 6 }, // 4 + 2 pai
            { name: P.pastelCarne, quantity: 4 },
            { name: P.carneCheddarForno, quantity: 5 },
          ],
          fatherAllocation: [
            { name: P.croissant, quantity: 2 },
            { name: P.mistaoFrito, quantity: 2 },
          ],
        },
        summary: {
          revenue: 120,
          profit: 120,
          quantitySold: 24,
          quantityLost: 0,
        },
        sales: sales07,
        newClients: clientsFromSales(sales07),
        observations: [
          "20 na Acal esgotaram 11:30 — tarde zerada.",
          "17 tickets Acal (Davi 3 + José 2) = 20 un; pai vendeu os 4 separados.",
          "100% Pix. Sem mistão de forno — teste cheddar forno.",
          "Cardápio/WhatsApp encomenda para próxima semana.",
          "Cofrinho teórico fim do dia: R$1.007,50 · prático R$1.009,28.",
        ].join("\n"),
      },
      diaryExtras: {
        quantitySold: 24,
        quantityLost: 0,
        fatherSale: { units: 4, amount: 20, buyerName: "Cota do pai / Colegas do Henrique" },
      },
    },
  ];
}

function assertUnits(spec: DaySpec): void {
  const paid = spec.plan.sales
    .filter((s) => s.paymentStatus === "paid")
    .reduce((n, s) => n + s.quantity, 0);
  const pending = spec.plan.sales
    .filter((s) => s.paymentStatus !== "paid")
    .reduce((n, s) => n + s.quantity, 0);
  if (paid !== spec.paidUnitsExpected) {
    throw new Error(`${spec.label}: paid=${paid}, esperado ${spec.paidUnitsExpected}`);
  }
  if (pending !== spec.pendingUnitsExpected) {
    throw new Error(`${spec.label}: pending=${pending}, esperado ${spec.pendingUnitsExpected}`);
  }
  const totalProfit = deriveDiaryTotalProfit({
    profit: spec.profitSalgados,
    bonusIncome: spec.bonusIncome,
  });
  console.log(
    `✓ ${spec.label} preview: paid ${paid} · pending ${pending} · fat R$${spec.plan.summary.revenue} · lucro ${spec.profitSalgados}+${spec.bonusIncome}=${totalProfit}`,
  );
}

async function insertFamilyExtras(
  date: string,
  extras: Array<{ name: string; amount: number }>,
): Promise<void> {
  if (extras.length === 0) return;
  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const days = await queryAll(
    db
      .select({ id: operationDays.id })
      .from(operationDays)
      .where(and(eq(operationDays.businessId, businessId), eq(operationDays.operationDate, date))),
  );
  const operationDayId = days[0]?.id;
  if (!operationDayId) throw new Error(`operation_day ausente em ${date}`);
  for (const extra of extras) {
    await queryRun(
      db.insert(dailyInvestments).values({
        id: generateId(),
        operationDayId,
        amount: String(extra.amount),
        investmentType: "additional",
        sourceType: "family",
        sourceName: extra.name,
        description: `Investimento ${extra.name} — compra diária ${date}.`,
      }),
    );
  }
}

async function applyDiary(spec: DaySpec): Promise<void> {
  const entry = await getDiaryEntry(BUSINESS, spec.date);
  if (!entry) throw new Error(`Diário ${spec.label} não encontrado`);

  const extras = spec.diaryExtras ?? {};
  const totalProfit = deriveDiaryTotalProfit({
    profit: spec.profitSalgados,
    bonusIncome: spec.bonusIncome,
  });

  await upsertDiaryEntry({
    ...entry,
    profit: spec.profitSalgados,
    bonusIncome: spec.bonusIncome || undefined,
    bonusIncomeDescription: spec.bonusIncomeDescription,
    quantitySold: extras.quantitySold ?? spec.plan.summary.quantitySold,
    quantityLost: extras.quantityLost ?? spec.plan.summary.quantityLost,
    lossReason: extras.lossReason ?? spec.plan.summary.lossReason,
    observations: extras.observations ?? spec.plan.observations,
    manualInsights: [
      spec.plan.manualInsights,
      spec.bonusIncomeDescription,
      `Lucro salgados R$${spec.profitSalgados.toFixed(2)} + bônus R$${spec.bonusIncome.toFixed(2)} = total R$${totalProfit.toFixed(2)}.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    lessonsLearned: extras.lessonsLearned ?? spec.plan.lessonsLearned,
    sales: {
      paidCount: extras.quantitySold ?? spec.plan.summary.quantitySold,
      creditCount: extras.creditCount,
      fatherSale: extras.fatherSale,
    },
    revenue: {
      received: spec.plan.summary.revenue,
      pending: spec.pendingUnitsExpected * 5,
      total: spec.plan.summary.revenue + spec.pendingUnitsExpected * 5,
    },
  });
}

async function verifyDay(spec: DaySpec): Promise<void> {
  const nSales = await countSalesForDate(BUSINESS, spec.date);
  const entry = await getDiaryEntry(BUSINESS, spec.date);
  if (!entry) throw new Error(`${spec.label}: sem diário após commit`);

  const db = await getPostgresDb();
  const businessId = toDbBusinessId(BUSINESS);
  const daySales = await queryAll(
    db
      .select()
      .from(sales)
      .where(and(eq(sales.businessId, businessId), eq(sales.saleDate, spec.date))),
  );

  let units = 0;
  for (const s of daySales) {
    const items = await queryAll(db.select().from(saleItems).where(eq(saleItems.saleId, s.id)));
    units += items.reduce((acc, it) => acc + it.quantity, 0);
  }

  const totalProfit = deriveDiaryTotalProfit(entry);
  const expectedTotal = deriveDiaryTotalProfit({
    profit: spec.profitSalgados,
    bonusIncome: spec.bonusIncome,
  });

  const checks: string[] = [];
  if (nSales !== spec.plan.sales.length) {
    checks.push(`vendas ${nSales}≠${spec.plan.sales.length}`);
  }
  if (units !== spec.paidUnitsExpected + spec.pendingUnitsExpected) {
    checks.push(`unidades ${units}≠${spec.paidUnitsExpected + spec.pendingUnitsExpected}`);
  }
  if (Math.abs((entry.profit ?? 0) - spec.profitSalgados) > 0.001) {
    checks.push(`profit ${entry.profit}≠${spec.profitSalgados}`);
  }
  if (Math.abs((entry.bonusIncome ?? 0) - spec.bonusIncome) > 0.001) {
    checks.push(`bonus ${entry.bonusIncome}≠${spec.bonusIncome}`);
  }
  if (Math.abs(totalProfit - expectedTotal) > 0.001) {
    checks.push(`totalProfit ${totalProfit}≠${expectedTotal}`);
  }
  if (Math.abs((entry.revenue?.received ?? 0) - spec.plan.summary.revenue) > 0.001) {
    checks.push(`revenue ${entry.revenue?.received}≠${spec.plan.summary.revenue}`);
  }

  if (checks.length) {
    throw new Error(`${spec.label} FALHOU: ${checks.join(" | ")}`);
  }
  console.log(
    `✅ ${spec.label} OK — ${nSales} tickets · ${units} un · fat R$${entry.revenue?.received} · lucro total R$${totalProfit}`,
  );
}

async function registerOne(spec: DaySpec): Promise<void> {
  console.log(`\n======== ${spec.label} (${spec.date}) ========`);
  assertUnits(spec);

  await cleanupOperationDay(BUSINESS, spec.date);
  const existing = await countSalesForDate(BUSINESS, spec.date);
  if (existing > 0) throw new Error(`${spec.label}: ainda ${existing} vendas após cleanup`);

  const sanitized = sanitizeRegistrationPlan(spec.plan);
  const result = await commitDayRegistration(sanitized);
  console.log(`Commit: ${result.saleIds.length} vendas · diary ${result.diaryId}`);

  await insertFamilyExtras(spec.date, spec.familyExtraInvestments ?? []);
  await applyDiary(spec);
  // fixDayPricing apaga investimentos no meio do caminho e dispara INV-03
  // quando o dia é 100% capital próprio. Só roda se houver split família.
  const hasFamilySplit = (spec.plan.purchase?.thirdParty?.amount ?? 0) > 0.01;
  if (hasFamilySplit) {
    await fixDayPricing(BUSINESS, spec.date);
    await applyDiary(spec);
  }
  await verifyDay(spec);
}

async function verifyCofrinho(specs: DaySpec[]): Promise<void> {
  let balance = 664; // 719 - 55 (base antes do 03, se 03 fecha 719)
  // Na verdade fim 02 = 719 - 55 = 664; fim 03 com lucro 55 = 719
  const expectedEnds = [719, 798, 830.5, 887.5, 1007.5];
  console.log("\n======== COFRINHO ========");
  for (let i = 0; i < specs.length; i++) {
    const spec = specs[i]!;
    const entry = await getDiaryEntry(BUSINESS, spec.date);
    const dayProfit = deriveDiaryTotalProfit({
      profit: entry?.profit ?? 0,
      bonusIncome: entry?.bonusIncome,
    });
    if (i === 0) balance = 664;
    balance = Math.round((balance + dayProfit) * 100) / 100;
    const expected = expectedEnds[i]!;
    const ok = Math.abs(balance - expected) < 0.01;
    console.log(
      `${ok ? "✅" : "❌"} ${spec.label}: +${dayProfit} → ${balance} (esperado ${expected})`,
    );
    if (!ok) throw new Error(`Cofrinho ${spec.label} divergente`);
  }
}

async function main(): Promise<void> {
  const days = buildDays();

  for (const spec of days) {
    await registerOne(spec);
  }

  await verifyCofrinho(days);

  console.log("\n🎉 Semana 03–07/08 registrada e verificada com sucesso.");
  process.exit(0);
}

main().catch((error) => {
  console.error("\n💥 Falha no registro:", error);
  process.exit(1);
});
