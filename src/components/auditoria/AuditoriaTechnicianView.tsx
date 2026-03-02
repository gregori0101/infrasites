import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { fetchAuditOrders, fetchAuditOrderItems, type AuditOrder } from "@/lib/auditoriaDatabase";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { isBefore, addDays, differenceInDays } from "date-fns";
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

function DeadlineBadge({ deadline, status }: { deadline: string | null; status: string }) {
  if (!deadline || status === 'concluido') return null;
  const now = new Date();
  const dl = new Date(deadline);
  const days = differenceInDays(dl, now);

  if (isBefore(dl, now)) {
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vencida</span>;
  }
  if (days <= 7) {
    return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{days}d restantes</span>;
  }
  return <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{days}d restantes</span>;
}

interface OrderWithProgress extends AuditOrder {
  totalItems: number;
  auditedItems: number;
}

export default function AuditoriaTechnicianView() {
  const [orders, setOrders] = useState<OrderWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AuditOrder | null>(null);
  const [pendingOpen, setPendingOpen] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditOrders();
      // Fetch item counts for each order
      const enriched: OrderWithProgress[] = await Promise.all(
        data.map(async (order) => {
          try {
            const items = await fetchAuditOrderItems(order.id);
            return {
              ...order,
              totalItems: items.length,
              auditedItems: items.filter(i => i.status !== 'pendente').length,
            };
          } catch {
            return { ...order, totalItems: 0, auditedItems: 0 };
          }
        })
      );
      setOrders(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar suas OS");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const pendingOrders = useMemo(() => orders.filter(o => o.status !== 'concluido'), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'concluido'), [orders]);

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

  const renderOrderCard = (order: OrderWithProgress) => {
    const progress = order.totalItems > 0 ? Math.round((order.auditedItems / order.totalItems) * 100) : 0;
    return (
      <Card
        key={order.id}
        className="cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
        onClick={() => setSelectedOrder(order)}
      >
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-foreground">OS {order.os_number}</span>
              <Badge variant="outline">{order.site_code}</Badge>
              <DeadlineBadge deadline={order.deadline} status={order.status} />
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${statusColors[order.status] || ''}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{order.motivo}</p>
          {order.totalItems > 0 && order.status !== 'concluido' && (
            <ProgressBar value={progress} showLabel />
          )}
          {order.status === 'concluido' && (
            <p className="text-xs text-muted-foreground">
              Concluída em {order.completed_at ? new Date(order.completed_at).toLocaleDateString('pt-BR') : '—'}
            </p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Suas OS para Auditoria</h2>
        <span className="text-xs text-muted-foreground">
          {pendingOrders.length} pendente{pendingOrders.length !== 1 ? 's' : ''}, {completedOrders.length} concluída{completedOrders.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Pending */}
      {pendingOrders.length > 0 && (
        <Collapsible open={pendingOpen} onOpenChange={setPendingOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground w-full py-1">
            {pendingOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Pendentes ({pendingOrders.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            {pendingOrders.map(renderOrderCard)}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Completed */}
      {completedOrders.length > 0 && (
        <Collapsible open={completedOpen} onOpenChange={setCompletedOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-foreground w-full py-1">
            {completedOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Concluídas ({completedOrders.length})
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-2">
            {completedOrders.map(renderOrderCard)}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
