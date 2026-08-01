"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loading";
import { ExecutiveSummary } from "@/components/executive/executive-summary";
import { SectionPanel } from "@/components/executive/section-panel";
import { FileText, Download } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { isViewingGeneral, useTemporalViewContext } from "@/stores/temporal-context-store";

interface ReportData {
  type: string;
  period: { start: string; end: string };
  totalRevenue?: number;
  totalProfit?: number;
  totalItems?: number;
  totalSales?: number;
  revenue?: number;
  profit?: number;
  itemsSold?: number;
  salesCount?: number;
  averageTicket?: number;
  paymentBreakdown?: Record<string, number>;
  productBreakdown?: Record<string, number>;
  days?: ReportData[];
}

interface GoalRow {
  type: string;
  targetAmount: number;
}

const reportTypes = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
  { value: "yearly", label: "Anual" },
];

function exportCSV(data: ReportData) {
  const rows = [
    ["Relatório", data.type],
    ["Período", `${data.period.start} a ${data.period.end}`],
    ["Receita Total", String(data.totalRevenue ?? data.revenue ?? 0)],
    ["Lucro Total", String(data.totalProfit ?? data.profit ?? 0)],
    ["Itens Vendidos", String(data.totalItems ?? data.itemsSold ?? 0)],
    ["Vendas", String(data.totalSales ?? data.salesCount ?? 0)],
  ];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `relatorio-${data.type}-${data.period.start}.csv`;
  a.click();
}

function exportExcel(data: ReportData) {
  import("xlsx").then((XLSX) => {
    const ws = XLSX.utils.json_to_sheet([
      { Métrica: "Receita", Valor: data.totalRevenue ?? data.revenue ?? 0 },
      { Métrica: "Lucro", Valor: data.totalProfit ?? data.profit ?? 0 },
      { Métrica: "Itens", Valor: data.totalItems ?? data.itemsSold ?? 0 },
      { Métrica: "Vendas", Valor: data.totalSales ?? data.salesCount ?? 0 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `relatorio-${data.type}-${data.period.start}.xlsx`);
  });
}

function exportPDF(data: ReportData) {
  import("jspdf").then(({ default: jsPDF }) => {
    import("jspdf-autotable").then(() => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("LH Hub — Relatório", 14, 22);
      doc.setFontSize(11);
      doc.text(`Tipo: ${data.type} | Período: ${data.period.start} a ${data.period.end}`, 14, 32);
      // @ts-expect-error autotable plugin
      doc.autoTable({
        startY: 40,
        head: [["Métrica", "Valor"]],
        body: [
          ["Receita", formatCurrency(data.totalRevenue ?? data.revenue ?? 0)],
          ["Lucro", formatCurrency(data.totalProfit ?? data.profit ?? 0)],
          ["Itens Vendidos", String(data.totalItems ?? data.itemsSold ?? 0)],
          ["Vendas", String(data.totalSales ?? data.salesCount ?? 0)],
        ],
      });
      doc.save(`relatorio-${data.type}-${data.period.start}.pdf`);
    });
  });
}

export default function RelatoriosPage() {
  const [type, setType] = useState("daily");
  const { activeBusinessId, withQuery } = useBusinessScope();
  const context = useTemporalViewContext();
  const effectiveType = !isViewingGeneral(context) ? "daily" : type;

  const { data, isLoading } = useQuery<ReportData>({
    queryKey: ["reports", effectiveType, activeBusinessId, context.mode, context.viewDate],
    queryFn: () => {
      const dateQuery = !isViewingGeneral(context) ? `&date=${context.viewDate}` : "";
      return fetch(withQuery(`/api/reports?type=${effectiveType}${dateQuery}`)).then((r) => r.json());
    },
  });

  const { data: goals = [] } = useQuery<GoalRow[]>({
    queryKey: ["goals", activeBusinessId],
    queryFn: () => fetch(withQuery("/api/goals")).then((r) => r.json()),
  });

  const summary = useMemo(() => {
    if (!data) return null;
    const revenue = data.totalRevenue ?? data.revenue ?? 0;
    const sales = data.totalSales ?? data.salesCount ?? 0;
    const items = data.totalItems ?? data.itemsSold ?? 0;
    const productCount = data.productBreakdown ? Object.keys(data.productBreakdown).length : 0;
    const goalType = effectiveType === "monthly" ? "monthly" : effectiveType === "weekly" ? "weekly" : "daily";
    const goalTarget = goals.find((g) => g.type === goalType)?.targetAmount ?? 0;
    const goalPct = goalTarget > 0 ? Math.min(100, (revenue / goalTarget) * 100) : 0;

    let conclusion: string;
    if (goalTarget > 0 && revenue >= goalTarget) {
      conclusion = `Meta ${goalType === "monthly" ? "mensal" : goalType === "weekly" ? "semanal" : "diária"} atingida com ${formatCurrency(revenue)} — desempenho sólido no período.`;
    } else if (goalTarget > 0) {
      conclusion = `${goalPct.toFixed(0)}% da meta alcançada. Faltam ${formatCurrency(goalTarget - revenue)} para o objetivo.`;
    } else if (sales > 0) {
      conclusion = `${sales} vendas e ${items} itens movimentados — ticket médio de ${formatCurrency(data.averageTicket ?? revenue / sales)}.`;
    } else {
      conclusion = "Nenhuma movimentação registrada neste período.";
    }

    return {
      revenue,
      sales,
      items,
      productCount,
      goalLabel: goalTarget > 0 ? `${goalPct.toFixed(0)}%` : "—",
      conclusion,
    };
  }, [data, goals, effectiveType]);

  if (isLoading || !data || !summary) {
    return (
      <ModuleShell title="Relatórios">
        <PageLoader />
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="Relatórios" subtitle="Visão executiva e detalhes do período">
      <div className="space-y-5">

        {isViewingGeneral(context) && (
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((rt) => (
            <Button key={rt.value} variant={type === rt.value ? "default" : "secondary"} onClick={() => setType(rt.value)}>
              {rt.label}
            </Button>
          ))}
        </div>
        )}

        <ExecutiveSummary
          theme="reports"
          title="Resumo Executivo"
          conclusion={summary.conclusion}
          items={[
            { label: "Receita", value: formatCurrency(summary.revenue), highlight: true },
            { label: "Vendas", value: String(summary.sales) },
            { label: "Produtos", value: `${summary.productCount} ativos` },
            { label: "Meta", value: summary.goalLabel, highlight: summary.goalLabel !== "—" },
          ]}
        />

        <SectionPanel theme="reports" title="Detalhamento" subtitle={`${formatDate(data.period.start)} — ${formatDate(data.period.end)}`}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Relatório {reportTypes.find((r) => r.value === effectiveType)?.label}
                </CardTitle>
                <Badge>{formatDate(data.period.start)} — {formatDate(data.period.end)}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-surface-elevated p-3">
                  <p className="label-upper">Receita</p>
                  <p className="text-xl font-bold">{formatCurrency(summary.revenue)}</p>
                </div>
                <div className="rounded-xl bg-surface-elevated p-3">
                  <p className="label-upper">Lucro</p>
                  <p className="text-xl font-bold text-brand-green">{formatCurrency(data.totalProfit ?? data.profit ?? 0)}</p>
                </div>
                <div className="rounded-xl bg-surface-elevated p-3">
                  <p className="label-upper">Itens</p>
                  <p className="text-xl font-bold">{summary.items}</p>
                </div>
                <div className="rounded-xl bg-surface-elevated p-3">
                  <p className="label-upper">Vendas</p>
                  <p className="text-xl font-bold">{summary.sales}</p>
                </div>
              </div>

              {data.paymentBreakdown && (
                <div className="mb-5">
                  <h4 className="label-upper mb-2">Pagamentos</h4>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {Object.entries(data.paymentBreakdown).map(([method, amount]) => (
                      <div key={method} className="rounded-lg bg-surface-elevated p-3 text-sm">
                        <span className="text-text-muted uppercase">{method}: </span>
                        <span className="font-semibold">{formatCurrency(amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.productBreakdown && (
                <div className="mb-5">
                  <h4 className="label-upper mb-2">Produtos</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(data.productBreakdown).sort((a, b) => b[1] - a[1]).map(([name, qty]) => (
                      <div key={name} className="flex justify-between rounded-lg bg-surface-elevated px-4 py-2 text-sm">
                        <span>{name}</span>
                        <span className="font-semibold">{qty} un.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" onClick={() => exportPDF(data)}><Download className="h-4 w-4" />PDF</Button>
                <Button variant="secondary" size="sm" onClick={() => exportExcel(data)}><Download className="h-4 w-4" />Excel</Button>
                <Button variant="secondary" size="sm" onClick={() => exportCSV(data)}><Download className="h-4 w-4" />CSV</Button>
              </div>
            </CardContent>
          </Card>
        </SectionPanel>
      </div>
    </ModuleShell>
  );
}
