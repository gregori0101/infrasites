import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createAuditOrder, fetchApprovedTechnicians, type NewAuditOrderItem } from "@/lib/auditoriaDatabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

interface TechOption { id: string; email: string }

const emptyItem = (): NewAuditOrderItem => ({ descricao: "", unidade: "UNI", quantidade: 1 });

export default function AuditoriaCreateDialog({ open, onOpenChange, onCreated }: Props) {
  const [osNumber, setOsNumber] = useState("");
  const [siteCode, setSiteCode] = useState("");
  const [motivo, setMotivo] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<NewAuditOrderItem[]>([emptyItem()]);
  const [technicians, setTechnicians] = useState<TechOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const techs = await fetchApprovedTechnicians();
        const ids = techs.map(t => t.user_id);
        if (ids.length === 0) { setTechnicians([]); return; }
        const { data } = await supabase.functions.invoke('get-technician-emails', { body: { technicianIds: ids } });
        if (data?.emails) {
          setTechnicians(data.emails.map((e: { id: string; email: string }) => ({ id: e.id, email: e.email })));
        }
      } catch { /* ignore */ }
    })();
  }, [open]);

  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof NewAuditOrderItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const resetForm = () => {
    setOsNumber(""); setSiteCode(""); setMotivo(""); setTechnicianId("");
    setDeadline(""); setNotes(""); setItems([emptyItem()]);
  };

  const handleSave = async () => {
    if (!osNumber.trim() || !siteCode.trim() || !motivo.trim() || !technicianId) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    const validItems = items.filter(i => i.descricao.trim());
    if (validItems.length === 0) {
      toast.error("Adicione pelo menos um item");
      return;
    }

    setSaving(true);
    try {
      await createAuditOrder(
        { os_number: osNumber.trim(), site_code: siteCode.trim(), motivo: motivo.trim(), technician_id: technicianId, deadline: deadline || undefined, notes: notes || undefined },
        validItems
      );
      resetForm();
      onCreated();
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao criar OS: " + (err.message || ""));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Ordem de Serviço</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Header fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nº OS *</Label>
              <Input placeholder="Ex: 586572212" value={osNumber} onChange={e => setOsNumber(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Sigla Site *</Label>
              <Input placeholder="Ex: AMDM1" value={siteCode} onChange={e => setSiteCode(e.target.value)} className="uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Motivo *</Label>
            <Input placeholder="Ex: Recuperação de vandalismo" value={motivo} onChange={e => setMotivo(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Técnico *</Label>
              <Select value={technicianId} onValueChange={setTechnicianId}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {technicians.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Prazo</Label>
              <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Observações</Label>
            <Textarea placeholder="Observações gerais..." value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </div>

          {/* Items table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Itens da OS</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus className="h-3 w-3 mr-1" /> Adicionar
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Denominação Mat./Serv.</TableHead>
                    <TableHead className="w-[15%]">Unidade</TableHead>
                    <TableHead className="w-[15%]">Qtd</TableHead>
                    <TableHead className="w-[20%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="p-1.5">
                        <Input
                          placeholder="Descrição do item"
                          value={item.descricao}
                          onChange={e => updateItem(idx, 'descricao', e.target.value)}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Select value={item.unidade} onValueChange={v => updateItem(idx, 'unidade', v)}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['UNI', 'm', 'm2', 'm3', 'M', 'CJ', 'PC'].map(u => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="p-1.5">
                        <Input
                          type="number"
                          min={0}
                          value={item.quantidade}
                          onChange={e => updateItem(idx, 'quantidade', Number(e.target.value))}
                          className="h-8 text-sm"
                        />
                      </TableCell>
                      <TableCell className="p-1.5 text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeItem(idx)} disabled={items.length <= 1}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Criar OS
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
