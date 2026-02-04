import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCaptureWithExtras } from "@/components/ui/photo-capture-with-extras";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Zap, Settings, Camera, Plus, Trash2 } from "lucide-react";
import { FCCFabricante, TensaoDC, FCCData, FCCItem } from "@/types/checklist";
import { ValidationError } from "@/hooks/use-validation";
import { SectionSkipToggle } from "@/components/ui/section-skip-toggle";

const FCC_FABRICANTES: FCCFabricante[] = [
  'ALCATEL', 'ALFA', 'ASCOM', 'DELTA', 'ELTEK', 'EFACEC',
  'EMERSON', 'HUAWEI', 'INTERGY', 'VERTIV', 'ZTE', 'OUTRA'
];

const TENSAO_OPTIONS: TensaoDC[] = ['24V', '48V'];
const UR_OPTIONS = Array.from({ length: 31 }, (_, i) => i); // 0 to 30

const EMPTY_FCC: FCCItem = {
  fabricante: null as unknown as FCCFabricante,
  fabricanteOutra: '',
  tensaoDC: null as unknown as TensaoDC,
  gerenciadaSG: false,
  gerenciavel: false,
  consumoDC: 0,
  qtdURSuportadas: null,
  qtdURInstaladas: null,
  fotoPanoramica: null,
  fotoPainel: null,
};

interface Step3Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step3FCC({ showErrors = false, validationErrors = [] }: Step3Props) {
  const { data, currentGabinete, updateGabinete, updateSecaoNaoAplicavel, updateFotosExtras, getFotosExtras } = useChecklist();
  const gabinete = data.gabinetes?.[currentGabinete];
  const isSkipped = data.secoesNaoAplicaveis?.fcc ?? false;

  if (!gabinete) return null;

  const updateFCCData = (updates: Partial<FCCData>) => {
    updateGabinete(currentGabinete, {
      fcc: { ...gabinete.fcc, ...updates }
    });
  };

  const updateFCC = (index: number, updates: Partial<FCCItem>) => {
    const newFCCs = [...gabinete.fcc.fccs];
    newFCCs[index] = { ...newFCCs[index], ...updates };
    updateFCCData({ fccs: newFCCs });
  };

  const addFCC = () => {
    if (gabinete.fcc.fccs.length < 4) {
      updateFCCData({
        fccs: [...gabinete.fcc.fccs, { ...EMPTY_FCC }],
        numFCCs: gabinete.fcc.numFCCs + 1
      });
    }
  };

  const removeFCC = (index: number) => {
    const newFCCs = gabinete.fcc.fccs.filter((_, i) => i !== index);
    updateFCCData({
      fccs: newFCCs,
      numFCCs: Math.max(0, gabinete.fcc.numFCCs - 1)
    });
  };

  return (
    <SectionSkipToggle
      sectionName="FCC"
      isSkipped={isSkipped}
      onToggle={(value) => updateSecaoNaoAplicavel('fcc', value)}
    >
      <div className="space-y-4">
        <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            FCC - Gabinete {currentGabinete + 1}
          </span>
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
            {gabinete.fcc.fccs.length}/4 FCCs
          </span>
        </div>

        <FormCard title="FCCs - Fontes de Corrente Contínua" icon={<Zap className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>FCCs</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addFCC}
                disabled={gabinete.fcc.fccs.length >= 4}
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {gabinete.fcc.fccs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhuma FCC cadastrada</p>
                <p className="text-xs">Clique em "Adicionar" para começar</p>
              </div>
            )}

            {gabinete.fcc.fccs.map((fcc, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 space-y-4 bg-muted/30 animate-slide-up"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">FCC {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeFCC(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Fabricante</Label>
                  <Select 
                    value={fcc.fabricante || ''} 
                    onValueChange={(value: FCCFabricante) => updateFCC(index, { fabricante: value, fabricanteOutra: value === 'OUTRA' ? fcc.fabricanteOutra : '' })}
                  >
                    <SelectTrigger className="h-9">
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

                {fcc.fabricante === 'OUTRA' && (
                  <div className="space-y-2">
                    <Label className="text-xs">Especifique o fabricante</Label>
                    <Input
                      placeholder="Digite o nome do fabricante"
                      value={fcc.fabricanteOutra || ''}
                      onChange={(e) => updateFCC(index, { fabricanteOutra: e.target.value })}
                      className="h-9"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Tensão DC</Label>
                    <Select 
                      value={fcc.tensaoDC || ''} 
                      onValueChange={(value: TensaoDC) => updateFCC(index, { tensaoDC: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
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
                    <Label className="text-xs">Consumo DC (W)</Label>
                    <Input
                      type="number"
                      value={fcc.consumoDC || ''}
                      onChange={(e) => updateFCC(index, { consumoDC: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Qtd. URs Suportadas</Label>
                    <Select 
                      value={fcc.qtdURSuportadas != null ? String(fcc.qtdURSuportadas) : ''} 
                      onValueChange={(value) => updateFCC(index, { qtdURSuportadas: parseInt(value) })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
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

                  <div className="space-y-2">
                    <Label className="text-xs">Qtd. URs Instaladas</Label>
                    <Select 
                      value={fcc.qtdURInstaladas != null ? String(fcc.qtdURInstaladas) : ''} 
                      onValueChange={(value) => updateFCC(index, { qtdURInstaladas: parseInt(value) })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
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

                <div className="space-y-3">
                  <ToggleSwitch
                    label="Gerenciada SG Infra"
                    value={fcc.gerenciadaSG}
                    onChange={(value) => updateFCC(index, { gerenciadaSG: value })}
                  />
                  <ToggleSwitch
                    label="Gerenciável"
                    value={fcc.gerenciavel}
                    onChange={(value) => updateFCC(index, { gerenciavel: value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <PhotoCaptureWithExtras
                    label="FCC Panorâmica"
                    value={fcc.fotoPanoramica}
                    onChange={(value) => updateFCC(index, { fotoPanoramica: value })}
                    extraPhotos={getFotosExtras(`gab${currentGabinete}_fcc${index}_panoramica`)}
                    onExtraPhotosChange={(photos) => updateFotosExtras(`gab${currentGabinete}_fcc${index}_panoramica`, photos)}
                    required
                    siteCode={data.siglaSite}
                    category={`gab${currentGabinete + 1}_fcc${index + 1}_panoramica`}
                  />
                  <PhotoCaptureWithExtras
                    label="Painel de Instrumentos"
                    value={fcc.fotoPainel}
                    onChange={(value) => updateFCC(index, { fotoPainel: value })}
                    extraPhotos={getFotosExtras(`gab${currentGabinete}_fcc${index}_painel`)}
                    onExtraPhotosChange={(photos) => updateFotosExtras(`gab${currentGabinete}_fcc${index}_painel`, photos)}
                    required
                    siteCode={data.siglaSite}
                    category={`gab${currentGabinete + 1}_fcc${index + 1}_painel`}
                  />
                </div>
              </div>
            ))}
          </div>
        </FormCard>
      </div>
    </SectionSkipToggle>
  );
}
