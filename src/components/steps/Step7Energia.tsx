import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Shield, Cable, FileText, Check, X } from "lucide-react";
import { 
  EnergiaData, TipoQuadro, FabricanteQuadro, TensaoEntrada, StatusPlaca, ProtecoesData, CabosData
} from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const TIPOS_QUADRO: TipoQuadro[] = ['QDCA', 'QGBT', 'SUBQUADRO'];
const FABRICANTES: FabricanteQuadro[] = ['SIEMENS', 'SCHNEIDER', 'ABB', 'WEG', 'OUTRA'];
const TENSOES_ENTRADA: TensaoEntrada[] = ['127V', '220V', '380V', '440V'];
const STATUS_PLACA: StatusPlaca[] = ['OK', 'NOK', 'AUSENTE'];

interface Step7Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step7Energia({ showErrors = false, validationErrors = [] }: Step7Props) {
  const { data, updateData } = useChecklist();
  const energia = data.energia;

  const updateEnergia = (updates: Partial<EnergiaData>) => {
    updateData('energia', { ...energia, ...updates });
  };

  const updateProtecoes = (updates: Partial<ProtecoesData>) => {
    updateData('energia', { ...energia, protecoes: { ...energia.protecoes, ...updates } });
  };

  const updateCabos = (updates: Partial<CabosData>) => {
    updateData('energia', { ...energia, cabos: { ...energia.cabos, ...updates } });
  };

  // Count OK items
  const protecoesList = [
    { key: 'drOK', label: 'DR' },
    { key: 'dpsOK', label: 'DPS' },
    { key: 'disjuntoresOK', label: 'Disjuntores' },
    { key: 'termomagneticosOK', label: 'Termomagnéticos' },
    { key: 'chaveGeralOK', label: 'Chave Geral' },
  ] as const;

  const okCount = protecoesList.filter(p => energia.protecoes[p.key]).length;
  const totalItems = 11; // 5 proteções + transformador + cabos(2) + placa + tipo + fabricante

  // Determine if needs NOK photo for cabos
  const cabosNeedPhoto = !energia.cabos.terminaisApertados || !energia.cabos.isolacaoOK;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Energia - Quadro Elétrico
        </span>
        <span className={cn(
          "text-xs font-semibold px-2 py-1 rounded-full",
          okCount === protecoesList.length 
            ? "bg-success/20 text-success" 
            : "bg-warning/20 text-warning"
        )}>
          {okCount}/5 proteções OK
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
              value={energia.fabricante}
              onValueChange={(value: FabricanteQuadro) => updateEnergia({ fabricante: value })}
            >
              <SelectTrigger>
                <SelectValue />
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
              value={energia.potenciaKVA}
              onChange={(e) => updateEnergia({ potenciaKVA: Math.min(2000, Math.max(5, parseInt(e.target.value) || 5)) })}
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
            value={energia.transformadorOK}
            onChange={(value) => updateEnergia({ transformadorOK: value })}
          />

          {!energia.transformadorOK && (
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

      {/* Proteções */}
      <FormCard title="Proteções" icon={<Shield className="w-4 h-4" />}>
        <div className="space-y-3">
          {protecoesList.map(({ key, label }) => (
            <div 
              key={key} 
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                energia.protecoes[key] 
                  ? "bg-success/10 border-success/30" 
                  : "bg-destructive/10 border-destructive/30"
              )}
            >
              <span className="text-sm font-medium">{label}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => updateProtecoes({ [key]: true })}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all",
                    energia.protecoes[key]
                      ? "bg-success text-success-foreground border-success"
                      : "bg-card border-border hover:border-success/50"
                  )}
                >
                  <Check className="w-3 h-3" />
                  OK
                </button>
                <button
                  onClick={() => updateProtecoes({ [key]: false })}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all",
                    !energia.protecoes[key]
                      ? "bg-destructive text-destructive-foreground border-destructive"
                      : "bg-card border-border hover:border-destructive/50"
                  )}
                >
                  <X className="w-3 h-3" />
                  NOK
                </button>
              </div>
            </div>
          ))}
        </div>
      </FormCard>

      {/* Cabos */}
      <FormCard title="Cabos" icon={<Cable className="w-4 h-4" />}>
        <div className="space-y-4">
          <ToggleSwitch
            label="Terminais apertados?"
            value={energia.cabos.terminaisApertados}
            onChange={(value) => updateCabos({ terminaisApertados: value })}
          />

          <ToggleSwitch
            label="Isolação OK?"
            value={energia.cabos.isolacaoOK}
            onChange={(value) => updateCabos({ isolacaoOK: value })}
          />

          {cabosNeedPhoto && (
            <PhotoCapture
              label="Foto Cabos (obrigatória se NOK)"
              value={energia.cabos.fotoCabos}
              onChange={(value) => updateCabos({ fotoCabos: value })}
              required
              siteCode={data.siglaSite}
              category="energia_cabos"
            />
          )}
        </div>
      </FormCard>

      {/* Placa */}
      <FormCard title="Placa" icon={<FileText className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status da Placa</Label>
            <div className="grid grid-cols-3 gap-2">
              {STATUS_PLACA.map((status) => (
                <button
                  key={status}
                  onClick={() => updateEnergia({ placaStatus: status })}
                  className={cn(
                    "py-3 text-sm font-medium rounded-md border transition-all",
                    energia.placaStatus === status
                      ? status === 'OK'
                        ? "bg-success text-success-foreground border-success"
                        : "bg-destructive text-destructive-foreground border-destructive"
                      : "bg-card border-border hover:border-primary/50"
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {energia.placaStatus !== 'OK' && (
            <PhotoCapture
              label="Foto Placa (obrigatória se NOK/Ausente)"
              value={energia.fotoPlaca}
              onChange={(value) => updateEnergia({ fotoPlaca: value })}
              required
              siteCode={data.siglaSite}
              category="energia_placa"
            />
          )}
        </div>
      </FormCard>
    </div>
  );
}
