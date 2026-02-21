import React from "react";
import { Cable, CheckCircle2, XCircle, Box, ArrowUpCircle, Layers, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export interface FibraStats {
  totalSites: number;
  sitesWithFibra: number;
  sitesProtegidos: number;
  sitesDesprotegidos: number;
  abordagensAereas: number;
  abordagensSubterraneas: number;
  totalCaixasPassagem: number;
  totalCaixasSubterraneas: number;
  totalSubidasLaterais: number;
  totalDGOs: number;
  dgosOk: number;
  dgosNok: number;
  abordagemChart: { name: string; value: number; color: string }[];
  dgosStatusChart: { name: string; value: number; color: string }[];
  protecaoChart: { name: string; value: number; color: string }[];
  infraestruturaChart: { name: string; value: number }[];
}

interface Props {
  stats: FibraStats;
  onDrillDown?: (type: "protegidos" | "desprotegidos" | "dgos-ok" | "dgos-nok" | "all") => void;
}

const TOOLTIP_STYLE = {
  borderRadius: '0.75rem',
  border: '1px solid hsl(var(--border))',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  fontSize: '0.8rem',
  backgroundColor: "hsl(var(--card))",
};

export function FibraOpticaPanel({ stats, onDrillDown }: Props) {
  const dgosPercent = stats.totalDGOs > 0 
    ? Math.round((stats.dgosOk / stats.totalDGOs) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-1.5 h-7 bg-blue-500 rounded-full" />
        <div>
          <h2 className="font-bold text-lg tracking-tight">Painel Fibra Óptica</h2>
          <p className="text-xs text-muted-foreground">Abordagens, DGOs e infraestrutura</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Sites"
          value={stats.totalSites}
          subtitle="Sites vistoriados"
          icon={Building2}
          iconBg="bg-primary/10 text-primary"
          onClick={() => onDrillDown?.("all")}
        />
        <StatCard
          title="Sites Protegidos"
          value={stats.sitesProtegidos}
          subtitle="2+ abordagens de fibra"
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={stats.sitesProtegidos > 0 ? { text: "Redundância", variant: "success" } : undefined}
          onClick={() => onDrillDown?.("protegidos")}
        />
        <StatCard
          title="Sites Desprotegidos"
          value={stats.sitesDesprotegidos}
          subtitle="Apenas 1 abordagem"
          icon={XCircle}
          iconBg="bg-amber-500/10 text-amber-500"
          badge={stats.sitesDesprotegidos > 0 ? { text: "Atenção", variant: "warning" } : undefined}
          onClick={() => onDrillDown?.("desprotegidos")}
        />
        <StatCard
          title="DGOs OK"
          value={stats.dgosOk}
          subtitle={`${dgosPercent}% do total`}
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${dgosPercent}%`, variant: "success" }}
          onClick={() => onDrillDown?.("dgos-ok")}
        />
        <StatCard
          title="DGOs NOK"
          value={stats.dgosNok}
          subtitle="Cordões desorganizados"
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.dgosNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
          onClick={() => onDrillDown?.("dgos-nok")}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4 px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Box className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCaixasPassagem}</p>
                <p className="text-xs text-muted-foreground">Caixas de Passagem</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4 px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                <Box className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCaixasSubterraneas}</p>
                <p className="text-xs text-muted-foreground">Caixas Subterrâneas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-4 px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSubidasLaterais}</p>
                <p className="text-xs text-muted-foreground">Subidas Laterais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Proteção de Fibra */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Cable className="w-3.5 h-3.5 text-blue-500" />
              </div>
              Proteção de Fibra (Abordagens)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.protecaoChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.protecaoChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {stats.protecaoChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status DGOs */}
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-2 px-6">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
              </div>
              Status dos DGOs
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6">
            {stats.dgosStatusChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.dgosStatusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                      strokeWidth={2}
                      stroke="hsl(var(--card))"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {stats.dgosStatusChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.75rem', fontWeight: 500 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-muted-foreground">
                Nenhum DGO registrado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 border-border/60 shadow-sm">
        <CardContent className="pt-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Cable className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-semibold">Resumo Fibra Óptica</p>
                <p className="text-sm text-muted-foreground">
                  {stats.sitesWithFibra} sites com fibra cadastrada
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10">
                {stats.sitesProtegidos} protegidos
              </Badge>
              <Badge variant="outline" className="bg-amber-500/10">
                {stats.sitesDesprotegidos} desprotegidos
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10">
                {stats.totalDGOs} DGOs
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
