import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { ChipSelect } from "@/components/ui/chip-select";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Server, Radio, Wifi, AlertCircle, Camera } from "lucide-react";
import { GabineteType, TecnologiaAcesso, TecnologiaTransporte } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const GABINETE_TYPES: GabineteType[] = [
  'CONTAINER', 'SHARING', 'HUAWEI 3012', 'HUAWEI APM30', 'HUAWEI APM5930',
  'HUAWEI MTS9000A', 'ILLIS-194', 'INDOOR MINI SHELTER 2X2', 'OUTDOOR'
];

const TECNOLOGIAS_ACESSO: TecnologiaAcesso[] = ['2G', '3G', '4G', '5G'];
const TECNOLOGIAS_TRANSPORTE: TecnologiaTransporte[] = ['DWDM', 'GPON', 'HL4', 'HL5D', 'HL5G', 'PDH', 'SDH', 'GWS', 'GWD', 'SWA'];

interface Step2Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step2Gabinete({ showErrors = false, validationErrors = [] }: Step2Props) {
  const { data, currentGabinete, updateGabinete } = useChecklist();
  const gabinete = data.gabinetes[currentGabinete];

  if (!gabinete) return null;

  const tipoError = showErrors && getFieldError(validationErrors, 'tipo');
  const acessoError = showErrors && getFieldError(validationErrors, 'tecnologiasAcesso');

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-center">
        <span className="text-sm font-medium text-primary">
          Gabinete {currentGabinete + 1} de {data.qtdGabinetes}
        </span>
      </div>

      <FormCard title="Tipo de Gabinete" icon={<Server className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo do Gabinete</Label>
            <Select 
              value={gabinete.tipo} 
              onValueChange={(value: GabineteType) => updateGabinete(currentGabinete, { tipo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {GABINETE_TYPES.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ToggleSwitch
            label="Com Proteção"
            description="Tranca ou cadeado instalado"
            value={gabinete.comProtecao}
            onChange={(value) => updateGabinete(currentGabinete, { comProtecao: value })}
          />
        </div>
      </FormCard>

      <FormCard title="Tecnologias de Acesso" icon={<Radio className="w-4 h-4" />}>
        <ChipSelect
          label="Selecione as tecnologias ativas"
          options={TECNOLOGIAS_ACESSO}
          value={gabinete.tecnologiasAcesso}
          onChange={(value) => updateGabinete(currentGabinete, { tecnologiasAcesso: value })}
        />
      </FormCard>

      <FormCard title="Tecnologias de Transporte" icon={<Wifi className="w-4 h-4" />}>
        <ChipSelect
          label="Selecione as tecnologias ativas"
          options={TECNOLOGIAS_TRANSPORTE}
          value={gabinete.tecnologiasTransporte}
          onChange={(value) => updateGabinete(currentGabinete, { tecnologiasTransporte: value })}
        />
      </FormCard>

      <FormCard title="Fotos do Gabinete" icon={<Camera className="w-4 h-4" />} variant="accent">
        <div className="space-y-4">
          <PhotoCapture
            label="Vista Panorâmica do Gabinete"
            value={gabinete.fotoPanoramicaGabinete}
            onChange={(value) => updateGabinete(currentGabinete, { fotoPanoramicaGabinete: value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Capture uma foto panorâmica externa do gabinete
          </p>
          
          <PhotoCapture
            label="Equipamentos de Transmissão (gabinete aberto)"
            value={gabinete.fotoTransmissao}
            onChange={(value) => updateGabinete(currentGabinete, { fotoTransmissao: value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Capture uma foto clara dos equipamentos de transmissão com o gabinete aberto
          </p>
          
          <PhotoCapture
            label="Equipamentos de Acesso (gabinete aberto)"
            value={gabinete.fotoAcesso}
            onChange={(value) => updateGabinete(currentGabinete, { fotoAcesso: value })}
            required
          />
          <p className="text-xs text-muted-foreground">
            Capture uma foto clara dos equipamentos de acesso com o gabinete aberto
          </p>
        </div>
      </FormCard>
    </div>
  );
}
