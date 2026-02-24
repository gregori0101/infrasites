import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock, Image as ImageIcon } from "lucide-react";
import { fetchAuditOrderItems, type AuditOrder, type AuditOrderItem } from "@/lib/auditoriaDatabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbox } from "@/components/ui/lightbox";

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  conforme: "Conforme",
  nao_conforme: "Não Conforme",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AuditOrder | null;
  techEmail: string;
}

export default function AuditoriaDetailModal({ open, onOpenChange, order, techEmail }: Props) {
  const [items, setItems] = useState<AuditOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !order) return;
    setLoading(true);
    fetchAuditOrderItems(order.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, order]);

  if (!order) return null;

  const conformes = items.filter(i => i.status === 'conforme').length;
  const naoConformes = items.filter(i => i.status === 'nao_conforme').length;
  const pendentes = items.filter(i => i.status === 'pendente').length;
  const hasNaoConforme = naoConformes > 0;
  const allAudited = items.length > 0 && pendentes === 0;
  const resultado = allAudited ? (hasNaoConforme ? 'Reprovado' : 'Aprovado') : null;

  const deadline = order.deadline ? new Date(order.deadline).toLocaleDateString('pt-BR') : '-';
  const createdAt = new Date(order.created_at).toLocaleDateString('pt-BR');
  const completedAt = order.completed_at ? new Date(order.completed_at).toLocaleDateString('pt-BR') : '-';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 flex-wrap">
              OS {order.os_number}
              <Badge variant="outline">{order.site_code}</Badge>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                order.status === 'concluido' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                order.status === 'em_andamento' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
              }`}>
                {statusLabels[order.status] || order.status}
              </span>
              {resultado && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  resultado === 'Aprovado'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {resultado}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Dados da OS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-muted/50 text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-medium">Motivo</span>
              <p className="font-medium text-foreground">{order.motivo}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Técnico</span>
              <p className="font-medium text-foreground">{techEmail}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Prazo</span>
              <p className="font-medium text-foreground">{deadline}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Criação</span>
              <p className="font-medium text-foreground">{createdAt}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Conclusão</span>
              <p className="font-medium text-foreground">{completedAt}</p>
            </div>
            {order.notes && (
              <div className="col-span-2 sm:col-span-3">
                <span className="text-muted-foreground text-xs font-medium">Observações</span>
                <p className="font-medium text-foreground">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Itens */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Resumo */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-lg font-bold text-foreground">{items.length}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="rounded-lg bg-green-50 dark:bg-green-950/30 p-2">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">{conformes}</p>
                  <p className="text-xs text-muted-foreground">Conformes</p>
                </div>
                <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-2">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">{naoConformes}</p>
                  <p className="text-xs text-muted-foreground">Não Conformes</p>
                </div>
                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-2">
                  <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{pendentes}</p>
                  <p className="text-xs text-muted-foreground">Pendentes</p>
                </div>
              </div>

              {/* Tabela de itens */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">#</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="w-16">Unid.</TableHead>
                      <TableHead className="w-20 text-right">Previsto</TableHead>
                      <TableHead className="w-20 text-right">Auditado</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                      <TableHead>Observação</TableHead>
                      <TableHead className="w-10">Foto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                          Nenhum item cadastrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                          <TableCell className="font-medium text-foreground text-xs">{item.descricao}</TableCell>
                          <TableCell className="text-xs uppercase">{item.unidade}</TableCell>
                          <TableCell className="text-right">{item.quantidade}</TableCell>
                          <TableCell className="text-right">{item.quantidade_auditada ?? '-'}</TableCell>
                          <TableCell>
                            {item.status === 'conforme' && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                                <CheckCircle className="h-3.5 w-3.5" /> Conforme
                              </span>
                            )}
                            {item.status === 'nao_conforme' && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                                <XCircle className="h-3.5 w-3.5" /> Não Conforme
                              </span>
                            )}
                            {item.status === 'pendente' && (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" /> Pendente
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={item.observacao || ''}>
                            {item.observacao || '-'}
                          </TableCell>
                          <TableCell>
                            {item.foto_url ? (
                              <button onClick={() => setLightboxUrl(item.foto_url)} className="text-primary hover:text-primary/80">
                                <ImageIcon className="h-4 w-4" />
                              </button>
                            ) : (
                              <span className="text-muted-foreground/40">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {lightboxUrl && (
        <Lightbox
          images={[{ url: lightboxUrl, label: 'Evidência' }]}
          initialIndex={0}
          open={true}
          onClose={() => setLightboxUrl(null)}
        />
      )}
    </>
  );
}
