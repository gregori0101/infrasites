import React from "react";
import { Zap, ShieldCheck, Lock, Factory, Gauge } from "lucide-react";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface Props {
  stats: PanelStats;
  onDrillDown: (type: "transformador-ok" | "transformador-nok" | "gradil-ok" | "gradil-nok" | "cadeado-ok" | "cadeado-nok") => void;
}

const TOOLTIP_STYLE = {
  borderRadius: '0.75rem',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '0.8rem',
  backgroundColor: "hsl(var(--card))",
};

export function EnergiaPanel({ stats, onDrillDown }: Props) {
  const totalTransformadores = stats.energiaTransformadorOk + stats.energiaTransformadorNok;
  const transformadorPercentOk = totalTransformadores > 0
    ? Math.round((stats.energiaTransformadorOk / totalTransformadores) * 100)
    : 0;

  const totalGradil = stats.energiaProtecaoGradilOk + stats.energiaProtecaoGradilNok;
  const gradilPercentOk = totalGradil > 0
    ? Math.round((stats.energiaProtecaoGradilOk / totalGradil) * 100)
    : 0;

  const totalCadeado = stats.energiaProtecaoCadeadoOk + stats.energiaProtecaoCadeadoNok;
  const cadeadoPercentOk = totalCadeado > 0
    ? Math.round((stats.energiaProtecaoCadeadoOk / totalCadeado) * 100)
    : 0;

  const protecaoChart = [
    { name: "Com Gradil", value: stats.energiaProtecaoGradilOk, color: "#22c55e" },
    { name: "Sem Gradil", value: stats.energiaProtecaoGradilNok, color: "#ef4444" },
    { name: "Com Cadeado", value: stats.energiaProtecaoCadeadoOk, color: "#3b82f6" },
    { name: "Sem Cadeado", value: stats.energiaProtecaoCadeadoNok, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  const transformadorChart = [
    { name: "OK", value: stats.energiaTransformadorOk, color: "#22c55e" },
    { name: "NOK", value: stats.energiaTransformadorNok, color: "#ef4444" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-7 bg-accent rounded-full" />
        <div>
          <h2 className="font-bold text-lg tracking-tight">Painel de Energia</h2>
          <p className="text-xs text-muted-foreground">Transformadores, proteção e quadros</p>
        </div>
      </div>

      {/* Energy KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Transformador OK"
          value={stats.energiaTransformadorOk}
          subtitle={`${transformadorPercentOk}% conformes`}
          icon={Zap}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${transformadorPercentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("transformador-ok")}
        />
        <StatCard
          title="Transformador NOK"
          value={stats.energiaTransformadorNok}
          subtitle="Requerem atenção"
          icon={Zap}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.energiaTransformadorNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("transformador-nok")}
        />
        <StatCard
          title="Proteção Gradil"
          value={stats.energiaProtecaoGradilOk}
          subtitle={`${gradilPercentOk}% protegidos`}
          icon={ShieldCheck}
          iconBg="bg-primary/10 text-primary"
          badge={{ text: `${gradilPercentOk}%`, variant: gradilPercentOk >= 80 ? "success" : gradilPercentOk >= 50 ? "warning" : "destructive" }}
          onClick={() => onDrillDown("gradil-ok")}
        />
        <StatCard
          title="Proteção Cadeado"
          value={stats.energiaProtecaoCadeadoOk}
          subtitle={`${cadeadoPercentOk}% protegidos`}
          icon={Lock}
          iconBg="bg-primary/10 text-primary"
          badge={{ text: `${cadeadoPercentOk}%`, variant: cadeadoPercentOk >= 80 ? "success" : cadeadoPercentOk >= 50 ? "warning" : "destructive" }}
          onClick={() => onDrillDown("cadeado-ok")}
        />
      </div>

      {/* Energy Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Transformador Status */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Zap className="w-3.5 h-3.5 text-accent" />
              </div>
              Status Transformador
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {transformadorChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={transformadorChart} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                      strokeWidth={2} stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {transformadorChart.map((entry, i) => (
                        <Cell key={`tf-${i}`} fill={entry.color} />
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

        {/* Tensão de Entrada */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Gauge className="w-3.5 h-3.5 text-primary" />
              </div>
              Tensão de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.energiaTensaoDistribution.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.energiaTensaoDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" name="Sites" radius={[0, 4, 4, 0]}>
                      {stats.energiaTensaoDistribution.map((entry, i) => (
                        <Cell key={`t-${i}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Proteção */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              </div>
              Proteção do Quadro
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {protecaoChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={protecaoChart} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                      strokeWidth={2} stroke="hsl(var(--card))"
                      label={({ value }) => `${value}`}>
                      {protecaoChart.map((entry, i) => (
                        <Cell key={`p-${i}`} fill={entry.color} />
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

      {/* Energy Details Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Fabricante Quadro */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-accent/10">
                <Factory className="w-3.5 h-3.5 text-accent" />
              </div>
              Fabricantes de Quadro
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.energiaFabricanteDistribution.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.energiaFabricanteDistribution.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Bar dataKey="value" name="Quantidade" radius={[0, 4, 4, 0]}>
                      {stats.energiaFabricanteDistribution.slice(0, 8).map((entry, i) => (
                        <Cell key={`fab-${i}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tipo de Quadro */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Zap className="w-3.5 h-3.5 text-primary" />
              </div>
              Tipos de Quadro
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.energiaTipoQuadroDistribution.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.energiaTipoQuadroDistribution} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value"
                      strokeWidth={2} stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {stats.energiaTipoQuadroDistribution.map((entry, i) => (
                        <Cell key={`tq-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-muted-foreground">
                <p>Nenhum dado disponível</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
