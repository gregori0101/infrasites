import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listVistoriasComItens, getVistoriaVandalismo, updateVistoriaVandalismo, updateVistoriaItem, deleteVistoriaVandalismo } from '@/lib/vandalismoDatabase';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, ArrowLeft, ShieldAlert, Info, LayoutDashboard, Edit, FileText, X, Save, ImageIcon, Paperclip, Search, Trash2, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SignedImage } from '@/components/ui/signed-image';
import { Lightbox } from "@/components/ui/lightbox";
import { VandalismoVistoriaCompleta } from '@/types/vandalismo';
import { downloadCasePDF, downloadBO } from '@/lib/vandalismoExport';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createColoredIcon(color: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  });
}

export default function VandalismoMapa() {
  const navigate = useNavigate();
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<VandalismoVistoriaCompleta | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [exportingAll, setExportingAll] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; label: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  const { data: vistorias = [], isLoading, refetch } = useQuery({
    queryKey: ['vandalismo_gestor'],
    queryFn: listVistoriasComItens,
    refetchOnWindowFocus: false
  });

  const vistoriasComLocalizacao = useMemo(() => {
    return vistorias.filter(v => v.latitude != null && v.longitude != null);
  }, [vistorias]);

  const filteredData = useMemo(() => {
    if (estadoFilter === 'all') return vistoriasComLocalizacao;
    return vistoriasComLocalizacao.filter(v => v.estado === estadoFilter);
  }, [vistoriasComLocalizacao, estadoFilter]);

  const center = useMemo<[number, number]>(() => {
    if (filteredData.length === 0) return [-2.5, -50.0];
    const avgLat = filteredData.reduce((a, v) => a + (v.latitude || 0), 0) / filteredData.length;
    const avgLng = filteredData.reduce((a, v) => a + (v.longitude || 0), 0) / filteredData.length;
    return [avgLat, avgLng];
  }, [filteredData]);

  const handleSaveEdit = async () => {
    if (!selectedCase) return;
    setIsSaving(true);
    try {
      await updateVistoriaVandalismo(selectedCase.id, {
        siteCode: editForm.site_code,
        descricao: editForm.descricao,
        operadora: editForm.operadora,
        tecnico: editForm.tecnico,
        estado: editForm.estado,
        municipio: editForm.municipio,
        boUrl: editForm.bo_url,
        boNome: editForm.bo_nome,
        fotosOcorrido: editForm.fotos_ocorrido
      });

      for (const item of editForm.itens || []) {
        const original = selectedCase.itens.find(i => i.id === item.id);
        if (original && (
          original.vulneravel !== item.vulneravel || 
          original.observacao !== item.observacao ||
          JSON.stringify(original.fotos) !== JSON.stringify(item.fotos)
        )) {
          await updateVistoriaItem(item.id, item.vulneravel, item.observacao, item.fotos);
        }
      }

      toast.success('Informações atualizadas com sucesso');
      setIsEditing(false);
      refetch();
      const updated = await getVistoriaVandalismo(selectedCase.id);
      setSelectedCase(updated);
    } catch (err: any) {
      toast.error('Erro ao salvar: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };


  const startEditing = () => {
    if (!selectedCase) return;
    setEditForm({
      site_code: selectedCase.site_code,
      descricao: selectedCase.descricao,
      operadora: selectedCase.operadora,
      tecnico: selectedCase.tecnico,
      estado: selectedCase.estado,
      municipio: selectedCase.municipio,
      bo_url: selectedCase.bo_url,
      bo_nome: selectedCase.bo_nome,
      fotos_ocorrido: selectedCase.fotos.map(f => f.url),
      itens: selectedCase.itens.map(i => ({ ...i }))
    });
    setIsEditing(true);
  };


  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta vistoria? Esta ação é irreversível.')) return;
    try {
      await deleteVistoriaVandalismo(id);
      toast.success('Vistoria excluída');
      setSelectedCase(null);
      refetch();
    } catch (err) {
      toast.error('Erro ao excluir');
    }
  };

  const openLightbox = (images: { url: string; label: string }[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando mapa de ocorrências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
      <header className="bg-card border-b px-4 py-4 sticky top-0 z-[1001]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-muted" 
              onClick={() => navigate('/')}
              title="Voltar para Início"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-muted" 
              onClick={() => navigate('/check-vandalismo/gestor')}
              title="Voltar para o Painel"
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mapa de Ocorrências
              </h1>
              <p className="text-xs text-muted-foreground">Localização geográfica dos vandalismos</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-32 h-9">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="z-[1002]">
                <SelectItem value="all">Todos ({vistoriasComLocalizacao.length})</SelectItem>
                {['PA', 'AM', 'MA', 'AP', 'RR'].map(uf => (
                  <SelectItem key={uf} value={uf}>
                    {uf} ({vistoriasComLocalizacao.filter(v => v.estado === uf).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 relative z-0">
        {vistoriasComLocalizacao.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-muted-foreground">
            <div className="max-w-xs">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium text-foreground">Nenhuma coordenada registrada</p>
              <p className="text-sm mt-1">Os registros atuais não possuem dados de GPS (latitude/longitude).</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/check-vandalismo/gestor')}
              >
                Voltar ao Painel
              </Button>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={5}
            className="h-full w-full"
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
            whenReady={() => {
              setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
            }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredData.map(v => (
              <Marker
                key={v.id}
                position={[v.latitude!, v.longitude!]}
                icon={createColoredIcon(v.indiceVulnerabilidade > 50 ? '#ef4444' : v.indiceVulnerabilidade > 20 ? '#f97316' : '#10b981')}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px] p-1 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-primary">{v.site_code}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded border border-slate-200 dark:border-slate-700">{v.estado}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${v.indiceVulnerabilidade > 50 ? 'bg-destructive' : v.indiceVulnerabilidade > 20 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                          style={{ width: `${v.indiceVulnerabilidade}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black">{v.indiceVulnerabilidade.toFixed(0)}%</span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 italic">
                      {v.descricao || 'Sem descrição'}
                    </p>

                    <div className="pt-1 border-t border-border mt-2 space-y-1">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="font-semibold text-foreground">{v.tecnico?.split('@')[0]}</span>
                        <span>•</span>
                        <span>{format(parseISO(v.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        {v.municipio && <span>{v.municipio}</span>}
                        {v.bo_url ? (
                          <Badge className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 border-none text-[8px] h-3.5 px-1 font-bold">BO Anexado</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[8px] bg-destructive/10 text-destructive hover:bg-destructive/10 border-none h-3.5 px-1 font-bold">Sem BO</Badge>
                        )}
                      </div>
                      {v.endereco && (
                        <div className="text-[10px] flex items-start gap-1 text-muted-foreground">
                          <MapPin className="h-2 w-2 mt-0.5 shrink-0" /> 
                          <span className="truncate">{v.endereco}</span>
                        </div>
                      )}
                    </div>


                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full mt-2 h-8 text-[11px] font-bold"
                      onClick={async () => {
                        const full = await getVistoriaVandalismo(v.id);
                        setSelectedCase(full);
                      }}
                    >
                      <ShieldAlert className="h-3 w-3 mr-1.5" /> Detalhes da Ocorrência
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </main>

      <Dialog open={!!selectedCase} onOpenChange={(open) => !open && setSelectedCase(null)}>
        <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 overflow-hidden z-[1005]">
          <DialogHeader className="p-6 pb-2 border-b">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  Vistoria Site: <span className="font-mono text-primary">{selectedCase?.site_code}</span>
                </DialogTitle>
                <DialogDescription>
                  Realizada em {selectedCase ? format(parseISO(selectedCase.created_at), "PPP 'às' HH:mm", { locale: ptBR }) : ''}
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <Button size="sm" variant="outline" onClick={startEditing}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </Button>
                    <Button size="sm" onClick={() => selectedCase && downloadCasePDF(selectedCase.id, selectedCase.site_code)}>
                      <FileText className="h-4 w-4 mr-2" /> PDF
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => selectedCase && handleDelete(selectedCase.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} disabled={isSaving}>
                      <X className="h-4 w-4 mr-2" /> Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                      {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Salvar
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Sigla do Site</label>
                      <Input 
                        value={editForm.site_code} 
                        onChange={(e) => setEditForm({...editForm, site_code: e.target.value})}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Estado (UF)</label>
                      <select
                        value={editForm.estado}
                        onChange={(e) => setEditForm({...editForm, estado: e.target.value})}
                        className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Selecione</option>
                        {['PA', 'AM', 'MA', 'AP', 'RR'].map(uf => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold text-primary">Município</label>
                      <Input 
                        value={editForm.municipio || ''} 
                        onChange={(e) => setEditForm({...editForm, municipio: e.target.value})}
                        className="h-8 text-xs border-primary/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Operadora</label>
                      <Input 
                        value={editForm.operadora || ''} 
                        onChange={(e) => setEditForm({...editForm, operadora: e.target.value})}
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Técnico</label>
                      <Input 
                        value={editForm.tecnico || ''} 
                        onChange={(e) => setEditForm({...editForm, tecnico: e.target.value})}
                        className="h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground uppercase font-bold">Descrição da Ocorrência</label>
                    <textarea 
                      value={editForm.descricao} 
                      onChange={(e) => setEditForm({...editForm, descricao: e.target.value})}
                      className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">BO Status</p>
                      {selectedCase?.bo_url ? (
                        <Badge className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none text-[10px]">Anexado</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] bg-destructive/10 text-destructive border-none">Não anexado</Badge>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Recorrência Site</p>
                      <p className="text-sm font-bold text-primary">{(selectedCase as any)?.totalAnterior || 0} vandalismos anteriores</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Técnico</p>
                      <p className="text-sm font-medium">{selectedCase?.tecnico || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Estado (UF)</p>
                      <p className="text-sm font-medium">{selectedCase?.estado || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Município</p>
                      <p className="text-sm font-medium">{selectedCase?.municipio || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Operadora</p>
                      <p className="text-sm font-medium">{selectedCase?.operadora || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Localização</p>
                      <p className="text-sm font-medium truncate">
                        {selectedCase?.latitude ? `${selectedCase.latitude.toFixed(5)}, ${selectedCase.longitude?.toFixed(5)}` : 'Não capturada'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-bold border-l-4 border-primary pl-2 text-foreground">Descrição da Ocorrência</h4>
                    <div className="bg-muted/30 p-3 rounded-md border border-border text-sm text-foreground whitespace-pre-wrap">
                      {selectedCase?.descricao}
                    </div>
                  </div>
                </>
              )}


              <div className="space-y-3">
                <h4 className="text-sm font-bold border-l-4 border-primary pl-2 text-foreground">Fotos do Ocorrido</h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {selectedCase?.fotos?.map((f, idx) => (
                    <div 
                      key={idx} 
                      className="relative aspect-square rounded-lg border overflow-hidden bg-muted group/foto cursor-pointer" 
                      onClick={() => {
                        const images = selectedCase.fotos.map((img, i) => ({ 
                          url: img.url, 
                          label: `Foto do Ocorrido ${i + 1}` 
                        }));
                        openLightbox(images, idx);
                      }}
                    >
                      <SignedImage 
                        src={f.url} 
                        className="object-cover w-full h-full transition-transform group-hover/foto:scale-105" 
                        alt={`Foto ocorrido ${idx + 1}`} 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  ))}
                  {(!selectedCase?.fotos || selectedCase.fotos.length === 0) && (
                    <div className="col-span-full py-8 text-center bg-muted/20 rounded-lg border border-dashed">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">Nenhuma foto do ocorrido anexada</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold border-l-4 border-destructive pl-2 text-foreground">Vulnerabilidades Identificadas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(isEditing ? editForm.itens : selectedCase?.itens)?.map((i: any, idx: number) => (
                    <div key={idx} className={`flex flex-col p-3 rounded border text-xs ${i.vulneravel ? 'bg-destructive/5 dark:bg-destructive/10 border-destructive/20' : 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20'}`}>
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-foreground">{i.rotulo}</span>
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase font-bold text-muted-foreground">Vulnerável?</span>
                            <button
                              onClick={() => {
                                const newItens = [...editForm.itens];
                                newItens[idx].vulneravel = !newItens[idx].vulneravel;
                                setEditForm({ ...editForm, itens: newItens });
                              }}
                              className={`w-10 h-5 rounded-full relative transition-colors ${i.vulneravel ? 'bg-destructive' : 'bg-emerald-500'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${i.vulneravel ? 'right-1' : 'left-1'}`} />
                            </button>
                          </div>
                        ) : (
                          i.vulneravel ? (
                            <Badge variant="destructive" className="h-5 text-[9px] px-1 ml-2">Vulnerável</Badge>
                          ) : (
                            <Badge className="h-5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-none text-[9px] px-1 ml-2">OK</Badge>
                          )
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {i.fotos.map((foto: string, fIdx: number) => (
                          <div 
                            key={fIdx} 
                            className="relative aspect-square w-12 h-12 rounded border overflow-hidden bg-muted group/foto cursor-pointer"
                            onClick={() => {
                              const images = i.fotos.map((img: string, idx: number) => ({
                                url: img,
                                label: `${i.rotulo} - Foto ${idx + 1}`
                              }));
                              openLightbox(images, fIdx);
                            }}
                          >
                            <SignedImage 
                              src={foto} 
                              className="object-cover w-full h-full transition-transform group-hover/foto:scale-105" 
                              alt={`${i.rotulo} - ${fIdx + 1}`} 
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/foto:opacity-100 transition-opacity">
                              <Search className="h-3 w-3 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>

                      {isEditing ? (
                        <div className="mt-2">
                          <label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Observação</label>
                          <textarea 
                            value={i.observacao || ''}
                            onChange={(e) => {
                              const newItens = [...editForm.itens];
                              newItens[idx].observacao = e.target.value;
                              setEditForm({ ...editForm, itens: newItens });
                            }}
                            className="w-full h-12 p-2 rounded border border-input bg-background text-[10px] focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                            placeholder="Adicione uma observação..."
                          />
                        </div>
                      ) : (
                        i.observacao && <p className="text-[10px] text-muted-foreground mt-1 italic">Obs: {i.observacao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selectedCase?.bo_url && (
                <div className="space-y-2">
                  <h4 className="text-sm font-bold border-l-4 border-primary pl-2">Boletim de Ocorrência</h4>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => downloadBO(selectedCase!.bo_url!, selectedCase!.bo_nome)}>
                    <Paperclip className="h-4 w-4 mr-2" /> {selectedCase.bo_nome || 'Baixar Boletim'}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Lightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />

      <div className="bg-card border-t p-3 flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest relative z-[1001]">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500 border border-white shadow-sm" />
          <span className="text-muted-foreground">Baixo Risco</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-orange-500 border border-white shadow-sm" />
          <span className="text-muted-foreground">Risco Médio</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-destructive border border-white shadow-sm" />
          <span className="text-muted-foreground">Alto Risco</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 ml-4 px-3 py-1 bg-muted/50 rounded-full">
          <Info className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground normal-case font-medium">Clique nos marcadores para detalhes</span>
        </div>
      </div>
    </div>
  );
}
