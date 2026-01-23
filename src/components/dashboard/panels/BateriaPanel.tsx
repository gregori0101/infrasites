import React from "react";
import { Battery, AlertTriangle, Clock, Gauge, ShieldCheck, ShieldAlert, ShieldX, Info, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, BatteryInfo } from "../types";
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
  batteries: BatteryInfo[];
  onDrillDown: (type: "all" | "ok" | "nok" | "obsolete-warning" | "obsolete-critical") => void;
}

export function BateriaPanel({ stats, batteries, onDrillDown }: Props) {
  const percentOk = stats.totalBatteries > 0 
    ? Math.round((stats.batteriesOk / stats.totalBatteries) * 100) 
    : 0;

  const percentOver5 = stats.totalBatteries > 0 
    ? Math.round((stats.batteriesOver5Years / stats.totalBatteries) * 100) 
    : 0;

  const percentOver8 = stats.totalBatteries > 0 
    ? Math.round((stats.batteriesOver8Years / stats.totalBatteries) * 100) 
    : 0;

  // Calculate totals for autonomy risk
  const totalSemGMG = stats.autonomyRisk.sitesOk + stats.autonomyRisk.sitesMedioRisco + 
    stats.autonomyRisk.sitesAltoRisco + stats.autonomyRisk.sitesCritico;
  const totalComGMG = stats.autonomyRisk.sitesOkComGMG + stats.autonomyRisk.sitesAltoRiscoComGMG + 
    stats.autonomyRisk.sitesCriticoComGMG;

  // Gauge visualization for obsolescence
  const GaugeCard = ({ 
    title, 
    value, 
    percent, 
    color, 
    onClick 
  }: { 
    title: string; 
    value: number; 
    percent: number; 
    color: string;
    onClick: () => void;
  }) => (
    <Card 
      className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">{title}</span>
          <Gauge className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="relative w-full h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full rounded-full transition-all"
            style={{ 
              width: `${Math.min(percent, 100)}%`,
              backgroundColor: color,
            }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-2xl font-bold">{value}</span>
          <span className="text-lg font-medium" style={{ color }}>{percent}%</span>
        </div>
      </CardContent>
    </Card>
  );

  // Autonomy Risk Card Component
  const AutonomyRiskCard = ({ 
    title, 
    value, 
    subtitle,
    icon: Icon, 
    colorClass,
    bgClass
  }: { 
    title: string; 
    value: number; 
    subtitle: string;
    icon: React.ElementType; 
    colorClass: string;
    bgClass: string;
  }) => (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className={`text-sm font-medium ${colorClass}`}>{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-xl ${bgClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: Risco de Autonomia */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-semibold text-lg">Risco de Autonomia de Bateria</h2>
        </div>

        {/* Sites SEM GMG */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="w-4 h-4" />
            Sites SEM Gerador ({totalSemGMG} sites)
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AutonomyRiskCard
              title="OK"
              value={stats.autonomyRisk.sitesOk}
              subtitle="≥ 6 horas de autonomia"
              icon={ShieldCheck}
              colorClass="text-success"
              bgClass="bg-success/10 text-success"
            />
            <AutonomyRiskCard
              title="Médio Risco"
              value={stats.autonomyRisk.sitesMedioRisco}
              subtitle="≥ 4h e < 6h de autonomia"
              icon={ShieldAlert}
              colorClass="text-warning"
              bgClass="bg-warning/10 text-warning"
            />
            <AutonomyRiskCard
              title="Alto Risco"
              value={stats.autonomyRisk.sitesAltoRisco}
              subtitle="≥ 2h e < 4h de autonomia"
              icon={ShieldAlert}
              colorClass="text-accent"
              bgClass="bg-accent/10 text-accent"
            />
            <AutonomyRiskCard
              title="Crítico"
              value={stats.autonomyRisk.sitesCritico}
              subtitle="< 2 horas de autonomia"
              icon={ShieldX}
              colorClass="text-destructive"
              bgClass="bg-destructive/10 text-destructive"
            />
          </div>
        </div>

        {/* Sites COM GMG */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Sites COM Gerador ({totalComGMG} sites)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <AutonomyRiskCard
              title="OK"
              value={stats.autonomyRisk.sitesOkComGMG}
              subtitle="≥ 4 horas de autonomia"
              icon={ShieldCheck}
              colorClass="text-success"
              bgClass="bg-success/10 text-success"
            />
            <AutonomyRiskCard
              title="Alto Risco"
              value={stats.autonomyRisk.sitesAltoRiscoComGMG}
              subtitle="≥ 2h e < 4h de autonomia"
              icon={ShieldAlert}
              colorClass="text-accent"
              bgClass="bg-accent/10 text-accent"
            />
            <AutonomyRiskCard
              title="Crítico"
              value={stats.autonomyRisk.sitesCriticoComGMG}
              subtitle="< 2 horas de autonomia"
              icon={ShieldX}
              colorClass="text-destructive"
              bgClass="bg-destructive/10 text-destructive"
            />
          </div>
        </div>

        {/* Card de Critérios */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Critérios de Classificação de Risco
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Battery className="w-4 h-4" /> Sites SEM Gerador:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" /> 
                    <strong className="text-foreground">OK:</strong> Autonomia ≥ 6 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" /> 
                    <strong className="text-foreground">Médio Risco:</strong> ≥ 4h e &lt; 6h
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" /> 
                    <strong className="text-foreground">Alto Risco:</strong> ≥ 2h e &lt; 4h
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> 
                    <strong className="text-foreground">Crítico:</strong> &lt; 2 horas
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Sites COM Gerador:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" /> 
                    <strong className="text-foreground">OK:</strong> Autonomia total ≥ 4 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" /> 
                    <strong className="text-foreground">Alto Risco:</strong> ≥ 2h e &lt; 4h
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> 
                    <strong className="text-foreground">Crítico:</strong> &lt; 2 horas
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 italic">
              * A autonomia é calculada com base na capacidade total das baterias (Ah) e consumo estimado por gabinete.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 2: Baterias de Chumbo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-slate-500 rounded-full" />
          <h2 className="font-semibold text-lg">Baterias de Chumbo (Polímero e Monobloco)</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Total Card */}
          <Card className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Battery className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">TOTAL</span>
              </div>
              <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">{stats.bateriasChumboTotal}</p>
              <p className="text-xs text-muted-foreground mt-1">unidades</p>
            </CardContent>
          </Card>

          {/* UF Cards */}
          {stats.bateriasChumboByUf.map(({ uf, count }) => (
            <Card key={`chumbo-${uf}`} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{uf}</span>
                  <Battery className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.bateriasChumboTotal > 0 
                    ? `${Math.round((count / stats.bateriasChumboTotal) * 100)}%` 
                    : '0%'}
                </p>
              </CardContent>
            </Card>
          ))}

          {stats.bateriasChumboByUf.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Battery className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma bateria de chumbo registrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* SEÇÃO 3: Baterias de Lítio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-emerald-500 rounded-full" />
          <h2 className="font-semibold text-lg">Baterias de Lítio</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Total Card */}
          <Card className="bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-700 text-emerald-700 dark:text-emerald-300">TOTAL</span>
              </div>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-200">{stats.bateriasLitioTotal}</p>
              <p className="text-xs text-muted-foreground mt-1">unidades</p>
            </CardContent>
          </Card>

          {/* UF Cards */}
          {stats.bateriasLitioByUf.map(({ uf, count }) => (
            <Card key={`litio-${uf}`} className="hover:shadow-md transition-shadow border-emerald-100 dark:border-emerald-900/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{uf}</span>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.bateriasLitioTotal > 0 
                    ? `${Math.round((count / stats.bateriasLitioTotal) * 100)}%` 
                    : '0%'}
                </p>
              </CardContent>
            </Card>
          ))}

          {stats.bateriasLitioByUf.length === 0 && (
            <Card className="col-span-full border-emerald-100 dark:border-emerald-900/50">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma bateria de lítio registrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* SEÇÃO 4: Obsolescência (existente) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-warning rounded-full" />
          <h2 className="font-semibold text-lg">Painel Baterias - Obsolescência</h2>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Baterias"
            value={stats.totalBatteries}
            subtitle="Unidades cadastradas"
            icon={Battery}
            iconBg="bg-primary/10 text-primary"
            onClick={() => onDrillDown("all")}
          />
          <StatCard
            title="Baterias OK"
            value={stats.batteriesOk}
            subtitle={`${percentOk}% operacional`}
            icon={Battery}
            iconBg="bg-success/10 text-success"
            badge={{ text: `${percentOk}%`, variant: "success" }}
            onClick={() => onDrillDown("ok")}
          />
          <StatCard
            title="Baterias com Defeito"
            value={stats.batteriesNok}
            subtitle="Requerem substituição"
            icon={AlertTriangle}
            iconBg="bg-destructive/10 text-destructive"
            badge={stats.batteriesNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
            onClick={() => onDrillDown("nok")}
          />
          <StatCard
            title="Próximo Vencimento"
            value={stats.batteriesOver5Years - stats.batteriesOver8Years}
            subtitle="Entre 5-8 anos"
            icon={Clock}
            iconBg="bg-warning/10 text-warning"
            onClick={() => onDrillDown("obsolete-warning")}
          />
        </div>

        {/* Obsolescence Gauges */}
        <div className="grid lg:grid-cols-2 gap-4">
          <GaugeCard 
            title="Baterias 5-8 anos (Atenção)"
            value={stats.batteriesOver5Years - stats.batteriesOver8Years}
            percent={percentOver5 - percentOver8}
            color="#f59e0b"
            onClick={() => onDrillDown("obsolete-warning")}
          />
          <GaugeCard 
            title="Baterias +8 anos (CRÍTICO)"
            value={stats.batteriesOver8Years}
            percent={percentOver8}
            color="#ef4444"
            onClick={() => onDrillDown("obsolete-critical")}
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Battery State Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Battery className="w-4 h-4 text-primary" />
                Estado das Baterias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.batteryStateChart.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.batteryStateChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${value}`}
                      >
                        {stats.batteryStateChart.map((entry, index) => (
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
                    <Battery className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum problema detectado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Battery Age Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Idade das Baterias
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.batteryAgeChart.length > 0 ? (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.batteryAgeChart}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {stats.batteryAgeChart.map((entry, index) => (
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
                    <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p>Nenhum dado de idade disponível</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
