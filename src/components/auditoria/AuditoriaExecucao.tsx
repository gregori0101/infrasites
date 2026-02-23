import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Check, X, Camera } from "lucide-react";
import { fetchAuditOrderItems, updateAuditItem, updateAuditOrderStatus, type AuditOrder, type AuditOrderItem } from "@/lib/auditoriaDatabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  order: AuditOrder;
  onBack: () => void;
}

export default function AuditoriaExecucao({ order, onBack }: Props) {
  const [items, setItems] = useState<AuditOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditOrderItems(order.id);
      setItems(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar itens");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, [order.id]);

  const handleUpdateItem = async (item: AuditOrderItem, field: string, value: unknown) => {
    const updatedItems = items.map(i => i.id === item.id ? { ...i, [field]: value } : i);
    setItems(updatedItems);
  };

  const handleSaveItem = async (item: AuditOrderItem) => {
    setSaving(item.id);
    try {
      await updateAuditItem(item.id, {
        quantidade_auditada: item.quantidade_auditada ?? undefined,
        status: item.status,
        observacao: item.observacao ?? undefined,
        foto_url: item.foto_url ?? undefined,
      });

      // If order is still pendente, move to em_andamento
      if (order.status === 'pendente') {
        await updateAuditOrderStatus(order.id, 'em_andamento');
      }

      toast.success("Item salvo");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao salvar item");
    } finally {
      setSaving(null);
    }
  };

  const handlePhotoUpload = async (item: AuditOrderItem, file: File) => {
    setSaving(item.id);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `audit/${order.id}/${item.id}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('report-photos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('report-photos').getPublicUrl(path);
      await updateAuditItem(item.id, { foto_url: urlData.publicUrl });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, foto_url: urlData.publicUrl } : i));
      toast.success("Foto enviada");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar foto");
    } finally {
      setSaving(null);
    }
  };

  const handleFinish = async () => {
    const pending = items.filter(i => i.status === 'pendente');
    if (pending.length > 0) {
      toast.error(`Ainda há ${pending.length} item(ns) pendente(s)`);
      return;
    }
    setFinishing(true);
    try {
      await updateAuditOrderStatus(order.id, 'concluido');
      toast.success("Auditoria finalizada!");
      onBack();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao finalizar");
    } finally {
      setFinishing(false);
    }
  };

  const completedCount = items.filter(i => i.status !== 'pendente').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-foreground">OS {order.os_number}</h2>
          <p className="text-sm text-muted-foreground">{order.site_code} — {order.motivo}</p>
        </div>
        <Badge variant="outline">{completedCount}/{items.length}</Badge>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <Card key={item.id} className={item.status !== 'pendente' ? 'border-l-4 border-l-green-500' : ''}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {idx + 1}. {item.descricao}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantidade} {item.unidade}
                  </p>
                </div>
                <Badge variant={item.status === 'conforme' ? 'default' : item.status === 'nao_conforme' ? 'destructive' : 'secondary'} className="text-xs">
                  {item.status === 'conforme' ? 'Conforme' : item.status === 'nao_conforme' ? 'Não Conforme' : 'Pendente'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Qtd Auditada</Label>
                  <Input
                    type="number"
                    min={0}
                    className="h-8 text-sm"
                    value={item.quantidade_auditada ?? ''}
                    onChange={e => handleUpdateItem(item, 'quantidade_auditada', e.target.value ? Number(e.target.value) : null)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Status</Label>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={item.status === 'conforme' ? 'default' : 'outline'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleUpdateItem(item, 'status', 'conforme')}
                    >
                      <Check className="h-3 w-3 mr-0.5" /> OK
                    </Button>
                    <Button
                      size="sm"
                      variant={item.status === 'nao_conforme' ? 'destructive' : 'outline'}
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleUpdateItem(item, 'status', 'nao_conforme')}
                    >
                      <X className="h-3 w-3 mr-0.5" /> NOK
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Observação</Label>
                <Textarea
                  className="text-sm min-h-[40px]"
                  rows={1}
                  placeholder="Observação..."
                  value={item.observacao || ''}
                  onChange={e => handleUpdateItem(item, 'observacao', e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(item, file);
                    }}
                  />
                  <div className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Camera className="h-3.5 w-3.5" /> {item.foto_url ? 'Alterar foto' : 'Tirar foto'}
                  </div>
                </label>
                {item.foto_url && (
                  <img src={item.foto_url} alt="Evidência" className="h-10 w-10 rounded object-cover border" />
                )}
                <div className="flex-1" />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => handleSaveItem(item)}
                  disabled={saving === item.id}
                >
                  {saving === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Finish */}
      {order.status !== 'concluido' && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleFinish}
          disabled={finishing}
        >
          {finishing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Finalizar Auditoria
        </Button>
      )}
    </div>
  );
}
