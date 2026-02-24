import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Loader2, RefreshCw, FileText, RotateCcw } from "lucide-react";
import { fetchAuditOrders, fetchAuditOrderItems, type AuditOrder } from "@/lib/auditoriaDatabase";
import { generateAuditPDF } from "@/lib/generateAuditPDF";
import { supabase } from "@/integrations/supabase/client";
import AuditoriaCreateDialog from "./AuditoriaCreateDialog";
import AuditoriaReassignDialog from "./AuditoriaReassignDialog";
import { toast } from "sonner";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
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

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhuma OS cadastrada. Clique em "Nova OS" para criar.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
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
                  <div className="flex gap-1">
                    {order.status === 'concluido' && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setReassignOrder(order)}
                        title="Devolver / Encaminhar"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
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
    </div>
  );
}
