"use client";

import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartCard } from "@/components/charts/chart-card";
import { PageLoader } from "@/components/ui/loading";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { useBusinessScope } from "@/hooks/use-business-scope";
import { getBusinessUnitName, isAllBusinesses } from "@/lib/business-units";

interface Projection {
  dailyUnits: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  monthlyUnits: number;
}

export default function ProjecoesPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const operationLabel = isAllBusinesses(activeBusinessId)
    ? "todas as operações"
    : getBusinessUnitName(activeBusinessId).toLowerCase();

  const { data: projections, isLoading } = useQuery<Projection[]>({
    queryKey: ["projections", activeBusinessId],
    queryFn: () => fetch(withQuery("/api/projections")).then((r) => r.json()),
  });

  if (isLoading || !projections) {
    return (
      <ModuleShell title="Projeções">
        <PageLoader />
      </ModuleShell>
    );
  }

  const revenueChart = projections.map((p) => ({
    label: `${p.dailyUnits}/dia`,
    value: p.monthlyRevenue,
    profit: p.monthlyProfit,
  }));

  const profitChart = projections.map((p) => ({
    label: `${p.dailyUnits}/dia`,
    value: p.monthlyProfit,
  }));

  return (
    <ModuleShell title="Projeções" subtitle="Simule o crescimento do seu negócio">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10">
            <TrendingUp className="h-6 w-6 text-brand-orange" />
          </div>
          <p className="text-text-secondary">
            Projeções baseadas na média de preço e custo de {operationLabel} (22 dias úteis/mês)
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projections.map((p, i) => (
            <motion.div
              key={p.dailyUnits}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="text-center p-5">
                <p className="text-3xl font-bold text-brand-orange mb-1">{p.dailyUnits}</p>
                <p className="text-xs text-text-muted mb-4">unidades/dia</p>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-text-muted text-xs">Receita Mensal</p>
                    <p className="font-bold">{formatCurrency(p.monthlyRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Lucro Mensal</p>
                    <p className="font-bold text-brand-green">{formatCurrency(p.monthlyProfit)}</p>
                  </div>
                  <div>
                    <p className="text-text-muted text-xs">Unidades/Mês</p>
                    <p className="font-semibold">{p.monthlyUnits}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <ChartCard data={revenueChart} title="Projeção de Receita Mensal" type="bar" height={350} />
          <ChartCard data={profitChart} title="Projeção de Lucro Mensal" type="bar" height={350} />
        </div>
      </div>
    </ModuleShell>
  );
}
