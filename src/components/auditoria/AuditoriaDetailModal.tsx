import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, Clock, Image as ImageIcon, Pencil, Check, X } from "lucide-react";
import { fetchAuditOrderItems, updateAuditOrder, updateAuditItem, type AuditOrder, type AuditOrderItem } from "@/lib/auditoriaDatabase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lightbox } from "@/components/ui/lightbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
  canEdit?: boolean;
  onOrderUpdated?: () => void;
}

// Inline editable text field
function EditableField({ value, onSave, type = "text", className = "" }: {
  value: string;
  onSave: (val: string) => Promise<void>;
  type?: "text" | "date" | "textarea";
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => { setDraft(value); setEditing(false); };

  if (!editing) {
    return (
      <div className={`group flex items-center gap-1 ${className}`}>
        <span className="font-medium text-foreground">{value || '-'}</span>
        <button onClick={() => { setDraft(value); setEditing(true); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary">
          <Pencil className="h-3 w-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {type === "textarea" ? (
        <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="text-xs min-h-[40px] h-10" autoFocus />
      ) : (
        <Input type={type} value={draft} onChange={e => setDraft(e.target.value)} className="h-7 text-xs" autoFocus onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }} />
      )}
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3 text-green-600" />}
      </Button>
      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleCancel} disabled={saving}>
        <X className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  );
}

export default function AuditoriaDetailModal({ open, onOpenChange, order, techEmail, canEdit = true, onOrderUpdated }: Props) {
  const [items, setItems] = useState<AuditOrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const loadItems = useCallback(() => {
    if (!order) return;
    setLoading(true);
    fetchAuditOrderItems(order.id)
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [order]);

  useEffect(() => {
    if (!open || !order) return;
    loadItems();
  }, [open, order, loadItems]);

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

  const saveOrderField = async (field: string, value: string) => {
    await updateAuditOrder(order.id, { [field]: value });
    (order as unknown as Record<string, unknown>)[field] = value;
    onOrderUpdated?.();
    toast.success("Campo atualizado");
  };

  const saveItemField = async (itemId: string, field: string, value: string | number) => {
    await updateAuditItem(itemId, { [field]: value } as any);
    loadItems();
    toast.success("Item atualizado");
  };

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
              <span className="text-muted-foreground text-xs font-medium">Nº OS</span>
              {canEdit ? (
                <EditableField value={order.os_number} onSave={v => saveOrderField('os_number', v)} />
              ) : (
                <p className="font-medium text-foreground">{order.os_number}</p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Site</span>
              {canEdit ? (
                <EditableField value={order.site_code} onSave={v => saveOrderField('site_code', v)} />
              ) : (
                <p className="font-medium text-foreground">{order.site_code}</p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Motivo</span>
              {canEdit ? (
                <EditableField value={order.motivo} onSave={v => saveOrderField('motivo', v)} />
              ) : (
                <p className="font-medium text-foreground">{order.motivo}</p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Técnico</span>
              <p className="font-medium text-foreground">{techEmail}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Prazo</span>
              {canEdit ? (
                <EditableField value={order.deadline || ''} onSave={v => saveOrderField('deadline', v)} type="date" />
              ) : (
                <p className="font-medium text-foreground">{deadline}</p>
              )}
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Criação</span>
              <p className="font-medium text-foreground">{createdAt}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-medium">Conclusão</span>
              <p className="font-medium text-foreground">{completedAt}</p>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <span className="text-muted-foreground text-xs font-medium">Observações</span>
              {canEdit ? (
                <EditableField value={order.notes || ''} onSave={v => saveOrderField('notes', v)} type="textarea" />
              ) : (
                <p className="font-medium text-foreground">{order.notes || '-'}</p>
              )}
            </div>
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
                        <EditableItemRow
                          key={item.id}
                          item={item}
                          idx={idx}
                          canEdit={canEdit}
                          onSave={saveItemField}
                          onPhotoClick={() => item.foto_url && setLightboxUrl(item.foto_url)}
                        />
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

// Extracted row component for item editing
function EditableItemRow({ item, idx, canEdit, onSave, onPhotoClick }: {
  item: AuditOrderItem;
  idx: number;
  canEdit: boolean;
  onSave: (itemId: string, field: string, value: string | number) => Promise<void>;
  onPhotoClick: () => void;
}) {
  const [editField, setEditField] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (field: string, currentValue: string | number | null) => {
    setEditField(field);
    setDraft(String(currentValue ?? ''));
  };

  const handleSave = async () => {
    if (!editField) return;
    setSaving(true);
    try {
      const value = ['quantidade', 'quantidade_auditada'].includes(editField) ? Number(draft) : draft;
      await onSave(item.id, editField, value);
    } finally {
      setSaving(false);
      setEditField(null);
    }
  };

  const handleCancel = () => { setEditField(null); setDraft(''); };

  const renderCell = (field: string, value: string | number | null, className = '') => {
    if (canEdit && editField === field) {
      return (
        <div className="flex items-center gap-0.5">
          <Input value={draft} onChange={e => setDraft(e.target.value)} className="h-6 text-xs w-full" autoFocus
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel(); }} />
          <button onClick={handleSave} disabled={saving} className="text-green-600 hover:text-green-700">
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </button>
          <button onClick={handleCancel} className="text-destructive"><X className="h-3 w-3" /></button>
        </div>
      );
    }
    return (
      <div className={`group/cell flex items-center gap-0.5 ${className}`}>
        <span>{value ?? '-'}</span>
        {canEdit && (
          <button onClick={() => startEdit(field, value)} className="opacity-0 group-hover/cell:opacity-100 text-muted-foreground hover:text-primary">
            <Pencil className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    );
  };

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
      <TableCell className="font-medium text-foreground text-xs">
        {renderCell('descricao', item.descricao)}
      </TableCell>
      <TableCell className="text-xs uppercase">
        {renderCell('unidade', item.unidade)}
      </TableCell>
      <TableCell className="text-right">
        {renderCell('quantidade', item.quantidade)}
      </TableCell>
      <TableCell className="text-right">
        {renderCell('quantidade_auditada', item.quantidade_auditada)}
      </TableCell>
      <TableCell>
        {canEdit && editField === 'status' ? (
          <div className="flex items-center gap-0.5">
            <Select value={draft} onValueChange={async (val) => {
              setSaving(true);
              try { await onSave(item.id, 'status', val); } finally { setSaving(false); setEditField(null); }
            }}>
              <SelectTrigger className="h-6 text-xs w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="conforme">Conforme</SelectItem>
                <SelectItem value="nao_conforme">Não Conforme</SelectItem>
              </SelectContent>
            </Select>
            <button onClick={handleCancel} className="text-destructive"><X className="h-3 w-3" /></button>
          </div>
        ) : (
          <div className="group/cell flex items-center gap-0.5">
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
            {canEdit && (
              <button onClick={() => startEdit('status', item.status)} className="opacity-0 group-hover/cell:opacity-100 text-muted-foreground hover:text-primary">
                <Pencil className="h-2.5 w-2.5" />
              </button>
            )}
          </div>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground max-w-[120px]">
        {renderCell('observacao', item.observacao)}
      </TableCell>
      <TableCell>
        {item.foto_url ? (
          <button onClick={onPhotoClick} className="text-primary hover:text-primary/80">
            <ImageIcon className="h-4 w-4" />
          </button>
        ) : (
          <span className="text-muted-foreground/40">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}
