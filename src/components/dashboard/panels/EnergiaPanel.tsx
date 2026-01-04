import React from "react";
import { Zap, Thermometer, Wind, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, ACInfo } from "../types";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

interface Props {
  stats: PanelStats;
  acs: ACInfo[];
  onDrillDown: (type: "gmg" | "ac-ok" | "ac-nok") => void;
}

export function EnergiaPanel({ stats, acs, onDrillDown }: Props) {
  const acPercentOk = stats.totalACs > 0 
    ? Math.round((stats.acsOk / stats.totalACs) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-accent rounded-full" />
        <h2 className="font-semibold text-lg">Painel AC / Energia</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Sites com GMG"
          value={stats.sitesWithGMG}
          subtitle={`${stats.sitesWithoutGMG} sem GMG`}
          icon={Zap}
          iconBg="bg-success/10 text-success"
          onClick={() => onDrillDown("gmg")}
        />
        <StatCard
          title="Total de ACs"
          value={stats.totalACs}
          subtitle="Unidades instaladas"
          icon={Wind}
          iconBg="bg-primary/10 text-primary"
        />
        <StatCard
          title="ACs Funcionando"
          value={stats.acsOk}
          subtitle={`${acPercentOk}% operacional`}
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${acPercentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("ac-ok")}
        />
        <StatCard
          title="ACs com Defeito"
          value={stats.acsNok}
          subtitle="Requerem manutenção"
          icon={Thermometer}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.acsNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("ac-nok")}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* GMG Distribution */}
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
                    <Pie
                      data={stats.energiaStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stats.energiaStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Zap className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Climatization Types */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="w-4 h-4 text-primary" />
              Tipos de Climatização
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.climatizacaoStatus.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.climatizacaoStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${value}`}
                    >
                      {stats.climatizacaoStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Wind className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
