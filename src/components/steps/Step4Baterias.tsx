import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCaptureWithExtras } from "@/components/ui/photo-capture-with-extras";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Battery, Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import { BateriaTipo, BateriaFabricante, CapacidadeAh, BateriaEstado, BateriaColada, BancoBateria, BateriasData } from "@/types/checklist";
import { ValidationError } from "@/hooks/use-validation";
import { SectionSkipToggle } from "@/components/ui/section-skip-toggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const BATERIA_TIPOS: BateriaTipo[] = ['LÍTIO', 'POLÍMERO', 'MONOBLOCO'];
const BATERIA_FABRICANTES: BateriaFabricante[] = [
  'ERICSSON', 'FREEDOM', 'FULGURIS', 'GETPOWER', 'HUAWEI', 'MOURA',
  'NEWMAX', 'NORTHSTAR', 'UNICOBA', 'ZTE', 'SHOTO', 'NA', 'OUTRA'
];
const CAPACIDADES: CapacidadeAh[] = [100, 105, 170, 200, 300, 400, 430, 500, 600, 640, 750, 800, 1000, 1250, 1500, 2000, 2500];
const ESTADOS: BateriaEstado[] = ['OK', 'ESTUFADA', 'ESTOURADA', 'VAZANDO', 'TRINCADA', 'NÃO SEGURA CARGA'];
const COLADA_OPTIONS: BateriaColada[] = ['SIM', 'NÃO', 'NA'];

const EMPTY_BANCO: BancoBateria = {
  tipo: null,
  fabricante: null,
  fabricanteOutra: '',
  capacidadeAh: null,
  dataFabricacao: '',
  estados: [],
  colada: null,
  comGradil: null,
  fotoBanco: null
};

interface Step4Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step4Baterias({ showErrors = false, validationErrors = [] }: Step4Props) {
  const { data, currentGabinete, updateGabinete, updateSecaoNaoAplicavel, updateFotosExtras, getFotosExtras } = useChecklist();
  const gabinete = data.gabinetes?.[currentGabinete];
  const isSkipped = data.secoesNaoAplicaveis?.baterias ?? false;
  const { toast } = useToast();
  const [analyzingIndex, setAnalyzingIndex] = React.useState<number | null>(null);

  if (!gabinete) return null;

  const analyzeBanco = async (index: number, banco: BancoBateria) => {
    if (!banco.fotoBanco) {
      toast({ title: "Foto necessária", description: "Capture a foto do banco antes de analisar.", variant: "destructive" });
      return;
    }
    setAnalyzingIndex(index);
    try {
      const { data: result, error } = await supabase.functions.invoke('classify-battery', {
        body: { imageUrl: banco.fotoBanco },
      });
      if (error) throw error;
      const tipo = result?.tipo as 'LÍTIO' | 'POLÍMERO' | undefined;
      if (tipo !== 'LÍTIO' && tipo !== 'POLÍMERO') throw new Error('Resposta inválida');
      updateBanco(index, { tipoIA: tipo });
      toast({ title: "Análise concluída", description: `IA classificou como ${tipo}${result?.confianca ? ` (${Math.round(result.confianca * 100)}%)` : ''}.` });
    } catch (e: any) {
      console.error('[classify-battery]', e);
      toast({ title: "Falha na análise", description: e?.message || "Não foi possível analisar a foto.", variant: "destructive" });
    } finally {
      setAnalyzingIndex(null);
    }
  };

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
    if (gabinete.baterias.bancos.length < 12) {
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
    <SectionSkipToggle
      sectionName="Baterias"
      isSkipped={isSkipped}
      onToggle={(value) => updateSecaoNaoAplicavel('baterias', value)}
    >
      <div className="space-y-4">
        <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-primary">
            Baterias - Gabinete {currentGabinete + 1}
          </span>
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
            {gabinete.baterias.bancos.length}/12 bancos
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
                disabled={gabinete.baterias.bancos.length >= 12}
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
                      value={banco.tipo || ''}
                      onValueChange={(value: BateriaTipo) => updateBanco(index, { tipo: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
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
                      value={banco.fabricante || ''}
                      onValueChange={(value: BateriaFabricante) => updateBanco(index, { fabricante: value, fabricanteOutra: value === 'OUTRA' ? banco.fabricanteOutra : '' })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {BATERIA_FABRICANTES.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {banco.fabricante === 'OUTRA' && (
                      <Input
                        placeholder="Nome do fabricante"
                        value={banco.fabricanteOutra || ''}
                        onChange={(e) => updateBanco(index, { fabricanteOutra: e.target.value })}
                        className="h-9 mt-1.5"
                      />
                    )}
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
                    {ESTADOS.map((estado) => {
                      const isSelected = banco.estados?.includes(estado) || false;
                      const isOkSelected = banco.estados?.includes('OK') || false;
                      
                      const handleEstadoClick = () => {
                        if (estado === 'OK') {
                          // Se clicar em OK, seleciona apenas OK
                          updateBanco(index, { estados: ['OK'] });
                        } else {
                          // Se clicar em outro estado
                          if (isOkSelected) {
                            // Se OK estava selecionado, remove OK e adiciona o novo
                            updateBanco(index, { estados: [estado] });
                          } else if (isSelected) {
                            // Se já está selecionado, remove
                            const newEstados = banco.estados.filter(e => e !== estado);
                            updateBanco(index, { estados: newEstados.length > 0 ? newEstados : ['OK'] });
                          } else {
                            // Adiciona à lista
                            updateBanco(index, { estados: [...(banco.estados || []), estado] });
                          }
                        }
                      };
                      
                      return (
                        <button
                          key={estado}
                          type="button"
                          onClick={handleEstadoClick}
                          className={`px-2 py-1 text-xs rounded-full border transition-all ${
                            isSelected
                              ? estado === 'OK'
                                ? 'bg-success text-success-foreground border-success'
                                : 'bg-destructive text-destructive-foreground border-destructive'
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          {estado}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Bateria Colada?</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLADA_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateBanco(index, { colada: option })}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          banco.colada === option
                            ? option === 'SIM'
                              ? 'bg-success text-success-foreground border-success'
                              : option === 'NÃO'
                              ? 'bg-destructive text-destructive-foreground border-destructive'
                              : 'bg-muted text-muted-foreground border-muted'
                            : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Bateria com Gradil?</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {COLADA_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateBanco(index, { comGradil: option })}
                        className={`px-3 py-1 text-xs rounded-full border transition-all ${
                          banco.comGradil === option
                            ? option === 'SIM'
                              ? 'bg-success text-success-foreground border-success'
                              : option === 'NÃO'
                              ? 'bg-destructive text-destructive-foreground border-destructive'
                              : 'bg-muted text-muted-foreground border-muted'
                            : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <PhotoCaptureWithExtras
                  label="Foto do Banco"
                  value={banco.fotoBanco}
                  onChange={(value) => updateBanco(index, { fotoBanco: value })}
                  extraPhotos={getFotosExtras(`gab${currentGabinete}_bateria_banco${index}`)}
                  onExtraPhotosChange={(photos) => updateFotosExtras(`gab${currentGabinete}_bateria_banco${index}`, photos)}
                  required
                  siteCode={data.siglaSite}
                  category={`gab${currentGabinete + 1}_bateria_banco${index + 1}`}
                />

                <div className="flex items-center justify-between gap-2 rounded-md border bg-card p-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Tipo (IA):</span>
                    {banco.tipoIA ? (
                      <Badge className="bg-primary text-primary-foreground">{banco.tipoIA}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Não analisado</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!banco.fotoBanco || analyzingIndex === index}
                    onClick={() => analyzeBanco(index, banco)}
                    className="gap-1 h-8"
                  >
                    {analyzingIndex === index ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Analisar com IA
                      </>
                    )}
                  </Button>
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
      </div>
    </SectionSkipToggle>
  );
}
