import React from "react";
import { MapPin, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, SiteInfo } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

interface Props {
  stats: PanelStats;
  sites: SiteInfo[];
  onDrillDown: (type: "total" | "ok" | "nok") => void;
}

export function DGOSPanel({ stats, sites, onDrillDown }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-primary rounded-full" />
        <h2 className="font-semibold text-lg">Painel DGOS - Dados Gerais</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Sites"
          value={stats.totalSites}
          subtitle="Sites inspecionados"
          icon={MapPin}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown("total")}
        />
        <StatCard
          title="Sites OK"
          value={stats.sitesOk}
          subtitle={`${stats.percentOk}% do total`}
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${stats.percentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("ok")}
        />
        <StatCard
          title="Sites com Problemas"
          value={stats.sitesNok}
          subtitle={`${100 - stats.percentOk}% do total`}
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.sitesNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("nok")}
        />
        <StatCard
          title="Vistorias/Mês"
          value={stats.vistoriasPorMes.length > 0 
            ? stats.vistoriasPorMes[stats.vistoriasPorMes.length - 1].count 
            : 0}
          subtitle="Último mês"
          icon={TrendingUp}
          iconBg="bg-accent/10 text-accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Monthly Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Vistorias por Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.vistoriasPorMes.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.vistoriasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                      name="Vistorias"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </CardContent>
        </Card>

        {/* UF Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Distribuição por UF
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.ufDistribution.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.ufDistribution} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={40}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value, name) => [
                        value,
                        name === "ok" ? "OK" : name === "nok" ? "Problemas" : "Total",
                      ]}
                    />
                    <Bar 
                      dataKey="ok" 
                      stackId="a" 
                      fill="hsl(var(--success))" 
                      radius={[0, 0, 0, 0]}
                      name="OK"
                    />
                    <Bar 
                      dataKey="nok" 
                      stackId="a" 
                      fill="hsl(var(--destructive))" 
                      radius={[0, 4, 4, 0]}
                      name="Problemas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
