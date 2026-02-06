import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCaptureWithExtras } from "@/components/ui/photo-capture-with-extras";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fuel, Radio, Shield, AlertCircle } from "lucide-react";
import { StatusFuncionamento, GMGData, TorreData, FCCFabricante } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";
import { SectionSkipToggle } from "@/components/ui/section-skip-toggle";

const STATUS_OPTIONS: StatusFuncionamento[] = ['OK', 'NOK', 'NA'];
const GMG_STATUS_OPTIONS: StatusFuncionamento[] = ['OK', 'NOK'];
const INFRA_STATUS_OPTIONS: StatusFuncionamento[] = ['OK', 'NOK'];
const FCC_FABRICANTES: FCCFabricante[] = [
  'ALCATEL', 'ALFA', 'ASCOM', 'DELTA', 'ELTEK', 'EFACEC',
  'EMERSON', 'HUAWEI', 'INTERGY', 'VERTIV', 'ZTE', 'OUTRA'
];

interface Step9Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step9GMGTorre({ showErrors = false, validationErrors = [] }: Step9Props) {
  const { data, updateData, updateSecaoNaoAplicavel, updateFotosExtras, getFotosExtras } = useChecklist();
  const isSkipped = data.secoesNaoAplicaveis?.gmgTorre ?? false;

  // Ensure gmg and torre are always defined
  const gmg = data.gmg ?? { informar: false };
  const torre = data.torre ?? { ninhos: false, fibrasProtegidas: true, aterramento: 'OK', zeladoria: 'OK' };

  const updateGMG = (updates: Partial<GMGData>) => {
    updateData('gmg', { ...gmg, ...updates });
  };

  const updateTorre = (updates: Partial<TorreData>) => {
    updateData('torre', { ...torre, ...updates });
  };

  return (
    <SectionSkipToggle
      sectionName="GMG/Torre"
      isSkipped={isSkipped}
      onToggle={(value) => updateSecaoNaoAplicavel('gmgTorre', value)}
    >
      <div className="space-y-4">
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
                  <Input
                    placeholder="Digite o nome do fabricante"
                    value={data.gmg.fabricanteOutra || ''}
                    onChange={(e) => updateGMG({ fabricanteOutra: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Potência</Label>
                    <input
                      type="number"
                      value={data.gmg.potencia || ''}
                      onChange={(e) => updateGMG({ potencia: parseInt(e.target.value) || undefined })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacidade do Tanque (L)</Label>
                    <input
                      type="number"
                      value={data.gmg.capacidadeTanque || ''}
                      onChange={(e) => updateGMG({ capacidadeTanque: parseInt(e.target.value) || undefined })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Combustível no Tanque (%)</Label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={data.gmg.combustivelPorcentagem || ''}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      updateGMG({ combustivelPorcentagem: isNaN(value) ? undefined : Math.min(100, Math.max(0, value)) });
                    }}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-2">
                    {GMG_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status}
                        type="button"
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

                <ToggleSwitch
                  label="Possui alarme ativo?"
                  value={data.gmg.alarmeAtivo ?? false}
                  onChange={(value) => updateGMG({ alarmeAtivo: value })}
                />

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    Data do Último Teste
                    <span className="text-destructive">*</span>
                  </Label>
                  <input
                    type="date"
                    value={data.gmg.ultimoTeste || ''}
                    onChange={(e) => updateGMG({ ultimoTeste: e.target.value })}
                    className={cn(
                      "w-full h-10 px-3 rounded-md border bg-background text-sm",
                      showErrors && getFieldError(validationErrors, 'gmg.ultimoTeste')
                        ? "border-destructive"
                        : "border-input"
                    )}
                  />
                  {showErrors && getFieldError(validationErrors, 'gmg.ultimoTeste') && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {getFieldError(validationErrors, 'gmg.ultimoTeste')}
                    </p>
                  )}
                </div>

                <PhotoCaptureWithExtras
                  label="Foto do Painel do GMG"
                  value={data.gmg.fotoGMG || null}
                  onChange={(value) => updateGMG({ fotoGMG: value })}
                  extraPhotos={getFotosExtras('gmg_painel')}
                  onExtraPhotosChange={(photos) => updateFotosExtras('gmg_painel', photos)}
                  siteCode={data.siglaSite}
                  category="gmg_painel"
                />
              </div>
            )}
          </div>
        </FormCard>

        <FormCard title="Torre" icon={<Radio className="w-4 h-4" />}>
          <div className="space-y-4">
            <ToggleSwitch
              label="Fibras Protegidas"
              description="Proteção contra caturritas"
              value={data.torre.fibrasProtegidas}
              onChange={(value) => updateTorre({ fibrasProtegidas: value })}
            />

            {data.torre.fibrasProtegidas && (
              <div className="pt-2 animate-slide-up">
                <PhotoCaptureWithExtras
                  label="Foto das Fibras Protegidas"
                  value={data.torre.fotoFibrasProtegidas || null}
                  onChange={(value) => updateTorre({ fotoFibrasProtegidas: value })}
                  extraPhotos={getFotosExtras('torre_fibras_protegidas')}
                  onExtraPhotosChange={(photos) => updateFotosExtras('torre_fibras_protegidas', photos)}
                  siteCode={data.siglaSite}
                  category="torre_fibras_protegidas"
                />
              </div>
            )}
          </div>
        </FormCard>

        <FormCard title="Infraestrutura" icon={<Shield className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Aterramento</Label>
              <div className="flex gap-2">
                {INFRA_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateTorre({ aterramento: status })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md border transition-all ${
                      torre.aterramento === status
                        ? status === 'OK'
                          ? 'bg-success text-success-foreground border-success'
                          : 'bg-destructive text-destructive-foreground border-destructive'
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <PhotoCaptureWithExtras
              label="Foto do Aterramento"
              value={data.torre.fotoAterramento || null}
              onChange={(value) => updateTorre({ fotoAterramento: value })}
              extraPhotos={getFotosExtras('torre_aterramento')}
              onExtraPhotosChange={(photos) => updateFotosExtras('torre_aterramento', photos)}
              siteCode={data.siglaSite}
              category="torre_aterramento"
            />

            <div className="space-y-2">
              <Label>Zeladoria</Label>
              <div className="flex gap-2">
                {INFRA_STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateTorre({ zeladoria: status })}
                    className={`flex-1 py-2 text-sm font-medium rounded-md border transition-all ${
                      torre.zeladoria === status
                        ? status === 'OK'
                          ? 'bg-success text-success-foreground border-success'
                          : 'bg-destructive text-destructive-foreground border-destructive'
                        : 'bg-card border-border hover:border-primary/50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <PhotoCaptureWithExtras
              label="Foto da Zeladoria"
              value={data.torre.fotoZeladoria || null}
              onChange={(value) => updateTorre({ fotoZeladoria: value })}
              extraPhotos={getFotosExtras('torre_zeladoria')}
              onExtraPhotosChange={(photos) => updateFotosExtras('torre_zeladoria', photos)}
              siteCode={data.siglaSite}
              category="torre_zeladoria"
            />
          </div>
        </FormCard>
      </div>
    </SectionSkipToggle>
  );
}
