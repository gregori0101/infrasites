import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Download,
} from "lucide-react";
import * as XLSX from "xlsx";

export interface TechnicianRanking {
  id: string;
  name: string;
  email?: string;
  count: number;
  mainUf: string;
}

export interface TechnicianProductivity {
  id: string;
  name: string;
  email?: string;
  mainUf: string;
  today: number;
  thisMonth: number;
  total: number;
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
  vistoriasPorDia: { day: string; count: number }[];
  vistoriasPorDiaTecnico: { day: string; technician: string; technicianId: string; count: number }[];
  vistoriasPorDiaUf: { day: string; uf: string; count: number }[];
  vistoriasPorUf: { uf: string; count: number }[];
  assignmentsByUf: UfAssignmentStats[];
}

interface Props {
  stats: ProdutividadeStats;
  onDrillDown?: (type: string) => void;
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#6b7280", "#ef4444"];

export function ProdutividadePanel({ stats, onDrillDown }: Props) {
  const [metaDiaria, setMetaDiaria] = useState<number>(10);
  const [searchTechnician, setSearchTechnician] = useState("");
  const totalAtribuidas = stats.totalRealizadas + stats.totalPendentes + stats.totalEmAndamento;

  // Calculate today's date in DD/MM format
  const todayFormatted = useMemo(() => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  // Calculate current month in MM/YYYY format
  const currentMonthFormatted = useMemo(() => {
    const today = new Date();
    return `${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  }, []);

  // Calculate technician productivity (daily, monthly, total)
  const technicianProductivity: TechnicianProductivity[] = useMemo(() => {
    const productivityMap = new Map<string, TechnicianProductivity>();
    
    // Initialize from ranking (has total counts)
    stats.technicianRanking.forEach(tech => {
      productivityMap.set(tech.id, {
        id: tech.id,
        name: tech.name,
        email: tech.email,
        mainUf: tech.mainUf,
        today: 0,
        thisMonth: 0,
        total: tech.count,
      });
    });
    
    // Calculate today's count from daily data
    stats.vistoriasPorDiaTecnico.forEach(item => {
      const existing = productivityMap.get(item.technicianId);
      if (existing) {
        if (item.day === todayFormatted) {
          existing.today += item.count;
        }
        // Calculate this month - check if day is in current month
        const [day, month] = item.day.split('/').map(Number);
        const currentMonth = new Date().getMonth() + 1;
        if (month === currentMonth) {
          existing.thisMonth += item.count;
        }
      }
    });
    
    return Array.from(productivityMap.values())
      .sort((a, b) => b.total - a.total);
  }, [stats.technicianRanking, stats.vistoriasPorDiaTecnico, todayFormatted]);

  // Filtered technicians based on search
  const filteredTechnicians = useMemo(() => {
    if (!searchTechnician.trim()) return technicianProductivity;
    const search = searchTechnician.toLowerCase();
    return technicianProductivity.filter(tech => 
      tech.name.toLowerCase().includes(search) ||
      (tech.email && tech.email.toLowerCase().includes(search)) ||
      tech.mainUf.toLowerCase().includes(search)
    );
  }, [technicianProductivity, searchTechnician]);

  // Export technicians to Excel
  const handleExportTechnicians = () => {
    const exportData = technicianProductivity.map((tech, index) => ({
      'Posição': index + 1,
      'Técnico': tech.email || tech.name,
      'UF Principal': tech.mainUf,
      'Hoje': tech.today,
      'Este Mês': tech.thisMonth,
      'Total': tech.total,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produtividade Técnicos");
    
    // Auto-size columns
    const colWidths = [
      { wch: 8 },  // Posição
      { wch: 35 }, // Técnico
      { wch: 12 }, // UF Principal
      { wch: 8 },  // Hoje
      { wch: 10 }, // Este Mês
      { wch: 8 },  // Total
    ];
    ws['!cols'] = colWidths;
    
    const fileName = `produtividade_tecnicos_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Aggregate daily data by technician for table
  const dailyTechnicianSummary = useMemo(() => {
    const summary: Record<string, { name: string; days: Record<string, number>; total: number }> = {};
    stats.vistoriasPorDiaTecnico.forEach(item => {
      if (!summary[item.technicianId]) {
        summary[item.technicianId] = { name: item.technician, days: {}, total: 0 };
      }
      summary[item.technicianId].days[item.day] = item.count;
      summary[item.technicianId].total += item.count;
    });
    return Object.entries(summary)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [stats.vistoriasPorDiaTecnico]);

  // Aggregate daily data by UF for table
  const dailyUfSummary = useMemo(() => {
    const summary: Record<string, { days: Record<string, number>; total: number }> = {};
    stats.vistoriasPorDiaUf.forEach(item => {
      if (!summary[item.uf]) {
        summary[item.uf] = { days: {}, total: 0 };
      }
      summary[item.uf].days[item.day] = item.count;
      summary[item.uf].total += item.count;
    });
    return Object.entries(summary)
      .map(([uf, data]) => ({ uf, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [stats.vistoriasPorDiaUf]);

  // Get unique days for table headers - sorted ascending (left to right = oldest to newest)
  const uniqueDays = useMemo(() => {
    const days = new Set<string>();
    stats.vistoriasPorDia.forEach(d => days.add(d.day));
    
    // Sort by date ascending
    const sortDayKey = (a: string, b: string) => {
      const [dayA, monthA] = a.split('/').map(Number);
      const [dayB, monthB] = b.split('/').map(Number);
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    };
    
    return Array.from(days).sort(sortDayKey).slice(-7); // Last 7 days, sorted ascending
  }, [stats.vistoriasPorDia]);

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
      {/* Evolução Diária - Full Width */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Evolução Diária de Vistorias
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="meta-input" className="text-xs text-muted-foreground whitespace-nowrap">
                Meta diária:
              </Label>
              <Input
                id="meta-input"
                type="number"
                min={0}
                value={metaDiaria}
                onChange={(e) => setMetaDiaria(Number(e.target.value) || 0)}
                className="w-20 h-7 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {stats.vistoriasPorDia.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.vistoriasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11 }}
                    className="text-muted-foreground"
                  />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || !payload.length) return null;
                      
                      const currentValue = payload[0].value as number;
                      const currentIndex = stats.vistoriasPorDia.findIndex(d => d.day === label);
                      const previousValue = currentIndex > 0 
                        ? stats.vistoriasPorDia[currentIndex - 1].count 
                        : null;
                      
                      const difference = previousValue !== null ? currentValue - previousValue : null;
                      const percentChange = previousValue !== null && previousValue > 0 
                        ? ((currentValue - previousValue) / previousValue) * 100 
                        : null;
                      
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-semibold text-foreground mb-2">{label}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="text-muted-foreground">Vistorias: </span>
                              <span className="font-bold text-primary">{currentValue}</span>
                            </p>
                            {previousValue !== null && (
                              <>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">Dia anterior: </span>
                                  <span className="font-medium">{previousValue}</span>
                                </p>
                                <p className="text-sm flex items-center gap-1">
                                  <span className="text-muted-foreground">Variação: </span>
                                  <span className={`font-bold ${difference! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {difference! >= 0 ? '+' : ''}{difference}
                                    {percentChange !== null && (
                                      <span className="ml-1">
                                        ({percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%)
                                      </span>
                                    )}
                                  </span>
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {metaDiaria > 0 && (
                    <ReferenceLine
                      y={metaDiaria}
                      stroke="hsl(var(--destructive))"
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{
                        value: `Meta: ${metaDiaria}`,
                        position: "insideTopRight",
                        fill: "hsl(var(--destructive))",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    name="Vistorias"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Sem dados para exibir
            </div>
          )}
        </CardContent>
      </Card>

      {/* Produtividade Completa dos Técnicos - Full Width */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Produtividade dos Técnicos
              <Badge variant="secondary" className="ml-2">
                {technicianProductivity.length} técnicos
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Buscar técnico..."
                value={searchTechnician}
                onChange={(e) => setSearchTechnician(e.target.value)}
                className="w-48 h-8 text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportTechnicians}
                className="flex items-center gap-1"
              >
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="min-w-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead className="text-center w-16">UF</TableHead>
                    <TableHead className="text-right w-20">
                      <div className="flex flex-col items-end">
                        <span>Hoje</span>
                        <span className="text-xs text-muted-foreground font-normal">{todayFormatted}</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-24">
                      <div className="flex flex-col items-end">
                        <span>Mensal</span>
                        <span className="text-xs text-muted-foreground font-normal">{currentMonthFormatted}</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right w-20">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTechnicians.map((tech, index) => {
                    const originalIndex = technicianProductivity.findIndex(t => t.id === tech.id);
                    return (
                      <TableRow key={tech.id}>
                        <TableCell className="font-medium">
                          {originalIndex < 3 ? (
                            <Badge
                              variant={originalIndex === 0 ? "default" : "secondary"}
                              className={
                                originalIndex === 0
                                  ? "bg-amber-500"
                                  : originalIndex === 1
                                  ? "bg-gray-400"
                                  : "bg-amber-700"
                              }
                            >
                              {originalIndex + 1}º
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">{originalIndex + 1}º</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium truncate max-w-[200px]" title={tech.email || tech.name}>
                          {tech.email ? (
                            <span>{tech.email}</span>
                          ) : (
                            <span className="text-muted-foreground italic">
                              {tech.name} <span className="text-xs">(sem email)</span>
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{tech.mainUf}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {tech.today > 0 ? (
                            <Badge className="bg-green-500 text-white">{tech.today}</Badge>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {tech.thisMonth}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary text-lg">
                          {tech.total}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredTechnicians.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        {searchTechnician ? "Nenhum técnico encontrado" : "Sem dados de técnicos"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Status por UF */}
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

      {/* Produtividade Diária por Técnico e UF */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtividade Diária por Técnico */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              Produtividade Diária por Técnico (Últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background min-w-[150px]">Técnico</TableHead>
                    {uniqueDays.map(day => (
                      <TableHead key={day} className="text-center w-16">{day}</TableHead>
                    ))}
                    <TableHead className="text-right w-20">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyTechnicianSummary.map((tech) => (
                    <TableRow key={tech.id}>
                      <TableCell className="font-medium truncate max-w-[150px] sticky left-0 bg-background" title={tech.name}>
                        {tech.name}
                      </TableCell>
                      {uniqueDays.map(day => (
                        <TableCell key={day} className="text-center">
                          {tech.days[day] ? (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {tech.days[day]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-bold text-primary">
                        {tech.total}
                      </TableCell>
                    </TableRow>
                  ))}
                  {dailyTechnicianSummary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={uniqueDays.length + 2} className="text-center text-muted-foreground">
                        Sem dados disponíveis
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Produtividade Diária por UF */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Produtividade Diária por UF (Últimos 7 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background w-16">UF</TableHead>
                    {uniqueDays.map(day => (
                      <TableHead key={day} className="text-center w-16">{day}</TableHead>
                    ))}
                    <TableHead className="text-right w-20">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dailyUfSummary.map((row) => (
                    <TableRow key={row.uf}>
                      <TableCell className="font-medium sticky left-0 bg-background">
                        <Badge variant="outline">{row.uf}</Badge>
                      </TableCell>
                      {uniqueDays.map(day => (
                        <TableCell key={day} className="text-center">
                          {row.days[day] ? (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              {row.days[day]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-bold text-primary">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                  {dailyUfSummary.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={uniqueDays.length + 2} className="text-center text-muted-foreground">
                        Sem dados disponíveis
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
              <ScrollBar orientation="vertical" />
            </ScrollArea>
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
