import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listVistoriasComItens, getVistoriaVandalismo } from '@/lib/vandalismoDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, ArrowLeft, ShieldAlert, Info, LayoutDashboard } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
      width: 24px;
      height: 24px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

export default function VandalismoMapa() {
  const navigate = useNavigate();
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  
  const { data: vistorias = [], isLoading } = useQuery({
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
                  <div className="space-y-2 min-w-[200px] p-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-primary">{v.site_code}</h3>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-muted rounded border">{v.estado}</span>
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
                      onClick={() => navigate('/check-vandalismo/gestor')}
                    >
                      <ShieldAlert className="h-3 w-3 mr-1.5" /> Detalhes no Painel
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </main>

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
