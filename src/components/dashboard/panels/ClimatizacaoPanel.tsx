import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, ClimatizacaoInfo, ACInfo } from "../types";
import { Thermometer, Fan, CheckCircle2, XCircle, Gauge, Wind } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Props {
  stats: PanelStats;
  climatizacao: ClimatizacaoInfo[];
  acs: ACInfo[];
  onDrillDown: (type: "all" | "ac" | "fan" | "ac-ok" | "ac-nok") => void;
}

export function ClimatizacaoPanel({ stats, climatizacao, acs, onDrillDown }: Props) {
  const statusBarData = [
    { name: "ACs OK", value: stats.acsOkCount, fill: "#22c55e" },
    { name: "ACs NOK", value: stats.acsNokCount, fill: "#ef4444" },
    { name: "Fan OK", value: stats.fanOkCount, fill: "#3b82f6" },
    { name: "Fan NOK", value: stats.fanNokCount, fill: "#f97316" },
    { name: "PLC OK", value: stats.plcOkCount, fill: "#8b5cf6" },
    { name: "PLC NOK", value: stats.plcNokCount, fill: "#ec4899" },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-cyan-600 rounded-full" />
        <h2 className="font-semibold text-lg">Painel Climatização</h2>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Gabinetes"
          value={stats.climatizacaoTotal}
          subtitle="Com climatização"
          icon={Thermometer}
          iconBg="bg-cyan-600/10 text-cyan-600"
          onClick={() => onDrillDown("all")}
        />
        <StatCard
          title="Ar Condicionado"
          value={stats.acTotal}
          subtitle={`${stats.totalACs} ACs instalados`}
          icon={Wind}
          iconBg="bg-blue-500/10 text-blue-500"
          onClick={() => onDrillDown("ac")}
        />
        <StatCard
          title="Fan/Ventilação"
          value={stats.fanTotal}
          subtitle="Gabinetes com fan"
          icon={Fan}
          iconBg="bg-emerald-500/10 text-emerald-500"
          onClick={() => onDrillDown("fan")}
        />
        <StatCard
          title="N/A"
          value={stats.naTotal}
          subtitle="Sem climatização"
          icon={XCircle}
          iconBg="bg-muted text-muted-foreground"
        />
      </div>

      {/* AC Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="ACs OK"
          value={stats.acsOkCount}
          subtitle="Funcionando"
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${stats.totalACs > 0 ? Math.round((stats.acsOkCount / stats.totalACs) * 100) : 0}%`, variant: "success" }}
          onClick={() => onDrillDown("ac-ok")}
        />
        <StatCard
          title="ACs NOK"
          value={stats.acsNokCount}
          subtitle="Com defeito"
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.acsNokCount > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("ac-nok")}
        />
        <StatCard
          title="PLC OK"
          value={stats.plcOkCount}
          subtitle="Lead-Lag funcional"
          icon={Gauge}
          iconBg="bg-violet-500/10 text-violet-500"
        />
        <StatCard
          title="PLC NOK"
          value={stats.plcNokCount}
          subtitle="Com problema"
          icon={Gauge}
          iconBg="bg-pink-500/10 text-pink-500"
          badge={stats.plcNokCount > 0 ? { text: "Verificar", variant: "warning" } : undefined}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Type Distribution */}
        {stats.climatizacaoChart.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-cyan-600" />
                Tipos de Climatização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.climatizacaoChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {stats.climatizacaoChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status Bar Chart */}
        {statusBarData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                Status dos Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {statusBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
