import React, { useState } from "react";
import { Battery, ShieldCheck, ShieldAlert, ShieldX, Info, Zap, Building2, Boxes, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelStats, BatteryInfo } from "../types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface Props {
  stats: PanelStats;
  batteries: BatteryInfo[];
  onDrillDown: (
    type: "all" | "ok" | "nok" | "obsolete-warning" | "obsolete-critical" | 
    "autonomy-ok" | "autonomy-medio" | "autonomy-alto" | "autonomy-critico" |
    "chumbo-all" | "litio-all" | "chumbo-uf" | "litio-uf" |
    "troca-all" | "troca-uf" | "obsolete-ok" | "obsolete-medio" | "obsolete-alto",
    uf?: string
  ) => void;
}

export function BateriaPanel({ stats, batteries, onDrillDown }: Props) {
  const [viewMode, setViewMode] = useState<"gabinete" | "site">("gabinete");
  
  // Get correct values based on view mode - unified (no GMG separation)
  const totalAutonomy = viewMode === "gabinete" 
    ? stats.autonomyRisk.gabinetesOk + stats.autonomyRisk.gabinetesMedioRisco + 
      stats.autonomyRisk.gabinetesAltoRisco + stats.autonomyRisk.gabinetesCritico
    : stats.autonomyRisk.sitesOk + stats.autonomyRisk.sitesMedioRisco + 
      stats.autonomyRisk.sitesAltoRisco + stats.autonomyRisk.sitesCritico;

  const autonomy = viewMode === "gabinete" ? {
    ok: stats.autonomyRisk.gabinetesOk,
    medioRisco: stats.autonomyRisk.gabinetesMedioRisco,
    altoRisco: stats.autonomyRisk.gabinetesAltoRisco,
    critico: stats.autonomyRisk.gabinetesCritico,
  } : {
    ok: stats.autonomyRisk.sitesOk,
    medioRisco: stats.autonomyRisk.sitesMedioRisco,
    altoRisco: stats.autonomyRisk.sitesAltoRisco,
    critico: stats.autonomyRisk.sitesCritico,
  };

  const obsolescencia = viewMode === "gabinete" ? {
    ok: stats.obsolescencia.gabinetesOk,
    medioRisco: stats.obsolescencia.gabinetesMedioRisco,
    altoRisco: stats.obsolescencia.gabinetesAltoRisco,
    semBanco: stats.obsolescencia.gabinetesSemBanco,
  } : {
    ok: stats.obsolescencia.sitesOk,
    medioRisco: stats.obsolescencia.sitesMedioRisco,
    altoRisco: stats.obsolescencia.sitesAltoRisco,
    semBanco: stats.obsolescencia.sitesSemBanco,
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
    bgClass,
    onClick
  }: { 
    title: string; 
    value: number; 
    subtitle: string;
    icon: React.ElementType; 
    colorClass: string;
    bgClass: string;
    onClick?: () => void;
  }) => (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        onClick && "cursor-pointer hover:border-primary/50 active:scale-[0.98]"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className={`text-sm font-medium ${colorClass}`}>{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {onClick && (
              <p className="text-xs text-primary mt-1">Ver detalhes →</p>
            )}
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
      {/* CARD DESTAQUE: Total de Baterias Cadastradas */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Battery className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Total de Baterias Cadastradas</h2>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold text-primary">{stats.totalBatteries}</p>
                <span className="text-muted-foreground">unidades</span>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <div className="flex items-center justify-end gap-2">
                <Battery className="w-4 h-4 text-slate-500" />
                <span>Chumbo: <strong className="text-foreground">{stats.bateriasChumboTotal}</strong></span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span>Lítio: <strong className="text-foreground">{stats.bateriasLitioTotal}</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEÇÃO 1: Baterias de Chumbo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-slate-500 rounded-full" />
          <h2 className="font-semibold text-lg">Baterias de Chumbo (Polímero e Monobloco)</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Total Card */}
          <Card 
            className="bg-muted/30 border-muted-foreground/20 cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
            onClick={() => onDrillDown("chumbo-all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Battery className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">TOTAL</span>
              </div>
              <p className="text-3xl font-bold">{stats.bateriasChumboTotal}</p>
              <p className="text-xs text-muted-foreground mt-1">unidades</p>
              <p className="text-xs text-primary mt-1">Ver detalhes →</p>
            </CardContent>
          </Card>

          {/* UF Cards */}
          {stats.bateriasChumboByUf.map(({ uf, count }) => (
            <Card 
              key={`chumbo-${uf}`} 
              className="hover:shadow-md transition-all cursor-pointer hover:border-primary/50 active:scale-[0.98]"
              onClick={() => onDrillDown("chumbo-uf", uf)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-muted-foreground">{uf}</span>
                  <Battery className="w-4 h-4 text-muted-foreground" />
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

      {/* SEÇÃO 2: Baterias de Lítio */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-emerald-500 rounded-full" />
          <h2 className="font-semibold text-lg">Baterias de Lítio</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* Total Card */}
          <Card 
            className="bg-success/5 border-success/30 cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
            onClick={() => onDrillDown("litio-all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-5 h-5 text-success" />
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/20 text-success">TOTAL</span>
              </div>
              <p className="text-3xl font-bold text-success">{stats.bateriasLitioTotal}</p>
              <p className="text-xs text-muted-foreground mt-1">unidades</p>
              <p className="text-xs text-primary mt-1">Ver detalhes →</p>
            </CardContent>
          </Card>

          {/* UF Cards */}
          {stats.bateriasLitioByUf.map(({ uf, count }) => (
            <Card 
              key={`litio-${uf}`} 
              className="hover:shadow-md transition-all border-success/20 cursor-pointer hover:border-primary/50 active:scale-[0.98]"
              onClick={() => onDrillDown("litio-uf", uf)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-success">{uf}</span>
                  <Zap className="w-4 h-4 text-success/70" />
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
            <Card className="col-span-full border-success/20">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma bateria de lítio registrada</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* SEÇÃO 3: Regras de Troca de Bateria */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-destructive rounded-full" />
          <h2 className="font-semibold text-lg">Regras de Troca de Bateria</h2>
        </div>

        {/* Regras Obrigatórias (texto explicativo) */}
        <Card className="bg-destructive/5 border-destructive/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Regras Obrigatórias de Troca
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-destructive/20">
                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <span><strong>Estado = "Estufada"</strong> → TROCA</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-destructive/20">
                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <span><strong>Estado = "Vazando"</strong> → TROCA</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-destructive/20">
                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <span><strong>Estado = "Não segura carga"</strong> → TROCA</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-background border border-destructive/20">
                <span className="w-2 h-2 rounded-full bg-destructive shrink-0" />
                <span><strong>Obsolescência = "Alto risco"</strong> → TROCA</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Painel 1: Total Baterias para Troca */}
        <Card 
          className="bg-destructive/10 border-destructive cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.99] transition-all"
          onClick={() => onDrillDown("troca-all")}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-destructive" />
                  <h3 className="text-lg font-semibold text-destructive">TOTAL BATERIAS PARA TROCA</h3>
                </div>
                <p className="text-xs text-muted-foreground">Região Norte (PA, MA, AM, RR, AP)</p>
                <p className="text-xs text-primary">Clique para ver detalhes →</p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-bold text-destructive">{stats.bateriasParaTroca.total}</p>
                <p className="text-sm text-muted-foreground mt-1">unidades</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Painel 2: Cards por UF Norte */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="w-4 h-4" />
            Baterias para Troca por UF (Região Norte)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {/* Total Card */}
            <Card 
              className="bg-destructive/10 border-destructive/50 cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
              onClick={() => onDrillDown("troca-all")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw className="w-5 h-5 text-destructive" />
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">TOTAL</span>
                </div>
                <p className="text-3xl font-bold text-destructive">{stats.bateriasParaTroca.total}</p>
                <p className="text-xs text-muted-foreground mt-1">para troca</p>
              </CardContent>
            </Card>

            {/* UF Cards (PA, MA, AM, RR, AP) */}
            {stats.bateriasParaTroca.byUf.map(({ uf, count }) => {
              const getRiskColor = (c: number) => {
                if (c === 0) return { text: "text-success", bg: "bg-success/10", border: "border-success/30" };
                if (c < 5) return { text: "text-warning", bg: "bg-warning/10", border: "border-warning/30" };
                if (c < 10) return { text: "text-accent", bg: "bg-accent/10", border: "border-accent/30" };
                return { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" };
              };
              const colors = getRiskColor(count);
              
              return (
                <Card 
                  key={`troca-${uf}`} 
                  className={cn(
                    "transition-all hover:shadow-md cursor-pointer hover:border-primary/50 active:scale-[0.98]",
                    colors.border
                  )}
                  onClick={() => onDrillDown("troca-uf", uf)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-bold ${colors.text}`}>{uf}</span>
                      <Battery className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <p className={`text-2xl font-bold ${count > 0 ? colors.text : ""}`}>{count}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats.bateriasParaTroca.total > 0 
                        ? `${Math.round((count / stats.bateriasParaTroca.total) * 100)}%` 
                        : '0%'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEÇÃO 4: Toggle para visualização de Risco */}
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

      {/* SEÇÃO 5: Risco de Autonomia - UNIFICADO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-primary rounded-full" />
          <h2 className="font-semibold text-lg">Risco de Autonomia de Bateria</h2>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="w-4 h-4" />
            {unitLabelSingular} por Risco de Autonomia ({totalAutonomy} {unitLabel})
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AutonomyRiskCard
              title="OK"
              value={autonomy.ok}
              subtitle="≥ 6h (sem GMG) ou ≥ 4h (com GMG)"
              icon={ShieldCheck}
              colorClass="text-success"
              bgClass="bg-success/10 text-success"
              onClick={() => onDrillDown("autonomy-ok")}
            />
            <AutonomyRiskCard
              title="Médio Risco"
              value={autonomy.medioRisco}
              subtitle="≥ 4h e < 6h (sem gerador)"
              icon={ShieldAlert}
              colorClass="text-warning"
              bgClass="bg-warning/10 text-warning"
              onClick={() => onDrillDown("autonomy-medio")}
            />
            <AutonomyRiskCard
              title="Alto Risco"
              value={autonomy.altoRisco}
              subtitle="≥ 2h e < 4h de autonomia"
              icon={ShieldAlert}
              colorClass="text-accent"
              bgClass="bg-accent/10 text-accent"
              onClick={() => onDrillDown("autonomy-alto")}
            />
            <AutonomyRiskCard
              title="Crítico"
              value={autonomy.critico}
              subtitle="< 2 horas de autonomia"
              icon={ShieldX}
              colorClass="text-destructive"
              bgClass="bg-destructive/10 text-destructive"
              onClick={() => onDrillDown("autonomy-critico")}
            />
          </div>
        </div>

        {/* Card de Critérios - Autonomia */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Critérios de Classificação de Risco de Autonomia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Battery className="w-4 h-4" /> Sem Gerador (GMG):
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
                  <Zap className="w-4 h-4" /> Com Gerador (GMG):
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" /> 
                    <strong className="text-foreground">OK:</strong> Autonomia ≥ 4 horas
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

      {/* SEÇÃO 6: Obsolescência - UNIFICADA */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-6 bg-warning rounded-full" />
          <h2 className="font-semibold text-lg">Risco de Obsolescência de Bateria</h2>
        </div>

        {/* Painel de Obsolescência - UNIFICADO */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Battery className="w-4 h-4" />
            {unitLabelSingular} por Risco de Obsolescência (todas as baterias)
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="border-success/50 cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
              onClick={() => onDrillDown("obsolete-ok")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-success">OK</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolescencia.ok}</p>
                    <p className="text-xs text-muted-foreground">Baterias dentro do prazo</p>
                    <p className="text-xs text-primary mt-1">Ver detalhes →</p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <ShieldCheck className="w-5 h-5 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="border-warning/50 cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
              onClick={() => onDrillDown("obsolete-medio")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-warning">Médio Risco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolescencia.medioRisco}</p>
                    <p className="text-xs text-muted-foreground">Atenção recomendada</p>
                    <p className="text-xs text-primary mt-1">Ver detalhes →</p>
                  </div>
                  <div className="p-3 rounded-xl bg-warning/10">
                    <ShieldAlert className="w-5 h-5 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card 
              className="border-destructive/50 cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
              onClick={() => onDrillDown("obsolete-alto")}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium text-destructive">Alto Risco</p>
                    <p className="text-3xl font-bold tracking-tight">{obsolescencia.altoRisco}</p>
                    <p className="text-xs text-muted-foreground">Substituição recomendada</p>
                    <p className="text-xs text-primary mt-1">Ver detalhes →</p>
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
                    <p className="text-3xl font-bold tracking-tight">{obsolescencia.semBanco}</p>
                    <p className="text-xs text-muted-foreground">Sem bateria registrada</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted">
                    <Battery className="w-5 h-5 text-muted-foreground" />
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
                A classificação de obsolescência considera a <strong className="text-foreground">pior bateria</strong> (mais antiga) cadastrada em cada {viewMode === "gabinete" ? "gabinete" : "site"}, independente da tecnologia (chumbo ou lítio).
                {unitLabelSingular} "Sem Banco" não possuem baterias registradas ou não têm data de fabricação informada.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Critérios de Obsolescência por Tecnologia - MOVIDO PARA O FINAL */}
        <Card className="bg-muted/30 border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Critérios de Obsolescência por Tecnologia
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Battery className="w-4 h-4 text-slate-600" /> Baterias de Chumbo:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" /> 
                    <strong className="text-foreground">OK:</strong> &lt; 2 anos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" /> 
                    <strong className="text-foreground">Médio Risco:</strong> ≥ 2 e &lt; 3 anos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> 
                    <strong className="text-foreground">Alto Risco:</strong> ≥ 3 anos
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600" /> Baterias de Lítio:
                </p>
                <ul className="space-y-1 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success" /> 
                    <strong className="text-foreground">OK:</strong> &lt; 5 anos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-warning" /> 
                    <strong className="text-foreground">Médio Risco:</strong> ≥ 5 e &lt; 10 anos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-destructive" /> 
                    <strong className="text-foreground">Alto Risco:</strong> ≥ 10 anos
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
