import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Reparo, CausaReparo, ConclusaoTA, CategoriaReparo, TipoRede, FGProfile } from '@/fiber-guardian/types/database';
import { CAUSAS, CATEGORIAS, TIPOS_REDE } from '@/fiber-guardian/lib/constants';
import { toast } from 'sonner';
import { Edit, UserCog } from 'lucide-react';

interface EditarReparoDialogProps {
  reparo: Reparo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedReparo: Reparo) => void;
}

interface EditForm {
  ta_titulo: string; trecho: string; usuario_id: string; causa: CausaReparo;
  categoria: CategoriaReparo; tipo_rede: TipoRede; conclusao_ta: ConclusaoTA;
  observacoes: string; observacao_prevencao: string; observacao_definitivo: string;
  tecnicos_reparo: string; caixa_bomba: boolean; prazo_vistoria: string;
}

export function EditarReparoDialog({ reparo, open, onOpenChange, onSave }: EditarReparoDialogProps) {
  const [form, setForm] = useState<EditForm>({
    ta_titulo: '', trecho: '', usuario_id: '', causa: 'outros', categoria: 'manutencao',
    tipo_rede: 'bbn', conclusao_ta: 'pendente', observacoes: '', observacao_prevencao: '',
    observacao_definitivo: '', tecnicos_reparo: '', caixa_bomba: false, prazo_vistoria: '',
  });
  const [saving, setSaving] = useState(false);
  const [tecnicos, setTecnicos] = useState<FGProfile[]>([]);
  const [loadingTecnicos, setLoadingTecnicos] = useState(false);

  useEffect(() => {
    const fetchTecnicos = async () => {
      if (!open) return;
      setLoadingTecnicos(true);
      try {
        const { data, error } = await supabase.from('fg_profiles').select('id, nome, email, criado_em').order('nome');
        if (error) throw error;
        setTecnicos(data || []);
      } catch (error) { console.error('Error fetching technicians:', error); }
      finally { setLoadingTecnicos(false); }
    };
    fetchTecnicos();
  }, [open]);

  useEffect(() => {
    if (reparo) {
      setForm({
        ta_titulo: reparo.ta_titulo || '', trecho: reparo.trecho || '', usuario_id: reparo.usuario_id,
        causa: reparo.causa, categoria: reparo.categoria, tipo_rede: reparo.tipo_rede || 'bbn',
        conclusao_ta: reparo.conclusao_ta, observacoes: reparo.observacoes || '',
        observacao_prevencao: reparo.observacao_prevencao || '', observacao_definitivo: reparo.observacao_definitivo || '',
        tecnicos_reparo: reparo.tecnicos_reparo || '', caixa_bomba: reparo.caixa_bomba || false,
        prazo_vistoria: reparo.prazo_vistoria ? reparo.prazo_vistoria.substring(0, 10) : '',
      });
    }
  }, [reparo, open]);

  const handleSave = async () => {
    if (!form.ta_titulo.trim()) { toast.error('TA é obrigatório'); return; }
    if (!form.usuario_id) { toast.error('Técnico responsável é obrigatório'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('reparos').update({
        ta_titulo: form.ta_titulo.trim(), trecho: form.trecho.trim() || null,
        usuario_id: form.usuario_id, causa: form.causa, categoria: form.categoria,
        tipo_rede: form.tipo_rede, conclusao_ta: form.conclusao_ta,
        observacoes: form.observacoes.trim() || null, observacao_prevencao: form.observacao_prevencao.trim() || null,
        observacao_definitivo: form.observacao_definitivo.trim() || null,
        tecnicos_reparo: form.tecnicos_reparo.trim() || null, caixa_bomba: form.caixa_bomba,
        prazo_vistoria: form.prazo_vistoria ? new Date(form.prazo_vistoria).toISOString() : null,
      }).eq('id', reparo.id);
      if (error) throw error;

      const newProfile = tecnicos.find(t => t.id === form.usuario_id);
      const updatedReparo: Reparo = {
        ...reparo, ta_titulo: form.ta_titulo.trim(), trecho: form.trecho.trim() || undefined,
        usuario_id: form.usuario_id, causa: form.causa, categoria: form.categoria,
        tipo_rede: form.tipo_rede, conclusao_ta: form.conclusao_ta,
        observacoes: form.observacoes.trim() || undefined, observacao_prevencao: form.observacao_prevencao.trim() || undefined,
        observacao_definitivo: form.observacao_definitivo.trim() || undefined,
        tecnicos_reparo: form.tecnicos_reparo.trim() || undefined, caixa_bomba: form.caixa_bomba,
        prazo_vistoria: form.prazo_vistoria ? new Date(form.prazo_vistoria).toISOString() : undefined,
        profiles: newProfile || reparo.profiles,
      };
      onSave(updatedReparo); onOpenChange(false); toast.success('Reparo atualizado com sucesso!');
    } catch (error) { console.error('Error updating reparo:', error); toast.error('Erro ao atualizar reparo'); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Edit className="w-5 h-5" />Editar Reparo</DialogTitle>
          <DialogDescription>Modifique as informações do reparo conforme necessário.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label htmlFor="edit-ta">TA *</Label><Input id="edit-ta" value={form.ta_titulo} onChange={(e) => setForm(prev => ({ ...prev, ta_titulo: e.target.value }))} placeholder="Ex: 123456" /></div>
          <div className="space-y-2"><Label htmlFor="edit-trecho">Trecho</Label><Input id="edit-trecho" value={form.trecho} onChange={(e) => setForm(prev => ({ ...prev, trecho: e.target.value }))} placeholder="Ex: PACRE X PAOTM" /></div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><UserCog className="w-4 h-4" />Técnico Responsável *</Label>
            <Select value={form.usuario_id} onValueChange={(value) => setForm(prev => ({ ...prev, usuario_id: value }))} disabled={loadingTecnicos}>
              <SelectTrigger><SelectValue placeholder={loadingTecnicos ? "Carregando..." : "Selecione o técnico"} /></SelectTrigger>
              <SelectContent className="max-h-60">{tecnicos.map((t) => (<SelectItem key={t.id} value={t.id}>{t.nome} ({t.email})</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label htmlFor="edit-tecnicos">Técnicos executantes</Label><Input id="edit-tecnicos" value={form.tecnicos_reparo} onChange={(e) => setForm(prev => ({ ...prev, tecnicos_reparo: e.target.value }))} placeholder="Ex: João Silva, Maria Santos" /></div>
          <div className="space-y-2"><Label>Causa</Label>
            <Select value={form.causa} onValueChange={(value) => setForm(prev => ({ ...prev, causa: value as CausaReparo }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="max-h-60">{CAUSAS.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Categoria</Label>
            <Select value={form.categoria} onValueChange={(value) => setForm(prev => ({ ...prev, categoria: value as CategoriaReparo }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIAS.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Tipo de Rede</Label>
            <Select value={form.tipo_rede} onValueChange={(value) => setForm(prev => ({ ...prev, tipo_rede: value as TipoRede }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent className="bg-background">{TIPOS_REDE.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Caixa Bomba</Label>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div><p className="font-medium">{form.caixa_bomba ? 'Sim' : 'Não'}</p><p className="text-sm text-muted-foreground">{form.caixa_bomba ? 'Este reparo possui caixa bomba' : 'Este reparo não possui caixa bomba'}</p></div>
              <Switch checked={form.caixa_bomba} onCheckedChange={(checked) => setForm(prev => ({ ...prev, caixa_bomba: checked }))} />
            </div>
          </div>
          <div className="space-y-2"><Label>Conclusão do TA</Label>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div><p className="font-medium">{form.conclusao_ta === 'definitivo' ? 'Definitivo' : 'Pendente'}</p></div>
              <Switch checked={form.conclusao_ta === 'definitivo'} onCheckedChange={(checked) => setForm(prev => ({ ...prev, conclusao_ta: checked ? 'definitivo' : 'pendente' }))} />
            </div>
          </div>
          <div className="space-y-2"><Label htmlFor="edit-prazo">Prazo para Vistoria</Label><Input id="edit-prazo" type="date" value={form.prazo_vistoria} onChange={(e) => setForm(prev => ({ ...prev, prazo_vistoria: e.target.value }))} /></div>
          <div className="space-y-2"><Label htmlFor="edit-observacoes">Observações Gerais</Label><Textarea id="edit-observacoes" value={form.observacoes} onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))} rows={3} /></div>
          <div className="space-y-2"><Label htmlFor="edit-prevencao">Prevenção de Rompimentos</Label><Textarea id="edit-prevencao" value={form.observacao_prevencao} onChange={(e) => setForm(prev => ({ ...prev, observacao_prevencao: e.target.value }))} rows={3} /></div>
          <div className="space-y-2"><Label htmlFor="edit-definitivo">Reconhecimento como Definitivo</Label><Textarea id="edit-definitivo" value={form.observacao_definitivo} onChange={(e) => setForm(prev => ({ ...prev, observacao_definitivo: e.target.value }))} rows={3} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Alterações'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
