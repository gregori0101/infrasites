import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { PanelStats, SiteInfo } from "../types";
import { LayoutDashboard, CheckCircle2, XCircle, Battery, Thermometer, Zap, ClipboardCheck, TrendingUp, Clock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Props {
  stats: PanelStats;
  sites: SiteInfo[];
  onDrillDown: (type: "total" | "ok" | "nok") => void;
}

export function OverviewPanel({ stats, sites, onDrillDown }: Props) {
  const { overview } = stats;
  
  const statusChart = [
    { name: "Sites OK", value: overview.sitesOk, color: "#22c55e" },
    { name: "Sites NOK", value: overview.sitesNok, color: "#ef4444" },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-[#003366] rounded-full" />
        <h2 className="font-semibold text-lg">Visão Geral - Painel Principal</h2>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Sites"
          value={overview.totalSites}
          subtitle="Sites vistoriados"
          icon={LayoutDashboard}
          iconBg="bg-[#003366]/10 text-[#003366]"
          onClick={() => onDrillDown("total")}
        />
        <StatCard
          title="Sites OK"
          value={overview.sitesOk}
          subtitle="Sem problemas"
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${overview.percentOk}%`, variant: "success" }}
          onClick={() => onDrillDown("ok")}
        />
        <StatCard
          title="Sites NOK"
          value={overview.sitesNok}
          subtitle="Com problemas"
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={overview.sitesNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown("nok")}
        />
        <StatCard
          title="Taxa de Sucesso"
          value={`${overview.percentOk}%`}
          subtitle="Conformidade geral"
          icon={TrendingUp}
          iconBg={overview.percentOk >= 80 ? "bg-success/10 text-success" : overview.percentOk >= 60 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Baterias"
          value={overview.totalBatteries}
          subtitle={`${overview.batteriesCritical} críticas`}
          icon={Battery}
          iconBg={overview.batteriesCritical > 0 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}
        />
        <StatCard
          title="ACs Total"
          value={overview.totalACs}
          subtitle={`${overview.acsNok} com defeito`}
          icon={Thermometer}
          iconBg={overview.acsNok > 0 ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}
        />
        <StatCard
          title="Com GMG"
          value={overview.sitesWithGMG}
          subtitle="Backup de energia"
          icon={Zap}
          iconBg="bg-success/10 text-success"
        />
        <StatCard
          title="Zeladoria OK"
          value={overview.zeladoriaOkCount}
          subtitle={`de ${overview.totalSites} sites`}
          icon={ClipboardCheck}
          iconBg="bg-primary/10 text-primary"
        />
        <StatCard
          title="Última Atualização"
          value={overview.lastUpdate}
          subtitle="Data do relatório"
          icon={Clock}
          iconBg="bg-muted text-muted-foreground"
        />
      </div>

      {/* Status Chart */}
      {statusChart.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#003366]" />
              Distribuição de Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {statusChart.map((entry, index) => (
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
    </div>
  );
}
