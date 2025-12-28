import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fuel, Radio, Shield, AlertCircle } from "lucide-react";
import { StatusFuncionamento, GMGData, TorreData, FCCFabricante } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: StatusFuncionamento[] = ['OK', 'NOK', 'NA'];
const FCC_FABRICANTES: FCCFabricante[] = [
  'ALCATEL', 'ALFA', 'ASCOM', 'DELTA', 'ELTEK', 'EFACEC',
  'EMERSON', 'HUAWEI', 'INTERGY', 'VERTIV', 'ZTE', 'OUTRA'
];

interface Step9Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step9GMGTorre({ showErrors = false, validationErrors = [] }: Step9Props) {
  const fotoNinhosError = showErrors && getFieldError(validationErrors, 'fotoNinhos');
  const { data, updateData } = useChecklist();

  const updateGMG = (updates: Partial<GMGData>) => {
    updateData('gmg', { ...data.gmg, ...updates });
  };

  const updateTorre = (updates: Partial<TorreData>) => {
    updateData('torre', { ...data.torre, ...updates });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <FormCard title="GMG - Grupo Motor Gerador" icon={<Fuel className="w-4 h-4" />}>
        <div className="space-y-4">
          <ToggleSwitch
            label="Informar dados do GMG"
            description="Site possui grupo gerador"
            value={data.gmg.informar}
            onChange={(value) => updateGMG({ informar: value })}
          />

          {data.gmg.informar && (
            <div className="space-y-4 pt-2 animate-slide-up">
              <div className="space-y-2">
                <Label>Fabricante</Label>
                <Select
                  value={data.gmg.fabricante || ''}
                  onValueChange={(value: FCCFabricante) => updateGMG({ fabricante: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {FCC_FABRICANTES.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Potência (kVA)</Label>
                  <input
                    type="number"
                    value={data.gmg.potencia || ''}
                    onChange={(e) => updateGMG({ potencia: parseInt(e.target.value) || undefined })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Autonomia (h)</Label>
                  <input
                    type="number"
                    value={data.gmg.autonomia || ''}
                    onChange={(e) => updateGMG({ autonomia: parseInt(e.target.value) || undefined })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateGMG({ status })}
                      className={`flex-1 py-2 text-sm font-medium rounded-md border transition-all ${
                        data.gmg.status === status
                          ? status === 'OK'
                            ? 'bg-success text-success-foreground border-success'
                            : status === 'NOK'
                            ? 'bg-destructive text-destructive-foreground border-destructive'
                            : 'bg-muted text-muted-foreground border-muted'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </FormCard>

      <FormCard title="Torre e Ninhos" icon={<Radio className="w-4 h-4" />}>
        <div className="space-y-4">
          <ToggleSwitch
            label="Ninhos na Torre"
            description="Presença de ninhos de pássaros"
            value={data.torre.ninhos}
            onChange={(value) => updateTorre({ ninhos: value })}
          />

          {data.torre.ninhos && (
            <div className="animate-slide-up">
              <PhotoCapture
                label="Foto dos ninhos"
                value={data.torre.fotoNinhos || null}
                onChange={(value) => updateTorre({ fotoNinhos: value })}
                required
              />
            </div>
          )}

          <ToggleSwitch
            label="Fibras Protegidas"
            description="Proteção contra caturritas"
            value={data.torre.fibrasProtegidas}
            onChange={(value) => updateTorre({ fibrasProtegidas: value })}
          />
        </div>
      </FormCard>

      <FormCard title="Infraestrutura" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Aterramento</Label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => updateTorre({ aterramento: status })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md border transition-all ${
                    data.torre.aterramento === status
                      ? status === 'OK'
                        ? 'bg-success text-success-foreground border-success'
                        : status === 'NOK'
                        ? 'bg-destructive text-destructive-foreground border-destructive'
                        : 'bg-muted text-muted-foreground border-muted'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zeladoria</Label>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => updateTorre({ zeladoria: status })}
                  className={`flex-1 py-2 text-sm font-medium rounded-md border transition-all ${
                    data.torre.zeladoria === status
                      ? status === 'OK'
                        ? 'bg-success text-success-foreground border-success'
                        : status === 'NOK'
                        ? 'bg-destructive text-destructive-foreground border-destructive'
                        : 'bg-muted text-muted-foreground border-muted'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
