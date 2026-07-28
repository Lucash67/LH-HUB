/**
 * Unifica clientes duplicados (ex.: Francisco Vanderson ↔ Vanderson Dias)
 * e repara horários/quantidades desde o 1º dia Salgados (16/07/2026).
 *
 * Fontes: enrich-acal-day1.mjs · register-acal-day2-via-api.mjs · reconcile-salgados-2007-official-list.mjs
 * Idempotente — seguro reexecutar.
 */
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const BUSINESS_ID = "salgados";
const db = new Database(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "lucas-business-os.db"),
);

/** Nome canônico → variantes conhecidas (inclui o próprio canônico). */
const IDENTITY_GROUPS = [
  {
    canonical: "Vanderson Dias",
    aliases: ["Francisco Vanderson O Dias", "Vanderson Dias"],
  },
  {
    canonical: "Dayanna Kelly Costa Almeida",
    aliases: ["Dayanna Kelly Costa da Silva", "Dayanna Kelly Costa Almeida"],
  },
  {
    canonical: "Leonardo De Sousa Sena",
    aliases: ["Leonardo de Sousa Sena", "Leonardo De Sousa Sena"],
  },
  {
    canonical: "Maria Mikelly Monteiro Coutinho",
    aliases: ["Maria Mikelly Monteiro Coutinho", "Mikely", "Maria Mikelly"],
  },
  {
    canonical: "Lucas Moraes",
    aliases: ["Lucas Moraes"],
  },
  {
    canonical: "Jackson Mendes Pinheiro",
    aliases: ["Jackson Mendes Pinheiro"],
  },
  {
    canonical: "Raimunda Raimunda Sousa",
    aliases: ["Raimunda Raimunda Sousa", "Raimunda"],
  },
  {
    canonical: "Henrique",
    aliases: ["Henrique"],
  },
  {
    canonical: "Gerb da Silva Maganos",
    aliases: ["Gerb da Silva"],
  },
  {
    canonical: "Maria Graziele Santos Oliveira",
    aliases: ["Maria Graziele"],
  },
  {
    canonical: "Maria Clara Gomes Mororo",
    aliases: ["Maria Clara Gomes Mororo"],
  },
  {
    canonical: "Anselmo Gabriel Freire da Silva",
    aliases: ["Anselmo Gabriel Freire da Silva"],
  },
];

/** Cronologia oficial por dia — hora · cliente canônico · produto · qtd */
const OFFICIAL_DAYS = {
  "2026-07-16": [
    { time: "09:09", client: "Diego Martins Pinheiro", product: "croissant", qty: 1 },
    { time: "09:09", client: "Francisco Ricardo Feijão Pinho", product: "misto", qty: 1 },
    { time: "09:14", client: "Germana Nataeli de Oliveira", product: "pastel", qty: 2 },
    { time: "09:16", client: "Daniele Gomes Silva", product: "misto", qty: 1 },
    { time: "09:26", client: "Maria Graziele Santos Oliveira", product: "croissant", qty: 1 },
    { time: "09:29", client: "Vanderson Dias", product: "croissant", qty: 1 },
    { time: "09:55", client: "Maria Mikelly Monteiro Coutinho", product: "pastel", qty: 1 },
    { time: "09:56", client: "Dayanna Kelly Costa Almeida", product: "misto", qty: 1 },
  ],
  "2026-07-17": [
    { time: "08:52", client: "Paulo André Cavalcante Oliveira", product: "croissant", qty: 1 },
    { time: "08:54", client: "Raimunda Raimunda Sousa", product: "pastel", qty: 1 },
    { time: "09:02", client: "Dayanna Kelly Costa Almeida", product: "pastel", qty: 1 },
    { time: "09:10", client: "Jackson Mendes Pinheiro", product: "croissant", qty: 1 },
    { time: "09:10", client: "Gerb da Silva Maganos", product: "croissant", qty: 1 },
    { time: "09:25", client: "Maria Clara Gomes Mororo", product: "pastel", qty: 1 },
    { time: "09:47", client: "Ana Letícia Ferreira dos Santos", product: "misto", qty: 1 },
    { time: "09:55", client: "Maurício de Sá Machado Júnior", product: "misto", qty: 1 },
    { time: "09:59", client: "Lucas Moraes", product: "misto", qty: 1 },
    { time: "14:58", client: "Raimunda Raimunda Sousa", product: "croissant", qty: 1 },
    { time: "15:35", client: "José Inácio Silva da Cruz", product: "croissant", qty: 1 },
    { time: "15:37", client: "Leonardo De Sousa Sena", product: "pastel", qty: 1 },
  ],
  "2026-07-20": [
    { time: "09:34", client: "Raimunda Raimunda Sousa", product: "pastel", qty: 1 },
    { time: "09:40", client: "Lucas Moraes", product: "pastel", qty: 1 },
    { time: "09:50", client: "Vanderson Dias", product: "pastel", qty: 2 },
    { time: "10:04", client: "Dayanna Kelly Costa Almeida", product: "pastel", qty: 1 },
    { time: "10:48", client: "Jackson Mendes Pinheiro", product: "misto", qty: 2 },
    { time: "10:55", client: "Maria Mikelly Monteiro Coutinho", product: "croissant", qty: 1 },
    { time: "12:10", client: "Francisca Laize De Oliveira Ribeiro", product: "croissant", qty: 1 },
    { time: "15:30", client: "Bruno Medeiros Silva", product: "misto", qty: 1 },
    { time: "15:30", client: "Leonardo De Sousa Sena", product: "misto", qty: 1 },
    { time: "20:00", client: "Henrique", product: "croissant", qty: 3 },
  ],
  "2026-07-21": [
    { time: "09:14", client: "Ana Raquel Lima de Araújo", product: "croissant", qty: 1 },
    { time: "09:14", client: "Ana Raquel Lima de Araújo", product: "misto", qty: 1 },
    { time: "09:24", client: "Maria Clara Gomes Mororo", product: "pastel", qty: 1 },
    { time: "09:24", client: "Maria Mikelly Monteiro Coutinho", product: "pastel", qty: 1 },
    { time: "09:47", client: "Gerb da Silva Maganos", product: "misto", qty: 1 },
    { time: "09:48", client: "Maria Graziele Santos Oliveira", product: "pastel", qty: 1 },
    { time: "09:48", client: "Vanderson Dias", product: "pastel", qty: 1 },
    { time: "09:49", client: "Iury Guilherme", product: "croissant", qty: 1 },
    { time: "09:49", client: "Iury Guilherme", product: "misto", qty: 1 },
    { time: "10:03", client: "Dayanna Kelly Costa Almeida", product: "misto", qty: 1 },
    { time: "11:28", client: "Francisco de Assis Soares Pereira", product: "croissant", qty: 1 },
    { time: "15:21", client: "Anselmo Gabriel Freire da Silva", product: "croissant", qty: 1 },
  ],
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function aliasSet(group) {
  return new Set(group.aliases.map(normalizeName).concat(normalizeName(group.canonical)));
}

function findGroupForName(name) {
  const n = normalizeName(name);
  for (const group of IDENTITY_GROUPS) {
    if (aliasSet(group).has(n)) return group;
  }
  if (n.includes("vanderson")) {
    return IDENTITY_GROUPS.find((g) => g.canonical === "Vanderson Dias");
  }
  if (n.includes("dayanna")) {
    return IDENTITY_GROUPS.find((g) => g.canonical === "Dayanna Kelly Costa Almeida");
  }
  if (n.includes("mikely") || n.includes("mikelly")) {
    return IDENTITY_GROUPS.find((g) => g.canonical === "Maria Mikelly Monteiro Coutinho");
  }
  const first = n.split(" ")[0];
  const last = n.split(" ").at(-1);
  for (const group of IDENTITY_GROUPS) {
    for (const alias of group.aliases) {
      const parts = normalizeName(alias).split(" ");
      if (parts[0] === first && parts.at(-1) === last) return group;
    }
  }
  return null;
}

function productKeyFromDbName(name) {
  const lower = name.toLowerCase();
  if (lower.includes("croissant")) return "croissant";
  if (lower.includes("misto")) return "misto";
  if (lower.includes("pastel")) return "pastel";
  return null;
}

function findProducts(tx) {
  const rows = tx.prepare("SELECT id, name FROM products WHERE business_id = ?").all(BUSINESS_ID);
  const map = {};
  for (const p of rows) {
    const key = productKeyFromDbName(p.name);
    if (key) map[key] = p.id;
  }
  return map;
}

function mergeDuplicateClients(tx) {
  const allClients = tx.prepare("SELECT id, name, business_id, created_at FROM clients").all();
  let merges = 0;

  for (const group of IDENTITY_GROUPS) {
    const aliases = aliasSet(group);
    const matches = allClients.filter((c) => {
      const n = normalizeName(c.name);
      if (aliases.has(n)) return true;
      return findGroupForName(c.name)?.canonical === group.canonical;
    });

    if (matches.length <= 1) {
      if (matches.length === 1 && matches[0].name !== group.canonical) {
        tx.prepare("UPDATE clients SET name = ?, updated_at = datetime('now') WHERE id = ?").run(
          group.canonical,
          matches[0].id,
        );
      }
      continue;
    }

    const withSales = matches.map((c) => ({
      ...c,
      salgadosSales: tx
        .prepare("SELECT COUNT(*) as c FROM sales WHERE client_id = ? AND business_id = ?")
        .get(c.id, BUSINESS_ID).c,
    }));

    withSales.sort(
      (a, b) =>
        b.salgadosSales - a.salgadosSales ||
        (a.name === group.canonical ? -1 : 1) ||
        a.created_at.localeCompare(b.created_at),
    );

    const keeper = withSales[0];
    const dupes = withSales.slice(1);

    tx.prepare("UPDATE clients SET name = ?, business_id = ?, updated_at = datetime('now') WHERE id = ?").run(
      group.canonical,
      BUSINESS_ID,
      keeper.id,
    );

    for (const dupe of dupes) {
      tx.prepare("UPDATE sales SET client_id = ?, updated_at = datetime('now') WHERE client_id = ?").run(
        keeper.id,
        dupe.id,
      );
      tx.prepare("DELETE FROM clients WHERE id = ?").run(dupe.id);
      merges++;
      console.log(`  ↳ ${dupe.name} → ${group.canonical}`);
    }
  }

  return merges;
}

function mergeExactNameDuplicates(tx) {
  const dupes = tx
    .prepare(
      `SELECT lower(trim(name)) as norm, GROUP_CONCAT(id) as ids, COUNT(*) as c
       FROM clients
       GROUP BY norm HAVING c > 1`,
    )
    .all();

  let merges = 0;
  for (const row of dupes) {
    const ids = row.ids.split(",");
    const clients = ids.map((id) => tx.prepare("SELECT id, name, created_at FROM clients WHERE id = ?").get(id));
    clients.sort((a, b) => a.created_at.localeCompare(b.created_at));
    const keeper = clients[0];
    for (const dupe of clients.slice(1)) {
      tx.prepare("UPDATE sales SET client_id = ? WHERE client_id = ?").run(keeper.id, dupe.id);
      tx.prepare("DELETE FROM clients WHERE id = ?").run(dupe.id);
      merges++;
      console.log(`  ↳ dup nome ${dupe.name}`);
    }
  }
  return merges;
}

function getClientIdByCanonical(tx, canonicalName) {
  const group = IDENTITY_GROUPS.find((g) => g.canonical === canonicalName);
  const names = group ? [group.canonical, ...group.aliases] : [canonicalName];

  for (const name of names) {
    const row = tx.prepare("SELECT id FROM clients WHERE name = ?").get(name);
    if (row) return row.id;
  }

  const fuzzy = tx
    .prepare("SELECT id, name FROM clients")
    .all()
    .find((c) => findGroupForName(c.name)?.canonical === canonicalName || c.name === canonicalName);
  return fuzzy?.id ?? null;
}

function repairDayTimeline(tx, date, entries, productIds) {
  const salesRows = tx
    .prepare(
      `SELECT s.id, s.time, s.client_id, c.name as client_name,
              si.quantity, p.name as product_name
       FROM sales s
       JOIN clients c ON c.id = s.client_id
       JOIN sale_items si ON si.sale_id = s.id
       JOIN products p ON p.id = si.product_id
       WHERE s.date = ? AND s.business_id = ?
       ORDER BY s.time, s.id`,
    )
    .all(date, BUSINESS_ID);

  const used = new Set();
  let fixed = 0;

  for (const expected of entries) {
    const clientId = getClientIdByCanonical(tx, expected.client);
    if (!clientId) {
      console.warn(`  ⚠ cliente ausente: ${expected.client}`);
      continue;
    }

    const match = salesRows.find((row) => {
      if (used.has(row.id)) return false;
      const rowGroup = findGroupForName(row.client_name);
      const expGroup = findGroupForName(expected.client);
      const sameClient =
        row.client_id === clientId ||
        (rowGroup && expGroup && rowGroup.canonical === expGroup.canonical) ||
        normalizeName(row.client_name) === normalizeName(expected.client);
      const sameProduct = productKeyFromDbName(row.product_name) === expected.product;
      const sameQty = row.quantity === expected.qty;
      return sameClient && sameProduct && sameQty;
    });

    if (!match) {
      console.warn(`  ⚠ venda não encontrada: ${date} ${expected.time} ${expected.client}`);
      continue;
    }

    used.add(match.id);
    if (match.time !== expected.time) {
      tx.prepare("UPDATE sales SET time = ?, updated_at = datetime('now') WHERE id = ?").run(
        expected.time,
        match.id,
      );
      fixed++;
    }
    if (match.client_id !== clientId) {
      tx.prepare("UPDATE sales SET client_id = ?, updated_at = datetime('now') WHERE id = ?").run(
        clientId,
        match.id,
      );
    }
  }

  return fixed;
}

function recalcSoldQuantities(tx) {
  const products = tx.prepare("SELECT id FROM products WHERE business_id = ?").all(BUSINESS_ID);
  for (const p of products) {
    const row = tx
      .prepare(
        `SELECT COALESCE(SUM(si.quantity), 0) as qty
         FROM sale_items si JOIN sales s ON s.id = si.sale_id
         WHERE si.product_id = ? AND s.business_id = ?`,
      )
      .get(p.id, BUSINESS_ID);
    tx.prepare("UPDATE products SET sold_quantity = ?, updated_at = datetime('now') WHERE id = ?").run(
      row.qty,
      p.id,
    );
  }
}

function txEnsureBusinessId(tx) {
  tx.prepare(
    `UPDATE sales SET business_id = ? WHERE business_id IS NULL OR business_id = '' OR business_id = 'default'`,
  ).run(BUSINESS_ID);
}

function validate(tx) {
  const vanderson = tx
    .prepare(
      `SELECT c.name, COUNT(s.id) as compras, ROUND(SUM(s.total_amount),2) as total
       FROM clients c JOIN sales s ON s.client_id = c.id AND s.business_id = 'salgados'
       WHERE lower(c.name) LIKE '%vanderson%'
       GROUP BY c.id`,
    )
    .all();

  console.log("\n=== Vanderson unificado ===");
  console.table(vanderson);

  if (vanderson.length !== 1) {
    throw new Error(`Esperado 1 Vanderson, encontrado ${vanderson.length}`);
  }
  if (vanderson[0].compras < 2) {
    throw new Error(`Vanderson deveria ter ≥2 compras, tem ${vanderson[0].compras}`);
  }
}

function main() {
  console.log("=== Reconciliação histórica Salgados ===");

  db.transaction(() => {
    const productIds = findProducts(db);

    console.log("\n1. Mesclando identidades…");
    const m1 = mergeDuplicateClients(db);
    const m2 = mergeExactNameDuplicates(db);
    console.log(`   ${m1 + m2} fusões`);

    console.log("\n2. Reparando horários…");
    let timeFixes = 0;
    for (const [date, entries] of Object.entries(OFFICIAL_DAYS)) {
      const n = repairDayTimeline(db, date, entries, productIds);
      if (n > 0) console.log(`   ${date}: ${n} horários`);
      timeFixes += n;
    }
    console.log(`   Total: ${timeFixes} horários corrigidos`);

    txEnsureBusinessId(db);
    recalcSoldQuantities(db);
  })();

  validate(db);
  console.log("\n✓ Concluído.");
  db.close();
}

main();
