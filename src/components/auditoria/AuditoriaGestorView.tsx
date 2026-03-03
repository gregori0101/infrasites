import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, RefreshCw, FileText, RotateCcw, Trash2, Search, Copy, Download, ClipboardList, AlertTriangle, CheckCircle2, Clock, Play, Database } from "lucide-react";
import { fetchAuditOrders, fetchAuditOrderItems, deleteAuditOrder, duplicateAuditOrder, type AuditOrder } from "@/lib/auditoriaDatabase";
import { MultiSelectFilter } from "@/fiber-guardian/components/filters/MultiSelectFilter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { generateAuditPDF } from "@/lib/generateAuditPDF";
import { generateAuditExcel, generateFullAuditExcel } from "@/lib/generateAuditExcel";
import { supabase } from "@/integrations/supabase/client";
import { PaginationControls, usePagination } from "@/components/ui/pagination-controls";
import { ProgressBar } from "@/components/ui/progress-bar";
import { isBefore, addDays } from "date-fns";
import AuditoriaCreateDialog from "./AuditoriaCreateDialog";
import AuditoriaReassignDialog from "./AuditoriaReassignDialog";
import AuditoriaDetailModal from "./AuditoriaDetailModal";
import AuditoriaExecucao from "./AuditoriaExecucao";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Vistoriado",
};

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  em_andamento: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  concluido: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function AuditoriaGestorView() {
  const [orders, setOrders] = useState<AuditOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [techEmails, setTechEmails] = useState<Record<string, string>>({});
  const [generatingPdf, setGeneratingPdf] = useState<string | null>(null);
  const [auditResults, setAuditResults] = useState<Record<string, 'aprovado' | 'reprovado' | null>>({});
  const [reassignOrder, setReassignOrder] = useState<AuditOrder | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AuditOrder | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailOrder, setDetailOrder] = useState<AuditOrder | null>(null);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [executingOrder, setExecutingOrder] = useState<AuditOrder | null>(null);
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [techFilter, setTechFilter] = useState<string[]>([]);
  const [ufFilter, setUfFilter] = useState<string[]>([]);
  const [resultFilter, setResultFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("recent");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [exportingFull, setExportingFull] = useState(false);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchDeleteOpen, setBatchDeleteOpen] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditOrders();
      setOrders(data);

      const techIds = [...new Set(data.map(o => o.technician_id))];
      if (techIds.length > 0) {
        const { data: fnData } = await supabase.functions.invoke('get-technician-emails', {
          body: { technicianIds: techIds },
        });
        if (fnData?.technicians) {
          const emailMap: Record<string, string> = {};
          fnData.technicians.forEach((e: { id: string; email: string }) => { emailMap[e.id] = e.email; });
          setTechEmails(emailMap);
        }
      }

      const concludedOrders = data.filter(o => o.status === 'concluido');
      const resultsMap: Record<string, 'aprovado' | 'reprovado' | null> = {};
      await Promise.all(concludedOrders.map(async (order) => {
        try {
          const items = await fetchAuditOrderItems(order.id);
          if (items.length === 0) {
            resultsMap[order.id] = null;
          } else {
            const hasNaoConforme = items.some(i => i.status === 'nao_conforme');
            resultsMap[order.id] = hasNaoConforme ? 'reprovado' : 'aprovado';
          }
        } catch {
          resultsMap[order.id] = null;
        }
      }));
      setAuditResults(resultsMap);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = orders.length;
    const pendentes = orders.filter(o => o.status === 'pendente').length;
    const now = new Date();
    const vencidas = orders.filter(o => o.deadline && o.status !== 'concluido' && isBefore(new Date(o.deadline), now)).length;
    const concluidos = orders.filter(o => o.status === 'concluido').length;
    const aprovados = Object.values(auditResults).filter(r => r === 'aprovado').length;
    const taxaAprovacao = concluidos > 0 ? Math.round((aprovados / concluidos) * 100) : 0;
    return { total, pendentes, vencidas, taxaAprovacao };
  }, [orders, auditResults]);

  const techOptions = useMemo(() => {
    const ids = [...new Set(orders.map(o => o.technician_id))];
    return ids.map(id => ({ value: id, label: techEmails[id] || id.slice(0, 8) }));
  }, [orders, techEmails]);

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Vistoriado' },
  ];

  const resultOptions = [
    { value: 'aprovado', label: 'Aprovado' },
    { value: 'reprovado', label: 'Reprovado' },
    { value: 'sem_resultado', label: 'Sem resultado' },
  ];

  const ufOptions = useMemo(() => {
    const ufs = [...new Set(orders.map(o => o.site_code.slice(0, 2).toUpperCase()))].sort();
    return ufs.map(uf => ({ value: uf, label: uf }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      if (statusFilter.length > 0 && !statusFilter.includes(o.status)) return false;
      if (techFilter.length > 0 && !techFilter.includes(o.technician_id)) return false;
      if (ufFilter.length > 0 && !ufFilter.includes(o.site_code.slice(0, 2).toUpperCase())) return false;
      if (resultFilter.length > 0) {
        const r = auditResults[o.id];
        if (resultFilter.includes('aprovado') && r === 'aprovado') return true;
        if (resultFilter.includes('reprovado') && r === 'reprovado') return true;
        if (resultFilter.includes('sem_resultado') && (!r && o.status !== 'concluido' || r === null)) return true;
        return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!o.os_number.toLowerCase().includes(q) && !o.site_code.toLowerCase().includes(q) && !o.motivo.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'deadline': {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        case 'site': return a.site_code.localeCompare(b.site_code);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [orders, statusFilter, techFilter, ufFilter, resultFilter, search, auditResults, sortBy]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, techFilter, ufFilter, resultFilter, search, sortBy]);

  const { totalPages, getPageItems, totalItems } = usePagination(filteredOrders, 15);
  const pageItems = getPageItems(currentPage);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAuditOrder(deleteTarget.id);
      toast.success("OS excluída com sucesso!");
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir OS");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleBatchDelete = async () => {
    setBatchDeleting(true);
    try {
      await Promise.all([...selectedIds].map(id => deleteAuditOrder(id)));
      toast.success(`${selectedIds.size} OS excluídas com sucesso!`);
      setSelectedIds(new Set());
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir OS em lote");
    } finally {
      setBatchDeleting(false);
      setBatchDeleteOpen(false);
    }
  };

  const handleDuplicate = async (order: AuditOrder) => {
    setDuplicating(order.id);
    try {
      await duplicateAuditOrder(order.id);
      toast.success("OS duplicada com sucesso!");
      loadOrders();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao duplicar OS");
    } finally {
      setDuplicating(null);
    }
  };

  const handleCreated = () => {
    setDialogOpen(false);
    loadOrders();
    toast.success("OS criada com sucesso!");
  };

  const handleDownloadPdf = async (order: AuditOrder) => {
    setGeneratingPdf(order.id);
    try {
      const items = await fetchAuditOrderItems(order.id);
      const email = techEmails[order.technician_id] || order.technician_id.slice(0, 8);
      await generateAuditPDF(order, items, email);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF");
    } finally {
      setGeneratingPdf(null);
    }
  };

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) {
      toast.error("Nenhuma OS para exportar");
      return;
    }
    generateAuditExcel({ orders: filteredOrders, techEmails, auditResults });
    toast.success("Excel exportado!");
  };

  const handleExportFullExcel = async () => {
    if (orders.length === 0) {
      toast.error("Nenhuma OS para exportar");
      return;
    }
    setExportingFull(true);
    try {
      await generateFullAuditExcel({ orders, techEmails, auditResults });
      toast.success("Excel completo exportado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar Excel completo");
    } finally {
      setExportingFull(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredOrders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  // If executing an order, show execution view
  if (executingOrder) {
    return (
      <AuditoriaExecucao
        order={executingOrder}
        onBack={() => { setExecutingOrder(null); loadOrders(); }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mini Dashboard KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total OS</p>
              <p className="text-lg font-bold text-foreground">{kpis.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pendentes</p>
              <p className="text-lg font-bold text-foreground">{kpis.pendentes}</p>
            </div>
          </CardContent>
        </Card>
        <Card className={kpis.vencidas > 0 ? "border-destructive/50" : ""}>
          <CardContent className="p-3 flex items-center gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${kpis.vencidas > 0 ? 'bg-destructive/10' : 'bg-muted'}`}>
              <AlertTriangle className={`h-4 w-4 ${kpis.vencidas > 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vencidas</p>
              <p className={`text-lg font-bold ${kpis.vencidas > 0 ? 'text-destructive' : 'text-foreground'}`}>{kpis.vencidas}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <p className="text-xs text-muted-foreground">Aprovação</p>
            </div>
            <ProgressBar value={kpis.taxaAprovacao} className="" />
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ordens de Serviço</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadOrders} title="Recarregar">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} title="Exportar Excel filtrado">
            <Download className="h-4 w-4 mr-1" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportFullExcel} disabled={exportingFull} title="Exportar Excel completo com itens">
            {exportingFull ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Database className="h-4 w-4 mr-1" />} Excel Completo
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova OS
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por OS, site ou motivo..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <MultiSelectFilter label="Status" options={statusOptions} selected={statusFilter} onChange={setStatusFilter} placeholder="Status" className="w-full sm:w-[140px]" />
        <MultiSelectFilter label="Resultado" options={resultOptions} selected={resultFilter} onChange={setResultFilter} placeholder="Resultado" className="w-full sm:w-[150px]" />
        <MultiSelectFilter label="Técnico" options={techOptions} selected={techFilter} onChange={setTechFilter} placeholder="Técnico" className="w-full sm:w-[160px]" />
        <MultiSelectFilter label="UF" options={ufOptions} selected={ufFilter} onChange={setUfFilter} placeholder="UF" className="w-full sm:w-[100px]" />
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Mais recente</SelectItem>
            <SelectItem value="oldest">Mais antiga</SelectItem>
            <SelectItem value="deadline">Prazo próximo</SelectItem>
            <SelectItem value="site">Site (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch selection bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} selecionada{selectedIds.size > 1 ? 's' : ''}</span>
          <Button variant="outline" size="sm" onClick={toggleSelectAll}>
            {selectedIds.size === filteredOrders.length ? 'Limpar seleção' : 'Selecionar todos'}
          </Button>
          <div className="flex-1" />
          <Button variant="destructive" size="sm" onClick={() => setBatchDeleteOpen(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir selecionados
          </Button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {orders.length === 0 ? 'Nenhuma OS cadastrada. Clique em "Nova OS" para criar.' : 'Nenhuma OS encontrada com os filtros aplicados.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {selectedIds.size === 0 && filteredOrders.length > 1 && (
            <button onClick={toggleSelectAll} className="text-xs text-muted-foreground hover:text-foreground underline">
              Selecionar todas
            </button>
          )}
          {pageItems.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailOrder(order)}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="pt-1" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(order.id)}
                      onCheckedChange={() => toggleSelect(order.id)}
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">OS {order.os_number}</span>
                      <Badge variant="outline">{order.site_code}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || ''}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                      {auditResults[order.id] === 'aprovado' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Aprovado</span>
                      )}
                      {auditResults[order.id] === 'reprovado' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Reprovado</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{order.motivo}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Técnico: {techEmails[order.technician_id] || order.technician_id.slice(0, 8)}</span>
                      {order.deadline && <span>Prazo: {new Date(order.deadline).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button variant="outline" size="icon" onClick={() => setExecutingOrder(order)} title="Executar auditoria">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDuplicate(order)} disabled={duplicating === order.id} title="Duplicar OS">
                      {duplicating === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setReassignOrder(order)} title="Alterar técnico">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownloadPdf(order)} disabled={generatingPdf === order.id} title="Baixar PDF">
                      {generatingPdf === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => setDeleteTarget(order)} title="Excluir OS" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={15}
            showingLabel="OS"
          />
        </div>
      )}

      <AuditoriaCreateDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={handleCreated} />
      <AuditoriaReassignDialog open={!!reassignOrder} onOpenChange={(open) => !open && setReassignOrder(null)} order={reassignOrder} onReassigned={() => { setReassignOrder(null); loadOrders(); }} />

      {/* Single delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir OS?</AlertDialogTitle>
            <AlertDialogDescription>A OS <strong>{deleteTarget?.os_number}</strong> e todos os seus itens serão excluídos permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch delete dialog */}
      <AlertDialog open={batchDeleteOpen} onOpenChange={setBatchDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.size} OS?</AlertDialogTitle>
            <AlertDialogDescription>Todas as OS selecionadas e seus itens serão excluídos permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={batchDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleBatchDelete} disabled={batchDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {batchDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null} Excluir {selectedIds.size}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuditoriaDetailModal open={!!detailOrder} onOpenChange={(open) => !open && setDetailOrder(null)} order={detailOrder} techEmail={detailOrder ? (techEmails[detailOrder.technician_id] || detailOrder.technician_id.slice(0, 8)) : ''} canEdit={true} onOrderUpdated={loadOrders} />
    </div>
  );
}
