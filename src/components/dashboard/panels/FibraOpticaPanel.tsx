import React from "react";
import { Cable, CheckCircle2, XCircle, Box, ArrowUpCircle, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "../StatCard";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export interface FibraStats {
  totalSites: number;
  sitesWithFibra: number;
  totalAbordagens: number;
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
  infraestruturaChart: { name: string; value: number }[];
}

interface Props {
  stats: FibraStats;
  onDrillDown?: (type: string) => void;
}

export function FibraOpticaPanel({ stats, onDrillDown }: Props) {
  const dgosPercent = stats.totalDGOs > 0 
    ? Math.round((stats.dgosOk / stats.totalDGOs) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1 h-6 bg-blue-500 rounded-full" />
        <h2 className="font-semibold text-lg">Painel Fibra Óptica</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total de Abordagens"
          value={stats.totalAbordagens}
          subtitle={`${stats.abordagensAereas} aéreas, ${stats.abordagensSubterraneas} subterrâneas`}
          icon={Cable}
          iconBg="bg-blue-500/10 text-blue-500"
        />
        <StatCard
          title="Total DGOs"
          value={stats.totalDGOs}
          subtitle={`Em ${stats.sitesWithFibra} sites`}
          icon={Layers}
          iconBg="bg-purple-500/10 text-purple-500"
        />
        <StatCard
          title="DGOs OK"
          value={stats.dgosOk}
          subtitle={`${dgosPercent}% do total`}
          icon={CheckCircle2}
          iconBg="bg-success/10 text-success"
          badge={{ text: `${dgosPercent}%`, variant: "success" }}
        />
        <StatCard
          title="DGOs NOK"
          value={stats.dgosNok}
          subtitle="Cordões desorganizados"
          icon={XCircle}
          iconBg="bg-destructive/10 text-destructive"
          badge={stats.dgosNok > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
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
        <Card>
          <CardContent className="pt-4">
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
        <Card>
          <CardContent className="pt-4">
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
        {/* Tipo de Abordagem */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cable className="w-4 h-4 text-blue-500" />
              Tipos de Abordagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.abordagemChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.abordagemChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.abordagemChart.map((entry, index) => (
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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-500" />
              Status dos DGOs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.dgosStatusChart.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.dgosStatusChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {stats.dgosStatusChart.map((entry, index) => (
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

      {/* Infrastructure Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Box className="w-4 h-4 text-amber-500" />
            Infraestrutura de Fibra por Tipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.infraestruturaChart.length > 0 && stats.infraestruturaChart.some(d => d.value > 0) ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.infraestruturaChart} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                    name="Quantidade"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Nenhuma infraestrutura registrada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-500/5 to-purple-500/5">
        <CardContent className="pt-4">
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
              <Badge variant="outline" className="bg-blue-500/10">
                {stats.totalAbordagens} abordagens
              </Badge>
              <Badge variant="outline" className="bg-purple-500/10">
                {stats.totalDGOs} DGOs
              </Badge>
              {stats.dgosNok > 0 && (
                <Badge variant="destructive">
                  {stats.dgosNok} NOK
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
