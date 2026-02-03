import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Image, History, Loader2, Navigation, CheckCircle2 } from "lucide-react";
import { UF, GeolocalizacaoData } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { usePreviousReport } from "@/hooks/use-previous-report";
import { PrefillDialog } from "@/components/ui/prefill-dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const UF_OPTIONS: UF[] = ['PA', 'AM', 'MA', 'RR', 'AP'];

interface Step1Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step1DadosSite({ showErrors = false, validationErrors = [] }: Step1Props) {
  const { data, updateData, loadFromPreviousReport } = useChecklist();
  const { 
    isLoading: isCheckingPrevious, 
    previousChecklistData, 
    lastInspectionDate,
    checkForPreviousReport,
    clearPreviousReport,
  } = usePreviousReport();
  
  const [showPrefillDialog, setShowPrefillDialog] = React.useState(false);
  const [hasShownDialogForSite, setHasShownDialogForSite] = React.useState<string | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = React.useState(false);

  const captureGeolocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada', {
        description: 'Seu navegador não suporta geolocalização.',
      });
      return;
    }

    setIsCapturingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Try to get address via reverse geocoding
        let endereco: string | null = null;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'pt-BR',
              },
            }
          );
          const data = await response.json();
          if (data.display_name) {
            endereco = data.display_name;
          }
        } catch (err) {
          console.error('Erro ao obter endereço:', err);
        }

        const geoData: GeolocalizacaoData = {
          latitude,
          longitude,
          endereco,
          capturadoEm: new Date().toISOString(),
        };

        updateData('geolocalizacao', geoData);
        setIsCapturingLocation(false);
        
        toast.success('Localização capturada!', {
          description: endereco 
            ? `${endereco.slice(0, 60)}...` 
            : `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
        });
      },
      (error) => {
        setIsCapturingLocation(false);
        let message = 'Erro ao capturar localização';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permissão de localização negada';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Localização indisponível';
            break;
          case error.TIMEOUT:
            message = 'Tempo esgotado ao capturar localização';
            break;
        }
        toast.error(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSiglaChange = (value: string) => {
    const formatted = value.toUpperCase().slice(0, 5);
    updateData('siglaSite', formatted);
    
    // When site code is complete, check for previous reports
    if (formatted.length === 5 && formatted !== hasShownDialogForSite) {
      checkForPreviousReport(formatted);
    } else if (formatted.length < 5) {
      clearPreviousReport();
    }
  };

  // Show dialog when previous report is found
  React.useEffect(() => {
    if (previousChecklistData && data.siglaSite.length === 5 && hasShownDialogForSite !== data.siglaSite) {
      setShowPrefillDialog(true);
      setHasShownDialogForSite(data.siglaSite);
    }
  }, [previousChecklistData, data.siglaSite, hasShownDialogForSite]);

  const handleUsePreviousData = () => {
    if (previousChecklistData) {
      loadFromPreviousReport(previousChecklistData);
      toast.success('Dados da vistoria anterior carregados!', {
        description: 'Todos os dados e fotos foram carregados. Apenas a assinatura precisa ser capturada novamente.',
      });
    }
    setShowPrefillDialog(false);
  };

  const handleStartFresh = () => {
    setShowPrefillDialog(false);
    clearPreviousReport();
  };

  const isSiglaValid = data.siglaSite.length === 5;
  const siglaError = showErrors && getFieldError(validationErrors, 'siglaSite');
  const ufError = showErrors && getFieldError(validationErrors, 'uf');
  const fotoError = showErrors && getFieldError(validationErrors, 'fotoPanoramica');

  return (
    <div className="space-y-4 animate-slide-up">
      <FormCard title="Identificação do Site" icon={<MapPin className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sigla">
              Sigla SCIENCE SITE <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="sigla"
                value={data.siglaSite}
                onChange={(e) => handleSiglaChange(e.target.value)}
                placeholder="Ex: PACRE"
                maxLength={5}
                className={cn(
                  "uppercase font-mono text-lg tracking-wider pr-16",
                  data.siglaSite.length > 0 && !isSiglaValid 
                    ? 'border-destructive focus-visible:ring-destructive' 
                    : isSiglaValid 
                    ? 'border-success focus-visible:ring-success' 
                    : ''
                )}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isCheckingPrevious && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
                {previousChecklistData && isSiglaValid && !isCheckingPrevious && (
                  <span title="Dados anteriores disponíveis">
                    <History className="h-4 w-4 text-primary" />
                  </span>
                )}
                <span className={cn(
                  "text-xs font-medium",
                  isSiglaValid ? 'text-success' : 'text-muted-foreground'
                )}>
                  {data.siglaSite.length}/5
                </span>
              </div>
            </div>
            {data.siglaSite.length > 0 && !isSiglaValid && (
              <p className="text-xs text-destructive">A sigla deve ter exatamente 5 caracteres</p>
            )}
            {previousChecklistData && isSiglaValid && !isCheckingPrevious && (
              <p className="text-xs text-primary flex items-center gap-1">
                <History className="h-3 w-3" />
                Este site possui dados de vistoria anterior
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">
              UF <span className="text-destructive">*</span>
            </Label>
            <Select value={data.uf} onValueChange={(value: UF) => updateData('uf', value)}>
              <SelectTrigger id="uf">
                <SelectValue placeholder="Selecione a UF" />
              </SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormCard>

      <FormCard title="Localização GPS" icon={<Navigation className="w-4 h-4" />}>
        <div className="space-y-4">
          <Button
            type="button"
            variant={data.geolocalizacao?.latitude ? "outline" : "default"}
            className="w-full"
            onClick={captureGeolocation}
            disabled={isCapturingLocation}
          >
            {isCapturingLocation ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Capturando localização...
              </>
            ) : data.geolocalizacao?.latitude ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                Atualizar Localização
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Capturar Localização do Site
              </>
            )}
          </Button>

          {data.geolocalizacao?.latitude && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                <span className="font-medium">Coordenadas:</span>
                <span className="text-muted-foreground">
                  {data.geolocalizacao.latitude.toFixed(6)}, {data.geolocalizacao.longitude?.toFixed(6)}
                </span>
              </div>
              {data.geolocalizacao.endereco && (
                <div className="text-muted-foreground text-xs leading-relaxed">
                  📍 {data.geolocalizacao.endereco}
                </div>
              )}
              {data.geolocalizacao.capturadoEm && (
                <div className="text-xs text-muted-foreground/70">
                  Capturado em: {new Date(data.geolocalizacao.capturadoEm).toLocaleString('pt-BR')}
                </div>
              )}
            </div>
          )}
        </div>
      </FormCard>

      <FormCard title="Configuração do Site" icon={<Building2 className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qtd">
              Quantidade de Gabinetes <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => updateData('qtdGabinetes', num)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                    data.qtdGabinetes === num
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FormCard>

      <FormCard title="Foto Panorâmica" icon={<Image className="w-4 h-4" />} variant="accent">
        <PhotoCapture
          label="Vista geral do site"
          value={data.fotoPanoramica}
          onChange={(value) => updateData('fotoPanoramica', value)}
          required
          siteCode={data.siglaSite}
          category="site_panoramica"
        />
      </FormCard>

      {/* Prefill Dialog */}
      <PrefillDialog
        open={showPrefillDialog}
        onOpenChange={setShowPrefillDialog}
        siteCode={data.siglaSite}
        lastInspectionDate={lastInspectionDate}
        onUsePreviousData={handleUsePreviousData}
        onStartFresh={handleStartFresh}
      />
    </div>
  );
}
