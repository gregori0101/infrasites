import React from "react";
import { Trash2, Shield, AlertTriangle, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, SiteInfo } from "../types";
import { Progress } from "@/components/ui/progress";

interface Props {
  stats: PanelStats;
  sites: SiteInfo[];
  onDrillDown: (type: "total" | "zeladoria" | "aterramento" | "zeladoria_nok" | "aterramento_nok") => void;
}

export function ZeladoriaPanel({ stats, sites, onDrillDown }: Props) {
  const zeladoriaPercent = stats.zeladoriaTotal > 0 
    ? Math.round((stats.zeladoriaOk / stats.zeladoriaTotal) * 100) 
    : 0;
    
  const aterramentoPercent = stats.zeladoriaTotal > 0 
    ? Math.round((stats.aterramentoOk / stats.zeladoriaTotal) * 100) 
    : 0;

  const zeladoriaNok = stats.zeladoriaTotal - stats.zeladoriaOk;
  const aterramentoNok = stats.zeladoriaTotal - stats.aterramentoOk;
  const zeladoriaNoKPercent = stats.zeladoriaTotal > 0
    ? Math.round((zeladoriaNok / stats.zeladoriaTotal) * 100)
    : 0;
  const aterramentoNokPercent = stats.zeladoriaTotal > 0
    ? Math.round((aterramentoNok / stats.zeladoriaTotal) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-7 bg-success rounded-full" />
        <div>
          <h2 className="font-bold text-lg tracking-tight">Painel Zeladoria / Torre</h2>
          <p className="text-xs text-muted-foreground">Limpeza, conservação e aterramento</p>
        </div>
      </div>

      {/* KPI Cards */}
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
        </CardContent>
      </Card>
    </div>
  );
}
