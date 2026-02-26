import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { FGLayout } from '@/fiber-guardian/components/layout/FGLayout';
import { StatusBadge } from '@/fiber-guardian/components/ui/status-badge';
import { CausaBadge } from '@/fiber-guardian/components/ui/causa-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, MapPin, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { STATUS } from '@/fiber-guardian/lib/constants';

// Fix leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const STATUS_MARKER_COLORS: Record<string, string> = {
  pendente: '#f59e0b',
  enviado: '#3b82f6',
  revisao: '#ef4444',
  concluido: '#22c55e',
};

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
    "></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
}

export default function MapaReparos() {
  const navigate = useNavigate();
  const { reparos, loading } = useReparos();
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const reparosComLocalizacao = useMemo(() => {
    return reparos.filter(r => r.latitude && r.longitude);
  }, [reparos]);

  const filteredReparos = useMemo(() => {
    if (statusFilter === 'todos') return reparosComLocalizacao;
    return reparosComLocalizacao.filter(r => r.status === statusFilter);
  }, [reparosComLocalizacao, statusFilter]);

  const center = useMemo<[number, number]>(() => {
    if (filteredReparos.length === 0) return [-23.55, -46.63]; // São Paulo default
    const avgLat = filteredReparos.reduce((a, r) => a + (r.latitude || 0), 0) / filteredReparos.length;
    const avgLng = filteredReparos.reduce((a, r) => a + (r.longitude || 0), 0) / filteredReparos.length;
    return [avgLat, avgLng];
  }, [filteredReparos]);

  if (loading) {
    return (
      <FGLayout title="Mapa de Reparos" showBack>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FGLayout>
    );
  }

  return (
    <FGLayout title="Mapa de Reparos" showBack>
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos ({reparosComLocalizacao.length})</SelectItem>
            {STATUS.map(s => (
              <SelectItem key={s.value} value={s.value}>
                {s.label} ({reparosComLocalizacao.filter(r => r.status === s.value).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filteredReparos.length} no mapa
        </span>
      </div>

      {reparosComLocalizacao.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhum reparo com localização</p>
            <p className="text-sm mt-1">Capture a localização ao criar um novo registro.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl overflow-hidden border" style={{ height: 'calc(100vh - 260px)', minHeight: '400px' }}>
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredReparos.map(reparo => (
              <Marker
                key={reparo.id}
                position={[reparo.latitude!, reparo.longitude!]}
                icon={createColoredIcon(STATUS_MARKER_COLORS[reparo.status] || '#6b7280')}
              >
                <Popup>
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm">{reparo.ta_titulo}</h3>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <StatusBadge status={reparo.status} />
                      <CausaBadge causa={reparo.causa} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reparo.profiles?.nome || 'Técnico'} • {format(new Date(reparo.criado_em), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </p>
                    {reparo.trecho && (
                      <p className="text-xs">Trecho: {reparo.trecho}</p>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-1"
                      onClick={() => navigate(`/auditoria-ta/reparo/${reparo.id}`)}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" /> Ver detalhes
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        {Object.entries(STATUS_MARKER_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ background: color }} />
            <span className="capitalize">{status}</span>
          </div>
        ))}
      </div>
    </FGLayout>
  );
}
