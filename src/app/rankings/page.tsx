"use client";

import { useQuery } from "@tanstack/react-query";
import { ModuleShell } from "@/components/layout/module-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/loading";
import { Trophy, Package, Users, Calendar, Clock, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { useBusinessScope } from "@/hooks/use-business-scope";

interface RankingsData {
  topProducts: Array<{ name: string; quantity: number; revenue: number; profit: number }>;
  topClients: Array<{ name: string; count: number; total: number; favorite: string }>;
  bestDays: Array<{ date: string; revenue: number }>;
  bestHours: Array<{ hour: string; count: number }>;
  bestDaysOfWeek: Array<{ day: string; revenue: number }>;
  highestRevenue?: [string, number];
  highestProfit?: { date: string; profit: number; totalAmount: number };
  highestTicket?: { date: string; totalAmount: number };
}

function RankingList({ items, renderItem }: { items: Array<Record<string, unknown>>; renderItem: (item: Record<string, unknown>, index: number) => React.ReactNode }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
          {renderItem(item, i)}
        </motion.div>
      ))}
    </div>
  );
}

export default function RankingsPage() {
  const { activeBusinessId, withQuery } = useBusinessScope();
  const { data, isLoading } = useQuery<RankingsData>({
    queryKey: ["rankings", activeBusinessId],
    queryFn: () => fetch(withQuery("/api/rankings")).then((r) => r.json()),
    staleTime: 90_000,
    placeholderData: (prev) => prev,
  });

  if (isLoading && !data) {
    return (
      <ModuleShell title="Rankings">
        <PageLoader />
      </ModuleShell>
    );
  }

  if (!data) {
    return (
      <ModuleShell title="Rankings">
        <p className="text-text-muted">Não foi possível carregar os rankings.</p>
      </ModuleShell>
    );
  }

  return (
    <ModuleShell title="Rankings" subtitle="Os melhores do seu negócio">
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-brand-orange" />Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingList
              items={data.topProducts as Array<Record<string, unknown>>}
              renderItem={(item, i) => (
                <div className="flex items-center justify-between rounded-xl bg-surface-elevated p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange/10 text-xs font-bold text-brand-orange">{i + 1}</span>
                    <span className="font-medium">{item.name as string}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{item.quantity as number} un.</p>
                    <p className="text-xs text-brand-green">{formatCurrency(item.profit as number)}</p>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-brand-orange" />Clientes que Mais Compraram</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingList
              items={data.topClients as Array<Record<string, unknown>>}
              renderItem={(item, i) => (
                <div className="flex items-center justify-between rounded-xl bg-surface-elevated p-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-orange/10 text-xs font-bold text-brand-orange">{i + 1}</span>
                    <div>
                      <p className="font-medium">{item.name as string}</p>
                      <p className="text-xs text-text-muted">{item.count as number} compras · Favorito: {item.favorite as string}</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.total as number)}</p>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-brand-orange" />Melhores Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingList
              items={data.bestDays as Array<Record<string, unknown>>}
              renderItem={(item, i) => (
                <div className="flex items-center justify-between rounded-xl bg-surface-elevated p-3">
                  <div className="flex items-center gap-3">
                    <Trophy className={`h-4 w-4 ${i === 0 ? "text-yellow-500" : "text-text-muted"}`} />
                    <span>{formatDate(item.date as string)}</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(item.revenue as number)}</span>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-brand-orange" />Melhores Horários</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingList
              items={data.bestHours as Array<Record<string, unknown>>}
              renderItem={(item, i) => (
                <div className="flex items-center justify-between rounded-xl bg-surface-elevated p-3">
                  <span>{item.hour as string}</span>
                  <span className="font-semibold">{item.count as number} vendas</span>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-brand-orange" />Recordes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {data.highestRevenue && (
                <div className="rounded-2xl bg-brand-orange/10 p-5 text-center">
                  <p className="text-xs text-text-muted mb-1">Maior Faturamento</p>
                  <p className="text-xl font-bold">{formatCurrency(data.highestRevenue[1])}</p>
                  <p className="text-xs text-text-muted mt-1">{formatDate(data.highestRevenue[0])}</p>
                </div>
              )}
              {data.highestProfit && (
                <div className="rounded-2xl bg-brand-green/10 p-5 text-center">
                  <p className="text-xs text-text-muted mb-1">Maior Lucro</p>
                  <p className="text-xl font-bold text-brand-green">{formatCurrency(data.highestProfit.profit)}</p>
                  <p className="text-xs text-text-muted mt-1">{formatDate(data.highestProfit.date)}</p>
                </div>
              )}
              {data.highestTicket && (
                <div className="rounded-2xl bg-surface-elevated p-5 text-center">
                  <p className="text-xs text-text-muted mb-1">Maior Ticket Médio</p>
                  <p className="text-xl font-bold">{formatCurrency(data.highestTicket.totalAmount)}</p>
                  <p className="text-xs text-text-muted mt-1">{formatDate(data.highestTicket.date)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}
