import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, ClimatizacaoInfo, ACInfo } from "../types";
import { Thermometer, Fan, CheckCircle2, XCircle, Gauge, Wind, Building2, Wrench } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface Props {
  stats: PanelStats;
  climatizacao: ClimatizacaoInfo[];
  acs: ACInfo[];
  onDrillDown: (type: "all" | "ac" | "fan" | "ac-ok" | "ac-nok" | "plc-ok" | "plc-nok" | "na") => void;
}

export function ClimatizacaoPanel({ stats, climatizacao, acs, onDrillDown }: Props) {
  // Equipment status bar data
  const equipmentBarData = [
    { name: "Ar Cond. OK", value: stats.acsOkCount, fill: "#22c55e" },
    { name: "Ar Cond. NOK", value: stats.acsNokCount, fill: "#ef4444" },
    { name: "Fan OK", value: stats.fanOkCount, fill: "#3b82f6" },
    { name: "Fan NOK", value: stats.fanNokCount, fill: "#f97316" },
  ].filter(item => item.value > 0);

  // AC model distribution
  const modelDistribution = React.useMemo(() => {
    const modelMap: Record<string, number> = {};
    acs.forEach(ac => {
      const modelo = ac.modelo || "N/A";
      modelMap[modelo] = (modelMap[modelo] || 0) + 1;
    });
    const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"];
    return Object.entries(modelMap)
      .map(([name, value], i) => ({ name, value, color: colors[i % colors.length] }))
      .sort((a, b) => b.value - a.value);
  }, [acs]);

  // AC status distribution by site (per-site aggregation)
  const siteClimaDistribution = React.useMemo(() => {
    const siteMap: Record<string, { tipo: string; fanOk: boolean; plcOk: boolean; acsOk: number; acsNok: number }> = {};
    climatizacao.forEach(c => {
      const key = `${c.siteCode}_gab${c.gabinete}`;
      siteMap[key] = {
        tipo: c.tipo,
        fanOk: c.fanStatus === "OK",
        plcOk: c.plcStatus === "OK",
        acsOk: c.acs.filter(a => a.status === "OK").length,
        acsNok: c.acs.filter(a => a.status === "NOK").length,
      };
    });
    return siteMap;
  }, [climatizacao]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-cyan-600 rounded-full" />
        <h2 className="font-semibold text-lg">Painel Climatização</h2>
      </div>

      {/* ==================== SEÇÃO 1: POR SITE ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-cyan-600" />
          <h3 className="font-semibold text-base text-foreground">Visão por Site</h3>
          <div className="flex-1 h-px bg-border ml-2" />
        </div>

        {/* Site-level Stats */}
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
            subtitle={`${stats.acTotal} gabinetes`}
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
            onClick={() => onDrillDown("na")}
          />
        </div>

        {/* Site-level: PLC & Fan Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Fan OK"
            value={stats.fanOkCount}
            subtitle="Funcionando"
            icon={Fan}
            iconBg="bg-success/10 text-success"
            badge={stats.fanTotal > 0 ? { text: `${Math.round((stats.fanOkCount / Math.max(stats.fanOkCount + stats.fanNokCount, 1)) * 100)}%`, variant: "success" } : undefined}
          />
          <StatCard
            title="Fan NOK"
            value={stats.fanNokCount}
            subtitle="Com defeito"
            icon={Fan}
            iconBg="bg-destructive/10 text-destructive"
            badge={stats.fanNokCount > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          />
          <StatCard
            title="PLC OK"
            value={stats.plcOkCount}
            subtitle="Lead-Lag funcional"
            icon={Gauge}
            iconBg="bg-violet-500/10 text-violet-500"
            onClick={() => onDrillDown("plc-ok")}
          />
          <StatCard
            title="PLC NOK"
            value={stats.plcNokCount}
            subtitle="Com problema"
            icon={Gauge}
            iconBg="bg-pink-500/10 text-pink-500"
            badge={stats.plcNokCount > 0 ? { text: "Verificar", variant: "warning" } : undefined}
            onClick={() => onDrillDown("plc-nok")}
          />
        </div>

        {/* Site-level Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Type Distribution Pie */}
          {stats.climatizacaoChart.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-cyan-600" />
                  Distribuição por Tipo
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

          {/* PLC & Fan Bar Chart */}
          {(stats.plcOkCount + stats.plcNokCount + stats.fanOkCount + stats.fanNokCount) > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-violet-500" />
                  Status PLC & Fan por Site
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "PLC OK", value: stats.plcOkCount, fill: "#8b5cf6" },
                        { name: "PLC NOK", value: stats.plcNokCount, fill: "#ec4899" },
                        { name: "Fan OK", value: stats.fanOkCount, fill: "#3b82f6" },
                        { name: "Fan NOK", value: stats.fanNokCount, fill: "#f97316" },
                      ].filter(d => d.value > 0)}
                      layout="vertical"
                    >
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
                        {[
                          { fill: "#8b5cf6" },
                          { fill: "#ec4899" },
                          { fill: "#3b82f6" },
                          { fill: "#f97316" },
                        ]
                          .filter((_, i) => [stats.plcOkCount, stats.plcNokCount, stats.fanOkCount, stats.fanNokCount][i] > 0)
                          .map((entry, index) => (
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

      {/* ==================== SEÇÃO 2: POR EQUIPAMENTO ==================== */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-base text-foreground">Visão por Equipamento</h3>
          <div className="flex-1 h-px bg-border ml-2" />
        </div>

        {/* Equipment-level Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Ar Condicionado"
            value={stats.totalACs}
            subtitle={`${stats.acTotal} gabinetes`}
            icon={Wind}
            iconBg="bg-blue-500/10 text-blue-500"
            onClick={() => onDrillDown("ac")}
          />
          <StatCard
            title="Ar Cond. OK"
            value={stats.acsOkCount}
            subtitle="Funcionando"
            icon={CheckCircle2}
            iconBg="bg-success/10 text-success"
            badge={{ text: `${stats.totalACs > 0 ? Math.round((stats.acsOkCount / stats.totalACs) * 100) : 0}%`, variant: "success" }}
            onClick={() => onDrillDown("ac-ok")}
          />
          <StatCard
            title="Ar Cond. NOK"
            value={stats.acsNokCount}
            subtitle="Com defeito"
            icon={XCircle}
            iconBg="bg-destructive/10 text-destructive"
            badge={stats.acsNokCount > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
            onClick={() => onDrillDown("ac-nok")}
          />
          <StatCard
            title="Taxa Operacional"
            value={`${stats.totalACs > 0 ? Math.round((stats.acsOkCount / stats.totalACs) * 100) : 0}%`}
            subtitle="Ar condicionados OK"
            icon={CheckCircle2}
            iconBg="bg-cyan-600/10 text-cyan-600"
          />
        </div>

        {/* Equipment Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Equipment Status Bar */}
          {equipmentBarData.length > 0 && (
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
                    <BarChart data={equipmentBarData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {equipmentBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AC Model Distribution */}
          {modelDistribution.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-500" />
                  Modelos de Ar Condicionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {modelDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AC Model Table */}
        {modelDistribution.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-500" />
                Detalhamento por Modelo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Modelo</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Quantidade</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">OK</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">NOK</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Taxa OK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelDistribution.map((model) => {
                      const modelAcs = acs.filter(a => a.modelo === model.name);
                      const ok = modelAcs.filter(a => a.status === "OK").length;
                      const nok = modelAcs.filter(a => a.status === "NOK").length;
                      const taxa = modelAcs.length > 0 ? Math.round((ok / modelAcs.length) * 100) : 0;
                      return (
                        <tr key={model.name} className="border-b border-border/50 hover:bg-muted/30">
                          <td className="py-2 px-3 font-medium">{model.name}</td>
                          <td className="py-2 px-3 text-center">{model.value}</td>
                          <td className="py-2 px-3 text-center text-success font-medium">{ok}</td>
                          <td className="py-2 px-3 text-center text-destructive font-medium">{nok}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              taxa >= 80 ? "bg-success/10 text-success" :
                              taxa >= 50 ? "bg-warning/10 text-warning" :
                              "bg-destructive/10 text-destructive"
                            }`}>
                              {taxa}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
