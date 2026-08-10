import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  LayoutDashboard,
  Loader2,
  MapPin,
  Paperclip,
  RotateCcw,
  Save,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VandalismoPhotoGrid } from '@/components/vandalismo/VandalismoPhotoGrid';
import { VandalismoChecklistItem } from '@/components/vandalismo/VandalismoChecklistItem';
import { saveVistoriaVandalismo, getVistoriaVandalismo } from '@/lib/vandalismoDatabase';
import { generateVandalismoPDF } from '@/lib/generateVandalismoPDF';
import {
  VANDALISMO_GRUPOS,
  VANDALISMO_ITENS,
  VANDALISMO_MAX_FOTOS_OCORRIDO,
  VANDALISMO_MIN_FOTOS_OCORRIDO,
  VandalismoItemState,
} from '@/types/vandalismo';

const initialItens = (): Record<string, VandalismoItemState> =>
  Object.fromEntries(VANDALISMO_ITENS.map((i) => [i.key, { vulneravel: false, fotos: [] }]));

const DRAFT_KEY = 'vandalismo_draft_v1';

interface VandalismoDraft {
  siteCode: string;
  estado: string;
  descricao: string;
  municipio: string;
  fotosOcorrido: string[];
  itens: Record<string, VandalismoItemState>;
  qtdGabinetes: number;
  geo: { latitude: number | null; longitude: number | null };
  gpsStatus: 'idle' | 'loading' | 'success' | 'error';
  gpsError: string | null;
  boFile: { url: string; nome: string } | null;
  savedAt: string;
}

function loadDraft(): VandalismoDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VandalismoDraft;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export default function CheckVandalismo() {
  const navigate = useNavigate();
  const { user, userOperadora, isAdmin, isGestor } = useAuth();
  const boInputRef = useRef<HTMLInputElement>(null);
  const draftRef = useRef<VandalismoDraft | null>(loadDraft());
  const draft = draftRef.current;

  const [siteCode, setSiteCode] = useState(draft?.siteCode ?? '');
  const [estado, setEstado] = useState(draft?.estado ?? '');
  const [descricao, setDescricao] = useState(draft?.descricao ?? '');
  const [municipio, setMunicipio] = useState(draft?.municipio ?? '');
  const [fotosOcorrido, setFotosOcorrido] = useState<string[]>(draft?.fotosOcorrido ?? []);
  const [itens, setItens] = useState<Record<string, VandalismoItemState>>(
    () => ({ ...initialItens(), ...(draft?.itens ?? {}) }),
  );
  const [qtdGabinetes, setQtdGabinetes] = useState(draft?.qtdGabinetes ?? 1);
  const [geo, setGeo] = useState<{ latitude: number | null; longitude: number | null }>(
    draft?.geo ?? { latitude: null, longitude: null },
  );
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    draft?.gpsStatus === 'loading' ? 'idle' : (draft?.gpsStatus ?? 'idle'),
  );
  const [gpsError, setGpsError] = useState<string | null>(draft?.gpsError ?? null);
  const [boFile, setBoFile] = useState<{ url: string; nome: string } | null>(draft?.boFile ?? null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [draftRestored, setDraftRestored] = useState(!!draft);
  const [uploadingBO, setUploadingBO] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Restore notice
  useEffect(() => {
    if (draftRestored) {
      toast.info('Rascunho restaurado', { description: 'Os dados preenchidos anteriormente foram recuperados.' });
      setDraftRestored(false);
    }
  }, [draftRestored]);

  // Persist draft on every change so a page reload never loses the checklist
  useEffect(() => {
    const payload: VandalismoDraft = {
      siteCode,
      estado,
      descricao,
      municipio,
      fotosOcorrido,
      itens,
      qtdGabinetes,
      geo,
      gpsStatus,
      gpsError,
      boFile,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('[Vandalismo] Falha ao salvar rascunho local', err);
    }
  }, [siteCode, estado, descricao, municipio, fotosOcorrido, itens, qtdGabinetes, geo, gpsStatus, gpsError, boFile]);

  const visibleItens = useMemo(
    () => VANDALISMO_ITENS.filter((i) => !i.gabineteOpcional || i.gabineteOpcional <= qtdGabinetes),
    [qtdGabinetes],
  );

  const vulneraveisCount = visibleItens.filter((i) => i.key !== 'placa_site' && itens[i.key]?.vulneravel).length;
  const preenchidosCount = visibleItens.filter((i) => (itens[i.key]?.fotos.length ?? 0) >= i.minFotos).length;

  const captureGeo = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Geolocalização indisponível neste dispositivo. Informe o município manualmente.');
      toast.error('Geolocalização indisponível neste dispositivo');
      return;
    }

    setGpsStatus('loading');
    setGpsError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeo({ latitude, longitude });
        toast.success('Localização capturada');

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || data.address?.suburb;
          if (city) {
            setMunicipio(city);
            setGpsStatus('success');
            setGpsError(null);
            toast.info(`Município identificado: ${city}`);
          } else {
            setGpsStatus('error');
            setGpsError('Não foi possível identificar o município pela localização. Informe manualmente.');
            toast.warning('Município não identificado automaticamente. Por favor, preencha manualmente.');
          }
        } catch (err) {
          console.warn('Falha ao obter município via reverse geocode', err);
          setGpsStatus('error');
          setGpsError('Erro ao consultar o município pela localização. Informe manualmente.');
          toast.warning('Erro ao identificar município. Por favor, preencha manualmente.');
        }
      },
      (error) => {
        let msg = 'Não foi possível obter a localização';
        if (error.code === 1) msg = 'Permissão de localização negada. Por favor, preencha o município manualmente.';
        else if (error.code === 2) msg = 'Posição indisponível. Por favor, preencha o município manualmente.';
        else if (error.code === 3) msg = 'Tempo esgotado ao obter localização. Por favor, preencha o município manualmente.';

        setGpsStatus('error');
        setGpsError(msg);
        toast.error(msg);
      },
      options
    );
  };

  const handleBOUpload = async (file: File | null) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Arquivo muito grande (máx. 15MB)');
      return;
    }
    setUploadingBO(true);
    try {
      const ext = file.name.split('.').pop() || 'pdf';
      const path = `vandalismo/${(siteCode || 'SEM_SITE').toUpperCase()}/bo_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('report-photos').upload(path, file, {
        contentType: file.type || 'application/octet-stream',
        upsert: true,
      });
      if (error) throw error;
      setBoFile({ url: path, nome: file.name });
      toast.success('Boletim de Ocorrência anexado');
    } catch (err) {
      toast.error('Falha ao anexar BO', { description: (err as Error).message });
    } finally {
      setUploadingBO(false);
    }
  };

  const validate = (): string | null => {
    if (!estado) return 'Selecione o Estado.';
    if (!municipio.trim())
      return gpsStatus === 'error'
        ? 'O município é obrigatório. Preencha manualmente no campo indicado.'
        : 'Capture o GPS para identificar o município.';
    if (!siteCode.trim()) return 'Informe a sigla do site.';
    if (descricao.trim().length < 10) return 'Descreva o vandalismo/furto com pelo menos 10 caracteres.';
    if (fotosOcorrido.length < VANDALISMO_MIN_FOTOS_OCORRIDO)
      return `Adicione no mínimo ${VANDALISMO_MIN_FOTOS_OCORRIDO} fotos do ocorrido.`;
    if (fotosOcorrido.length > VANDALISMO_MAX_FOTOS_OCORRIDO)
      return `Máximo de ${VANDALISMO_MAX_FOTOS_OCORRIDO} fotos do ocorrido.`;
    const pendente = visibleItens.find((i) => (itens[i.key]?.fotos.length ?? 0) < i.minFotos);
    if (pendente) return `Fotos pendentes em: ${pendente.rotulo}`;
    return null;
  };

  const handleSave = async () => {
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      const id = await saveVistoriaVandalismo({
        siteCode,
        estado,
        descricao,
        municipio,
        operadora: userOperadora ?? null,
        latitude: geo.latitude,
        longitude: geo.longitude,
        endereco: null,
        boUrl: boFile?.url ?? null,
        boNome: boFile?.nome ?? null,
        tecnico: user?.email ?? null,
        fotosOcorrido,
        itens,
      });
      setSavedId(id);
      clearDraft();
      toast.success('Vistoria salva com sucesso');
    } catch (err) {
      toast.error('Erro ao salvar vistoria', { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!savedId) return;
    setGenerating(true);
    try {
      const vistoria = await getVistoriaVandalismo(savedId);
      if (!vistoria) throw new Error('Vistoria não encontrada');
      const blob = await generateVandalismoPDF(vistoria);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Vandalismo_${vistoria.site_code}_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      toast.error('Erro ao gerar relatório', { description: (err as Error).message });
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setSiteCode('');
    setEstado('');
    setMunicipio('');
    setDescricao('');
    setFotosOcorrido([]);
    setItens(initialItens());
    setBoFile(null);
    setGeo({ latitude: null, longitude: null });
    setGpsStatus('idle');
    setGpsError(null);
    setSavedId(null);
    setQtdGabinetes(1);
    clearDraft();
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 bg-primary text-primary-foreground shadow-md dark:border-b dark:border-primary/20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-base font-bold truncate">Check Vandalismo</h1>
            <p className="text-xs opacity-80">Vistoria de estações vandalizadas</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="destructive" className="text-[10px]">
              <ShieldAlert className="h-3 w-3 mr-1" />
              {vulneraveisCount}
            </Badge>
            <Badge className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-[10px] border-none">
              <ShieldCheck className="h-3 w-3 mr-1" />
              {preenchidosCount}/{visibleItens.length}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-white/20"
              onClick={() => setConfirmReset(true)}
              title="Zerar e iniciar novo relatório"
            >
              <RotateCcw className="h-5 w-5" />
            </Button>
            {(isAdmin || isGestor) && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary-foreground hover:bg-white/20"
                onClick={() => navigate('/check-vandalismo/gestor')}
                title="Painel Gestor"
              >
                <LayoutDashboard className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5 space-y-6">
        {/* Seção 1 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">1. Identificação e Registro do Vandalismo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado (UF) *</Label>
                <select
                  id="estado"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione...</option>
                  {['PA', 'AM', 'MA', 'AP', 'RR'].map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site">Sigla do Site *</Label>
                <Input
                  id="site"
                  value={siteCode}
                  onChange={(e) => setSiteCode(e.target.value.toUpperCase())}
                  placeholder="Ex: PACRE"
                  autoCapitalize="characters"
                />
              </div>
            </div>
            
            {gpsStatus === 'success' && municipio && (
              <div className="space-y-1">
                <Label>Município</Label>
                <div className="flex items-center gap-2 rounded-md border p-2 bg-muted/40">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{municipio}</span>
                  <Badge variant="secondary" className="ml-auto text-[10px]">GPS</Badge>
                </div>
              </div>
            )}

            {gpsStatus === 'error' && (
              <div className="space-y-2 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-xs text-destructive font-medium">{gpsError ?? 'Falha na geolocalização.'}</p>
                </div>
                <Label htmlFor="municipio">Município (manual) *</Label>
                <Input
                  id="municipio"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  placeholder="Ex: Manaus"
                  className={!municipio ? 'border-destructive' : ''}
                />
                <Button variant="outline" size="sm" onClick={captureGeo}>
                  <MapPin className="h-4 w-4 mr-2" /> Tentar GPS novamente
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="descricao">O que foi vandalizado e/ou furtado? *</Label>
              <Textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva detalhadamente o ocorrido..."
                rows={6}
                maxLength={4000}
              />
              <p className="text-xs text-muted-foreground text-right">{descricao.length}/4000</p>
            </div>

            <div className="space-y-2">
              <Label>
                Fotos do ocorrido * (mín. {VANDALISMO_MIN_FOTOS_OCORRIDO}, máx. {VANDALISMO_MAX_FOTOS_OCORRIDO})
              </Label>
              <VandalismoPhotoGrid
                value={fotosOcorrido}
                onChange={setFotosOcorrido}
                category="vandalismo_ocorrido"
                siteCode={siteCode || undefined}
                max={VANDALISMO_MAX_FOTOS_OCORRIDO}
              />
              {fotosOcorrido.length < VANDALISMO_MIN_FOTOS_OCORRIDO && (
                <p className="text-xs text-destructive">
                  Faltam {VANDALISMO_MIN_FOTOS_OCORRIDO - fotosOcorrido.length} foto(s).
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Boletim de Ocorrência (PDF ou imagem)</Label>
              {boFile ? (
                <div className="flex items-center gap-2 rounded-md border p-2 bg-muted/40">
                  <Paperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate flex-1">{boFile.nome}</span>
                  <Button variant="ghost" size="icon" onClick={() => setBoFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button variant="outline" disabled={uploadingBO} onClick={() => boInputRef.current?.click()}>
                  {uploadingBO ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Paperclip className="h-4 w-4 mr-2" />}
                  Anexar BO
                </Button>
              )}
              <input
                ref={boInputRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  handleBOUpload(e.target.files?.[0] ?? null);
                  e.target.value = '';
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Localização</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={captureGeo} disabled={gpsStatus === 'loading'}>
                  {gpsStatus === 'loading' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4 mr-2" />
                  )}
                  {gpsStatus === 'loading' ? 'Obtendo GPS...' : 'Capturar GPS'}
                </Button>
                {geo.latitude != null && (
                  <span className="text-xs text-muted-foreground">
                    {geo.latitude.toFixed(5)}, {geo.longitude?.toFixed(5)}
                  </span>
                )}
                {gpsStatus === 'error' && (
                  <Badge variant="destructive" className="text-[10px]">Falha no GPS</Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">2. Vulnerabilidade do Site</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qtdGab">Quantidade de gabinetes no site</Label>
              <Input
                id="qtdGab"
                type="number"
                min={1}
                max={4}
                value={qtdGabinetes}
                onChange={(e) => setQtdGabinetes(Math.min(4, Math.max(1, Number(e.target.value) || 1)))}
                className="w-24"
              />
            </div>

            {VANDALISMO_GRUPOS.map((grupo) => {
              const grupoItens = visibleItens.filter((i) => i.grupo === grupo);
              if (grupoItens.length === 0) return null;
              return (
                <div key={grupo} className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{grupo}</h3>
                  {grupoItens.map((def) => (
                    <VandalismoChecklistItem
                      key={def.key}
                      def={def}
                      state={itens[def.key]}
                      siteCode={siteCode || undefined}
                      onChange={(next) => setItens((prev) => ({ ...prev, [def.key]: next }))}
                    />
                  ))}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 inset-x-0 border-t bg-background/95 backdrop-blur px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <Button className="flex-1" size="lg" onClick={handleSave} disabled={saving || !!savedId}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {savedId ? 'Vistoria salva' : 'Finalizar e Salvar Vistoria'}
          </Button>
          <Button variant="outline" size="lg" onClick={() => setConfirmReset(true)} disabled={saving}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Novo
          </Button>
          {savedId && (
            <Button variant="outline" size="lg" onClick={handleGeneratePDF} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Relatório
            </Button>
          )}
        </div>
      </div>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Iniciar novo relatório?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados preenchidos (incluindo o rascunho salvo neste dispositivo) serão apagados. As fotos já
              enviadas permanecem no armazenamento, mas serão removidas deste formulário.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                resetForm();
                setConfirmReset(false);
                toast.success('Novo relatório iniciado');
              }}
            >
              Zerar e começar novo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!savedId} onOpenChange={(open) => !open && setSavedId(savedId)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Vistoria registrada</AlertDialogTitle>
            <AlertDialogDescription>
              Os dados foram salvos. Deseja gerar o Relatório de Vandalismo e Vulnerabilidades agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={resetForm}>Nova vistoria</AlertDialogCancel>
            <AlertDialogAction onClick={handleGeneratePDF} disabled={generating}>
              Gerar relatório
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
