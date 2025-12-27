import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Building2, Image, AlertCircle } from "lucide-react";
import { UF, AbrigoType } from "@/types/checklist";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

const UF_OPTIONS: UF[] = ['PA', 'AM', 'MA', 'RR', 'AP'];
const ABRIGO_OPTIONS: AbrigoType[] = ['SHARING', 'GABINETE 1', 'GABINETE 2', 'GABINETE 3', 'GABINETE 4', 'GABINETE 5', 'GABINETE 6', 'GABINETE 7'];

interface Step1Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step1DadosSite({ showErrors = false, validationErrors = [] }: Step1Props) {
  const { data, updateData } = useChecklist();

  const handleSiglaChange = (value: string) => {
    const formatted = value.toUpperCase().slice(0, 5);
    updateData('siglaSite', formatted);
  };

  const isSiglaValid = data.siglaSite.length === 5;
  const siglaError = showErrors && getFieldError(validationErrors, 'siglaSite');
  const ufError = showErrors && getFieldError(validationErrors, 'uf');
  const abrigoError = showErrors && getFieldError(validationErrors, 'abrigoSelecionado');
  const fotoError = showErrors && getFieldError(validationErrors, 'fotoPanoramica');

  return (
    <div className="space-y-4 animate-slide-up">
      <FormCard title="Identificação do Site" icon={<MapPin className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sigla">
              Sigla SCIENCE SITE <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="sigla"
                value={data.siglaSite}
                onChange={(e) => handleSiglaChange(e.target.value)}
                placeholder="Ex: PACRE"
                maxLength={5}
                className={`uppercase font-mono text-lg tracking-wider ${
                  data.siglaSite.length > 0 && !isSiglaValid 
                    ? 'border-destructive focus-visible:ring-destructive' 
                    : isSiglaValid 
                    ? 'border-success focus-visible:ring-success' 
                    : ''
                }`}
              />
              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium ${
                isSiglaValid ? 'text-success' : 'text-muted-foreground'
              }`}>
                {data.siglaSite.length}/5
              </span>
            </div>
            {data.siglaSite.length > 0 && !isSiglaValid && (
              <p className="text-xs text-destructive">A sigla deve ter exatamente 5 caracteres</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="uf">
              UF <span className="text-destructive">*</span>
            </Label>
            <Select value={data.uf} onValueChange={(value: UF) => updateData('uf', value)}>
              <SelectTrigger id="uf">
                <SelectValue placeholder="Selecione a UF" />
              </SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormCard>

      <FormCard title="Configuração do Site" icon={<Building2 className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="qtd">
              Quantidade de Gabinetes <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  onClick={() => updateData('qtdGabinetes', num)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                    data.qtdGabinetes === num
                      ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="abrigo">
              Abrigo Selecionado <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={data.abrigoSelecionado} 
              onValueChange={(value: AbrigoType) => updateData('abrigoSelecionado', value)}
            >
              <SelectTrigger id="abrigo">
                <SelectValue placeholder="Selecione o abrigo" />
              </SelectTrigger>
              <SelectContent>
                {ABRIGO_OPTIONS.map((abrigo) => (
                  <SelectItem key={abrigo} value={abrigo}>
                    {abrigo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormCard>

      <FormCard title="Foto Panorâmica" icon={<Image className="w-4 h-4" />} variant="accent">
        <PhotoCapture
          label="Vista geral do site"
          value={data.fotoPanoramica}
          onChange={(value) => updateData('fotoPanoramica', value)}
          required
        />
      </FormCard>
    </div>
  );
}
