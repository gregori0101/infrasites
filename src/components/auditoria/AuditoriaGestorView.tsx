import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, RefreshCw, FileText, RotateCcw, Trash2, Search } from "lucide-react";
import { fetchAuditOrders, fetchAuditOrderItems, deleteAuditOrder, type AuditOrder } from "@/lib/auditoriaDatabase";
import { MultiSelectFilter } from "@/fiber-guardian/components/filters/MultiSelectFilter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { generateAuditPDF } from "@/lib/generateAuditPDF";
import { supabase } from "@/integrations/supabase/client";
import AuditoriaCreateDialog from "./AuditoriaCreateDialog";
import AuditoriaReassignDialog from "./AuditoriaReassignDialog";
import AuditoriaDetailModal from "./AuditoriaDetailModal";
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

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [techFilter, setTechFilter] = useState<string[]>([]);

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

      // Fetch audit result for concluded orders
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

  const techOptions = useMemo(() => {
    const ids = [...new Set(orders.map(o => o.technician_id))];
    return ids.map(id => ({ value: id, label: techEmails[id] || id.slice(0, 8) }));
  }, [orders, techEmails]);

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Vistoriado' },
  ];

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter.length > 0 && !statusFilter.includes(o.status)) return false;
      if (techFilter.length > 0 && !techFilter.includes(o.technician_id)) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchOs = o.os_number.toLowerCase().includes(q);
        const matchSite = o.site_code.toLowerCase().includes(q);
        const matchMotivo = o.motivo.toLowerCase().includes(q);
        if (!matchOs && !matchSite && !matchMotivo) return false;
      }
      return true;
    });
  }, [orders, statusFilter, techFilter, search]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Ordens de Serviço</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={loadOrders}>
            <RefreshCw className="h-4 w-4" />
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
          <Input
            placeholder="Buscar por OS, site ou motivo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <MultiSelectFilter
          label="Status"
          options={statusOptions}
          selected={statusFilter}
          onChange={setStatusFilter}
          placeholder="Status"
          className="w-full sm:w-[160px]"
        />
        <MultiSelectFilter
          label="Técnico"
          options={techOptions}
          selected={techFilter}
          onChange={setTechFilter}
          placeholder="Técnico"
          className="w-full sm:w-[180px]"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {orders.length === 0 ? 'Nenhuma OS cadastrada. Clique em "Nova OS" para criar.' : 'Nenhuma OS encontrada com os filtros aplicados.'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailOrder(order)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">OS {order.os_number}</span>
                      <Badge variant="outline">{order.site_code}</Badge>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status] || ''}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                      {auditResults[order.id] === 'aprovado' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Aprovado
                        </span>
                      )}
                      {auditResults[order.id] === 'reprovado' && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Reprovado
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{order.motivo}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Técnico: {techEmails[order.technician_id] || order.technician_id.slice(0, 8)}</span>
                      {order.deadline && <span>Prazo: {new Date(order.deadline).toLocaleDateString('pt-BR')}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setReassignOrder(order)}
                      title="Alterar técnico / Encaminhar"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDownloadPdf(order)}
                      disabled={generatingPdf === order.id}
                      title="Baixar PDF"
                    >
                      {generatingPdf === order.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDeleteTarget(order)}
                      title="Excluir OS"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AuditoriaCreateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />

      <AuditoriaReassignDialog
        open={!!reassignOrder}
        onOpenChange={(open) => !open && setReassignOrder(null)}
        order={reassignOrder}
        onReassigned={() => {
          setReassignOrder(null);
          loadOrders();
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir OS?</AlertDialogTitle>
            <AlertDialogDescription>
              A OS <strong>{deleteTarget?.os_number}</strong> e todos os seus itens serão excluídos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AuditoriaDetailModal
        open={!!detailOrder}
        onOpenChange={(open) => !open && setDetailOrder(null)}
        order={detailOrder}
        techEmail={detailOrder ? (techEmails[detailOrder.technician_id] || detailOrder.technician_id.slice(0, 8)) : ''}
        canEdit={true}
        onOrderUpdated={loadOrders}
      />
    </div>
  );
}
