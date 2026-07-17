import React from "react";
import { Zap, CheckCircle2, XCircle, AlertTriangle, Fuel, Factory, Gauge, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface Props {
  stats: PanelStats;
  onDrillDown: (type: "gmg" | "gmg-no" | "gmg-ok" | "gmg-nok" | "gmg-alarme" | "gmg-total") => void;
}

const TOOLTIP_STYLE = {
  borderRadius: '0.75rem',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '0.8rem',
  backgroundColor: "hsl(var(--card))",
};

export function GMGPanel({ stats, onDrillDown }: Props) {
  const gmgPercentOk = stats.sitesWithGMG > 0
    ? Math.round((stats.gmgStatusOk / stats.sitesWithGMG) * 100)
    : 0;

  const gmgStatusChart = [
    { name: "OK", value: stats.gmgStatusOk, color: "#22c55e" },
    { name: "NOK", value: stats.gmgStatusNok, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-7 bg-warning rounded-full" />
        <div>
          <h2 className="font-bold text-lg tracking-tight">Painel GMG (Gerador)</h2>
          <p className="text-xs text-muted-foreground">Status operacional e distribuição dos geradores</p>
        </div>
      </div>

      {/* GMG KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Sites"
          value={stats.totalSites}
          subtitle="Sites vistoriados"
          icon={Building2}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown("gmg-total")}
        />
        <StatCard
          title="Sites com GMG"
          value={stats.sitesWithGMG}
          subtitle={`${stats.sitesWithoutGMG} sem GMG`}
          icon={Zap}
          iconBg="bg-success/10 text-success"
          onClick={() => onDrillDown("gmg")}
        />
        <StatCard
          title="Sites sem GMG"
          value={stats.sitesWithoutGMG}
          subtitle="Sem backup energia"
          icon={Zap}
          iconBg="bg-warning/10 text-warning"
          onClick={() => onDrillDown("gmg-no")}
        />
        <StatCard
          title="GMG Operacional"
          value={stats.gmgStatusOk}
          subtitle={`${gmgPercentOk}% dos GMGs`}
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${gmgPercentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("gmg-ok")}
        />
        <StatCard
          title="GMG Inoperante"
          value={stats.gmgStatusNok}
          subtitle="Requerem manutenção"
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.gmgStatusNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("gmg-nok")}
        />
        <StatCard
          title="Alarme Ativo"
          value={stats.gmgAlarmeAtivo}
          subtitle="GMGs com alarme"
          icon={AlertTriangle}
          iconBg={stats.gmgAlarmeAtivo > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}
          badge={stats.gmgAlarmeAtivo > 0 ? { text: "Ativo", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("gmg-alarme")}
        />
      </div>

      {/* GMG Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* GMG Distribution */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Zap className="w-3.5 h-3.5 text-accent" />
              </div>
              Distribuição GMG
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.energiaStatus.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 70, bottom: 20, left: 70 }}>
                    <Pie data={stats.energiaStatus} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                      strokeWidth={2} stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {stats.energiaStatus.map((entry, i) => (
                        <Cell key={`gmg-dist-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GMG Status */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-success/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              </div>
              Status Operacional GMG
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {gmgStatusChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 70, bottom: 20, left: 70 }}>
                    <Pie data={gmgStatusChart} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                      strokeWidth={2} stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {gmgStatusChart.map((entry, i) => (
                        <Cell key={`gmg-st-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GMG Combustível */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-warning/10">
                <Fuel className="w-3.5 h-3.5 text-warning" />
              </div>
              Tipo de Combustível
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.gmgCombustivelDistribution.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, right: 70, bottom: 20, left: 70 }}>
                    <Pie data={stats.gmgCombustivelDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                      strokeWidth={2} stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {stats.gmgCombustivelDistribution.map((entry, i) => (
                        <Cell key={`comb-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GMG Detail Tables Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* GMG Fabricantes */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Factory className="w-3.5 h-3.5 text-accent" />
              </div>
              Fabricantes de GMG
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.gmgFabricanteDistribution.length > 0 ? (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {stats.gmgFabricanteDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-sm font-medium truncate flex-1">{item.name}</span>
                    <Badge variant="secondary" className="ml-2">{item.value}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* GMG Potências */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Gauge className="w-3.5 h-3.5 text-primary" />
              </div>
              Potências de GMG
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.gmgPotenciaDistribution.length > 0 ? (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {stats.gmgPotenciaDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0">
                    <span className="text-sm font-medium truncate flex-1">{item.name} kVA</span>
                    <Badge variant="secondary" className="ml-2">{item.value}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
