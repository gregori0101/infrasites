import { useState, useMemo, useEffect } from 'react';
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
  Image as ImageIcon,
  Edit,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { format, subDays, startOfMonth, isAfter, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SignedImage } from '@/components/ui/signed-image';
import { 
  VandalismoVistoriaResumo, 
  getVistoriaVandalismo, 
  deleteVistoriaVandalismo, 
  listVistoriasComItens,
  updateVistoriaVandalismo,
  updateVistoriaItem
} from '@/lib/vandalismoDatabase';
import { VandalismoVistoriaCompleta } from '@/types/vandalismo';
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
import { Lightbox } from "@/components/ui/lightbox";
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
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [boFilter, setBoFilter] = useState<'all' | 'with' | 'without'>('all');
  const [dateFilter, setDateFilter] = useState<'7' | '30' | 'month' | 'year' | 'all'>('all');
  const [selectedCase, setSelectedCase] = useState<VandalismoVistoriaCompleta | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingZip, setExportingZip] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; label: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: allVistorias = [], isLoading, refetch } = useQuery({
    queryKey: ['vandalismo_gestor'],
    queryFn: listVistoriasComItens,
  });

  const filteredData = useMemo(() => {
    let data = [...allVistorias];

    // Search (Site Code Only)
    if (searchTerm) {
      const low = searchTerm.toLowerCase();
      data = data.filter(v =>
        v.site_code.toLowerCase().includes(low)
      );
    }

    // Filter by Estado
    if (estadoFilter !== 'all') {
      data = data.filter(v => v.estado === estadoFilter);
    }

    // Filter by BO
    if (boFilter === 'with') {
      data = data.filter(v => !!v.bo_url);
    } else if (boFilter === 'without') {
      data = data.filter(v => !v.bo_url);
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
  }, [allVistorias, searchTerm, estadoFilter, boFilter, dateFilter]);

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

  const boMetrics = useMemo(() => {
    const withBO = filteredData.filter(v => !!v.bo_url).length;
    const withoutBO = filteredData.length - withBO;
    return { withBO, withoutBO };
  }, [filteredData]);

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

  const siteStats = useMemo(() => {
    const stats: Record<string, { count: number; totalVuln: number; estado: string }> = {};
    allVistorias.forEach(v => {
      if (!stats[v.site_code]) {
        stats[v.site_code] = { count: 0, totalVuln: 0, estado: v.estado || '-' };
      }
      stats[v.site_code].count += 1;
      stats[v.site_code].totalVuln += v.indiceVulnerabilidade;
    });

    return Object.entries(stats)
      .map(([site, s]) => ({
        site,
        estado: s.estado,
        count: s.count,
        avgVuln: s.totalVuln / s.count
      }))
      .sort((a, b) => b.count - a.count);
  }, [allVistorias]);

  const estadoStats = useMemo(() => {
    const stats: Record<string, { count: number; totalVuln: number }> = {};
    allVistorias.forEach(v => {
      const uf = v.estado || 'NI';
      if (!stats[uf]) stats[uf] = { count: 0, totalVuln: 0 };
      stats[uf].count += 1;
      stats[uf].totalVuln += v.indiceVulnerabilidade;
    });

    return Object.entries(stats).map(([uf, s]) => ({
      uf,
      count: s.count,
      avgVuln: s.totalVuln / s.count
    })).sort((a, b) => b.count - a.count);
  }, [allVistorias]);

  const siteRanking = useMemo(() => {
    return siteStats.slice(0, 5).map(s => ({ name: s.site, value: s.count }));
  }, [siteStats]);

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

  const handleSaveEdit = async () => {
    if (!selectedCase) return;
    setIsSaving(true);
    try {
      await updateVistoriaVandalismo(selectedCase.id, {
        siteCode: editForm.site_code,
        descricao: editForm.descricao,
        operadora: editForm.operadora,
        tecnico: editForm.tecnico,
        estado: editForm.estado,
      });

      // Update items if modified
      for (const item of editForm.itens || []) {
        const original = selectedCase.itens.find(i => i.id === item.id);
        if (original && (original.vulneravel !== item.vulneravel || original.observacao !== item.observacao)) {
          await updateVistoriaItem(item.id, item.vulneravel, item.observacao);
        }
      }

      toast.success('Informações atualizadas com sucesso');
      setIsEditing(false);
      refetch();
      // Refresh current selected case view
      const updated = await getVistoriaVandalismo(selectedCase.id);
      setSelectedCase(updated);
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = () => {
    if (!selectedCase) return;
    setEditForm({
      site_code: selectedCase.site_code,
      descricao: selectedCase.descricao,
      operadora: selectedCase.operadora,
      tecnico: selectedCase.tecnico,
      estado: selectedCase.estado,
      itens: selectedCase.itens.map(i => ({ ...i }))
    });
    setIsEditing(true);
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

  const openLightbox = (images: { url: string; label: string }[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
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
              onClick={() => navigate('/check-vandalismo/mapa')} 
            >
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              Mapa
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 sm:flex-none border-border shadow-sm hover:bg-muted/50" 
              onClick={handleExportExcel} 
              disabled={exportingAll}
            >
              {exportingAll ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500" />}
              Excel
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Os filtros foram movidos para dentro do Card de Histórico de Vistorias */}


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
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">Boletins de Ocorrência</CardDescription>
              <div className="flex items-baseline gap-2">
                <CardTitle className="text-4xl font-black text-foreground">{boMetrics.withBO}</CardTitle>
                <span className="text-xs text-muted-foreground font-medium">com anexo</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground mb-1">
                <span>{boMetrics.withoutBO} sem BO</span>
                <span>{totalOccurrences > 0 ? ((boMetrics.withBO / totalOccurrences) * 100).toFixed(0) : 0}%</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-blue-500 transition-all duration-700" 
                  style={{ width: `${totalOccurrences > 0 ? (boMetrics.withBO / totalOccurrences) * 100 : 0}%` }} 
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 font-medium">Proporção de casos documentados</p>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS SECTION */}
        <div className="grid grid-cols-1 gap-6">
          {/* O painel de Ranking de Localidades e Histórico Temporal foi removido conforme solicitado */}
        </div>

        {/* SITE AND STATE STATS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-none shadow-md bg-card lg:col-span-2">
            <CardHeader className="pb-2 border-b border-border mb-4">
              <CardTitle className="text-base font-bold text-foreground">Visão por Site</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">Recorrência e Vulnerabilidade Média</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px] uppercase">Site</TableHead>
                      <TableHead className="text-[10px] uppercase text-center">UF</TableHead>
                      <TableHead className="text-[10px] uppercase text-center">Vandalismos</TableHead>
                      <TableHead className="text-[10px] uppercase text-right">Vuln. Média</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {siteStats.map((s) => (
                      <TableRow key={s.site}>
                        <TableCell className="font-mono text-xs">{s.site}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] px-1 py-0">{s.estado}</Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs font-bold">{s.count}x</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full ${s.avgVuln > 60 ? 'bg-destructive' : s.avgVuln > 25 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                style={{ width: `${s.avgVuln}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold">{s.avgVuln.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-card">
            <CardHeader className="pb-2 border-b border-border mb-4">
              <CardTitle className="text-base font-bold text-foreground">Visão por Estado</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">Ocorrências e Risco por UF</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {estadoStats.map((e) => (
                <div key={e.uf} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">{e.uf}</span>
                    <span className="text-muted-foreground">{e.count} ocorrências</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${e.avgVuln > 50 ? 'bg-destructive' : 'bg-orange-500'}`}
                        style={{ width: `${e.avgVuln}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold w-8 text-right">{e.avgVuln.toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* DATA TABLE SECTION */}
        <Card className="border-none shadow-md bg-card overflow-hidden">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-foreground">Histórico de Vistorias</CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">Gestão detalhada de casos registrados</CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Sigla do site..."
                    className="h-8 pl-8 bg-muted/30 border-transparent focus:bg-background text-xs transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">UF:</span>
                  <select
                    value={estadoFilter}
                    onChange={(e) => setEstadoFilter(e.target.value)}
                    className="h-8 px-2 rounded-md border border-border bg-muted/30 text-xs focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    {['PA', 'AM', 'MA', 'AP', 'RR'].map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">BO:</span>
                  <select
                    value={boFilter}
                    onChange={(e) => setBoFilter(e.target.value as any)}
                    className="h-8 px-2 rounded-md border border-border bg-muted/30 text-xs focus:outline-none"
                  >
                    <option value="all">Todos</option>
                    <option value="with">Com</option>
                    <option value="without">Sem</option>
                  </select>
                </div>

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
                    <TableHead>UF</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Índice Vuln.</TableHead>
                    <TableHead>BO</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((v) => (
                    <TableRow key={v.id} className="cursor-pointer hover:bg-muted/50 transition-colors group/row" onClick={async () => {
                      const full = await getVistoriaVandalismo(v.id);
                      setSelectedCase(full);
                    }}>
                      <TableCell className="text-xs font-medium text-foreground">
                        {format(parseISO(v.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-background text-foreground border-border">{v.site_code}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] px-1 py-0">{v.estado || '-'}</Badge>
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
                              <DropdownMenuItem onClick={async () => {
                                const full = await getVistoriaVandalismo(v.id);
                                setSelectedCase(full);
                                // Trigger edit mode directly
                                setEditForm({
                                  site_code: full?.site_code,
                                  descricao: full?.descricao,
                                  operadora: full?.operadora,
                                  tecnico: full?.tecnico,
                                  estado: full?.estado,
                                  itens: full?.itens.map(i => ({ ...i }))
                                });
                                setIsEditing(true);
                              }}>
                                <Edit className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                const full = await getVistoriaVandalismo(v.id);
                                setSelectedCase(full);
                              }}>
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
                {!isEditing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={startEditing}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button size="sm" onClick={() => selectedCase && downloadCasePDF(selectedCase.id, selectedCase.site_code)}>
                      <FileText className="h-4 w-4 mr-2" /> PDF
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" /> Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Sigla do Site</label>
                      <Input 
                        value={editForm.site_code} 
                        onChange={(e) => setEditForm({...editForm, site_code: e.target.value})}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Estado (UF)</label>
                      <select
                        value={editForm.estado}
                        onChange={(e) => setEditForm({...editForm, estado: e.target.value})}
                        className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Selecione</option>
                        {['PA', 'AM', 'MA', 'AP', 'RR'].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Operadora</label>
                      <Input 
                        value={editForm.operadora || ''} 
                        onChange={(e) => setEditForm({...editForm, operadora: e.target.value})}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Técnico</label>
                      <Input 
                        value={editForm.tecnico || ''} 
                        onChange={(e) => setEditForm({...editForm, tecnico: e.target.value})}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Descrição da Ocorrência</label>
                    <textarea 
                      value={editForm.descricao} 
                      onChange={(e) => setEditForm({...editForm, descricao: e.target.value})}
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Técnico</p>
                      <p className="text-sm font-medium">{selectedCase?.tecnico || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Estado (UF)</p>
                      <p className="text-sm font-medium">{selectedCase?.estado || '-'}</p>
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
                </>
              )}

              <div className="space-y-3">
                <h4 className="text-sm font-bold border-l-4 border-primary pl-2 text-foreground">Fotos do Ocorrido</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedCase?.fotos?.map((f, idx) => (
                    <div 
                      key={idx} 
                      className="relative aspect-square rounded-lg border overflow-hidden bg-muted group/foto cursor-pointer" 
                      onClick={() => {
                        const images = selectedCase.fotos.map((img, i) => ({ 
                          url: img.url, 
                          label: `Foto do Ocorrido ${i + 1}` 
                        }));
                        openLightbox(images, idx);
                      }}
                    >
                      <SignedImage 
                        src={f.url} 
                        className="object-cover w-full h-full transition-transform group-hover/foto:scale-105" 
                        alt={`Foto ocorrido ${idx + 1}`} 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ))}
                  {(!selectedCase?.fotos || selectedCase.fotos.length === 0) && (
                    <div className="col-span-full py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhuma foto do ocorrido anexada</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold border-l-4 border-destructive pl-2 text-foreground">Vulnerabilidades Identificadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(isEditing ? editForm.itens : selectedCase?.itens)?.map((i: any, idx: number) => (
                    <div key={idx} className={`flex flex-col p-3 rounded border text-xs ${i.vulneravel ? 'bg-destructive/5 dark:bg-destructive/10 border-destructive/20' : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'}`}>
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-foreground">{i.rotulo}</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Vulnerável?</span>
                            <button
                              onClick={() => {
                                const newItens = [...editForm.itens];
                                newItens[idx].vulneravel = !newItens[idx].vulneravel;
                                setEditForm({ ...editForm, itens: newItens });
                              }}
                              className={`w-10 h-5 rounded-full relative transition-colors ${i.vulneravel ? 'bg-destructive' : 'bg-emerald-500'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${i.vulneravel ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        ) : (
                          i.vulneravel ? (
                            <Badge variant="destructive" className="h-5 text-[9px] px-1 ml-2">Vulnerável</Badge>
                          ) : (
                            <Badge className="h-5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none text-[9px] px-1 ml-2">OK</Badge>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {i.fotos.map((foto: string, fIdx: number) => (
                          <div 
                            key={fIdx} 
                            className="relative aspect-square w-12 h-12 rounded border overflow-hidden bg-muted group/foto cursor-pointer"
                            onClick={() => {
                              const images = i.fotos.map((img: string, idx: number) => ({
                                url: img,
                                label: `${i.rotulo} - Foto ${idx + 1}`
                              }));
                              openLightbox(images, fIdx);
                            }}
                          >
                            <SignedImage 
                              src={foto} 
                              className="object-cover w-full h-full transition-transform group-hover/foto:scale-105" 
                              alt={`${i.rotulo} - ${fIdx + 1}`} 
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity">
                              <Search className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Observação</label>
                          <textarea 
                            value={i.observacao || ''}
                            onChange={(e) => {
                              const newItens = [...editForm.itens];
                              newItens[idx].observacao = e.target.value;
                              setEditForm({ ...editForm, itens: newItens });
                            }}
                            className="w-full h-12 p-2 rounded border border-input bg-background text-[10px] focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            placeholder="Adicione uma observação..."
                          />
                        </div>
                      ) : (
                        i.observacao && <p className="text-[10px] text-muted-foreground mt-1 italic">Obs: {i.observacao}</p>
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
