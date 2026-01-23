import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Settings, Camera, AlertCircle } from "lucide-react";
import { FCCFabricante, TensaoDC, FCCData } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const FCC_FABRICANTES: FCCFabricante[] = [
  'ALCATEL', 'ALFA', 'ASCOM', 'DELTA', 'ELTEK', 'EFACEC',
  'EMERSON', 'HUAWEI', 'INTERGY', 'VERTIV', 'ZTE', 'OUTRA'
];

const TENSAO_OPTIONS: TensaoDC[] = ['24V', '48V'];
const UR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Outra'] as const;

interface Step3Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step3FCC({ showErrors = false, validationErrors = [] }: Step3Props) {
  const { data, currentGabinete, updateGabinete } = useChecklist();
  const gabinete = data.gabinetes[currentGabinete];

  if (!gabinete) return null;

  const fabricanteError = showErrors && getFieldError(validationErrors, 'fabricante');
  const tensaoError = showErrors && getFieldError(validationErrors, 'tensaoDC');
  const fotoError = showErrors && getFieldError(validationErrors, 'fcc.fotoPanoramica');

  const updateFCC = (updates: Partial<FCCData>) => {
    updateGabinete(currentGabinete, {
      fcc: { ...gabinete.fcc, ...updates }
    });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          FCC - Gabinete {currentGabinete + 1}
        </span>
      </div>

      <FormCard title="Dados da FCC" icon={<Zap className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Fabricante</Label>
            <Select 
              value={gabinete.fcc.fabricante} 
              onValueChange={(value: FCCFabricante) => updateFCC({ fabricante: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o fabricante" />
              </SelectTrigger>
              <SelectContent>
                {FCC_FABRICANTES.map((fab) => (
                  <SelectItem key={fab} value={fab}>
                    {fab}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tensão DC</Label>
              <Select 
                value={gabinete.fcc.tensaoDC} 
                onValueChange={(value: TensaoDC) => updateFCC({ tensaoDC: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TENSAO_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Consumo DC (W)</Label>
              <Input
                type="number"
                value={gabinete.fcc.consumoDC || ''}
                onChange={(e) => updateFCC({ consumoDC: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Qtd. URs Suportadas</Label>
            <Select 
              value={String(gabinete.fcc.qtdURSuportadas)} 
              onValueChange={(value) => updateFCC({ qtdURSuportadas: value === 'Outra' ? 'Outra' : parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {UR_OPTIONS.map((ur) => (
                  <SelectItem key={ur} value={String(ur)}>
                    {ur}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormCard>

      <FormCard title="Gerenciamento" icon={<Settings className="w-4 h-4" />}>
        <div className="space-y-3">
          <ToggleSwitch
            label="Gerenciada SG Infra"
            value={gabinete.fcc.gerenciadaSG}
            onChange={(value) => updateFCC({ gerenciadaSG: value })}
          />
          <ToggleSwitch
            label="Gerenciável"
            value={gabinete.fcc.gerenciavel}
            onChange={(value) => updateFCC({ gerenciavel: value })}
          />
        </div>
      </FormCard>

      <FormCard title="Fotos FCC" icon={<Camera className="w-4 h-4" />} variant="accent">
        <div className="grid grid-cols-1 gap-4">
          <PhotoCapture
            label="FCC Panorâmica"
            value={gabinete.fcc.fotoPanoramica}
            onChange={(value) => updateFCC({ fotoPanoramica: value })}
            required
            siteCode={data.siglaSite}
            category={`gab${currentGabinete + 1}_fcc_panoramica`}
          />
          <PhotoCapture
            label="Painel de Instrumentos"
            value={gabinete.fcc.fotoPainel}
            onChange={(value) => updateFCC({ fotoPainel: value })}
            required
            siteCode={data.siglaSite}
            category={`gab${currentGabinete + 1}_fcc_painel`}
          />
        </div>
      </FormCard>
    </div>
  );
}
