import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Check, X, Camera, Plus, Trash2, ChevronsUpDown } from "lucide-react";
import { fetchAuditOrderItems, updateAuditItem, updateAuditOrderStatus, type AuditOrder, type AuditOrderItem } from "@/lib/auditoriaDatabase";
import { supabase } from "@/integrations/supabase/client";
import { ProgressBar } from "@/components/ui/progress-bar";
import { differenceInDays, isBefore } from "date-fns";
import { toast } from "sonner";
import { Lightbox } from "@/components/ui/lightbox";
import { SignedImage } from "@/components/ui/signed-image";

function parsePhotos(fotoUrl: string | null): string[] {
  if (!fotoUrl) return [];
  try {
    const parsed = JSON.parse(fotoUrl);
    if (Array.isArray(parsed)) return parsed;
  } catch { /* single URL */ }
  return [fotoUrl];
}

function photosToString(photos: string[]): string | null {
  if (photos.length === 0) return null;
  if (photos.length === 1) return photos[0];
  return JSON.stringify(photos);
}

function DeadlineIndicator({ deadline }: { deadline: string | null }) {
  if (!deadline) return null;
  const now = new Date();
  const dl = new Date(deadline);
  const days = differenceInDays(dl, now);

  if (isBefore(dl, now)) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Vencida!</span>;
  }
  if (days <= 3) {
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{days}d restante{days !== 1 ? 's' : ''}</span>;
  }
  return <span className="text-xs text-muted-foreground">{days}d restantes</span>;
}

interface Props {
  order: AuditOrder;
  onBack: () => void;
}

export default function AuditoriaExecucao({ order, onBack }: Props) {
  const [items, setItems] = useState<AuditOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; label: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const openLightbox = (photos: string[], index: number, itemDesc: string) => {
    setLightboxImages(photos.map((url, i) => ({ url, label: `${itemDesc} — Foto ${i + 1}` })));
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

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

  const scrollToNextPending = useCallback((afterItemId: string) => {
    const currentIdx = items.findIndex(i => i.id === afterItemId);
    const nextPending = items.find((i, idx) => idx > currentIdx && i.status === 'pendente');
    if (nextPending && itemRefs.current[nextPending.id]) {
      itemRefs.current[nextPending.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [items]);

  const handleUpdateItem = async (item: AuditOrderItem, field: string, value: unknown) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, [field]: value } : i));
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
      if (order.status === 'pendente') {
        await updateAuditOrderStatus(order.id, 'em_andamento');
      }
      toast.success("Item salvo");
      // Auto-scroll to next pending
      setTimeout(() => scrollToNextPending(item.id), 300);
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
      const timestamp = Date.now();
      const path = `audit/${order.id}/${item.id}_${timestamp}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('report-photos').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: signedData, error: signErr } = await supabase.storage
        .from('report-photos')
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (signErr || !signedData?.signedUrl) throw signErr ?? new Error('Falha ao gerar URL');
      const currentPhotos = parsePhotos(item.foto_url);
      const newPhotos = [...currentPhotos, signedData.signedUrl];
      const newFotoUrl = photosToString(newPhotos);
      await updateAuditItem(item.id, { foto_url: newFotoUrl ?? undefined });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, foto_url: newFotoUrl } : i));
      toast.success("Foto enviada");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao enviar foto");
    } finally {
      setSaving(null);
    }
  };

  const handleRemovePhoto = async (item: AuditOrderItem, photoIndex: number) => {
    const currentPhotos = parsePhotos(item.foto_url);
    const newPhotos = currentPhotos.filter((_, i) => i !== photoIndex);
    const newFotoUrl = photosToString(newPhotos);
    setSaving(item.id);
    try {
      await updateAuditItem(item.id, { foto_url: newFotoUrl ?? undefined });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, foto_url: newFotoUrl } : i));
      toast.success("Foto removida");
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao remover foto");
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
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

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
        <DeadlineIndicator deadline={order.deadline} />
        <Badge variant="outline">{completedCount}/{items.length}</Badge>
      </div>

      {/* Progress bar */}
      <ProgressBar value={progress} />

      {/* Collapse toggle */}
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)} className="text-xs">
          <ChevronsUpDown className="h-3.5 w-3.5 mr-1" />
          {collapsed ? 'Expandir todos' : 'Recolher auditados'}
        </Button>
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item, idx) => {
          const photos = parsePhotos(item.foto_url);
          const isDone = item.status !== 'pendente';
          const isCollapsed = collapsed && isDone;

          return (
            <div key={item.id} ref={el => { itemRefs.current[item.id] = el; }}>
              <Card className={isDone ? 'border-l-4 border-l-green-500' : ''}>
                <CardContent className={`p-4 ${isCollapsed ? 'space-y-0' : 'space-y-3'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {idx + 1}. {item.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.quantidade} {item.unidade}
                        {isDone && item.quantidade_auditada != null && ` → Auditado: ${item.quantidade_auditada}`}
                      </p>
                    </div>
                    <Badge variant={item.status === 'conforme' ? 'default' : item.status === 'nao_conforme' ? 'destructive' : 'secondary'} className="text-xs">
                      {item.status === 'conforme' ? 'Conforme' : item.status === 'nao_conforme' ? 'Não Conforme' : 'Pendente'}
                    </Badge>
                  </div>

                  {!isCollapsed && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Qtd Auditada</Label>
                          <Input type="number" min={0} className="h-8 text-sm" value={item.quantidade_auditada ?? ''} onChange={e => handleUpdateItem(item, 'quantidade_auditada', e.target.value ? Number(e.target.value) : null)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Status</Label>
                          <div className="flex gap-1">
                            <Button size="sm" variant={item.status === 'conforme' ? 'default' : 'outline'} className="flex-1 h-8 text-xs" onClick={() => handleUpdateItem(item, 'status', 'conforme')}>
                              <Check className="h-3 w-3 mr-0.5" /> OK
                            </Button>
                            <Button size="sm" variant={item.status === 'nao_conforme' ? 'destructive' : 'outline'} className="flex-1 h-8 text-xs" onClick={() => handleUpdateItem(item, 'status', 'nao_conforme')}>
                              <X className="h-3 w-3 mr-0.5" /> NOK
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Observação</Label>
                        <Textarea className="text-sm min-h-[40px]" rows={1} placeholder="Observação..." value={item.observacao || ''} onChange={e => handleUpdateItem(item, 'observacao', e.target.value)} />
                      </div>

                      {/* Photos */}
                      <div className="space-y-2">
                        {photos.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {photos.map((photo, pIdx) => (
                              <div key={pIdx} className="relative group w-16 h-16">
                                <img src={photo} alt={`Evidência ${pIdx + 1}`} className="w-full h-full rounded object-cover border cursor-pointer" onClick={() => openLightbox(photos, pIdx, item.descricao)} />
                                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all rounded flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <button className="bg-destructive/80 text-destructive-foreground rounded-full p-1" onClick={() => handleRemovePhoto(item, pIdx)}>
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                                <span className="absolute -top-1 -left-1 bg-muted text-muted-foreground text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pIdx + 1}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) handlePhotoUpload(item, file); if (e.target) e.target.value = ''; }} />
                            <div className="flex items-center gap-1 text-xs text-primary hover:underline">
                              {photos.length > 0 ? <><Plus className="h-3.5 w-3.5" /> Adicionar foto</> : <><Camera className="h-3.5 w-3.5" /> Tirar foto</>}
                            </div>
                          </label>
                          {photos.length > 0 && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{photos.length} foto{photos.length > 1 ? 's' : ''}</span>
                          )}
                          <div className="flex-1" />
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleSaveItem(item)} disabled={saving === item.id}>
                            {saving === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Salvar'}
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Finish */}
      {order.status !== 'concluido' && (
        <Button className="w-full" size="lg" onClick={handleFinish} disabled={finishing}>
          {finishing && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
          Finalizar Auditoria
        </Button>
      )}

      <Lightbox images={lightboxImages} initialIndex={lightboxIndex} open={lightboxOpen} onClose={() => setLightboxOpen(false)} />
    </div>
  );
}
