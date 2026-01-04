import React from "react";
import { Trash2, Cable, Wifi, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, SiteInfo } from "../types";
import { Progress } from "@/components/ui/progress";

interface Props {
  stats: PanelStats;
  sites: SiteInfo[];
  onDrillDown: (type: "zeladoria" | "fibra" | "aterramento") => void;
}

export function ZeladoriaPanel({ stats, sites, onDrillDown }: Props) {
  const zeladoriaPercent = stats.zeladoriaTotal > 0 
    ? Math.round((stats.zeladoriaOk / stats.zeladoriaTotal) * 100) 
    : 0;
  
  const fibraPercent = stats.fibraTotal > 0 
    ? Math.round((stats.fibraProtegida / stats.fibraTotal) * 100) 
    : 0;
    
  const aterramentoPercent = stats.zeladoriaTotal > 0 
    ? Math.round((stats.aterramentoOk / stats.zeladoriaTotal) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-success rounded-full" />
        <h2 className="font-semibold text-lg">Painel Zeladoria / Fibra / Torre</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
          title="Fibra Protegida"
          value={stats.fibraProtegida}
          subtitle={`${fibraPercent}% dos sites`}
          icon={Cable}
          iconBg="bg-primary/10 text-primary"
          badge={{ text: `${fibraPercent}%`, variant: fibraPercent >= 80 ? "success" : "warning" }}
          onClick={() => onDrillDown("fibra")}
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
      </div>

      {/* Progress Bars */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Indicadores de Conformidade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                <Cable className="w-4 h-4" /> Fibra Protegida
              </span>
              <span className="font-medium">{fibraPercent}%</span>
            </div>
            <Progress value={fibraPercent} className="h-2" />
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
