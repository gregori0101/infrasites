import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FileText,
  Loader2,
  MapPin,
  Paperclip,
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

export default function CheckVandalismo() {
  const navigate = useNavigate();
  const { user, userOperadora, isAdmin, isGestor } = useAuth();
  const boInputRef = useRef<HTMLInputElement>(null);

  const [siteCode, setSiteCode] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotosOcorrido, setFotosOcorrido] = useState<string[]>([]);
  const [itens, setItens] = useState<Record<string, VandalismoItemState>>(initialItens);
  const [qtdGabinetes, setQtdGabinetes] = useState(1);
  const [geo, setGeo] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [boFile, setBoFile] = useState<{ url: string; nome: string } | null>(null);
  const [uploadingBO, setUploadingBO] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const visibleItens = useMemo(
    () => VANDALISMO_ITENS.filter((i) => !i.gabineteOpcional || i.gabineteOpcional <= qtdGabinetes),
    [qtdGabinetes],
  );

  const vulneraveisCount = visibleItens.filter((i) => itens[i.key]?.vulneravel).length;
  const preenchidosCount = visibleItens.filter((i) => (itens[i.key]?.fotos.length ?? 0) >= i.minFotos).length;

  const captureGeo = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização indisponível neste dispositivo');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        toast.success('Localização capturada');
      },
      () => toast.error('Não foi possível obter a localização'),
      { enableHighAccuracy: true, timeout: 15000 },
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
        descricao,
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
    setDescricao('');
    setFotosOcorrido([]);
    setItens(initialItens());
    setBoFile(null);
    setGeo({ latitude: null, longitude: null });
    setSavedId(null);
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-20 bg-primary text-primary-foreground shadow-md">
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
            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px]">
              <ShieldCheck className="h-3 w-3 mr-1" />
              {preenchidosCount}/{visibleItens.length}
            </Badge>
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
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={captureGeo}>
                  <MapPin className="h-4 w-4 mr-2" /> Capturar GPS
                </Button>
                {geo.latitude != null && (
                  <span className="text-xs text-muted-foreground">
                    {geo.latitude.toFixed(5)}, {geo.longitude?.toFixed(5)}
                  </span>
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
          {savedId && (
            <Button variant="outline" size="lg" onClick={handleGeneratePDF} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
              Relatório
            </Button>
          )}
        </div>
      </div>

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
