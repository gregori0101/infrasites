import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Battery, Plus, Trash2, AlertCircle } from "lucide-react";
import { BateriaTipo, BateriaFabricante, CapacidadeAh, BateriaEstado, BancoBateria, BateriasData } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const BATERIA_TIPOS: BateriaTipo[] = ['LÍTIO', 'POLÍMERO 100A', 'POLÍMERO 200A', 'MONOBLOCO 2V', 'NA'];
const BATERIA_FABRICANTES: BateriaFabricante[] = [
  'FREEDOM', 'FULGURIS', 'GETPOWER', 'HUAWEI', 'MOURA',
  'NEWMAX', 'NORTHSTAR', 'UNICOBA', 'ZTE', 'SHOTO', 'NA', 'OUTRA'
];
const CAPACIDADES: CapacidadeAh[] = [100, 105, 170, 200, 300, 400, 430, 500, 600, 640, 750, 800, 1000, 1250, 1500, 2000, 2500];
const ESTADOS: BateriaEstado[] = ['OK', 'ESTUFADA', 'VAZANDO', 'TRINCADA', 'NÃO SEGURA CARGA', 'NA'];

const EMPTY_BANCO: BancoBateria = {
  tipo: 'NA',
  fabricante: 'NA',
  capacidadeAh: null,
  dataFabricacao: '',
  estado: 'OK'
};

interface Step4Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step4Baterias({ showErrors = false, validationErrors = [] }: Step4Props) {
  const { data, currentGabinete, updateGabinete } = useChecklist();
  const gabinete = data.gabinetes[currentGabinete];

  if (!gabinete) return null;

  const fotoError = showErrors && getFieldError(validationErrors, 'fotoBanco');

  const updateBaterias = (updates: Partial<BateriasData>) => {
    updateGabinete(currentGabinete, {
      baterias: { ...gabinete.baterias, ...updates }
    });
  };

  const updateBanco = (index: number, updates: Partial<BancoBateria>) => {
    const newBancos = [...gabinete.baterias.bancos];
    newBancos[index] = { ...newBancos[index], ...updates };
    updateBaterias({ bancos: newBancos });
  };

  const addBanco = () => {
    if (gabinete.baterias.bancos.length < 6) {
      updateBaterias({
        bancos: [...gabinete.baterias.bancos, { ...EMPTY_BANCO }],
        numBancos: gabinete.baterias.numBancos + 1
      });
    }
  };

  const removeBanco = (index: number) => {
    const newBancos = gabinete.baterias.bancos.filter((_, i) => i !== index);
    updateBaterias({
      bancos: newBancos,
      numBancos: Math.max(0, gabinete.baterias.numBancos - 1)
    });
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          Baterias - Gabinete {currentGabinete + 1}
        </span>
        <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
          {gabinete.baterias.bancos.length}/6 bancos
        </span>
      </div>

      <FormCard title="Configuração" icon={<Battery className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Bancos de Bateria</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addBanco}
              disabled={gabinete.baterias.bancos.length >= 6}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>

          {gabinete.baterias.bancos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Battery className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum banco cadastrado</p>
              <p className="text-xs">Clique em "Adicionar" para começar</p>
            </div>
          )}

          {gabinete.baterias.bancos.map((banco, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 space-y-3 bg-muted/30 animate-slide-up"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">Banco {index + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeBanco(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo</Label>
                  <Select
                    value={banco.tipo}
                    onValueChange={(value: BateriaTipo) => updateBanco(index, { tipo: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATERIA_TIPOS.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Fabricante</Label>
                  <Select
                    value={banco.fabricante}
                    onValueChange={(value: BateriaFabricante) => updateBanco(index, { fabricante: value })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BATERIA_FABRICANTES.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Capacidade (Ah)</Label>
                  <Select
                    value={banco.capacidadeAh?.toString() || ''}
                    onValueChange={(value) => updateBanco(index, { capacidadeAh: parseInt(value) as CapacidadeAh })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAPACIDADES.map((c) => (
                        <SelectItem key={c} value={c.toString()}>{c} Ah</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Data Fabricação</Label>
                  <Input
                    type="date"
                    value={banco.dataFabricacao}
                    onChange={(e) => updateBanco(index, { dataFabricacao: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Estado</Label>
                <div className="flex flex-wrap gap-1.5">
                  {ESTADOS.map((estado) => (
                    <button
                      key={estado}
                      onClick={() => updateBanco(index, { estado })}
                      className={`px-2 py-1 text-xs rounded-full border transition-all ${
                        banco.estado === estado
                          ? estado === 'OK'
                            ? 'bg-success text-success-foreground border-success'
                            : estado === 'NA'
                            ? 'bg-muted text-muted-foreground border-muted'
                            : 'bg-destructive text-destructive-foreground border-destructive'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {estado}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {gabinete.baterias.bancos.length > 1 && (
            <ToggleSwitch
              label="Bancos Interligados"
              description="Os bancos estão conectados entre si"
              value={gabinete.baterias.bancosInterligados}
              onChange={(value) => updateBaterias({ bancosInterligados: value })}
            />
          )}
        </div>
      </FormCard>

      <FormCard title="Foto do Banco" icon={<Battery className="w-4 h-4" />} variant="accent">
        <PhotoCapture
          label="Banco de Baterias"
          value={gabinete.baterias.fotoBanco}
          onChange={(value) => updateBaterias({ fotoBanco: value })}
          required
          siteCode={data.siglaSite}
          category={`gab${currentGabinete + 1}_bateria`}
        />
      </FormCard>
    </div>
  );
}
