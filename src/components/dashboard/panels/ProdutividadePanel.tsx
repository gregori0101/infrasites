import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatCard } from "../StatCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
  Tooltip,
  Legend,
  ReferenceLine,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  ClipboardCheck,
  Clock,
  TrendingUp,
  Users,
  Target,
  Award,
  MapPin,
} from "lucide-react";

export interface TechnicianRanking {
  id: string;
  name: string;
  email?: string;
  count: number;
  mainUf: string;
}

export interface UfAssignmentStats {
  uf: string;
  totalSites: number;
  concluidas: number;
  emAndamento: number;
  pendentes: number;
  semAtribuicao: number;
}

export interface ProdutividadeStats {
  totalRealizadas: number;
  totalPendentes: number;
  totalEmAndamento: number;
  taxaConclusao: number;
  mediaPorTecnico: number;
  technicianRanking: TechnicianRanking[];
  vistoriasPorMes: { month: string; count: number }[];
  vistoriasPorUf: { uf: string; count: number }[];
  assignmentsByUf: UfAssignmentStats[];
}

interface Props {
  stats: ProdutividadeStats;
  onDrillDown?: (type: string) => void;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#6b7280", "#ef4444"];

export function ProdutividadePanel({ stats, onDrillDown }: Props) {
  const [metaMensal, setMetaMensal] = useState<number>(100);
  const totalAtribuidas = stats.totalRealizadas + stats.totalPendentes + stats.totalEmAndamento;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Vistorias Realizadas"
          value={stats.totalRealizadas}
          subtitle="Concluídas no período"
          icon={ClipboardCheck}
          iconBg="bg-green-100"
          badge={{ text: "Concluídas", variant: "success" }}
          onClick={() => onDrillDown?.("realizadas")}
        />
        <StatCard
          title="Vistorias Pendentes"
          value={stats.totalPendentes}
          subtitle="Aguardando execução"
          icon={Clock}
          iconBg="bg-amber-100"
          badge={{ text: "Pendentes", variant: "warning" }}
          onClick={() => onDrillDown?.("pendentes")}
        />
        <StatCard
          title="Taxa de Conclusão"
          value={`${stats.taxaConclusao}%`}
          subtitle={`${stats.totalRealizadas} de ${totalAtribuidas} atribuídas`}
          icon={Target}
          iconBg="bg-blue-100"
          trend={stats.taxaConclusao >= 80 ? { value: stats.taxaConclusao, label: "bom" } : { value: -stats.taxaConclusao, label: "baixo" }}
        />
        <StatCard
          title="Média por Técnico"
          value={stats.mediaPorTecnico.toFixed(1)}
          subtitle={`${stats.technicianRanking.length} técnicos ativos`}
          icon={Users}
          iconBg="bg-purple-100"
        />
      </div>

      {/* Gráficos de Evolução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução Mensal */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                Evolução Mensal de Vistorias
              </CardTitle>
              <div className="flex items-center gap-2">
                <Label htmlFor="meta-input" className="text-xs text-muted-foreground whitespace-nowrap">
                  Meta mensal:
                </Label>
                <Input
                  id="meta-input"
                  type="number"
                  min={0}
                  value={metaMensal}
                  onChange={(e) => setMetaMensal(Number(e.target.value) || 0)}
                  className="w-20 h-7 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats.vistoriasPorMes.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.vistoriasPorMes}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    {metaMensal > 0 && (
                      <ReferenceLine
                        y={metaMensal}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                          value: `Meta: ${metaMensal}`,
                          position: "insideTopRight",
                          fill: "#ef4444",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      name="Vistorias"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vistorias por UF */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              Vistorias Realizadas por UF
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.vistoriasPorUf.length > 0 ? (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.vistoriasPorUf.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis
                      dataKey="uf"
                      type="category"
                      tick={{ fontSize: 12 }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" name="Vistorias" radius={[0, 4, 4, 0]}>
                      {stats.vistoriasPorUf.slice(0, 10).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Sem dados para exibir
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Técnicos e Status por UF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ranking de Técnicos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Top 10 Técnicos por Produtividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead className="text-center">UF Principal</TableHead>
                    <TableHead className="text-right">Vistorias</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.technicianRanking.slice(0, 10).map((tech, index) => (
                    <TableRow key={tech.id}>
                      <TableCell className="font-medium">
                        {index < 3 ? (
                          <Badge
                            variant={index === 0 ? "default" : "secondary"}
                            className={
                              index === 0
                                ? "bg-amber-500"
                                : index === 1
                                ? "bg-gray-400"
                                : "bg-amber-700"
                            }
                          >
                            {index + 1}º
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{index + 1}º</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium truncate max-w-[200px]" title={tech.email || tech.name}>
                        {tech.email || tech.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{tech.mainUf}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-bold text-primary">
                        {tech.count}
                      </TableCell>
                    </TableRow>
                  ))}
                  {stats.technicianRanking.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        Sem dados de técnicos
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Status por UF (Stacked Bar) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              Status das Atribuições por UF
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.assignmentsByUf.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.assignmentsByUf.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      dataKey="uf"
                      type="category"
                      tick={{ fontSize: 11 }}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="concluidas" name="Concluídas" stackId="a" fill="#22c55e" />
                    <Bar dataKey="emAndamento" name="Em Andamento" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="pendentes" name="Pendentes" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="semAtribuicao" name="Sem Atribuição" stackId="a" fill="#6b7280" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados de atribuições
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada por UF */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Detalhamento por UF</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>UF</TableHead>
                  <TableHead className="text-center">Total Sites</TableHead>
                  <TableHead className="text-center">Concluídas</TableHead>
                  <TableHead className="text-center">Pendentes</TableHead>
                  <TableHead className="text-center">Sem Atribuição</TableHead>
                  <TableHead className="text-right">% Concluído</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.assignmentsByUf.map((row) => {
                  const percentConcluido = row.totalSites > 0
                    ? Math.round((row.concluidas / row.totalSites) * 100)
                    : 0;
                  return (
                    <TableRow key={row.uf}>
                      <TableCell className="font-medium">{row.uf}</TableCell>
                      <TableCell className="text-center">{row.totalSites}</TableCell>
                      <TableCell className="text-center text-green-600 font-medium">
                        {row.concluidas}
                      </TableCell>
                      <TableCell className="text-center text-amber-600">
                        {row.pendentes}
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.semAtribuicao}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={percentConcluido >= 80 ? "default" : percentConcluido >= 50 ? "secondary" : "destructive"}
                          className={
                            percentConcluido >= 80
                              ? "bg-green-500"
                              : percentConcluido >= 50
                              ? "bg-amber-500"
                              : ""
                          }
                        >
                          {percentConcluido}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {stats.assignmentsByUf.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Sem dados disponíveis
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
