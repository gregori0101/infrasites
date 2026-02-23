import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList } from "lucide-react";
import { fetchAuditOrders, type AuditOrder } from "@/lib/auditoriaDatabase";
import AuditoriaExecucao from "./AuditoriaExecucao";
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

export default function AuditoriaTechnicianView() {
  const [orders, setOrders] = useState<AuditOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AuditOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar suas OS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  if (selectedOrder) {
    return (
      <AuditoriaExecucao
        order={selectedOrder}
        onBack={() => { setSelectedOrder(null); loadOrders(); }}
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
        <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
          <ClipboardList className="h-7 w-7 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">Nenhuma OS atribuída a você no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Suas OS para Auditoria</h2>
      <div className="space-y-3">
        {orders.map(order => (
          <Card
            key={order.id}
            className="cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
            onClick={() => setSelectedOrder(order)}
          >
            <CardContent className="p-4 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground">OS {order.os_number}</span>
                  <Badge variant="outline">{order.site_code}</Badge>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[order.status] || ''}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{order.motivo}</p>
              {order.deadline && (
                <p className="text-xs text-muted-foreground">Prazo: {new Date(order.deadline).toLocaleDateString('pt-BR')}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
