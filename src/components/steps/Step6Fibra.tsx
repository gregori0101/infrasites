import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Cable, Box, Plus, Trash2, ChevronLeft, ChevronRight, Camera, AlertCircle, Image } from "lucide-react";
import { 
  FibraData, AbordagemData, DGOData, AbordagemFibra, NumAbordagens, 
  ConvergenciaFibra, CapacidadeDGO, FormatoDGO, EstadoFisico,
  INITIAL_ABORDAGEM, INITIAL_DGO
} from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const CAPACIDADES_DGO: CapacidadeDGO[] = ['12FO', '24FO', '48FO', '72FO', '144FO', '144+FO'];
const FORMATOS_DGO: FormatoDGO[] = ['SLIDE', 'FRONTAL', 'ARTICULADO', 'MÓDULO'];

interface Step6Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step6Fibra({ showErrors = false, validationErrors = [] }: Step6Props) {
  const { data, updateData } = useChecklist();
  const [currentDGO, setCurrentDGO] = React.useState(0);

  const fibra = data.fibra;

  const updateFibra = (updates: Partial<FibraData>) => {
    updateData('fibra', { ...fibra, ...updates });
  };

  const updateAbordagem = (num: 1 | 2, updates: Partial<AbordagemData>) => {
    const key = num === 1 ? 'abordagem1' : 'abordagem2';
    const current = num === 1 ? fibra.abordagem1 : (fibra.abordagem2 || { ...INITIAL_ABORDAGEM });
    updateFibra({ [key]: { ...current, ...updates } });
  };

  const addPhotoToArray = (field: 'fotoCaixasSubterraneas' | 'fotoSubidaLateral', abordagemNum: 1 | 2, photo: string) => {
    const abordagem = abordagemNum === 1 ? fibra.abordagem1 : fibra.abordagem2;
    if (!abordagem) return;
    const newPhotos = [...abordagem[field], photo];
    updateAbordagem(abordagemNum, { [field]: newPhotos });
  };

  const removePhotoFromArray = (field: 'fotoCaixasSubterraneas' | 'fotoSubidaLateral', abordagemNum: 1 | 2, index: number) => {
    const abordagem = abordagemNum === 1 ? fibra.abordagem1 : fibra.abordagem2;
    if (!abordagem) return;
    const newPhotos = abordagem[field].filter((_, i) => i !== index);
    updateAbordagem(abordagemNum, { [field]: newPhotos });
  };

  const updateDGO = (index: number, updates: Partial<DGOData>) => {
    const newDGOs = [...fibra.dgos];
    newDGOs[index] = { ...newDGOs[index], ...updates };
    updateFibra({ dgos: newDGOs });
  };

  const toggleFormato = (index: number, formato: FormatoDGO) => {
    const dgo = fibra.dgos[index];
    if (!dgo) return;
    const newFormatos = dgo.formatos.includes(formato)
      ? dgo.formatos.filter(f => f !== formato)
      : [...dgo.formatos, formato];
    updateDGO(index, { formatos: newFormatos });
  };

  const handleNumAbordagensChange = (value: string) => {
    const num = parseInt(value) as NumAbordagens;
    if (num === 2 && !fibra.abordagem2) {
      updateFibra({ 
        numAbordagens: num, 
        abordagem2: { ...INITIAL_ABORDAGEM },
        convergencia: 'SEM CONVERGÊNCIA'
      });
    } else {
      updateFibra({ numAbordagens: num });
    }
  };

  const handleNumDGOsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
    const currentDGOs = fibra.dgos;
    let newDGOs = [...currentDGOs];
    
    if (num > currentDGOs.length) {
      for (let i = currentDGOs.length; i < num; i++) {
        newDGOs.push({ ...INITIAL_DGO });
      }
    } else if (num < currentDGOs.length) {
      newDGOs = newDGOs.slice(0, num);
      if (currentDGO >= num) {
        setCurrentDGO(Math.max(0, num - 1));
      }
    }
    
    updateFibra({ numDGOs: num, dgos: newDGOs });
  };

  const renderAbordagem = (num: 1 | 2) => {
    const abordagem = num === 1 ? fibra.abordagem1 : fibra.abordagem2;
    if (!abordagem) return null;

    return (
      <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
        <h4 className="font-medium text-sm text-primary">
          Abordagem {num}
        </h4>

        <div className="space-y-2">
          <Label>Tipo</Label>
          <div className="flex gap-2">
            {(['AÉREA', 'SUBTERRÂNEA'] as AbordagemFibra[]).map((tipo) => (
              <button
                key={tipo}
                onClick={() => updateAbordagem(num, { tipo })}
                className={cn(
                  "flex-1 py-2 text-sm font-medium rounded-md border transition-all",
                  abordagem.tipo === tipo
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                )}
              >
                {tipo}
              </button>
            ))}
          </div>
        </div>

        {abordagem.tipo === 'SUBTERRÂNEA' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Fotos Caixas Subterrâneas</Label>
              <div className="grid grid-cols-3 gap-2">
                  {abordagem.fotoCaixasSubterraneas.map((foto, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={foto} alt={`Caixa ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhotoFromArray('fotoCaixasSubterraneas', num, idx)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <PhotoCapture
                      label="+"
                      value={null}
                      onChange={(value) => value && addPhotoToArray('fotoCaixasSubterraneas', num, value)}
                    />
                  </div>
              </div>
            </div>

            <ToggleSwitch
              label="Subida lateral padrão?"
              value={abordagem.subidaLateralOK}
              onChange={(value) => updateAbordagem(num, { subidaLateralOK: value })}
            />

            {!abordagem.subidaLateralOK && (
              <div className="space-y-2">
                <Label>Fotos Subida Lateral (Não Padrão)</Label>
                <div className="grid grid-cols-3 gap-2">
                  {abordagem.fotoSubidaLateral.map((foto, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={foto} alt={`Subida ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removePhotoFromArray('fotoSubidaLateral', num, idx)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <PhotoCapture
                      label="+"
                      value={null}
                      onChange={(value) => value && addPhotoToArray('fotoSubidaLateral', num, value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          Fibra - Dados do Site
        </span>
      </div>

      {/* Subseção 1: Acesso da Fibra */}
      <FormCard title="Acesso da Fibra" icon={<Cable className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quantas abordagens de fibra?</Label>
            <Select
              value={String(fibra.numAbordagens)}
              onValueChange={handleNumAbordagensChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Abordagem</SelectItem>
                <SelectItem value="2">2 Abordagens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {renderAbordagem(1)}

          {fibra.numAbordagens === 2 && (
            <>
              {renderAbordagem(2)}
              
              <div className="space-y-2">
                <Label>Convergência</Label>
                <div className="flex gap-2">
                  {(['CONVERGENTES', 'SEM CONVERGÊNCIA'] as ConvergenciaFibra[]).map((conv) => (
                    <button
                      key={conv}
                      onClick={() => updateFibra({ convergencia: conv })}
                      className={cn(
                        "flex-1 py-2 text-sm font-medium rounded-md border transition-all",
                        fibra.convergencia === conv
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border hover:border-primary/50"
                      )}
                    >
                      {conv}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="pt-2">
            <PhotoCapture
              label={fibra.numAbordagens === 1 ? "Foto Geral (obrigatória)" : "Foto Geral das 2 Abordagens (obrigatória)"}
              value={fibra.fotoGeralAbordagens}
              onChange={(value) => updateFibra({ fotoGeralAbordagens: value })}
              required
            />
          </div>
        </div>
      </FormCard>

      {/* Caixas de Passagem */}
      <FormCard title="Caixas de Passagem" icon={<Box className="w-4 h-4" />}>
        <div className="space-y-4">
          <ToggleSwitch
            label="Caixas de passagem existem?"
            value={fibra.caixasPassagemExistem}
            onChange={(value) => updateFibra({ caixasPassagemExistem: value })}
          />

          {fibra.caixasPassagemExistem && (
            <>
              <ToggleSwitch
                label="Padrão correto?"
                value={fibra.caixasPassagemPadrao}
                onChange={(value) => updateFibra({ caixasPassagemPadrao: value })}
              />

              <div className="space-y-2">
                <Label>Fotos das Caixas de Passagem</Label>
                <div className="grid grid-cols-3 gap-2">
                  {fibra.fotosCaixasPassagem.map((foto, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={foto} alt={`Caixa ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          const newPhotos = fibra.fotosCaixasPassagem.filter((_, i) => i !== idx);
                          updateFibra({ fotosCaixasPassagem: newPhotos });
                        }}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <div className="aspect-square">
                    <PhotoCapture
                      label="+"
                      value={null}
                      onChange={(value) => value && updateFibra({ 
                        fotosCaixasPassagem: [...fibra.fotosCaixasPassagem, value] 
                      })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </FormCard>

      {/* Subseção 2: DGOs */}
      <FormCard title="DGOs" icon={<Box className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Quantidade de DGOs</Label>
            <Input
              type="number"
              min={0}
              max={10}
              value={fibra.numDGOs}
              onChange={handleNumDGOsChange}
            />
          </div>

          {fibra.numDGOs > 0 && fibra.dgos.length > 0 && (
            <>
              {/* DGO Navigator */}
              <div className="flex items-center justify-center gap-2 py-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDGO(Math.max(0, currentDGO - 1))}
                  disabled={currentDGO === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                {fibra.dgos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentDGO(idx)}
                    className={cn(
                      "w-8 h-8 rounded-full text-xs font-semibold transition-all",
                      currentDGO === idx
                        ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "bg-card border border-border hover:border-primary/50"
                    )}
                  >
                    {idx + 1}
                  </button>
                ))}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDGO(Math.min(fibra.dgos.length - 1, currentDGO + 1))}
                  disabled={currentDGO === fibra.dgos.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Current DGO Form */}
              {fibra.dgos[currentDGO] && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/20 animate-slide-up">
                  <h4 className="font-medium text-sm text-primary">DGO {currentDGO + 1}</h4>

                  <PhotoCapture
                    label="Foto DGO Externo (obrigatória)"
                    value={fibra.dgos[currentDGO].fotoExterno}
                    onChange={(value) => updateDGO(currentDGO, { fotoExterno: value })}
                    required
                  />

                  <div className="space-y-2">
                    <Label>Capacidade</Label>
                    <Select
                      value={fibra.dgos[currentDGO].capacidade}
                      onValueChange={(value: CapacidadeDGO) => updateDGO(currentDGO, { capacidade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CAPACIDADES_DGO.map((cap) => (
                          <SelectItem key={cap} value={cap}>{cap}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato (múltipla escolha)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {FORMATOS_DGO.map((formato) => (
                        <button
                          key={formato}
                          onClick={() => toggleFormato(currentDGO, formato)}
                          className={cn(
                            "py-2 text-sm font-medium rounded-md border transition-all",
                            fibra.dgos[currentDGO].formatos.includes(formato)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-card border-border hover:border-primary/50"
                          )}
                        >
                          {formato}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Estado Físico</Label>
                      <div className="flex gap-1">
                        {(['OK', 'NOK'] as EstadoFisico[]).map((estado) => (
                          <button
                            key={estado}
                            onClick={() => updateDGO(currentDGO, { estadoFisico: estado })}
                            className={cn(
                              "flex-1 py-2 text-sm font-medium rounded-md border transition-all",
                              fibra.dgos[currentDGO].estadoFisico === estado
                                ? estado === 'OK'
                                  ? "bg-success text-success-foreground border-success"
                                  : "bg-destructive text-destructive-foreground border-destructive"
                                : "bg-card border-border hover:border-primary/50"
                            )}
                          >
                            {estado}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Organização Cordões</Label>
                      <div className="flex gap-1">
                        {(['OK', 'NOK'] as EstadoFisico[]).map((estado) => (
                          <button
                            key={estado}
                            onClick={() => updateDGO(currentDGO, { organizacaoCordoes: estado })}
                            className={cn(
                              "flex-1 py-2 text-sm font-medium rounded-md border transition-all",
                              fibra.dgos[currentDGO].organizacaoCordoes === estado
                                ? estado === 'OK'
                                  ? "bg-success text-success-foreground border-success"
                                  : "bg-destructive text-destructive-foreground border-destructive"
                                : "bg-card border-border hover:border-primary/50"
                            )}
                          >
                            {estado}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {fibra.dgos[currentDGO].organizacaoCordoes === 'NOK' && (
                    <PhotoCapture
                      label="Foto Cordões (obrigatória se NOK)"
                      value={fibra.dgos[currentDGO].fotoCordoes}
                      onChange={(value) => updateDGO(currentDGO, { fotoCordoes: value })}
                      required
                    />
                  )}
                </div>
              )}
            </>
          )}

          <div className="space-y-2 pt-2">
            <Label>Observações DGOs (opcional)</Label>
            <Textarea
              placeholder="Digite observações sobre os DGOs..."
              value={fibra.observacoesDGOs}
              onChange={(e) => updateFibra({ observacoesDGOs: e.target.value })}
            />
          </div>

          {fibra.observacoesDGOs && (
            <PhotoCapture
              label="Foto Observação DGOs"
              value={fibra.fotoObservacoesDGOs}
              onChange={(value) => updateFibra({ fotoObservacoesDGOs: value })}
            />
          )}
        </div>
      </FormCard>

      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Camera className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Dicas para documentação de Fibra</h4>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Fotografe todas as caixas e DGOs claramente</li>
              <li>• Capture detalhes de organização dos cordões</li>
              <li>• Documente qualquer não conformidade</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}