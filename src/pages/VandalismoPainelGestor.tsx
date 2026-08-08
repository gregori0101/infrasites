import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  Download,
  FileDown,
  FileSpreadsheet,
  Filter,
  LayoutDashboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  User,
  Eye,
  FileText,
  Paperclip,
  Loader2,
  Trash2,
  MapPin,
} from 'lucide-react';
import { format, subDays, startOfMonth, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { toast } from 'sonner';
import { listVistoriasComItens, VandalismoVistoriaResumo, deleteVistoriaVandalismo } from '@/lib/vandalismoDatabase';
import {
  generateVandalismoExcel,
  downloadCasePDF,
  downloadBO,
  downloadCasesZip,
  downloadBlob,
} from '@/lib/vandalismoExport';

const COLORS = ['#8b5cf6', '#f97316', '#10b981', '#ef4444', '#3b82f6', '#f43f5e'];

export default function VandalismoPainelGestor() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<'7' | '30' | 'month' | 'year' | 'all'>('30');
  const [selectedCase, setSelectedCase] = useState<VandalismoVistoriaResumo | null>(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);

  const { data: allVistorias = [], isLoading, refetch } = useQuery({
    queryKey: ['vandalismo_gestor'],
    queryFn: listVistoriasComItens,
  });

  const filteredData = useMemo(() => {
    let data = [...allVistorias];

    // Search
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      data = data.filter(v =>
        v.site_code.toLowerCase().includes(low) ||
        v.tecnico?.toLowerCase().includes(low) ||
        v.descricao.toLowerCase().includes(low)
      );
    }

    // Date
    const now = new Date();
    if (dateFilter === '7') {
      const limit = subDays(now, 7);
      data = data.filter(v => isAfter(parseISO(v.created_at), limit));
    } else if (dateFilter === '30') {
      const limit = subDays(now, 30);
      data = data.filter(v => isAfter(parseISO(v.created_at), limit));
    } else if (dateFilter === 'month') {
      const limit = startOfMonth(now);
      data = data.filter(v => isAfter(parseISO(v.created_at), limit));
    } else if (dateFilter === 'year') {
      const limit = new Date(now.getFullYear(), 0, 1);
      data = data.filter(v => isAfter(parseISO(v.created_at), limit));
    }

    return data;
  }, [allVistorias, searchTerm, dateFilter]);

  // --- Metrics ---
  const totalOccurrences = filteredData.length;

  const currentMonthCount = allVistorias.filter(v =>
    isAfter(parseISO(v.created_at), startOfMonth(new Date()))
  ).length;

  const prevMonthStart = startOfMonth(subDays(startOfMonth(new Date()), 1));
  const prevMonthEnd = startOfMonth(new Date());
  const prevMonthCount = allVistorias.filter(v => {
    const d = parseISO(v.created_at);
    return isAfter(d, prevMonthStart) && isBefore(d, prevMonthEnd);
  }).length;

  const monthVariation = prevMonthCount > 0
    ? ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100
    : currentMonthCount > 0 ? 100 : 0;

  const avgVulnerability = filteredData.length > 0
    ? filteredData.reduce((acc, v) => acc + v.indiceVulnerabilidade, 0) / filteredData.length
    : 0;

  // --- Charts Data ---
  const vulnStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(v => {
      v.itens.forEach(i => {
        if (i.vulneravel) {
          counts[i.rotulo] = (counts[i.rotulo] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredData]);

  const historyData = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(v => {
      const day = format(parseISO(v.created_at), 'dd/MM');
      groups[day] = (groups[day] || 0) + 1;
    });
    return Object.entries(groups)
      .map(([name, value]) => ({ name, value }))
      .slice(-15);
  }, [filteredData]);

  const siteRanking = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(v => {
      counts[v.site_code] = (counts[v.site_code] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredData]);

  // --- Actions ---
  const handleExportExcel = () => {
    if (filteredData.length === 0) return;
    setExportingAll(true);
    try {
      const blob = generateVandalismoExcel(filteredData);
      downloadBlob(blob, `Vandalismo_Consolidado_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Exportação Excel concluída');
    } catch (err) {
      toast.error('Falha ao exportar Excel');
    } finally {
      setExportingAll(false);
    }
  };

  const handleExportZip = async () => {
    if (filteredData.length === 0) return;
    setExportingZip(true);
    try {
      await downloadCasesZip(filteredData);
      toast.success('Download do ZIP iniciado');
    } catch (err) {
      toast.error('Falha ao gerar ZIP');
    } finally {
      setExportingZip(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta vistoria? Esta ação é irreversível.')) return;
    try {
      await deleteVistoriaVandalismo(id);
      toast.success('Vistoria excluída');
      refetch();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-muted" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Painel de Gestão
                </h1>
              </div>
              <p className="text-sm text-muted-foreground font-medium">Controle de Vandalismo & Vulnerabilidades</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none border-border shadow-sm hover:bg-muted/50" 
              onClick={handleExportExcel} 
              disabled={exportingAll}
            >
              {exportingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500" />}
              Excel
            </Button>
            <Button 
              className="flex-1 sm:flex-none shadow-sm" 
              onClick={handleExportZip} 
              disabled={exportingZip}
            >
              {exportingZip ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
              Relatórios ZIP
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* FILTERS SECTION */}
        <section className="bg-card p-4 rounded-xl shadow-sm border border-border flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por site, técnico ou descrição..."
              className="pl-9 bg-muted/30 border-transparent focus:bg-background transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:inline">Período:</span>
            <div className="flex bg-muted p-1 rounded-lg border border-border">
              {(['7', '30', 'month', 'all'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDateFilter(opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateFilter === opt 
                    ? 'bg-card text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt === '7' ? '7D' : opt === '30' ? '30D' : opt === 'month' ? 'Mês' : 'Tudo'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-md bg-card overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Total de Registros</CardDescription>
              <CardTitle className="text-4xl font-black text-foreground">{totalOccurrences}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Ocorrências totais</span>
                <ShieldAlert className="h-5 w-5 text-primary/20 group-hover:text-primary/40 transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Frequência Mensal</CardDescription>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-4xl font-black text-foreground">{currentMonthCount}</CardTitle>
                <div className={`text-xs font-bold flex items-center ${monthVariation >= 0 ? 'text-destructive' : 'text-emerald-600 dark:text-emerald-500'}`}>
                  {monthVariation >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingUp className="h-3 w-3 mr-0.5 rotate-180" />}
                  {monthVariation > 0 ? '+' : ''}{monthVariation.toFixed(0)}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-medium text-muted-foreground">Registros no mês atual</span>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Vulnerabilidade Média</CardDescription>
              <CardTitle className="text-4xl font-black text-foreground">{avgVulnerability.toFixed(0)}<span className="text-2xl opacity-40">%</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-muted h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${avgVulnerability > 50 ? 'bg-destructive' : 'bg-orange-500'}`} 
                  style={{ width: `${avgVulnerability}%` }} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium">Grau de risco médio das estações</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Abrangência Local</CardDescription>
              <CardTitle className="text-4xl font-black text-foreground">{new Set(filteredData.map(v => v.site_code)).size}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Localidades afetadas</span>
                <MapPin className="h-5 w-5 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-md bg-card">
            <CardHeader className="pb-2 border-b border-border mb-4">
              <CardTitle className="text-base font-bold text-foreground">Histórico Temporal</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card">
            <CardHeader className="pb-2 border-b border-border mb-4">
              <CardTitle className="text-base font-bold text-foreground">Vulnerabilidades Críticas</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">Itens com maior incidência</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vulnStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {vulnStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      borderColor: 'hsl(var(--border))',
                      color: 'hsl(var(--foreground))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {vulnStats.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="truncate w-32 text-muted-foreground font-medium">{s.name}</span>
                    </span>
                    <span className="font-bold text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DATA TABLE SECTION */}
        <Card className="border-none shadow-md bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Histórico de Vistorias</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">Gestão detalhada de casos registrados</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Carregando dados...</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="py-20 text-center border-2 border-dashed rounded-lg">
                <ShieldCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground font-medium">Nenhum registro encontrado</p>
                <p className="text-xs text-muted-foreground">Tente alterar os filtros de busca ou período.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Índice Vuln.</TableHead>
                    <TableHead>BO</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((v) => (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50 transition-colors group/row" onClick={() => setSelectedCase(v)}>
                      <TableCell className="text-xs font-medium text-foreground">
                        {format(parseISO(v.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-background text-foreground border-border">{v.site_code}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate text-muted-foreground">
                        {v.tecnico?.split('@')[0] || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${v.indiceVulnerabilidade > 50 ? 'bg-destructive' : v.indiceVulnerabilidade > 20 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                              style={{ width: `${v.indiceVulnerabilidade}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-foreground">{v.indiceVulnerabilidade.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {v.bo_url ? (
                          <Badge className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 border-none text-[10px]">
                            Anexado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] text-muted-foreground bg-muted/50 border-none">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => downloadCasePDF(v.id, v.site_code)}>
                            <FileDown className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Search className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedCase(v)}>
                                <Eye className="h-4 w-4 mr-2" /> Visualizar
                              </DropdownMenuItem>
                              {v.bo_url && (
                                <DropdownMenuItem onClick={() => downloadBO(v.bo_url!, v.bo_nome)}>
                                  <Paperclip className="h-4 w-4 mr-2" /> Baixar BO
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(v.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>

      {/* DETAIL MODAL */}
      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  Vistoria Site: <span className="font-mono text-primary">{selectedCase?.site_code}</span>
                </DialogTitle>
                <DialogDescription>
                  Realizada em {selectedCase ? format(parseISO(selectedCase.created_at), "PPP 'às' HH:mm", { locale: ptBR }) : ''}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => selectedCase && downloadCasePDF(selectedCase.id, selectedCase.site_code)}>
                  <FileText className="h-4 w-4 mr-2" /> PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Técnico</p>
                  <p className="text-sm font-medium">{selectedCase?.tecnico || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Operadora</p>
                  <p className="text-sm font-medium">{selectedCase?.operadora || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Localização</p>
                  <p className="text-sm font-medium">
                    {selectedCase?.latitude ? `${selectedCase.latitude.toFixed(5)}, ${selectedCase.longitude?.toFixed(5)}` : 'Não capturada'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-bold border-l-4 border-primary pl-2 text-foreground">Descrição da Ocorrência</h4>
                <div className="bg-muted/30 p-3 rounded-md border border-border text-sm text-foreground whitespace-pre-wrap">
                  {selectedCase?.descricao}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold border-l-4 border-destructive pl-2 text-foreground">Vulnerabilidades Identificadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCase?.itens.map((i, idx) => (
                    <div key={idx} className={`flex items-start justify-between p-2 rounded border text-xs ${i.vulneravel ? 'bg-destructive/5 dark:bg-destructive/10 border-destructive/20' : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'}`}>
                      <div className="flex-1">
                        <span className="font-medium text-foreground">{i.rotulo}</span>
                        {i.observacao && <p className="text-[10px] text-muted-foreground mt-1 italic">Obs: {i.observacao}</p>}
                      </div>
                      {i.vulneravel ? (
                        <Badge variant="destructive" className="h-5 text-[9px] px-1 ml-2">Vulnerável</Badge>
                      ) : (
                        <Badge className="h-5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none text-[9px] px-1 ml-2">OK</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedCase?.bo_url && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold border-l-4 border-primary pl-2">Boletim de Ocorrência</h4>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => downloadBO(selectedCase!.bo_url!, selectedCase!.bo_nome)}>
                    <Paperclip className="h-4 w-4 mr-2" /> {selectedCase.bo_nome || 'Baixar Boletim'}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
