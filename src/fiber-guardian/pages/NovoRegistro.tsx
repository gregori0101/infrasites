import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { useGeolocation } from '@/fiber-guardian/hooks/useGeolocation';
import { FGLayout } from '@/fiber-guardian/components/layout/FGLayout';
import { NovoReparoForm, CausaReparo, ConclusaoTA, CategoriaReparo, TipoRede } from '@/fiber-guardian/types/database';
import { CAUSAS, CONCLUSAO_TA, CATEGORIAS, TIPOS_REDE } from '@/fiber-guardian/lib/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { VoiceInput } from '@/fiber-guardian/components/tecnico/VoiceInput';
import { PhotoPicker } from '@/fiber-guardian/components/ui/photo-picker';
import { MapPin, Send, Save, Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';

export default function NovoRegistro() {
  const navigate = useNavigate();
  const { user } = useFGAuth();
  const { createReparo } = useReparos();
  const geo = useGeolocation();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<NovoReparoForm>({
    ta_titulo: '',
    trecho: '',
    causa: 'causa_desconhecida',
    categoria: 'manutencao',
    tipo_rede: undefined,
    latitude: undefined,
    longitude: undefined,
    conclusao_ta: 'pendente',
    observacoes: '',
    observacao_prevencao: '',
    observacao_definitivo: '',
    tecnicos_reparo: '',
    caixa_bomba: false,
    fotos: { rompimento: [], caixa_emenda: [], caixas_poste: [] },
  });

  const updateField = <K extends keyof NovoReparoForm>(key: K, value: NovoReparoForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleCapturarLocalizacao = () => {
    geo.getCurrentPosition();
  };

  useEffect(() => {
    if (geo.latitude && geo.longitude) {
      setForm(prev => ({ ...prev, latitude: geo.latitude!, longitude: geo.longitude! }));
    }
  }, [geo.latitude, geo.longitude]);

  const handleFileChange = (tipo: 'rompimento' | 'caixa_emenda' | 'caixas_poste', e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setForm(prev => ({
      ...prev,
      fotos: { ...prev.fotos, [tipo]: [...prev.fotos[tipo], ...Array.from(files)] },
    }));
  };

  const handleRemoveFoto = (tipo: 'rompimento' | 'caixa_emenda' | 'caixas_poste', index: number) => {
    setForm(prev => ({
      ...prev,
      fotos: { ...prev.fotos, [tipo]: prev.fotos[tipo].filter((_, i) => i !== index) },
    }));
  };

  const handleSubmit = async (asDraft = false) => {
    if (!form.ta_titulo.trim()) {
      toast.error('Preencha o título da TA');
      return;
    }
    if (form.fotos.caixa_emenda.length === 0 && !asDraft) {
      toast.error('Adicione pelo menos uma foto da caixa de emenda');
      return;
    }
    if (form.fotos.caixas_poste.length === 0 && !asDraft) {
      toast.error('Adicione pelo menos uma foto das caixas no poste');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createReparo(form, asDraft ? 'pendente' : 'enviado');
      if (result.success) {
        toast.success(asDraft ? 'Rascunho salvo!' : 'Reparo enviado com sucesso!');
        navigate('/auditoria-ta');
      } else {
        toast.error(result.error || 'Erro ao salvar');
      }
    } catch {
      toast.error('Erro inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePhotoPicked = (tipo: 'rompimento' | 'caixa_emenda' | 'caixas_poste', files: FileList | null) => {
    if (!files) return;
    setForm(prev => ({
      ...prev,
      fotos: { ...prev.fotos, [tipo]: [...prev.fotos[tipo], ...Array.from(files)] },
    }));
  };

  const renderFotoSection = (tipo: 'rompimento' | 'caixa_emenda' | 'caixas_poste', label: string, required: boolean) => (
    <div className="space-y-2">
      <Label>{label}{required ? ' *' : ' (opcional)'}</Label>
      <PhotoPicker
        onPhotosSelected={(files) => handlePhotoPicked(tipo, files)}
        multiple
      >
        <Button variant="outline" className="w-full justify-center gap-2">
          <Camera className="w-4 h-4" />
          Adicionar foto
        </Button>
      </PhotoPicker>
      {form.fotos[tipo].length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {form.fotos[tipo].map((f, i) => (
            <div key={i} className="relative">
              <img src={URL.createObjectURL(f)} className="h-16 w-16 object-cover rounded" alt="" />
              <button
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 text-xs flex items-center justify-center"
                onClick={() => handleRemoveFoto(tipo, i)}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <FGLayout title="Novo Registro" showBack backTo="/auditoria-ta">
      {/* Dados Principais */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Dados do Reparo</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Título da TA *</Label>
            <Input placeholder="Ex: TA-12345" value={form.ta_titulo} onChange={e => updateField('ta_titulo', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Trecho</Label>
            <Input placeholder="Ex: Trecho A-B" value={form.trecho || ''} onChange={e => updateField('trecho', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Causa *</Label>
            <Select value={form.causa} onValueChange={v => updateField('causa', v as CausaReparo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CAUSAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={form.categoria} onValueChange={v => updateField('categoria', v as CategoriaReparo)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CATEGORIAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Rede</Label>
            <Select value={form.tipo_rede || ''} onValueChange={v => updateField('tipo_rede', (v || undefined) as TipoRede | undefined)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{TIPOS_REDE.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Conclusão TA</Label>
            <Select value={form.conclusao_ta} onValueChange={v => updateField('conclusao_ta', v as ConclusaoTA)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONCLUSAO_TA.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.caixa_bomba} onCheckedChange={v => updateField('caixa_bomba', v)} />
            <Label>Caixa bomba</Label>
          </div>
          <div className="space-y-2">
            <Label>Técnicos no reparo</Label>
            <Input placeholder="Nomes dos técnicos" value={form.tecnicos_reparo || ''} onChange={e => updateField('tecnicos_reparo', e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Localização</CardTitle></CardHeader>
        <CardContent>
          <Button variant="outline" className="w-full" onClick={handleCapturarLocalizacao} disabled={geo.loading}>
            {geo.loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MapPin className="h-4 w-4 mr-2" />}
            {geo.hasLocation ? `${geo.latitude?.toFixed(5)}, ${geo.longitude?.toFixed(5)}` : 'Capturar Localização'}
          </Button>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Observações</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Observações gerais</Label>
            <Textarea placeholder="Descreva o reparo..." value={form.observacoes || ''} onChange={e => updateField('observacoes', e.target.value)} rows={3} />
            <VoiceInput onTranscript={text => updateField('observacoes', (form.observacoes || '') + ' ' + text)} />
          </div>
          <div className="space-y-2">
            <Label>Observação de prevenção</Label>
            <Textarea placeholder="Medidas preventivas..." value={form.observacao_prevencao || ''} onChange={e => updateField('observacao_prevencao', e.target.value)} rows={2} />
          </div>
          {form.conclusao_ta === 'definitivo' && (
            <div className="space-y-2">
              <Label>Observação definitivo</Label>
              <Textarea placeholder="Detalhes da conclusão definitiva..." value={form.observacao_definitivo || ''} onChange={e => updateField('observacao_definitivo', e.target.value)} rows={2} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Fotos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {renderFotoSection('rompimento', 'Foto do rompimento', false)}
          {renderFotoSection('caixa_emenda', 'Foto da caixa de emenda', true)}
          {renderFotoSection('caixas_poste', 'Foto das caixas no poste', true)}
        </CardContent>
      </Card>

      {/* Bottom Actions - positioned above bottom nav */}
      <div className="flex gap-3 pb-2">
        <Button variant="outline" className="flex-1" onClick={() => handleSubmit(true)} disabled={submitting}>
          <Save className="h-4 w-4 mr-2" /> Rascunho
        </Button>
        <Button className="flex-1" onClick={() => handleSubmit(false)} disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
          Enviar
        </Button>
      </div>
    </FGLayout>
  );
}
