import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Fan, Thermometer, Plus, Trash2, Camera, AlertCircle } from "lucide-react";
import { ClimatizacaoTipo, ACModelo, StatusFuncionamento, ArCondicionado, ClimatizacaoData } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const CLIMATIZACAO_TIPOS: ClimatizacaoTipo[] = ['AR CONDICIONADO', 'FAN', 'NA'];
const AC_MODELOS: ACModelo[] = [
  'SPLIT 12 KBTU', 'SPLIT 18 KBTU', 'SPLIT 24 KBTU', 'SPLIT 30 KBTU', 'SPLIT 36 KBTU', 'SPLIT 60 KBTU',
  'WALL MOUNTED 24', 'WALL MOUNTED 36', 'WALL MOUNTED 60', 'JANELA 30', 'NA'
];
const STATUS_OPTIONS: StatusFuncionamento[] = ['OK', 'NOK', 'NA'];

const EMPTY_AC: ArCondicionado = {
  modelo: 'NA',
  funcionamento: 'OK'
};

interface Step5Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step5Climatizacao({ showErrors = false, validationErrors = [] }: Step5Props) {
  const { data, currentGabinete, updateGabinete } = useChecklist();
  const gabinete = data.gabinetes[currentGabinete];

  if (!gabinete) return null;

  const tipoError = showErrors && getFieldError(validationErrors, 'climatizacao.tipo');

  const updateClimatizacao = (updates: Partial<ClimatizacaoData>) => {
    updateGabinete(currentGabinete, {
      climatizacao: { ...gabinete.climatizacao, ...updates }
    });
  };

  const updateAC = (index: number, updates: Partial<ArCondicionado>) => {
    const newACs = [...gabinete.climatizacao.acs];
    newACs[index] = { ...newACs[index], ...updates };
    updateClimatizacao({ acs: newACs });
  };

  const addAC = () => {
    if (gabinete.climatizacao.acs.length < 4) {
      updateClimatizacao({
        acs: [...gabinete.climatizacao.acs, { ...EMPTY_AC }]
      });
    }
  };

  const removeAC = (index: number) => {
    const newACs = gabinete.climatizacao.acs.filter((_, i) => i !== index);
    updateClimatizacao({ acs: newACs });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          Climatização - Gabinete {currentGabinete + 1}
        </span>
      </div>

      <FormCard title="Tipo de Climatização" icon={<Fan className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={gabinete.climatizacao.tipo}
              onValueChange={(value: ClimatizacaoTipo) => updateClimatizacao({ tipo: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIMATIZACAO_TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {gabinete.climatizacao.tipo === 'FAN' && (
            <ToggleSwitch
              label="FAN Funcionando"
              value={gabinete.climatizacao.fanOK}
              onChange={(value) => updateClimatizacao({ fanOK: value })}
            />
          )}
        </div>
      </FormCard>

      {gabinete.climatizacao.tipo === 'AR CONDICIONADO' && (
        <FormCard title="Ar Condicionados" icon={<Thermometer className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Unidades de AC</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addAC}
                disabled={gabinete.climatizacao.acs.length >= 4}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {gabinete.climatizacao.acs.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Thermometer className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum AC cadastrado</p>
              </div>
            )}

            {gabinete.climatizacao.acs.map((ac, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 space-y-3 bg-muted/30 animate-slide-up"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">AC {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeAC(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Modelo</Label>
                    <Select
                      value={ac.modelo}
                      onValueChange={(value: ACModelo) => updateAC(index, { modelo: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AC_MODELOS.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Funcionamento</Label>
                    <div className="flex gap-1">
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateAC(index, { funcionamento: status })}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-all ${
                            ac.funcionamento === status
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
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-2">
                <Label>PLC Lead-Lag</Label>
                <div className="flex gap-1">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => updateClimatizacao({ plcLeadLag: status })}
                      className={`flex-1 py-2 text-xs font-medium rounded-md border transition-all ${
                        gabinete.climatizacao.plcLeadLag === status
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
                <Label>Alarmística</Label>
                <Select
                  value={gabinete.climatizacao.alarmistica}
                  onValueChange={(value: 'SGINFRA U2020' | 'Outra') => updateClimatizacao({ alarmistica: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SGINFRA U2020">SGINFRA U2020</SelectItem>
                    <SelectItem value="Outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </FormCard>
      )}

      <FormCard title="Fotos Climatização" icon={<Camera className="w-4 h-4" />} variant="accent">
        <div className="grid grid-cols-2 gap-3">
          <PhotoCapture
            label="AR 1"
            value={gabinete.climatizacao.fotoAR1}
            onChange={(value) => updateClimatizacao({ fotoAR1: value })}
          />
          <PhotoCapture
            label="AR 2"
            value={gabinete.climatizacao.fotoAR2}
            onChange={(value) => updateClimatizacao({ fotoAR2: value })}
          />
          <PhotoCapture
            label="Condensador"
            value={gabinete.climatizacao.fotoCondensador}
            onChange={(value) => updateClimatizacao({ fotoCondensador: value })}
          />
          <PhotoCapture
            label="Evaporador"
            value={gabinete.climatizacao.fotoEvaporador}
            onChange={(value) => updateClimatizacao({ fotoEvaporador: value })}
          />
        </div>
      </FormCard>
    </div>
  );
}
