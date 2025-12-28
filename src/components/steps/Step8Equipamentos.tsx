import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Server, Radio, Camera, AlertCircle } from "lucide-react";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

interface Step8Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step8Equipamentos({ showErrors = false, validationErrors = [] }: Step8Props) {
  const { data, currentGabinete, updateGabinete } = useChecklist();
  const gabinete = data.gabinetes[currentGabinete];

  if (!gabinete) return null;

  const transmissaoError = showErrors && getFieldError(validationErrors, 'fotoTransmissao');
  const acessoError = showErrors && getFieldError(validationErrors, 'fotoAcesso');

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          Equipamentos - Gabinete {currentGabinete + 1}
        </span>
      </div>

      <FormCard 
        title="Equipamentos de Transmissão" 
        icon={<Server className="w-4 h-4" />}
        variant="accent"
      >
        <PhotoCapture
          label="Vista do gabinete aberto (Transmissão)"
          value={gabinete.fotoTransmissao}
          onChange={(value) => updateGabinete(currentGabinete, { fotoTransmissao: value })}
          required
        />
        <p className="text-xs text-muted-foreground mt-2">
          Capture uma foto clara dos equipamentos de transmissão com o gabinete aberto
        </p>
      </FormCard>

      <FormCard 
        title="Equipamentos de Acesso" 
        icon={<Radio className="w-4 h-4" />}
        variant="accent"
      >
        <PhotoCapture
          label="Vista do gabinete aberto (Acesso)"
          value={gabinete.fotoAcesso}
          onChange={(value) => updateGabinete(currentGabinete, { fotoAcesso: value })}
          required
        />
        <p className="text-xs text-muted-foreground mt-2">
          Capture uma foto clara dos equipamentos de acesso com o gabinete aberto
        </p>
      </FormCard>

      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Camera className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">Dicas para boas fotos</h4>
            <ul className="text-xs text-muted-foreground mt-1 space-y-1">
              <li>• Garanta boa iluminação no gabinete</li>
              <li>• Capture todos os equipamentos visíveis</li>
              <li>• Evite reflexos e sombras intensas</li>
              <li>• Mantenha o foco nos componentes principais</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
