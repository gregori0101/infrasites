import React, { useState, useMemo } from "react";
import { Building2, Shield, ShieldCheck, ShieldX, Info, ToggleLeft, ToggleRight, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GabineteInfo } from "../types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface Props {
  gabinetes: GabineteInfo[];
  onDrillDown: (type: string) => void;
}

export function GabinetePanel({ gabinetes, onDrillDown }: Props) {
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "desativado">("todos");

  const filtered = useMemo(() => {
    if (statusFilter === "todos") return gabinetes;
    if (statusFilter === "ativo") return gabinetes.filter(g => g.ativo !== "Desativado");
    return gabinetes.filter(g => g.ativo === "Desativado");
  }, [gabinetes, statusFilter]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const ativos = gabinetes.filter(g => g.ativo !== "Desativado").length;
    const desativados = gabinetes.filter(g => g.ativo === "Desativado").length;

    // Type distribution
    const tipoMap: Record<string, number> = {};
    filtered.forEach(g => {
      const tipo = g.tipo || "N/A";
      tipoMap[tipo] = (tipoMap[tipo] || 0) + 1;
    });
    const tipoDistribution = Object.entries(tipoMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Protection
    let protegidos = 0;
    let naoProtegidos = 0;
    let protecaoNI = 0;
    filtered.forEach(g => {
      const p = g.protecao?.toUpperCase();
      if (p === "SIM") protegidos++;
      else if (p === "NÃO" || p === "NAO" || p === "NO") naoProtegidos++;
      else protecaoNI++;
    });

    return { total, ativos, desativados, tipoDistribution, protegidos, naoProtegidos, protecaoNI };
  }, [filtered, gabinetes]);

  const tipoColors: Record<string, string> = {
    "CONTAINER": "bg-blue-500/10 text-blue-700 border-blue-200",
    "SHARING": "bg-purple-500/10 text-purple-700 border-purple-200",
    "ABRIGO": "bg-amber-500/10 text-amber-700 border-amber-200",
    "OUTDOOR": "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    "INDOOR": "bg-cyan-500/10 text-cyan-700 border-cyan-200",
  };

  const getColorClass = (tipo: string) => tipoColors[tipo] || "bg-muted/50 text-muted-foreground border-muted";

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/30 cursor-pointer hover:shadow-lg active:scale-[0.99] transition-all" onClick={() => onDrillDown("protecao-total")}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold">Total de Gabinetes</h2>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-bold text-primary">{stats.total}</p>
                <span className="text-muted-foreground">unidades</span>
              </div>
              <p className="text-xs text-primary flex items-center gap-1">
                Ver detalhes <ChevronRight className="w-3 h-3" />
              </p>
            </div>
            <div className="text-right text-sm text-muted-foreground space-y-1">
              <div className="flex items-center justify-end gap-2">
                <ToggleRight className="w-4 h-4 text-success" />
                <span>Ativos: <strong className="text-foreground">{stats.ativos}</strong></span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <ToggleLeft className="w-4 h-4 text-destructive" />
                <span>Desativados: <strong className="text-foreground">{stats.desativados}</strong></span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Filter */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Filtrar por Status do Gabinete:</span>
            </div>
            <ToggleGroup
              type="single"
              value={statusFilter}
              onValueChange={(value) => value && setStatusFilter(value as "todos" | "ativo" | "desativado")}
              className="bg-background border rounded-lg"
            >
              <ToggleGroupItem value="todos" aria-label="Todos" className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Todos</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="ativo" aria-label="Ativos" className="gap-2 data-[state=on]:bg-success data-[state=on]:text-white">
                <ToggleRight className="w-4 h-4" />
                <span className="hidden sm:inline">Ativos</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="desativado" aria-label="Desativados" className="gap-2 data-[state=on]:bg-destructive data-[state=on]:text-white">
                <ToggleLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Desativados</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardContent>
      </Card>

      {/* Tipo de Gabinete */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-primary rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Tipo de Gabinete</h2>
            <p className="text-xs text-muted-foreground">Distribuição por classificação física</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {stats.tipoDistribution.map(({ name, count }) => {
            const colorClass = getColorClass(name);
            return (
              <Card
                key={name}
                className={cn("hover:shadow-md transition-all cursor-pointer hover:border-primary/50 active:scale-[0.98] border", colorClass.split(' ').pop())}
                onClick={() => onDrillDown(`tipo-${name}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-bold ${colorClass.split(' ')[1]}`}>{name}</span>
                    <Building2 className={`w-4 h-4 ${colorClass.split(' ')[1]}`} />
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.total > 0 ? `${Math.round((count / stats.total) * 100)}%` : '0%'}
                  </p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    Ver detalhes <ChevronRight className="w-3 h-3" />
                  </p>
                </CardContent>
              </Card>
            );
          })}

          {stats.tipoDistribution.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="p-6 text-center text-muted-foreground">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum gabinete registrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Proteção */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1.5 h-7 bg-warning rounded-full" />
          <div>
            <h2 className="font-bold text-lg tracking-tight">Proteção dos Gabinetes</h2>
            <p className="text-xs text-muted-foreground">Status de segurança física</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/30 cursor-pointer hover:border-primary/50 hover:shadow-lg active:scale-[0.98] transition-all" onClick={() => onDrillDown("protecao-total")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-primary">Total</p>
                  <p className="text-3xl font-bold tracking-tight">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">gabinetes</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    Ver detalhes <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-success/50 cursor-pointer hover:border-success hover:shadow-lg active:scale-[0.98] transition-all" onClick={() => onDrillDown("protecao-sim")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-success">Protegidos</p>
                  <p className="text-3xl font-bold tracking-tight">{stats.protegidos}</p>
                  <p className="text-xs text-muted-foreground">com proteção</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    Ver detalhes <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-success/10">
                  <ShieldCheck className="w-5 h-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50 cursor-pointer hover:border-destructive hover:shadow-lg active:scale-[0.98] transition-all" onClick={() => onDrillDown("protecao-nao")}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-destructive">Não Protegidos</p>
                  <p className="text-3xl font-bold tracking-tight">{stats.naoProtegidos}</p>
                  <p className="text-xs text-muted-foreground">sem proteção</p>
                  <p className="text-xs text-primary flex items-center gap-1 mt-1">
                    Ver detalhes <ChevronRight className="w-3 h-3" />
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-destructive/10">
                  <ShieldX className="w-5 h-5 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-muted cursor-pointer hover:border-muted-foreground/30 hover:shadow-lg active:scale-[0.98] transition-all" onClick={() => onDrillDown("protecao-ni")}>
            <CardContent className="p-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Não informado:</span>
                  <span className="font-bold">{stats.protecaoNI}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="text-muted-foreground">% Protegidos:</span>
                  <span className="font-bold text-success">
                    {stats.total > 0 ? Math.round((stats.protegidos / stats.total) * 100) : 0}%
                  </span>
                </div>
                <p className="text-xs text-primary flex items-center gap-1 mt-1">
                  Ver detalhes <ChevronRight className="w-3 h-3" />
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Os dados de gabinete são extraídos dos relatórios de vistoria. O <strong className="text-foreground">tipo</strong> indica a classificação física do gabinete (Container, Sharing, Abrigo, etc.). A <strong className="text-foreground">proteção</strong> indica se o gabinete possui grade, cadeado ou outro mecanismo de segurança. Use o filtro acima para visualizar apenas gabinetes <strong className="text-foreground">ativos</strong> ou <strong className="text-foreground">desativados</strong>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
