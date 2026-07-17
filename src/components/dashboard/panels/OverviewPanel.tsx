import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, SiteInfo } from "../types";
import { LayoutDashboard, CheckCircle2, XCircle, Battery, Thermometer, Zap, ClipboardCheck, TrendingUp, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Props {
  stats: PanelStats;
  sites: SiteInfo[];
  onDrillDown: (type: "total" | "ok" | "nok" | "batteries" | "batteries-critical" | "acs" | "acs-nok" | "gmg" | "zeladoria-ok") => void;
}

const COLORS = {
  ok: "hsl(142, 76%, 36%)",
  nok: "hsl(0, 84%, 60%)",
};

export function OverviewPanel({ stats, sites, onDrillDown }: Props) {
  const { overview } = stats;
  
  const statusChart = [
    { name: "Sites OK", value: overview.sitesOk, color: COLORS.ok },
    { name: "Sites NOK", value: overview.sitesNok, color: COLORS.nok },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-7 bg-primary rounded-full" />
        <div>
          <h2 className="font-bold text-lg tracking-tight">Visão Geral</h2>
          <p className="text-xs text-muted-foreground">Resumo da infraestrutura</p>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Sites"
          value={overview.totalSites}
          subtitle="Sites vistoriados"
          icon={LayoutDashboard}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown("total")}
        />
        <StatCard
          title="Sites OK"
          value={overview.sitesOk}
          subtitle="Sem problemas"
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${overview.percentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("ok")}
        />
        <StatCard
          title="Sites NOK"
          value={overview.sitesNok}
          subtitle="Com problemas"
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={overview.sitesNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("nok")}
        />
        <StatCard
          title="Taxa de Sucesso"
          value={`${overview.percentOk}%`}
          subtitle="Conformidade geral"
          icon={TrendingUp}
          iconBg={overview.percentOk >= 80 ? "bg-success/10 text-success" : overview.percentOk >= 60 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}
          onClick={() => onDrillDown("total")}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Baterias"
          value={overview.totalBatteries}
          subtitle="Total encontradas"
          icon={Battery}
          iconBg={overview.batteriesCritical > 0 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}
          onClick={() => onDrillDown("batteries")}
        />
        <StatCard
          title="Ar Condicionado"
          value={overview.totalACs}
          subtitle="Total encontrados"
          icon={Thermometer}
          iconBg={overview.acsNok > 0 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}
          onClick={() => onDrillDown("acs")}
        />
        <StatCard
          title="Com GMG"
          value={overview.sitesWithGMG}
          subtitle="Backup de energia"
          icon={Zap}
          iconBg="bg-success/10 text-success"
          onClick={() => onDrillDown("gmg")}
        />
        <StatCard
          title="Zeladoria OK"
          value={overview.zeladoriaOkCount}
          subtitle={`de ${overview.totalSites} sites`}
          icon={ClipboardCheck}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown("zeladoria-ok")}
        />
        <StatCard
          title="Última Atualização"
          value={overview.lastUpdate}
          subtitle="Data do relatório"
          icon={Clock}
          iconBg="bg-muted text-muted-foreground"
          onClick={() => onDrillDown("total")}
        />
      </div>

      {/* Status Chart */}
      {statusChart.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <TrendingUp className="w-3.5 h-3.5 text-primary" />
              </div>
              Distribuição de Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 24, right: 80, bottom: 24, left: 80 }}>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    strokeWidth={2}
                    stroke="hsl(var(--card))"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  >
                    {statusChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>

                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '0.75rem', 
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      fontSize: '0.8rem'
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
