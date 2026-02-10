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

const CHART_STYLE = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-warning rounded-full" />
        <h2 className="font-semibold text-lg">Painel GMG (Gerador)</h2>
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
        {/* GMG Distribution (Com/Sem) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              Distribuição GMG
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.energiaStatus.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.energiaStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {stats.energiaStatus.map((entry, i) => (
                        <Cell key={`gmg-dist-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
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

        {/* GMG Status (OK/NOK) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              Status Operacional GMG
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gmgStatusChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={gmgStatusChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {gmgStatusChart.map((entry, i) => (
                        <Cell key={`gmg-st-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Fuel className="w-4 h-4 text-warning" />
              Tipo de Combustível
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.gmgCombustivelDistribution.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.gmgCombustivelDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {stats.gmgCombustivelDistribution.map((entry, i) => (
                        <Cell key={`comb-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Factory className="w-4 h-4 text-accent" />
              Fabricantes de GMG
            </CardTitle>
          </CardHeader>
          <CardContent>
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              Potências de GMG
            </CardTitle>
          </CardHeader>
          <CardContent>
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
