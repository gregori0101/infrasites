import React, { useState } from "react";
import { Battery, ShieldCheck, ShieldAlert, ShieldX, Info, Zap, Building2, Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelStats, BatteryInfo } from "../types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface Props {
  stats: PanelStats;
  batteries: BatteryInfo[];
  onDrillDown: (type: "all" | "ok" | "nok" | "obsolete-warning" | "obsolete-critical") => void;
}

export function BateriaPanel({ stats, batteries, onDrillDown }: Props) {
  const [viewMode, setViewMode] = useState<"gabinete" | "site">("gabinete");
  
  // Calculate totals for autonomy risk based on view mode
  const totalSemGMG = viewMode === "gabinete" 
    ? stats.autonomyRisk.gabinetesOk + stats.autonomyRisk.gabinetesMedioRisco + 
      stats.autonomyRisk.gabinetesAltoRisco + stats.autonomyRisk.gabinetesCritico
    : stats.autonomyRisk.sitesOk + stats.autonomyRisk.sitesMedioRisco + 
      stats.autonomyRisk.sitesAltoRisco + stats.autonomyRisk.sitesCritico;
  
  const totalComGMG = viewMode === "gabinete"
    ? stats.autonomyRisk.gabinetesOkComGMG + stats.autonomyRisk.gabinetesAltoRiscoComGMG + 
      stats.autonomyRisk.gabinetesCriticoComGMG
    : stats.autonomyRisk.sitesOkComGMG + stats.autonomyRisk.sitesAltoRiscoComGMG + 
      stats.autonomyRisk.sitesCriticoComGMG;

  // Get correct values based on view mode
  const autonomy = viewMode === "gabinete" ? {
    ok: stats.autonomyRisk.gabinetesOk,
    medioRisco: stats.autonomyRisk.gabinetesMedioRisco,
    altoRisco: stats.autonomyRisk.gabinetesAltoRisco,
    critico: stats.autonomyRisk.gabinetesCritico,
    okComGMG: stats.autonomyRisk.gabinetesOkComGMG,
    altoRiscoComGMG: stats.autonomyRisk.gabinetesAltoRiscoComGMG,
    criticoComGMG: stats.autonomyRisk.gabinetesCriticoComGMG,
  } : {
    ok: stats.autonomyRisk.sitesOk,
    medioRisco: stats.autonomyRisk.sitesMedioRisco,
    altoRisco: stats.autonomyRisk.sitesAltoRisco,
    critico: stats.autonomyRisk.sitesCritico,
    okComGMG: stats.autonomyRisk.sitesOkComGMG,
    altoRiscoComGMG: stats.autonomyRisk.sitesAltoRiscoComGMG,
    criticoComGMG: stats.autonomyRisk.sitesCriticoComGMG,
  };

  const obsolChumbo = viewMode === "gabinete" ? {
    ok: stats.obsolescenciaChumbo.gabinetesOk,
    medioRisco: stats.obsolescenciaChumbo.gabinetesMedioRisco,
    altoRisco: stats.obsolescenciaChumbo.gabinetesAltoRisco,
    semBanco: stats.obsolescenciaChumbo.gabinetesSemBanco,
  } : {
    ok: stats.obsolescenciaChumbo.sitesOk,
    medioRisco: stats.obsolescenciaChumbo.sitesMedioRisco,
    altoRisco: stats.obsolescenciaChumbo.sitesAltoRisco,
    semBanco: stats.obsolescenciaChumbo.sitesSemBanco,
  };

  const obsolLitio = viewMode === "gabinete" ? {
    ok: stats.obsolescenciaLitio.gabinetesOk,
    medioRisco: stats.obsolescenciaLitio.gabinetesMedioRisco,
    altoRisco: stats.obsolescenciaLitio.gabinetesAltoRisco,
    semBanco: stats.obsolescenciaLitio.gabinetesSemBanco,
  } : {
    ok: stats.obsolescenciaLitio.sitesOk,
    medioRisco: stats.obsolescenciaLitio.sitesMedioRisco,
    altoRisco: stats.obsolescenciaLitio.sitesAltoRisco,
    semBanco: stats.obsolescenciaLitio.sitesSemBanco,
  };

  const unitLabel = viewMode === "gabinete" ? "gabinetes" : "sites";
  const unitLabelSingular = viewMode === "gabinete" ? "Gabinetes" : "Sites";

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
      {/* Toggle para escolher visualização */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Visualização de Risco de Autonomia e Obsolescência:</span>
            </div>
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as "gabinete" | "site")}
              className="bg-background border rounded-lg"
            >
              <ToggleGroupItem value="gabinete" aria-label="Por Gabinete" className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <Boxes className="w-4 h-4" />
                <span className="hidden sm:inline">Por Gabinete</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="site" aria-label="Por Site" className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Por Site</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 1: Risco de Autonomia */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-semibold text-lg">Risco de Autonomia de Bateria</h2>
        </div>

        {/* SEM GMG */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="w-4 h-4" />
            {unitLabelSingular} SEM Gerador ({totalSemGMG} {unitLabel})
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AutonomyRiskCard
              title="OK"
              value={autonomy.ok}
              subtitle="≥ 6 horas de autonomia"
              icon={ShieldCheck}
              colorClass="text-success"
              bgClass="bg-success/10 text-success"
            />
            <AutonomyRiskCard
              title="Médio Risco"
              value={autonomy.medioRisco}
              subtitle="≥ 4h e < 6h de autonomia"
              icon={ShieldAlert}
              colorClass="text-warning"
              bgClass="bg-warning/10 text-warning"
            />
            <AutonomyRiskCard
              title="Alto Risco"
              value={autonomy.altoRisco}
              subtitle="≥ 2h e < 4h de autonomia"
              icon={ShieldAlert}
              colorClass="text-accent"
              bgClass="bg-accent/10 text-accent"
            />
            <AutonomyRiskCard
              title="Crítico"
              value={autonomy.critico}
              subtitle="< 2 horas de autonomia"
              icon={ShieldX}
              colorClass="text-destructive"
              bgClass="bg-destructive/10 text-destructive"
            />
          </div>
        </div>

        {/* COM GMG */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {unitLabelSingular} COM Gerador ({totalComGMG} {unitLabel})
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <AutonomyRiskCard
              title="OK"
              value={autonomy.okComGMG}
              subtitle="≥ 4 horas de autonomia"
              icon={ShieldCheck}
              colorClass="text-success"
              bgClass="bg-success/10 text-success"
            />
            <AutonomyRiskCard
              title="Alto Risco"
              value={autonomy.altoRiscoComGMG}
              subtitle="≥ 2h e < 4h de autonomia"
              icon={ShieldAlert}
              colorClass="text-accent"
              bgClass="bg-accent/10 text-accent"
            />
            <AutonomyRiskCard
              title="Crítico"
              value={autonomy.criticoComGMG}
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
                  <Battery className="w-4 h-4" /> Gabinetes SEM Gerador:
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
                  <Zap className="w-4 h-4" /> Gabinetes COM Gerador:
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
              * A autonomia é calculada com base na capacidade total das baterias (Ah) e consumo estimado por gabinete (30A).
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

      {/* SEÇÃO 4: Regras de Obsolescência - NOVA */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-warning rounded-full" />
          <h2 className="font-semibold text-lg">Regras de Obsolescência por Tecnologia</h2>
        </div>

        {/* Bloco de Regras por Tecnologia */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Regras Baterias de Chumbo */}
          <Card className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Battery className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Baterias de Chumbo (Polímero e Monobloco)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success shrink-0" />
                  <span><strong className="text-foreground">OK:</strong> <span className="text-muted-foreground">Data de fabricação &lt; 2 anos</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning shrink-0" />
                  <span><strong className="text-foreground">Médio Risco:</strong> <span className="text-muted-foreground">≥ 2 anos e &lt; 3 anos</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive shrink-0" />
                  <span><strong className="text-foreground">Alto Risco:</strong> <span className="text-muted-foreground">≥ 3 anos</span></span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Regras Baterias de Lítio */}
          <Card className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Baterias de Lítio
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success shrink-0" />
                  <span><strong className="text-foreground">OK:</strong> <span className="text-muted-foreground">Data de fabricação &lt; 5 anos</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-warning shrink-0" />
                  <span><strong className="text-foreground">Médio Risco:</strong> <span className="text-muted-foreground">≥ 5 anos e &lt; 10 anos</span></span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive shrink-0" />
                  <span><strong className="text-foreground">Alto Risco:</strong> <span className="text-muted-foreground">≥ 10 anos</span></span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Painel de Obsolescência - Chumbo */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="w-4 h-4" />
            {unitLabelSingular} por Obsolescência - Baterias de Chumbo
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-success/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-success">OK</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolChumbo.ok}</p>
                    <p className="text-xs text-muted-foreground">Baterias &lt; 2 anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-warning/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-warning">Médio Risco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolChumbo.medioRisco}</p>
                    <p className="text-xs text-muted-foreground">Baterias 2-3 anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10">
                    <ShieldAlert className="w-5 h-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-destructive">Alto Risco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolChumbo.altoRisco}</p>
                    <p className="text-xs text-muted-foreground">Baterias ≥ 3 anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <ShieldX className="w-5 h-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Sem Banco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolChumbo.semBanco}</p>
                    <p className="text-xs text-muted-foreground">Sem bateria de chumbo</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted">
                    <Battery className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Painel de Obsolescência - Lítio */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Zap className="w-4 h-4" />
            {unitLabelSingular} por Obsolescência - Baterias de Lítio
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-success/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-success">OK</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolLitio.ok}</p>
                    <p className="text-xs text-muted-foreground">Baterias &lt; 5 anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-warning/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-warning">Médio Risco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolLitio.medioRisco}</p>
                    <p className="text-xs text-muted-foreground">Baterias 5-10 anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10">
                    <ShieldAlert className="w-5 h-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-destructive/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-destructive">Alto Risco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolLitio.altoRisco}</p>
                    <p className="text-xs text-muted-foreground">Baterias ≥ 10 anos</p>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <ShieldX className="w-5 h-5 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-muted">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Sem Banco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolLitio.semBanco}</p>
                    <p className="text-xs text-muted-foreground">Sem bateria de lítio</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nota explicativa */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                A classificação de obsolescência considera a <strong className="text-foreground">pior bateria</strong> (mais antiga) cadastrada em cada {viewMode === "gabinete" ? "gabinete" : "site"}.
                {unitLabelSingular} "Sem Banco" não possuem baterias daquela tecnologia registradas ou não têm data de fabricação informada.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
