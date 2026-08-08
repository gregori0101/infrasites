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

const COLORS = ['#660099', '#ff6b35', '#22c55e', '#ef4444', '#3b82f6', '#eab308'];

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
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-slate-100" 
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Painel de Gestão
                </h1>
              </div>
              <p className="text-sm text-slate-500 font-medium">Controle de Vandalismo & Vulnerabilidades</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none border-slate-200 shadow-sm hover:bg-slate-50" 
              onClick={handleExportExcel} 
              disabled={exportingAll}
            >
              {exportingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600" />}
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
        <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar por site, técnico ou descrição..."
              className="pl-9 bg-slate-50 border-transparent focus:bg-white transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Período:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              {(['7', '30', 'month', 'all'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDateFilter(opt)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    dateFilter === opt 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
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
          <Card className="border-none shadow-md bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Registros</CardDescription>
              <CardTitle className="text-4xl font-black text-slate-900">{totalOccurrences}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Ocorrências totais</span>
                <ShieldAlert className="h-5 w-5 text-primary/20 group-hover:text-primary/40 transition-colors" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Frequência Mensal</CardDescription>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-4xl font-black text-slate-900">{currentMonthCount}</CardTitle>
                <div className={`text-xs font-bold flex items-center ${monthVariation >= 0 ? 'text-destructive' : 'text-emerald-600'}`}>
                  {monthVariation >= 0 ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingUp className="h-3 w-3 mr-0.5 rotate-180" />}
                  {monthVariation > 0 ? '+' : ''}{monthVariation.toFixed(0)}%
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <span className="text-xs font-medium text-slate-500">Registros no mês atual</span>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Vulnerabilidade Média</CardDescription>
              <CardTitle className="text-4xl font-black text-slate-900">{avgVulnerability.toFixed(0)}<span className="text-2xl opacity-40">%</span></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${avgVulnerability > 50 ? 'bg-destructive' : 'bg-orange-500'}`} 
                  style={{ width: `${avgVulnerability}%` }} 
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium">Grau de risco médio das estações</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-white overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-slate-400">Abrangência Local</CardDescription>
              <CardTitle className="text-4xl font-black text-slate-900">{new Set(filteredData.map(v => v.site_code)).size}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Localidades afetadas</span>
                <MapPin className="h-5 w-5 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Histórico de Registros (Diário)</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#660099" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Vulnerabilidades Críticas</CardTitle>
              <CardDescription>Itens mais apontados como vulneráveis</CardDescription>
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
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {vulnStats.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="truncate w-32">{s.name}</span>
                    </span>
                    <span className="font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* DATA TABLE SECTION */}
        <Card className="border-none shadow-md bg-white overflow-hidden">
          <CardHeader className="pb-4 border-b border-slate-50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">Histórico de Vistorias</CardTitle>
                <CardDescription className="text-sm font-medium">Gestão detalhada de casos registrados</CardDescription>
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
                    <TableRow key={v.id} className="cursor-pointer hover:bg-slate-100/50" onClick={() => setSelectedCase(v)}>
                      <TableCell className="text-xs font-medium">
                        {format(parseISO(v.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-white">{v.site_code}</Badge>
                      </TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        {v.tecnico?.split('@')[0] || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${v.indiceVulnerabilidade > 50 ? 'bg-destructive' : v.indiceVulnerabilidade > 20 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                              style={{ width: `${v.indiceVulnerabilidade}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold">{v.indiceVulnerabilidade.toFixed(0)}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {v.bo_url ? (
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none text-[10px]">
                            Anexado
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] text-muted-foreground">Pendente</Badge>
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
                <h4 className="text-sm font-bold border-l-4 border-primary pl-2">Descrição da Ocorrência</h4>
                <div className="bg-slate-50 p-3 rounded-md border text-sm whitespace-pre-wrap">
                  {selectedCase?.descricao}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold border-l-4 border-destructive pl-2">Vulnerabilidades Identificadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedCase?.itens.map((i, idx) => (
                    <div key={idx} className={`flex items-start justify-between p-2 rounded border text-xs ${i.vulneravel ? 'bg-destructive/5 border-destructive/20' : 'bg-emerald-50/30 border-emerald-100'}`}>
                      <div className="flex-1">
                        <span className="font-medium">{i.rotulo}</span>
                        {i.observacao && <p className="text-[10px] text-muted-foreground mt-1 italic">Obs: {i.observacao}</p>}
                      </div>
                      {i.vulneravel ? (
                        <Badge variant="destructive" className="h-5 text-[9px] px-1 ml-2">Vulnerável</Badge>
                      ) : (
                        <Badge className="h-5 bg-emerald-100 text-emerald-700 border-none text-[9px] px-1 ml-2">OK</Badge>
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
