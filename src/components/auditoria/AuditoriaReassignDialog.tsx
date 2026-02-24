import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { fetchApprovedTechnicians, reassignAuditOrder, type AuditOrder } from "@/lib/auditoriaDatabase";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: AuditOrder | null;
  onReassigned: () => void;
}

export default function AuditoriaReassignDialog({ open, onOpenChange, order, onReassigned }: Props) {
  const [technicians, setTechnicians] = useState<{ id: string; email: string }[]>([]);
  const [selectedTech, setSelectedTech] = useState("");
  const [resetItems, setResetItems] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingTechs, setLoadingTechs] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedTech("");
    setResetItems(true);
    loadTechnicians();
  }, [open]);

  const loadTechnicians = async () => {
    setLoadingTechs(true);
    try {
      const techs = await fetchApprovedTechnicians();
      const ids = techs.map(t => t.user_id);
      if (ids.length > 0) {
        const { data } = await supabase.functions.invoke('get-technician-emails', {
          body: { technicianIds: ids },
        });
        if (data?.technicians) {
          setTechnicians(data.technicians);
        }
      }
    } catch {
      toast.error("Erro ao carregar técnicos");
    } finally {
      setLoadingTechs(false);
    }
  };

  const handleSubmit = async () => {
    if (!order || !selectedTech) return;
    setLoading(true);
    try {
      await reassignAuditOrder(order.id, selectedTech, resetItems);
      toast.success("Auditoria encaminhada com sucesso!");
      onOpenChange(false);
      onReassigned();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao encaminhar auditoria");
    } finally {
      setLoading(false);
    }
  };

  const isSameTech = order?.technician_id === selectedTech;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Devolver / Encaminhar Auditoria</DialogTitle>
          <DialogDescription>
            {order && <>OS {order.os_number} — {order.site_code}</>}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Técnico destino</Label>
            {loadingTechs ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </div>
            ) : (
              <Select value={selectedTech} onValueChange={setSelectedTech}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.email} {t.id === order?.technician_id ? "(atual)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="reset-items" className="text-sm font-normal">
              Resetar itens auditados (limpar respostas)
            </Label>
            <Switch id="reset-items" checked={resetItems} onCheckedChange={setResetItems} />
          </div>

          {isSameTech && (
            <p className="text-xs text-muted-foreground">
              Devolvendo para o mesmo técnico responsável.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!selectedTech || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            {isSameTech ? "Devolver" : "Encaminhar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
