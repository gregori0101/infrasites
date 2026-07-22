import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Battery, ShieldCheck, ShieldAlert, ShieldX, Info, Zap, Building2, Boxes, AlertTriangle, RefreshCw, Shield, Lock, Radio, Sparkles, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PanelStats, BatteryInfo } from "../types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  stats: PanelStats;
  batteries: BatteryInfo[];
  onRefetch?: () => void;
  onDrillDown: (
    type: "all" | "ok" | "nok" | "obsolete-warning" | "obsolete-critical" | 
    "autonomy-ok" | "autonomy-medio" | "autonomy-alto" | "autonomy-critico" |
    "chumbo-all" | "litio-all" | "chumbo-uf" | "litio-uf" |
    "troca-all" | "troca-uf" | "obsolete-ok" | "obsolete-medio" | "obsolete-alto" |
    "tech-obs-ok" | "tech-obs-nok" | "tech-aut-ok" | "tech-aut-nok" | "sem-banco",
    uf?: string
  ) => void;
}

const createAiError = (message: string, code?: string) => Object.assign(new Error(message), { code });

const AI_BULK_AUTORUN_KEY = "battery-ai-bulk-autorun";
const BULK_BATCH_LIMIT = 12;
const BULK_PAGE_SIZE = 80;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function BateriaPanel({ stats, batteries, onRefetch, onDrillDown }: Props) {
  const [viewMode, setViewMode] = useState<"gabinete" | "site">("gabinete");
  const { toast } = useToast();
  const [bulkAnalyzing, setBulkAnalyzing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });
  const [bulkStatusMessage, setBulkStatusMessage] = useState<string | null>(null);
  const [autoAnalyzeEnabled, setAutoAnalyzeEnabled] = useState(() => {
    try {
      return window.localStorage.getItem(AI_BULK_AUTORUN_KEY) === "true";
    } catch {
      return false;
    }
  });
  const autoAnalyzeRef = useRef(autoAnalyzeEnabled);
  const bulkLoopRef = useRef(false);

  const pendingAnalysisCount = useMemo(
    () => batteries.filter((b) => !b.tipoIA && b.reportId).length,
    [batteries]
  );
  const totalAnalisavel = useMemo(
    () => batteries.filter((b) => b.reportId).length,
    [batteries]
  );
  const analisadasCount = Math.max(0, totalAnalisavel - pendingAnalysisCount);
  const progressPct = totalAnalisavel > 0 ? Math.round((analisadasCount / totalAnalisavel) * 100) : 0;

  // Auto-refresh dashboard while server-side bulk processing is running
  useEffect(() => {
    if (pendingAnalysisCount === 0 || !onRefetch) return;
    const id = setInterval(() => {
      onRefetch();
    }, 20000);
    return () => clearInterval(id);
  }, [pendingAnalysisCount, onRefetch]);

  const setAutoAnalysis = useCallback((enabled: boolean) => {
    autoAnalyzeRef.current = enabled;
    setAutoAnalyzeEnabled(enabled);
    try {
      window.localStorage.setItem(AI_BULK_AUTORUN_KEY, enabled ? "true" : "false");
    } catch {
      // ignore storage failures
    }
  }, []);

  const analyzeAllBatteries = useCallback(async () => {
    if (bulkLoopRef.current) return;

    const initialPending = batteries.filter((b) => !b.tipoIA && b.reportId).length;
    if (initialPending === 0) {
      setAutoAnalysis(false);
      toast({ title: "Tudo analisado", description: "Não há baterias pendentes de análise." });
      return;
    }

    bulkLoopRef.current = true;
    setBulkAnalyzing(true);
    setBulkProgress({ done: 0, total: initialPending });
    setBulkStatusMessage("Iniciando análise contínua...");

    let offset = 0;
    let totalProcessed = 0;
    let totalUpdated = 0;
    let totalMarkedIndeterminate = 0;
    let emptyBatches = 0;

    try {
      while (autoAnalyzeRef.current && emptyBatches < 8) {
        const { data: result, error } = await supabase.functions.invoke("classify-batteries-bulk", {
          body: {
            limit: BULK_BATCH_LIMIT,
            pageSize: BULK_PAGE_SIZE,
            offset,
          },
        });

        if (error) {
          throw createAiError(error.message || "Não foi possível executar o lote de IA.", error.code);
        }

        if (result?.ok === false) {
          throw createAiError(result.message || "A análise de IA foi interrompida.", result.code);
        }

        const processed = Number(result?.processed || 0);
        const updated = Number(result?.updated || 0);
        const skipped = Number(result?.skipped || 0);
        const markedIndeterminate = Number(result?.markedIndeterminate || 0);
        let nextOffset = Number(result?.nextOffset ?? offset);
        totalProcessed += processed;
        totalUpdated += updated;
        totalMarkedIndeterminate += markedIndeterminate;

        setBulkProgress({
          done: Math.min(initialPending, totalProcessed + totalMarkedIndeterminate),
          total: initialPending,
        });
        setBulkStatusMessage(
          `${totalProcessed.toLocaleString("pt-BR")} foto(s) processadas nesta execução` +
          (totalMarkedIndeterminate > 0 ? ` · ${totalMarkedIndeterminate.toLocaleString("pt-BR")} sem leitura marcadas como indeterminadas` : "")
        );
        onRefetch?.();

        if (result?.done) {
          setAutoAnalysis(false);
          toast({
            title: "Análise contínua concluída",
            description: `${totalUpdated.toLocaleString("pt-BR")} relatório(s) atualizados.`,
          });
          break;
        }

        if (processed === 0 && updated === 0 && markedIndeterminate === 0 && skipped === 0) {
          emptyBatches++;
        } else {
          emptyBatches = 0;
        }

        if (processed === 0 && nextOffset <= offset) {
          nextOffset = offset + BULK_PAGE_SIZE;
        }
        offset = nextOffset;

        await wait(1500);
      }

      if (!autoAnalyzeRef.current) {
        setBulkStatusMessage("Análise pausada pelo usuário.");
      } else if (emptyBatches >= 8) {
        setAutoAnalysis(false);
        setBulkStatusMessage("A fila não avançou após várias tentativas. Reteste a análise.");
        toast({
          title: "Análise pausada",
          description: "A fila não avançou após várias tentativas seguidas.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      console.error("[classify-batteries-bulk]", e);
      setAutoAnalysis(false);
      setBulkStatusMessage(e?.message || "Falha na análise contínua.");
      toast({
        title: "Análise pausada",
        description: e?.message || "Não foi possível continuar a análise de IA.",
        variant: "destructive",
      });
    } finally {
      bulkLoopRef.current = false;
      setBulkAnalyzing(false);
      onRefetch?.();
    }
  }, [batteries, onRefetch, setAutoAnalysis, toast]);

  useEffect(() => {
    if (autoAnalyzeEnabled && pendingAnalysisCount > 0) {
      analyzeAllBatteries();
    }
  }, [autoAnalyzeEnabled, pendingAnalysisCount, analyzeAllBatteries]);

  
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

  // Protection stats computed from batteries
  const protecaoStats = useMemo(() => {
    let total = batteries.length;
    let coladas = 0;
    let comGradil = 0;
    let protegidas = 0;
    let naoProtegidas = 0;

    batteries.forEach(b => {
      const isColada = b.colada?.toUpperCase() === "SIM";
      const isComGradil = b.comGradil?.toUpperCase() === "SIM";
      if (isColada) coladas++;
      if (isComGradil) comGradil++;
      if (isColada || isComGradil) protegidas++;
      else naoProtegidas++;
    });

    return { total, coladas, comGradil, protegidas, naoProtegidas };
  }, [batteries]);

  // Autonomy Risk Card Component
  const AutonomyRiskCard = ({ 
    title, 
    value, 
    subtitle,
    percentage,
    icon: Icon, 
    colorClass,
    bgClass,
    onClick
  }: { 
    title: string; 
    value: number; 
    subtitle: string;
    percentage: number;
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
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded", bgClass)}>
                {percentage}%
              </span>
            </div>
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
      {/* Análise IA em Lote */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-sm">Classificação por IA (Lítio × Polímero)</p>
                <p className="text-xs text-muted-foreground">
                  {pendingAnalysisCount > 0
                    ? `${pendingAnalysisCount} bateria(s) pendentes de análise.`
                    : "Todas as baterias com foto já foram analisadas."}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (autoAnalyzeEnabled || bulkAnalyzing) {
                  setAutoAnalysis(false);
                } else {
                  setAutoAnalysis(true);
                }
              }}
              disabled={pendingAnalysisCount === 0}
              size="sm"
              className="gap-2 shrink-0"
              variant={autoAnalyzeEnabled || bulkAnalyzing ? "secondary" : "default"}
            >
              {bulkAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {autoAnalyzeEnabled || bulkAnalyzing ? "Pausar análise" : "Rodar IA sem parar"}
            </Button>
          </div>

          {totalAnalisavel > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  {pendingAnalysisCount > 0 && (
                    <Loader2 className="w-3 h-3 animate-spin text-primary" />
                  )}
                  <span className="font-medium text-foreground">
                    {analisadasCount.toLocaleString("pt-BR")} / {totalAnalisavel.toLocaleString("pt-BR")}
                  </span>
                  <span>baterias analisadas</span>
                  {pendingAnalysisCount > 0 && (
                    <span className="text-primary">· atualiza automaticamente</span>
                  )}
                </span>
                <span className="font-semibold text-primary">{progressPct}%</span>
              </div>
              <Progress value={progressPct} className="h-2" />
              {bulkAnalyzing && (
                <p className="text-xs text-primary">
                  Lote contínuo: {bulkProgress.done} / {bulkProgress.total}
                </p>
              )}
              {bulkStatusMessage && (
                <p className="text-xs text-muted-foreground">{bulkStatusMessage}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>



      {/* CARD DESTAQUE: Total de Baterias Cadastradas */}
      <Card 
        className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all"
        onClick={() => onDrillDown("all")}
      >
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
              <p className="text-xs text-primary">Ver detalhes →</p>
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-slate-500 rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Baterias de Chumbo (Polímero e Monobloco)</h2>
            <p className="text-xs text-muted-foreground">Distribuição por UF</p>
          </div>
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-emerald-500 rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Baterias de Lítio</h2>
            <p className="text-xs text-muted-foreground">Distribuição por UF</p>
          </div>
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

      {/* SEÇÃO: Indicadores por Tecnologia de Acesso */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-blue-500 rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Indicadores por Tecnologia de Acesso</h2>
            <p className="text-xs text-muted-foreground">Obsolescência e Autonomia OK vs NOK por 2G, 3G, 4G, 5G</p>
          </div>
        </div>

        {stats.bateriasByTecAcesso.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Obsolescência por Tecnologia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.bateriasByTecAcesso} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} className="cursor-pointer">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="tech" className="text-xs" />
                      <YAxis className="text-xs" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="obsolescenciaOk" name="OK" stackId="obs" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} onClick={(data) => onDrillDown("tech-obs-ok", data.tech)} />
                      <Bar dataKey="obsolescenciaNok" name="NOK" stackId="obs" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} onClick={(data) => onDrillDown("tech-obs-nok", data.tech)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Autonomia por Tecnologia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.bateriasByTecAcesso} margin={{ top: 5, right: 20, left: 0, bottom: 5 }} className="cursor-pointer">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="tech" className="text-xs" />
                      <YAxis className="text-xs" />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="autonomiaOk" name="OK" stackId="aut" fill="hsl(var(--success))" radius={[0, 0, 0, 0]} onClick={(data) => onDrillDown("tech-aut-ok", data.tech)} />
                      <Bar dataKey="autonomiaNok" name="NOK" stackId="aut" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} onClick={(data) => onDrillDown("tech-aut-nok", data.tech)} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum dado de tecnologia de acesso disponível</p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-foreground">OK</strong>: Obsolescência (ok + médio) / Autonomia (ok + médio). <strong className="text-foreground">NOK</strong>: Obsolescência (alto) / Autonomia (alto + crítico). Gabinetes com múltiplas tecnologias contribuem para todas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO: Proteção das Baterias */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-primary rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Proteção das Baterias</h2>
            <p className="text-xs text-muted-foreground">Colagem e gradil de proteção</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-primary">Total de Baterias</p>
                  <p className="text-3xl font-bold tracking-tight">{protecaoStats.total}</p>
                  <p className="text-xs text-muted-foreground">cadastradas</p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Battery className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-success">Protegidas</p>
                  <p className="text-3xl font-bold tracking-tight">{protecaoStats.protegidas}</p>
                  <p className="text-xs text-muted-foreground">colada ou com gradil</p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-destructive">Não Protegidas</p>
                  <p className="text-3xl font-bold tracking-tight">{protecaoStats.naoProtegidas}</p>
                  <p className="text-xs text-muted-foreground">sem colagem nem gradil</p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <ShieldX className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted">
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Coladas:</span>
                  <span className="font-bold">{protecaoStats.coladas}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Com Gradil:</span>
                  <span className="font-bold">{protecaoStats.comGradil}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-muted-foreground">% Protegidas:</span>
                  <span className="font-bold text-success">
                    {protecaoStats.total > 0 ? Math.round((protecaoStats.protegidas / protecaoStats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Uma bateria é considerada <strong className="text-foreground">protegida</strong> se estiver <strong className="text-foreground">colada</strong> ou possuir <strong className="text-foreground">gradil</strong> de proteção. Baterias com gradil também são consideradas protegidas independentemente do status de colagem.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 3: Regras de Troca de Bateria */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-destructive rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Regras de Troca de Bateria</h2>
            <p className="text-xs text-muted-foreground">Critérios obrigatórios de substituição</p>
          </div>
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-primary rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Risco de Autonomia de Bateria</h2>
            <p className="text-xs text-muted-foreground">Classificação por horas de backup</p>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 flex-wrap">
            <Battery className="w-4 h-4" />
            {unitLabelSingular} por Risco de Autonomia ({totalAutonomy} {unitLabel})
            {totalAutonomy > 0 && (
              <>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">OK: {Math.round(((autonomy.ok + autonomy.medioRisco) / totalAutonomy) * 100)}%</span>
                <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">NOK: {Math.round(((autonomy.altoRisco + autonomy.critico) / totalAutonomy) * 100)}%</span>
              </>
            )}
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <AutonomyRiskCard
              title="OK"
              value={autonomy.ok}
              subtitle="≥ 6h (sem GMG) ou ≥ 4h (com GMG)"
              percentage={totalAutonomy > 0 ? Math.round((autonomy.ok / totalAutonomy) * 100) : 0}
              icon={ShieldCheck}
              colorClass="text-success"
              bgClass="bg-success/10 text-success"
              onClick={() => onDrillDown("autonomy-ok")}
            />
            <AutonomyRiskCard
              title="Médio Risco"
              value={autonomy.medioRisco}
              subtitle="≥ 4h e < 6h (sem gerador)"
              percentage={totalAutonomy > 0 ? Math.round((autonomy.medioRisco / totalAutonomy) * 100) : 0}
              icon={ShieldAlert}
              colorClass="text-warning"
              bgClass="bg-warning/10 text-warning"
              onClick={() => onDrillDown("autonomy-medio")}
            />
            <AutonomyRiskCard
              title="Alto Risco"
              value={autonomy.altoRisco}
              subtitle="≥ 2h e < 4h de autonomia"
              percentage={totalAutonomy > 0 ? Math.round((autonomy.altoRisco / totalAutonomy) * 100) : 0}
              icon={ShieldAlert}
              colorClass="text-accent"
              bgClass="bg-accent/10 text-accent"
              onClick={() => onDrillDown("autonomy-alto")}
            />
            <AutonomyRiskCard
              title="Crítico"
              value={autonomy.critico}
              subtitle="< 2 horas de autonomia"
              percentage={totalAutonomy > 0 ? Math.round((autonomy.critico / totalAutonomy) * 100) : 0}
              icon={ShieldX}
              colorClass="text-destructive"
              bgClass="bg-destructive/10 text-destructive"
              onClick={() => onDrillDown("autonomy-critico")}
            />
          </div>

          {/* Pie Chart OK vs NOK */}
          <Card className="mt-4 border-border/60 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Autonomia: OK vs NOK</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center gap-8">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "OK", value: autonomy.ok + autonomy.medioRisco, color: "hsl(var(--success))" },
                          { name: "NOK", value: autonomy.altoRisco + autonomy.critico, color: "hsl(var(--destructive))" },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={4}
                        strokeWidth={2}
                        stroke="hsl(var(--card))"
                        dataKey="value"
                      >
                        {[
                          { name: "OK", value: autonomy.ok + autonomy.medioRisco, color: "hsl(var(--success))" },
                          { name: "NOK", value: autonomy.altoRisco + autonomy.critico, color: "hsl(var(--destructive))" },
                        ].filter(d => d.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => [value, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-sm">OK: <strong>{autonomy.ok + autonomy.medioRisco}</strong> {unitLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-sm">NOK: <strong>{autonomy.altoRisco + autonomy.critico}</strong> {unitLabel}</span>
                  </div>
                  {totalAutonomy > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {Math.round(((autonomy.ok + autonomy.medioRisco) / totalAutonomy) * 100)}% OK · {Math.round(((autonomy.altoRisco + autonomy.critico) / totalAutonomy) * 100)}% NOK
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-warning rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Risco de Obsolescência de Bateria</h2>
            <p className="text-xs text-muted-foreground">Classificação por tempo de uso</p>
          </div>
        </div>

        {/* Painel de Obsolescência - UNIFICADO */}
        <div className="space-y-3">
          {(() => {
            const totalObsolescencia = obsolescencia.ok + obsolescencia.medioRisco + obsolescencia.altoRisco + obsolescencia.semBanco;
            const pct = (v: number) => totalObsolescencia > 0 ? Math.round((v / totalObsolescencia) * 100) : 0;
            return (
              <>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 flex-wrap">
                  <Battery className="w-4 h-4" />
                  {unitLabelSingular} por Risco de Obsolescência ({totalObsolescencia} {unitLabel})
                  {totalObsolescencia > 0 && (
                    <>
                       <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">OK: {pct(obsolescencia.ok + obsolescencia.medioRisco)}%</span>
                       <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">NOK: {pct(obsolescencia.altoRisco + obsolescencia.semBanco)}%</span>
                    </>
                  )}
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
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold tracking-tight">{obsolescencia.ok}</p>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-success/10 text-success">{pct(obsolescencia.ok)}%</span>
                          </div>
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
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold tracking-tight">{obsolescencia.medioRisco}</p>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-warning/10 text-warning">{pct(obsolescencia.medioRisco)}%</span>
                          </div>
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
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold tracking-tight">{obsolescencia.altoRisco}</p>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{pct(obsolescencia.altoRisco)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Substituição recomendada</p>
                          <p className="text-xs text-primary mt-1">Ver detalhes →</p>
                        </div>
                        <div className="p-3 rounded-xl bg-destructive/10">
                          <ShieldX className="w-5 h-5 text-destructive" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="border-muted cursor-pointer hover:shadow-md hover:border-primary/50 active:scale-[0.98] transition-all"
                    onClick={() => onDrillDown("sem-banco")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium text-muted-foreground">Sem Banco</p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold tracking-tight">{obsolescencia.semBanco}</p>
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{pct(obsolescencia.semBanco)}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Sem bateria registrada</p>
                          <p className="text-xs text-primary mt-1">Ver detalhes →</p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted">
                      <Battery className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            );
          })()}

          {/* Pie Chart OK vs NOK - Obsolescência */}
          {(() => {
            const totalObsolescencia = obsolescencia.ok + obsolescencia.medioRisco + obsolescencia.altoRisco + obsolescencia.semBanco;
            const nokObsolescencia = obsolescencia.altoRisco + obsolescencia.semBanco;
            return (
              <Card className="mt-4 border-border/60 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Obsolescência: OK vs NOK</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-8">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "OK", value: obsolescencia.ok + obsolescencia.medioRisco, color: "hsl(var(--success))" },
                              { name: "NOK", value: nokObsolescencia, color: "hsl(var(--destructive))" },
                            ].filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={4}
                            strokeWidth={2}
                            stroke="hsl(var(--card))"
                            dataKey="value"
                          >
                            {[
                              { name: "OK", value: obsolescencia.ok + obsolescencia.medioRisco, color: "hsl(var(--success))" },
                              { name: "NOK", value: nokObsolescencia, color: "hsl(var(--destructive))" },
                            ].filter(d => d.value > 0).map((entry, index) => (
                              <Cell key={`cell-obs-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip formatter={(value: number) => [value, ""]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span className="text-sm">OK: <strong>{obsolescencia.ok + obsolescencia.medioRisco}</strong> {unitLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-sm">NOK: <strong>{nokObsolescencia}</strong> {unitLabel}</span>
                      </div>
                      {totalObsolescencia > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {Math.round(((obsolescencia.ok + obsolescencia.medioRisco) / totalObsolescencia) * 100)}% OK · {Math.round(((obsolescencia.altoRisco + obsolescencia.semBanco) / totalObsolescencia) * 100)}% NOK
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}
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
