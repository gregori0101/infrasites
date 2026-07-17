import React from "react";
import { Trash2, Shield, AlertTriangle, Building2, MoveHorizontal, MoveVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, SiteInfo } from "../types";
import { Progress } from "@/components/ui/progress";

interface Props {
  stats: PanelStats;
  sites: SiteInfo[];
  onDrillDown: (
    type:
      | "total"
      | "zeladoria"
      | "aterramento"
      | "zeladoria_nok"
      | "aterramento_nok"
      | "esteiramento_h_ok"
      | "esteiramento_h_nok"
      | "esteiramento_v_ok"
      | "esteiramento_v_nok"
  ) => void;
}

export function ZeladoriaPanel({ stats, sites, onDrillDown }: Props) {
  const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

  const zeladoriaPercent = pct(stats.zeladoriaOk, stats.zeladoriaTotal);
  const aterramentoPercent = pct(stats.aterramentoOk, stats.zeladoriaTotal);

  const zeladoriaNok = stats.zeladoriaTotal - stats.zeladoriaOk;
  const aterramentoNok = stats.zeladoriaTotal - stats.aterramentoOk;
  const zeladoriaNoKPercent = pct(zeladoriaNok, stats.zeladoriaTotal);
  const aterramentoNokPercent = pct(aterramentoNok, stats.zeladoriaTotal);

  const estHPercent = pct(stats.esteiramentoHorizontalOk, stats.esteiramentoHorizontalTotal);
  const estHNokPercent = pct(stats.esteiramentoHorizontalNok, stats.esteiramentoHorizontalTotal);
  const estVPercent = pct(stats.esteiramentoVerticalOk, stats.esteiramentoVerticalTotal);
  const estVNokPercent = pct(stats.esteiramentoVerticalNok, stats.esteiramentoVerticalTotal);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-7 bg-success rounded-full" />
        <div>
          <h2 className="font-bold text-lg tracking-tight">Painel Zeladoria / Torre</h2>
          <p className="text-xs text-muted-foreground">Limpeza, conservação, aterramento e esteiramento</p>
        </div>
      </div>

      {/* KPI Cards - Zeladoria & Aterramento */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Total Sites"
          value={stats.zeladoriaTotal}
          subtitle="Sites vistoriados"
          icon={Building2}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown("total")}
        />
        <StatCard
          title="Zeladoria OK"
          value={stats.zeladoriaOk}
          subtitle={`${zeladoriaPercent}% dos sites`}
          icon={Trash2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${zeladoriaPercent}%`, variant: zeladoriaPercent >= 80 ? "success" : "warning" }}
          onClick={() => onDrillDown("zeladoria")}
        />
        <StatCard
          title="Zeladoria NOK"
          value={zeladoriaNok}
          subtitle={`${zeladoriaNoKPercent}% dos sites`}
          icon={AlertTriangle}
          iconBg="bg-destructive/10 text-destructive"
          badge={{ text: `${zeladoriaNoKPercent}%`, variant: zeladoriaNoKPercent > 0 ? "destructive" : "success" }}
          onClick={() => onDrillDown("zeladoria_nok")}
        />
        <StatCard
          title="Aterramento OK"
          value={stats.aterramentoOk}
          subtitle={`${aterramentoPercent}% dos sites`}
          icon={Shield}
          iconBg="bg-accent/10 text-accent"
          badge={{ text: `${aterramentoPercent}%`, variant: aterramentoPercent >= 80 ? "success" : "warning" }}
          onClick={() => onDrillDown("aterramento")}
        />
        <StatCard
          title="Aterramento NOK"
          value={aterramentoNok}
          subtitle={`${aterramentoNokPercent}% dos sites`}
          icon={AlertTriangle}
          iconBg="bg-destructive/10 text-destructive"
          badge={{ text: `${aterramentoNokPercent}%`, variant: aterramentoNokPercent > 0 ? "destructive" : "success" }}
          onClick={() => onDrillDown("aterramento_nok")}
        />
      </div>

      {/* KPI Cards - Esteiramento */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Esteir. Horizontal OK"
          value={stats.esteiramentoHorizontalOk}
          subtitle={`${estHPercent}% de ${stats.esteiramentoHorizontalTotal}`}
          icon={MoveHorizontal}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${estHPercent}%`, variant: estHPercent >= 80 ? "success" : "warning" }}
          onClick={() => onDrillDown("esteiramento_h_ok")}
        />
        <StatCard
          title="Esteir. Horizontal NOK"
          value={stats.esteiramentoHorizontalNok}
          subtitle={`${estHNokPercent}% de ${stats.esteiramentoHorizontalTotal}`}
          icon={AlertTriangle}
          iconBg="bg-destructive/10 text-destructive"
          badge={{ text: `${estHNokPercent}%`, variant: estHNokPercent > 0 ? "destructive" : "success" }}
          onClick={() => onDrillDown("esteiramento_h_nok")}
        />
        <StatCard
          title="Esteir. Vertical OK"
          value={stats.esteiramentoVerticalOk}
          subtitle={`${estVPercent}% de ${stats.esteiramentoVerticalTotal}`}
          icon={MoveVertical}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${estVPercent}%`, variant: estVPercent >= 80 ? "success" : "warning" }}
          onClick={() => onDrillDown("esteiramento_v_ok")}
        />
        <StatCard
          title="Esteir. Vertical NOK"
          value={stats.esteiramentoVerticalNok}
          subtitle={`${estVNokPercent}% de ${stats.esteiramentoVerticalTotal}`}
          icon={AlertTriangle}
          iconBg="bg-destructive/10 text-destructive"
          badge={{ text: `${estVNokPercent}%`, variant: estVNokPercent > 0 ? "destructive" : "success" }}
          onClick={() => onDrillDown("esteiramento_v_nok")}
        />
      </div>

      {/* Progress Bars */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2 px-6">
          <CardTitle className="text-sm font-semibold">Indicadores de Conformidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Zeladoria
              </span>
              <span className="font-medium">{zeladoriaPercent}%</span>
            </div>
            <Progress value={zeladoriaPercent} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" /> Aterramento
              </span>
              <span className="font-medium">{aterramentoPercent}%</span>
            </div>
            <Progress value={aterramentoPercent} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <MoveHorizontal className="w-4 h-4" /> Esteiramento Horizontal
              </span>
              <span className="font-medium">{estHPercent}%</span>
            </div>
            <Progress value={estHPercent} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-2">
                <MoveVertical className="w-4 h-4" /> Esteiramento Vertical
              </span>
              <span className="font-medium">{estVPercent}%</span>
            </div>
            <Progress value={estVPercent} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
