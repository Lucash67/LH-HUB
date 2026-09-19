/**
 * Registra 11, 12, 16, 17 e 18/09/2026 — Salgados.
 * Uso: pnpm tsx scripts/register-days-1109-1809.ts
 *
 * Confirmações do Lucas (19/09):
 * - 11: 4 fiados, só 1 é Ana Laura; lucro R$85
 * - 12: 3 croissants da geladeira, custo 0, lucro R$15 (bloco ok)
 * - 16: lucro R$95; quitação não entra por cima do que já está no banco
 * - 17: sobe o resumo; lista de clientes vem depois
 * - 18: lucro R$65; quitação não soma em cima dos 65
 *
 * Não registra 14/09 (bloco completo, ainda sem confirmação)
 * nem 15/09 (nota só tem "Lucro: R$70").
 */
import "./load-env";
import { cleanupOperationDay } from "./cleanup-operation-day";
import { fixDayPricing } from "./fix-day-pricing";
import { commitDayRegistration } from "../src/lib/day-registration/day-registration-service";
import { sanitizeRegistrationPlan } from "../src/lib/day-registration/plan-sanitize";
import type { DayRegistrationPlan, DraftSale } from "../src/lib/day-registration/types";
import { getDiaryEntry, upsertDiaryEntry } from "../src/lib/diary-service";
import { setPracticalProfitBankBalance } from "../src/lib/profit-bank-service";
import { UNIDENTIFIED_FLAVOR_PRODUCT_NAME } from "../src/lib/salgados-flavors";
import { countSalesForDate } from "@/platform/db/repositories/sale-repository";

const BUSINESS = "salgados";
const ACAL = "Acal";
const HENRIQUE = "Colegas do Henrique";
const UNKNOWN = UNIDENTIFIED_FLAVOR_PRODUCT_NAME;

const P = {
  mistaoFrito: "Mistão Frito",
  mistaoForno: "Mistão de Forno",
  frango: "Frango com Catupiry",
  croissant: "Croissant",
  carneForno: "Carne com Cheddar de Forno",
  queijo: "Queijo Frito",
  unknown: UNKNOWN,
} as const;

function sale(
  partial: Omit<DraftSale, "paymentMethod" | "paymentStatus" | "department"> &
    Partial<Pick<DraftSale, "paymentMethod" | "paymentStatus" | "department">>,
): DraftSale {
  return {
    paymentMethod: "pix",
    paymentStatus: "paid",
    department: ACAL,
    productName: P.unknown,
    ...partial,
  };
}

function clientsFromSales(salesList: DraftSale[]): DayRegistrationPlan["newClients"] {
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

function unitsOf(list: DraftSale[]): number {
  return list.reduce((n, s) => n + s.quantity, 0);
}

async function commitDay(plan: DayRegistrationPlan, diary: {
  profit: number;
  received: number;
  pending: number;
  total: number;
  quantitySold: number;
  paidCount: number;
  creditCount: number;
  fatherSale?: { units: number; amount: number; buyerName: string };
  fixPricing?: boolean;
}): Promise<void> {
  console.log(`\n======== SALGADOS ${plan.date} ========`);
  await cleanupOperationDay(BUSINESS, plan.date);
  const existing = await countSalesForDate(BUSINESS, plan.date);
  if (existing > 0) throw new Error(`Ainda ${existing} venda(s) após cleanup em ${plan.date}`);

  const result = await commitDayRegistration(sanitizeRegistrationPlan(plan));
  console.log(`Commit: ${result.saleIds.length} venda(s)`);

  const entry = await getDiaryEntry(BUSINESS, plan.date);
  if (!entry) throw new Error(`Diário ${plan.date} ausente`);

  await upsertDiaryEntry({
    ...entry,
    profit: diary.profit,
    bonusIncome: undefined,
    quantitySold: diary.quantitySold,
    quantityLost: 0,
    observations: plan.observations,
    manualInsights: plan.manualInsights,
    lessonsLearned: plan.lessonsLearned,
    revenue: { received: diary.received, pending: diary.pending, total: diary.total },
    sales: {
      paidCount: diary.paidCount,
      creditCount: diary.creditCount,
      fatherSale: diary.fatherSale,
    },
  });

  if (diary.fixPricing !== false) {
    await fixDayPricing(BUSINESS, plan.date);
    const after = await getDiaryEntry(BUSINESS, plan.date);
    if (!after) throw new Error(`Diário ${plan.date} sumiu após preço`);
    if (after.profit !== diary.profit || after.revenue.received !== diary.received) {
      await upsertDiaryEntry({
        ...after,
        profit: diary.profit,
        bonusIncome: undefined,
        quantitySold: diary.quantitySold,
        quantityLost: 0,
        revenue: { received: diary.received, pending: diary.pending, total: diary.total },
      });
    }
  }

  const n = await countSalesForDate(BUSINESS, plan.date);
  console.log(
    `✅ ${plan.date} OK — ${n} tickets · lucro R$${diary.profit} · rec R$${diary.received} · pend R$${diary.pending}`,
  );
}

function plan11(): DayRegistrationPlan {
  const salesList: DraftSale[] = [
    sale({
      time: "08:58",
      clientName: "Cliente Tap to Pay",
      quantity: 1,
      paymentMethod: "card",
      notes: "Tap to Pay. Movimentação mostra R$5,50; lançado R$5.",
    }),
    sale({ time: "09:07", clientName: "Ana Luzia Araújo Uchoa", quantity: 1 }),
    sale({ time: "09:14", clientName: "Jackson Mendes Pinheiro", quantity: 1 }),
    sale({ time: "09:18", clientName: "Maria Emanuela Sansão Pereira", quantity: 1 }),
    sale({ time: "09:19", clientName: "Anselmo Gabriel", quantity: 1 }),
    sale({ time: "09:22", clientName: "Francisco Ricardo Feijao Pinho", quantity: 1 }),
    sale({ time: "09:23", clientName: "Raimunda Raimunda Sousa", quantity: 1 }),
    sale({ time: "09:28", clientName: "Carla Gabriela Bernardo Martins", quantity: 1 }),
    sale({ time: "09:30", clientName: "Maria Clara Gomes Mororo", quantity: 1 }),
    sale({ time: "09:33", clientName: "Francisco Vanderson O Dias", quantity: 1 }),
    sale({ time: "09:41", clientName: "Caio Felipe Teixeira Pereira", quantity: 1 }),
    sale({ time: "09:45", clientName: "Nathanael Roberto Da Silva Neto", quantity: 1 }),
    sale({ time: "09:45", clientName: "Bernardo Ferreira Domingo", quantity: 1 }),
    sale({ time: "09:54", clientName: "Barbara Braga Melo", quantity: 1 }),
    sale({ time: "10:02", clientName: "Lucas Moraes", quantity: 1 }),
    sale({ time: "10:26", clientName: "Meylla Sinnara Ribeiro Dos Santos", quantity: 1 }),
    sale({
      time: "10:35",
      clientName: "Henrique Alberto Matos Da Rocha",
      quantity: 2,
      notes: "Compra pessoal do Henrique — fora da cota de trabalho (cota = 4 de ontem às 16:02).",
    }),
    sale({ time: "10:36", clientName: "João Pedro De Souza Pereira Marques", quantity: 1 }),
    sale({ time: "13:52", clientName: "Maria Mikelly Monteiro Coutinho", quantity: 1 }),
    sale({ time: "14:53", clientName: "Helano Clysman Fernandes Dos Santos", quantity: 1 }),
    sale({ time: "15:03", clientName: "Leonardo De Sousa Sena", quantity: 1 }),
    sale({
      time: "16:02",
      clientName: "Henrique Alberto Matos Da Rocha",
      quantity: 4,
      department: HENRIQUE,
      productName: P.mistaoFrito,
      notes: "Trabalho do Henrique — 4 mistão da geladeira de 10/09, custo zero, todos vendidos R$20.",
    }),
    sale({
      time: "16:24",
      clientName: "Henrique Alberto Matos Da Rocha",
      quantity: 1,
      notes: "Compra pessoal do Henrique — não entra na cota de trabalho.",
    }),
    sale({
      time: "19:00",
      clientName: "Ana Laura",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 11/09 — 1 dos 4. R$5 pendente.",
    }),
    sale({
      time: "19:01",
      clientName: "Fiado não reconhecido A (11/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 11/09 sem nome. R$5 pendente.",
    }),
    sale({
      time: "19:02",
      clientName: "Fiado não reconhecido B (11/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 11/09 sem nome. R$5 pendente.",
    }),
    sale({
      time: "19:03",
      clientName: "Fiado não reconhecido C (11/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado 11/09 sem nome. R$5 pendente.",
    }),
  ];

  if (unitsOf(salesList.filter((s) => s.paymentStatus !== "pending")) !== 27) {
    throw new Error(`11/09 pagos ${unitsOf(salesList)} ≠ 27`);
  }
  if (unitsOf(salesList) !== 31) throw new Error("11/09 total unidades ≠ 31");

  return {
    businessId: BUSINESS,
    date: "2026-09-11",
    purchase: {
      totalUnits: 30,
      investment: 105,
      ownInvestment: 50,
      thirdParty: { name: "Terceiros", amount: 55 },
      products: [
        { name: P.mistaoFrito, quantity: 11 },
        { name: P.frango, quantity: 6 },
        { name: P.croissant, quantity: 5 },
        { name: P.carneForno, quantity: 3 },
        { name: P.mistaoForno, quantity: 3 },
        { name: P.queijo, quantity: 2 },
      ],
    },
    summary: { revenue: 135, profit: 85, quantitySold: 31, quantityLost: 0, forecastProfit: 60 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Compra 30 un · R$105 (own R$50 + terceiros R$55). Manhã 22 + tarde 8.",
      "Mix: Mistão frito 11 · Frango forno 6 · Croissant 5 · Carne forno 3 · Mistão forno 3 · Queijo frito 2.",
      "Henrique: 4 mistão da geladeira de 10/09, custo 0, todos vendidos R$20 (16:02). 10:35 (2) e 16:24 (1) são compra pessoal.",
      "Lista paga 27 un · R$135. Fiados 4 · R$20: Ana Laura + 3 sem nome (confirmado).",
      "3 croissants não vendidos foram para 12/09 — geladeira, não perda.",
      "Lucro R$85 (= 135 − 50). Bônus R$0.",
      "Bloco '26 un · Henrique 3 · Unifor 7 · Acal 20' era sobra do modelo do 10/09 — ignorado.",
      "Cofrinho prático na nota: R$2.612,58.",
    ].join("\n"),
    manualInsights: "Lucro R$85 com 4 fiados fora da lista e 3 na geladeira para o sábado.",
    lessonsLearned: "Dos 4 fiados, só a Ana Laura tem nome. Os 3 croissants saíram no 12/09.",
  };
}

function plan12(): DayRegistrationPlan {
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      quantity: 3,
      department: HENRIQUE,
      productName: P.croissant,
      notes: "3 croissants da geladeira de 11/09. Custo zero. Vendidos R$15.",
    }),
  ];
  return {
    businessId: BUSINESS,
    date: "2026-09-12",
    summary: { revenue: 15, profit: 15, quantitySold: 3, quantityLost: 0 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Sábado. Sem compra nova.",
      "Henrique vendeu os 3 croissants que sobraram em 11/09. Custo zero. Lucro R$15.",
      "Cofrinho prático na nota: R$2.627,58 (= 2.612,58 + 15).",
    ].join("\n"),
    manualInsights: "Geladeira do 11 virou venda no sábado, custo zero.",
    lessonsLearned: "Sobra de sexta no trabalho do Henrique no sábado.",
  };
}

function plan16(): DayRegistrationPlan {
  const lines: Array<[string, string, number]> = [
    ["08:09", "João Pedro De Souza Pereira Marques", 3],
    ["09:12", "Arthur Xavier De Magalhaes", 1],
    ["09:15", "Francisco S S Souza", 6],
    ["09:19", "Francisco Anderson Das Chagas Xavier Rocha", 1],
    ["09:25", "Valentina Macedo Barbosa", 1],
    ["09:26", "Katarina Barros Pereira Bacelar", 1],
    ["09:26", "Alecsandra Alves De Sousa", 1],
    ["10:04", "Dayanna Kelly Costa Almeida", 1],
    ["10:05", "Maria Mikelly Monteiro Coutinho", 2],
    ["10:07", "Maria Mikelly Monteiro Coutinho", 2],
    ["10:12", "Davi Oliveira Da Silva Ayoub", 2],
    ["10:28", "João Pedro De Souza Pereira Marques", 1],
    ["11:23", "Danilo Duarte Nobre", 1],
    ["11:52", "Leonardo De Sousa Sena", 1],
    ["13:28", "Maria Eduarda Viana Pereira", 1],
    ["14:55", "Anselmo Gabriel", 1],
    ["15:00", "Raimunda Raimunda Sousa", 2],
    ["15:08", "Francisco Ricardo Feijao Pinho", 1],
    ["15:54", "Vanderson Dias", 1],
    ["16:20", "Paulo Andre Cavalcante Oliveira", 1],
    ["17:39", "Henrique Alberto Matos Da Rocha", 6],
  ];
  const salesList: DraftSale[] = lines.map(([time, clientName, quantity]) =>
    sale({
      time,
      clientName,
      quantity,
      department: clientName.startsWith("Henrique") ? HENRIQUE : ACAL,
      notes:
        clientName.startsWith("Henrique")
          ? "Trabalho do Henrique — 6/6 vendidos R$30."
          : undefined,
    }),
  );
  salesList.push(
    sale({
      time: "19:00",
      clientName: "Ana Laura",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Fiado novo 16/09. R$5. Acordo: Laura paga o mês em 30/09.",
    }),
  );
  if (unitsOf(salesList.filter((s) => s.paymentStatus !== "pending")) !== 37) {
    throw new Error("16/09 lista paga ≠ 37");
  }

  return {
    businessId: BUSINESS,
    date: "2026-09-16",
    purchase: {
      totalUnits: 32,
      investment: 98.5,
      ownInvestment: 90,
      thirdParty: { name: "Terceiros", amount: 8.5 },
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.croissant, quantity: 4 },
        { name: P.frango, quantity: 5 },
        { name: P.carneForno, quantity: 1 },
        { name: P.mistaoForno, quantity: 5 },
        { name: P.queijo, quantity: 5 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.queijo, quantity: 1 },
        { name: P.frango, quantity: 1 },
        { name: P.croissant, quantity: 1 },
      ],
    },
    summary: { revenue: 185, profit: 95, quantitySold: 38, quantityLost: 0 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Compra 32 un · R$98,50 (own R$90 + terceiros R$8,50).",
      "Lista paga 37 un · R$185. Fiado novo: Ana Laura R$5.",
      "Lucro R$95 (= 185 − 90). Quitações citadas (João Pedro, Mikelly, Laura) não foram somadas por cima: se entrassem de novo, aumentariam o valor que já está no banco.",
      "Linha 'somente desse dia R$130' era sobra de modelo — ignorada.",
      "Cofrinho prático na nota: R$2.871,64.",
    ].join("\n"),
    manualInsights: "Lucro homologado R$95, sem somar quitação em cima.",
    lessonsLearned: "Quitação não entra como pago extra quando o lucro da nota já é o número do banco.",
  };
}

function plan17(): DayRegistrationPlan {
  const salesList: DraftSale[] = [
    sale({
      time: "12:00",
      clientName: "Henrique Alberto Matos Da Rocha",
      quantity: 6,
      department: HENRIQUE,
      notes: "Trabalho do Henrique — 6/6 vendidos R$30. Resto da lista de clientes ainda não foi lançado.",
    }),
    sale({
      time: "18:30",
      clientName: "Ana Laura",
      quantity: 1,
      productName: P.queijo,
      paymentStatus: "pending",
      notes: "Fiado 17/09 — 1 queijo frito. Acordo: paga tudo do mês em 30/09.",
    }),
    sale({
      time: "18:31",
      clientName: "Ana Laura",
      quantity: 1,
      productName: P.frango,
      paymentStatus: "pending",
      notes: "Fiado 17/09 — 1 frango forno. Acordo: paga tudo do mês em 30/09.",
    }),
  ];
  return {
    businessId: BUSINESS,
    date: "2026-09-17",
    purchase: {
      totalUnits: 38,
      investment: 90,
      ownInvestment: 90,
      products: [{ name: P.unknown, quantity: 38 }],
    },
    summary: { revenue: 175, profit: 85, quantitySold: 38, quantityLost: 0 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Resumo, sem lista de clientes — Lucas vai completar depois.",
      "Levados 38 un. Custo R$90 (só o próprio; terceiros não informados).",
      "Canais na nota: Henrique 6 todos R$30 · Unifor 11 (recebido R$35) · Acal 21 (recebido R$90).",
      "Faturamento do dia R$175. Lucro R$85 (= 175 − 90).",
      "A receber na noite: JV R$15, Laura R$10, Henrique R$5. JV e o R$5 do Henrique foram recebidos em 18/09 e já estão dentro dos R$155/R$65 daquele dia — não ficam pendentes aqui para não somar de novo.",
      "Laura R$10 segue pendente até 30/09.",
      "Cofrinho prático na nota: R$2.957,95.",
    ].join("\n"),
    manualInsights: "Dia lançado pelo resumo. Lista de vendas ainda falta.",
    lessonsLearned: "Acordo da Laura: fiados do mês fecham em 30/09.",
  };
}

function plan18(): DayRegistrationPlan {
  const lines: Array<[string, string, number, string?]> = [
    ["07:38", "Hellen Alessandra Oliveira Costa", 1],
    ["09:07", "Ana Luzia Araújo Uchoa", 3],
    ["09:27", "Leonardo De Sousa Sena", 1],
    ["09:36", "Maria Graziele Dos Santos Oliveira", 1],
    ["09:52", "Ismael Silva Da Paz", 1],
    ["10:06", "Cleane Cipriano Pereira", 1],
    ["10:44", "Meylla Sinnara Ribeiro Dos Santos", 1],
    ["11:22", "Danilo Duarte Nobre", 1],
    ["13:28", "João Victor dos Santos Carvalho", 3, "Quitação dos 3 mistão de 17/09. Já entra nos R$155; não somar de novo."],
    ["13:58", "Helano Clysman Fernandes Dos Santos", 1],
    ["15:05", "Henrique Alberto Matos Da Rocha", 6, "Trabalho do Henrique — 6/6 R$30."],
    ["15:34", "Arthur Cavalcante Passos", 1],
    ["15:58", "Igor Silva Vieira", 1],
    ["16:02", "Mylena Kelly De Sousa Lima", 1],
    ["16:02", "Rodrigo David Gadelha De Sousa", 1],
    ["16:09", "Cleane Cipriano Pereira", 1],
    ["16:42", "Davi Oliveira Da Silva Ayoub", 1],
    ["17:52", "Henrique Alberto Matos Da Rocha", 2, "Compra pessoal — fora da cota de 6."],
    ["19:36", "Walderlan Falcao Dos Santos", 1],
    ["19:40", "Henrique Alberto Matos Da Rocha", 1, "Compra pessoal — fora da cota de 6."],
  ];
  const salesList: DraftSale[] = lines.map(([time, clientName, quantity, notes]) =>
    sale({
      time,
      clientName,
      quantity,
      department: time === "15:05" ? HENRIQUE : ACAL,
      notes,
    }),
  );
  salesList.push(
    sale({
      time: "19:50",
      clientName: "Ana Laura",
      quantity: 5,
      paymentStatus: "pending",
      notes: "5 un · R$25. Paga em 30/09 junto com o restante do mês.",
    }),
    sale({
      time: "19:51",
      clientName: "Fiado não reconhecido A (18/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Pendente sem nome na Acal. R$5.",
    }),
    sale({
      time: "19:52",
      clientName: "Fiado não reconhecido B (18/09)",
      quantity: 1,
      paymentStatus: "pending",
      notes: "Pendente sem nome na Acal. R$5.",
    }),
  );
  const paid = unitsOf(salesList.filter((s) => s.paymentStatus !== "pending"));
  if (paid !== 30) throw new Error(`18/09 pagos ${paid} ≠ 30`);

  return {
    businessId: BUSINESS,
    date: "2026-09-18",
    purchase: {
      totalUnits: 34,
      investment: 90,
      ownInvestment: 90,
      products: [
        { name: P.mistaoFrito, quantity: 12 },
        { name: P.queijo, quantity: 6 },
        { name: P.croissant, quantity: 5 },
        { name: P.frango, quantity: 5 },
        { name: P.mistaoForno, quantity: 4 },
        { name: P.carneForno, quantity: 2 },
      ],
      fatherAllocation: [
        { name: P.mistaoFrito, quantity: 3 },
        { name: P.mistaoForno, quantity: 1 },
        { name: P.frango, quantity: 1 },
        { name: P.queijo, quantity: 1 },
      ],
    },
    summary: { revenue: 155, profit: 65, quantitySold: 37, quantityLost: 0 },
    sales: salesList,
    newClients: clientsFromSales(salesList),
    observations: [
      "Compra 34 un. Custo na nota só R$90 (own). Terceiros não informados.",
      "Lista MP 30 un · R$150. Faturamento do dia R$155 (inclui o R$5 em dinheiro do Henrique). Lucro R$65 (= 155 − 90).",
      "Quitações não somam em cima dos 65. JV (13:28) e o R$5 do Henrique já estão dentro desse faturamento.",
      "Laura 5 un · R$25 pendente até 30/09. Mais 2 pendentes sem nome · R$10.",
      "Cota Henrique 6 (15:05). 17:52 e 19:40 são compra pessoal.",
      "Linha do cofrinho no bloco veio em branco — saldo prático não foi avançado além de 17/09.",
    ].join("\n"),
    manualInsights: "Lucro R$65 homologado. Cofrinho do dia em branco na nota.",
    lessonsLearned: "Laura acumula fiados até 30/09. Dois pendentes da Acal ainda sem nome.",
  };
}

async function main() {
  const days: Array<{ plan: DayRegistrationPlan; diary: Parameters<typeof commitDay>[1] }> = [
    {
      plan: plan11(),
      diary: {
        profit: 85,
        received: 135,
        pending: 20,
        total: 155,
        quantitySold: 31,
        paidCount: 27,
        creditCount: 4,
        fatherSale: { units: 4, amount: 20, buyerName: "Colegas do Henrique" },
      },
    },
    {
      plan: plan12(),
      diary: {
        profit: 15,
        received: 15,
        pending: 0,
        total: 15,
        quantitySold: 3,
        paidCount: 3,
        creditCount: 0,
        fatherSale: { units: 3, amount: 15, buyerName: "Colegas do Henrique" },
        fixPricing: false,
      },
    },
    {
      plan: plan16(),
      diary: {
        profit: 95,
        received: 185,
        pending: 5,
        total: 190,
        quantitySold: 38,
        paidCount: 37,
        creditCount: 1,
        fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
      },
    },
    {
      plan: plan17(),
      diary: {
        profit: 85,
        received: 175,
        pending: 10,
        total: 185,
        quantitySold: 38,
        paidCount: 6,
        creditCount: 2,
        fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
        fixPricing: false,
      },
    },
    {
      plan: plan18(),
      diary: {
        profit: 65,
        received: 155,
        pending: 35,
        total: 190,
        quantitySold: 37,
        paidCount: 30,
        creditCount: 7,
        fatherSale: { units: 6, amount: 30, buyerName: "Colegas do Henrique" },
        fixPricing: false,
      },
    },
  ];

  for (const day of days) {
    await commitDay(day.plan, day.diary);
  }

  await setPracticalProfitBankBalance(BUSINESS, 2957.95);
  console.log("✓ Cofrinho prático → R$2.957,95 (último número escrito, 17/09; 18/09 veio em branco)");
  console.log("ALL_DAYS_OK");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
