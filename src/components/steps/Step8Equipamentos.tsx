import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Camera, Info } from "lucide-react";
import { ValidationError } from "@/hooks/use-validation";

interface Step8Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step8Equipamentos({ showErrors = false, validationErrors = [] }: Step8Props) {
  const { data, currentGabinete, updateGabinete } = useChecklist();
  const gabinete = data.gabinetes[currentGabinete];

  if (!gabinete) return null;

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="bg-primary/10 rounded-lg p-3 flex items-center justify-between">
        <span className="text-sm font-medium text-primary">
          Equipamentos - Gabinete {currentGabinete + 1}
        </span>
      </div>

      <FormCard 
        title="Informações dos Equipamentos" 
        icon={<Info className="w-4 h-4" />}
        variant="accent"
      >
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Camera className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Fotos de Equipamentos</h4>
              <p className="text-sm text-muted-foreground mt-1">
                As fotos de equipamentos de transmissão e acesso foram movidas para a seção 
                <span className="font-medium text-primary"> Informações do Gabinete</span>.
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Vista Panorâmica do Gabinete</li>
                <li>• Equipamentos de Transmissão</li>
                <li>• Equipamentos de Acesso</li>
              </ul>
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
}
