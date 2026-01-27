import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, FileText } from "lucide-react";
import { 
  EnergiaData, TipoQuadro, FabricanteQuadro, TensaoEntrada
} from "@/types/checklist";
import { ValidationError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";
import { SectionSkipToggle } from "@/components/ui/section-skip-toggle";

const TIPOS_QUADRO: TipoQuadro[] = ['QDCA', 'QGBT', 'SUBQUADRO'];
const FABRICANTES: FabricanteQuadro[] = ['SIEMENS', 'SCHNEIDER', 'ABB', 'WEG', 'OUTRA'];
const TENSOES_ENTRADA: TensaoEntrada[] = ['127V', '220V', '380V', '440V'];

interface Step7Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step7Energia({ showErrors = false, validationErrors = [] }: Step7Props) {
  const { data, updateData, updateSecaoNaoAplicavel } = useChecklist();
  const energia = data.energia;
  const isSkipped = data.secoesNaoAplicaveis.energia;

  const updateEnergia = (updates: Partial<EnergiaData>) => {
    updateData('energia', { ...energia, ...updates });
  };

  return (
    <SectionSkipToggle
      sectionName="Energia"
      isSkipped={isSkipped}
      onToggle={(value) => updateSecaoNaoAplicavel('energia', value)}
    >
      <div className="space-y-4">
        <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Energia - Quadro Elétrico
          </span>
        </div>

        {/* Tipo de Quadro */}
        <FormCard title="Tipo de Quadro" icon={<Zap className="w-4 h-4" />}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <div className="grid grid-cols-3 gap-2">
                {TIPOS_QUADRO.map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => updateEnergia({ tipoQuadro: tipo })}
                    className={cn(
                      "py-3 text-sm font-medium rounded-md border transition-all",
                      energia.tipoQuadro === tipo
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    {tipo}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fabricante</Label>
              <Select
                value={energia.fabricante || ""}
                onValueChange={(value: FabricanteQuadro) => updateEnergia({ fabricante: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {FABRICANTES.map((fab) => (
                    <SelectItem key={fab} value={fab}>{fab}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Potência (kVA)</Label>
              <Input
                type="number"
                min={5}
                max={2000}
                value={energia.potenciaKVA ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    updateEnergia({ potenciaKVA: null });
                  } else {
                    updateEnergia({ potenciaKVA: Math.min(2000, Math.max(5, parseInt(val) || 5)) });
                  }
                }}
                placeholder="Ex: 75"
              />
              <p className="text-xs text-muted-foreground">Entre 5 e 2000 kVA</p>
            </div>

            <div className="space-y-2">
              <Label>Tensão de Entrada</Label>
              <div className="grid grid-cols-4 gap-2">
                {TENSOES_ENTRADA.map((tensao) => (
                  <button
                    key={tensao}
                    onClick={() => updateEnergia({ tensaoEntrada: tensao })}
                    className={cn(
                      "py-2 text-sm font-medium rounded-md border transition-all",
                      energia.tensaoEntrada === tensao
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    {tensao}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </FormCard>

        {/* Transformador */}
        <FormCard title="Transformador" icon={<Zap className="w-4 h-4" />}>
          <div className="space-y-4">
            <ToggleSwitch
              label="Transformador OK?"
              value={energia.transformadorOK ?? false}
              onChange={(value) => updateEnergia({ transformadorOK: value })}
            />

            {energia.transformadorOK === false && (
              <PhotoCapture
                label="Foto Transformador (obrigatória)"
                value={energia.fotoTransformador}
                onChange={(value) => updateEnergia({ fotoTransformador: value })}
                required
                siteCode={data.siglaSite}
                category="energia_transformador"
              />
            )}
          </div>
        </FormCard>

        {/* Foto Quadro Geral */}
        <FormCard title="Foto Quadro Geral" icon={<FileText className="w-4 h-4" />}>
          <PhotoCapture
            label="Foto do Quadro Geral (obrigatória)"
            value={energia.fotoQuadroGeral}
            onChange={(value) => updateEnergia({ fotoQuadroGeral: value })}
            required
            siteCode={data.siglaSite}
            category="energia_quadro"
          />
        </FormCard>
      </div>
    </SectionSkipToggle>
  );
}
