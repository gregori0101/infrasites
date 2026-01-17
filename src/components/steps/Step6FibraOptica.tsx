import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Cable, Box, ArrowUpCircle, Layers, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AbordagemFibra, NumAbordagens, AbordagemFibraData, DGOFibraData, INITIAL_ABORDAGEM_FIBRA, INITIAL_DGO_FIBRA, INITIAL_FIBRA_OPTICA } from "@/types/checklist";
import { ValidationError } from "@/hooks/use-validation";

interface Step6Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step6FibraOptica({ showErrors, validationErrors = [] }: Step6Props) {
  const { data, updateData } = useChecklist();
  const fibraOptica = data.fibraOptica || INITIAL_FIBRA_OPTICA;

  const updateFibra = (updates: Partial<typeof fibraOptica>) => {
    updateData('fibraOptica', { ...fibraOptica, ...updates });
  };

  // Handle quantity of abordagens change
  const handleQtdAbordagensChange = (qtd: NumAbordagens) => {
    const currentAbordagens = [...fibraOptica.abordagens];
    while (currentAbordagens.length < qtd) {
      currentAbordagens.push({ ...INITIAL_ABORDAGEM_FIBRA });
    }
    while (currentAbordagens.length > qtd) {
      currentAbordagens.pop();
    }
    updateFibra({ qtdAbordagens: qtd, abordagens: currentAbordagens });
  };

  // Update specific abordagem
  const updateAbordagem = (index: number, updates: Partial<AbordagemFibraData>) => {
    const newAbordagens = [...fibraOptica.abordagens];
    newAbordagens[index] = { ...newAbordagens[index], ...updates };
    updateFibra({ abordagens: newAbordagens });
  };

  // Add photo to abordagem
  const addAbordagemPhoto = (index: number, photo: string) => {
    const newAbordagens = [...fibraOptica.abordagens];
    newAbordagens[index].fotos = [...newAbordagens[index].fotos, photo];
    updateFibra({ abordagens: newAbordagens });
  };

  // Remove photo from abordagem
  const removeAbordagemPhoto = (abordIndex: number, photoIndex: number) => {
    const newAbordagens = [...fibraOptica.abordagens];
    newAbordagens[abordIndex].fotos = newAbordagens[abordIndex].fotos.filter((_, i) => i !== photoIndex);
    updateFibra({ abordagens: newAbordagens });
  };

  // Handle DGOs quantity change
  const handleQtdDGOsChange = (qtd: number) => {
    const currentDGOs = [...fibraOptica.dgos];
    while (currentDGOs.length < qtd) {
      currentDGOs.push({ ...INITIAL_DGO_FIBRA });
    }
    while (currentDGOs.length > qtd) {
      currentDGOs.pop();
    }
    updateFibra({ qtdDGOs: qtd, dgos: currentDGOs });
  };

  // Update specific DGO
  const updateDGO = (index: number, updates: Partial<DGOFibraData>) => {
    const newDGOs = [...fibraOptica.dgos];
    newDGOs[index] = { ...newDGOs[index], ...updates };
    updateFibra({ dgos: newDGOs });
  };

  // Photo array handlers
  const addArrayPhoto = (field: 'fotosCaixasPassagem' | 'fotosCaixasSubterraneas' | 'fotosSubidasLaterais', photo: string) => {
    updateFibra({ [field]: [...fibraOptica[field], photo] });
  };

  const removeArrayPhoto = (field: 'fotosCaixasPassagem' | 'fotosCaixasSubterraneas' | 'fotosSubidasLaterais', index: number) => {
    updateFibra({ [field]: fibraOptica[field].filter((_, i) => i !== index) });
  };

  // Calculate summary
  const summary = React.useMemo(() => {
    const tiposAbordagem = fibraOptica.abordagens.map(a => a.tipoEntrada);
    const dgosOk = fibraOptica.dgos.filter(d => d.estadoCordoes === 'OK').length;
    const dgosNok = fibraOptica.dgos.filter(d => d.estadoCordoes === 'NOK').length;
    
    return {
      qtdAbordagens: fibraOptica.qtdAbordagens,
      tiposAbordagem,
      qtdCaixasPassagem: fibraOptica.qtdCaixasPassagem,
      qtdCaixasSubterraneas: fibraOptica.qtdCaixasSubterraneas,
      qtdSubidasLaterais: fibraOptica.qtdSubidasLaterais,
      qtdDGOs: fibraOptica.qtdDGOs,
      dgosOk,
      dgosNok,
    };
  }, [fibraOptica]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Cable className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Fibra Óptica do Site</h2>
          <p className="text-sm text-muted-foreground">Registre a infraestrutura de fibra óptica</p>
        </div>
      </div>

      {/* 1. Abordagem da Fibra */}
      <FormCard title="Abordagem da Fibra" icon={<Cable className="w-4 h-4" />}>
        <div className="space-y-4">
          <div>
            <Label>Quantidade de abordagens de fibra no site</Label>
            <Select
              value={String(fibraOptica.qtdAbordagens)}
              onValueChange={(v) => handleQtdAbordagensChange(Number(v) as NumAbordagens)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 abordagem</SelectItem>
                <SelectItem value="2">2 abordagens</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {fibraOptica.abordagens.map((abordagem, index) => (
            <Card key={index} className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  Abordagem {index + 1}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Tipo de entrada da fibra</Label>
                  <Select
                    value={abordagem.tipoEntrada}
                    onValueChange={(v) => updateAbordagem(index, { tipoEntrada: v as AbordagemFibra })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AÉREA">Aérea</SelectItem>
                      <SelectItem value="SUBTERRÂNEA">Subterrânea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Descrição da abordagem (opcional)</Label>
                  <Textarea
                    value={abordagem.descricao}
                    onChange={(e) => updateAbordagem(index, { descricao: e.target.value })}
                    placeholder="Descreva detalhes da abordagem..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label className="mb-2 block">Fotos da abordagem</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {abordagem.fotos.map((photo, photoIndex) => (
                      <div key={photoIndex} className="relative group">
                        <img src={photo} alt={`Foto ${photoIndex + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <Button
                          size="icon"
                          variant="destructive"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeAbordagemPhoto(index, photoIndex)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <PhotoCapture
                    label="Adicionar foto"
                    value={null}
                    onChange={(photo) => photo && addAbordagemPhoto(index, photo)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </FormCard>

      {/* 2. Caixas de Passagem */}
      <FormCard title="Caixas de Passagem" icon={<Box className="w-4 h-4" />}>
        <div className="space-y-4">
          <div>
            <Label>Quantidade de caixas de passagem no site</Label>
            <Input
              type="number"
              min={0}
              value={fibraOptica.qtdCaixasPassagem}
              onChange={(e) => updateFibra({ qtdCaixasPassagem: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>

          {fibraOptica.qtdCaixasPassagem > 0 && (
            <div>
              <Label className="mb-2 block">Fotos das caixas de passagem</Label>
              <div className="grid grid-cols-2 gap-2">
                {fibraOptica.fotosCaixasPassagem.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Caixa ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeArrayPhoto('fotosCaixasPassagem', index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <PhotoCapture
                label="Adicionar foto"
                value={null}
                onChange={(photo) => photo && addArrayPhoto('fotosCaixasPassagem', photo)}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </FormCard>

      {/* 2b. Caixas Subterrâneas */}
      <FormCard title="Caixas Subterrâneas" icon={<Box className="w-4 h-4" />}>
        <div className="space-y-4">
          <div>
            <Label>Quantidade de caixas subterrâneas no site</Label>
            <Input
              type="number"
              min={0}
              value={fibraOptica.qtdCaixasSubterraneas}
              onChange={(e) => updateFibra({ qtdCaixasSubterraneas: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>

          {fibraOptica.qtdCaixasSubterraneas > 0 && (
            <div>
              <Label className="mb-2 block">Fotos das caixas subterrâneas</Label>
              <div className="grid grid-cols-2 gap-2">
                {fibraOptica.fotosCaixasSubterraneas.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Caixa Sub ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeArrayPhoto('fotosCaixasSubterraneas', index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <PhotoCapture
                label="Adicionar foto"
                value={null}
                onChange={(photo) => photo && addArrayPhoto('fotosCaixasSubterraneas', photo)}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </FormCard>

      {/* 3. Subidas Laterais */}
      <FormCard title="Subidas Laterais" icon={<ArrowUpCircle className="w-4 h-4" />}>
        <div className="space-y-4">
          <div>
            <Label>Quantidade de subidas laterais de fibra na estrutura</Label>
            <Input
              type="number"
              min={0}
              value={fibraOptica.qtdSubidasLaterais}
              onChange={(e) => updateFibra({ qtdSubidasLaterais: Math.max(0, parseInt(e.target.value) || 0) })}
            />
          </div>

          {fibraOptica.qtdSubidasLaterais > 0 && (
            <div>
              <Label className="mb-2 block">Fotos das subidas laterais</Label>
              <div className="grid grid-cols-2 gap-2">
                {fibraOptica.fotosSubidasLaterais.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img src={photo} alt={`Subida ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeArrayPhoto('fotosSubidasLaterais', index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <PhotoCapture
                label="Adicionar foto"
                value={null}
                onChange={(photo) => photo && addArrayPhoto('fotosSubidasLaterais', photo)}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </FormCard>

      {/* 4. DGOs */}
      <FormCard title="DGOs (Distribuição de Fibra)" icon={<Layers className="w-4 h-4" />}>
        <div className="space-y-4">
          <div>
            <Label>Quantidade de DGOs no site</Label>
            <Input
              type="number"
              min={0}
              value={fibraOptica.qtdDGOs}
              onChange={(e) => handleQtdDGOsChange(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>

          {fibraOptica.dgos.map((dgo, index) => (
            <Card key={index} className={cn(
              "border-2",
              dgo.estadoCordoes === 'NOK' ? "border-destructive/50" : "border-success/50"
            )}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    DGO {index + 1}
                  </span>
                  <Badge variant={dgo.estadoCordoes === 'OK' ? 'default' : 'destructive'}>
                    {dgo.estadoCordoes === 'OK' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                    {dgo.estadoCordoes}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Identificação do DGO</Label>
                  <Input
                    value={dgo.identificacao}
                    onChange={(e) => updateDGO(index, { identificacao: e.target.value })}
                    placeholder="Ex: DGO-01"
                  />
                </div>

                <div>
                  <Label>Capacidade de fibras (FO)</Label>
                  <Select
                    value={String(dgo.capacidadeFO)}
                    onValueChange={(v) => updateDGO(index, { capacidadeFO: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 FO</SelectItem>
                      <SelectItem value="24">24 FO</SelectItem>
                      <SelectItem value="48">48 FO</SelectItem>
                      <SelectItem value="72">72 FO</SelectItem>
                      <SelectItem value="144">144 FO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Estado da organização dos cordões</Label>
                  <Select
                    value={dgo.estadoCordoes}
                    onValueChange={(v) => updateDGO(index, { 
                      estadoCordoes: v as 'OK' | 'NOK',
                      fotoCordesDetalhada: v === 'OK' ? null : dgo.fotoCordesDetalhada
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOK">NOK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <PhotoCapture
                  label="Foto do DGO"
                  value={dgo.fotoDGO}
                  onChange={(photo) => updateDGO(index, { fotoDGO: photo })}
                  required
                />

                {dgo.estadoCordoes === 'NOK' && (
                  <PhotoCapture
                    label="Foto detalhada dos cordões (obrigatória)"
                    value={dgo.fotoCordesDetalhada}
                    onChange={(photo) => updateDGO(index, { fotoCordesDetalhada: photo })}
                    required
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </FormCard>

      {/* Summary */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Cable className="w-4 h-4 text-primary" />
            Resumo da Fibra Óptica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Abordagens:</span>
              <span className="font-medium">{summary.qtdAbordagens}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tipos:</span>
              <span className="font-medium">{summary.tiposAbordagem.join(', ') || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caixas de passagem:</span>
              <span className="font-medium">{summary.qtdCaixasPassagem}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Caixas subterrâneas:</span>
              <span className="font-medium">{summary.qtdCaixasSubterraneas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subidas laterais:</span>
              <span className="font-medium">{summary.qtdSubidasLaterais}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total DGOs:</span>
              <span className="font-medium">{summary.qtdDGOs}</span>
            </div>
            {summary.qtdDGOs > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DGOs OK:</span>
                  <Badge variant="default" className="text-xs">{summary.dgosOk}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">DGOs NOK:</span>
                  <Badge variant="destructive" className="text-xs">{summary.dgosNok}</Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
