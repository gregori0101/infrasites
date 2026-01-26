import * as React from "react";
import { cn } from "@/lib/utils";
import { Ban, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "./button";

interface SectionSkipToggleProps {
  sectionName: string;
  isSkipped: boolean;
  onToggle: (skipped: boolean) => void;
  children: React.ReactNode;
}

export function SectionSkipToggle({
  sectionName,
  isSkipped,
  onToggle,
  children,
}: SectionSkipToggleProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Skip Toggle Header */}
      <div 
        className={cn(
          "rounded-lg p-4 border-2 border-dashed transition-all",
          isSkipped 
            ? "bg-muted/50 border-muted-foreground/30" 
            : "bg-transparent border-transparent"
        )}
      >
        <Button
          type="button"
          variant={isSkipped ? "default" : "outline"}
          className={cn(
            "w-full gap-2 h-12 text-base font-medium transition-all",
            isSkipped && "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          onClick={() => onToggle(!isSkipped)}
        >
          <Ban className="w-5 h-5" />
          {isSkipped ? (
            <>
              <span>Seção marcada como "Não se Aplica"</span>
              <ChevronDown className="w-4 h-4 ml-auto" />
            </>
          ) : (
            <>
              <span>Marcar como "Não se Aplica"</span>
              <ChevronUp className="w-4 h-4 ml-auto opacity-0" />
            </>
          )}
        </Button>

        {isSkipped && (
          <p className="text-sm text-muted-foreground text-center mt-3">
            A seção "{sectionName}" foi marcada como não aplicável para este site.
            <br />
            <span className="text-xs">Clique no botão acima para expandir e preencher.</span>
          </p>
        )}
      </div>

      {/* Section Content */}
      {!isSkipped && children}
    </div>
  );
}
