import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StepIndicator } from "@/components/ui/step-indicator";
import { Button } from "@/components/ui/button";
import { Step1DadosSite } from "@/components/steps/Step1DadosSite";
import { Step2Gabinete } from "@/components/steps/Step2Gabinete";
import { Step3FCC } from "@/components/steps/Step3FCC";
import { Step4Baterias } from "@/components/steps/Step4Baterias";
import { Step5Climatizacao } from "@/components/steps/Step5Climatizacao";
import { Step6Fibra } from "@/components/steps/Step6Fibra";
import { Step7Energia } from "@/components/steps/Step7Energia";
import { Step9GMGTorre } from "@/components/steps/Step9GMGTorre";
import { Step10Finalizacao } from "@/components/steps/Step10Finalizacao";
import { 
  MapPin, Server, Zap, Battery, Fan, Cable, Plug,
  Fuel, FileCheck, ChevronLeft, ChevronRight,
  Moon, Sun, History, AlertCircle, LayoutDashboard
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { VivoLogo } from "@/components/ui/vivo-logo";
import { useStepValidation } from "@/hooks/use-validation";
import { toast } from "sonner";

const STEPS = [
  { label: 'Site', icon: <MapPin /> },
  { label: 'Gabinete', icon: <Server /> },
  { label: 'FCC', icon: <Zap /> },
  { label: 'Baterias', icon: <Battery /> },
  { label: 'Clima', icon: <Fan /> },
  { label: 'Fibra', icon: <Cable /> },
  { label: 'Energia', icon: <Plug /> },
  { label: 'GMG/Torre', icon: <Fuel /> },
  { label: 'Finalizar', icon: <FileCheck /> },
];

export function ChecklistWizard() {
  const { 
    currentStep, 
    setCurrentStep, 
    currentGabinete,
    setCurrentGabinete,
    data,
    calculateProgress,
    isDarkMode,
    toggleDarkMode,
    getAllLocal,
    loadFromLocal,
    deleteLocal
  } = useChecklist();

  const [touchStart, setTouchStart] = React.useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<{ x: number; y: number } | null>(null);

  const progress = calculateProgress();
  const savedChecklists = getAllLocal();

  // Steps 1-4 are per-gabinete (step 0 = site, step 5 = fibra, step 6 = energia)
  const isGabineteStep = (currentStep >= 1 && currentStep <= 4);
  const maxGabinetes = data.qtdGabinetes;

  // Ensure currentGabinete is always within bounds
  const safeCurrentGabinete = Math.min(currentGabinete, Math.max(0, data.gabinetes.length - 1));

  React.useEffect(() => {
    if (currentGabinete !== safeCurrentGabinete) {
      setCurrentGabinete(safeCurrentGabinete);
    }
  }, [currentGabinete, safeCurrentGabinete, setCurrentGabinete]);

  const validation = useStepValidation(data, currentStep, currentGabinete);
  const [showValidationErrors, setShowValidationErrors] = React.useState(false);

  const handleNext = () => {
    // Validate current step before proceeding
    if (!validation.isValid) {
      setShowValidationErrors(true);
      toast.error("Preencha os campos obrigatórios", {
        description: validation.errors[0]?.message,
        icon: <AlertCircle className="w-4 h-4" />
      });
      return;
    }

    setShowValidationErrors(false);

    if (isGabineteStep && currentGabinete < maxGabinetes - 1) {
      setCurrentGabinete(currentGabinete + 1);
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 0 || currentStep === 5 || currentStep === 6) {
        setCurrentGabinete(0);
      }
    }
  };

  const handlePrev = () => {
    if (isGabineteStep && currentGabinete > 0) {
      setCurrentGabinete(currentGabinete - 1);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 1) {
        setCurrentGabinete(0);
      }
    }
  };

  // Swipe detection (avoid triggering while user is interacting with inputs)
  const minSwipeDistance = 60;

  const isInteractiveElement = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return false;
    const tag = target.tagName.toLowerCase();
    if (['input', 'textarea', 'select', 'button', 'label'].includes(tag)) return true;
    return Boolean(target.closest('input, textarea, select, button, label, [role="combobox"], [data-radix-collection-item]'));
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (isInteractiveElement(e.target)) return;
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;

    // Ignore mostly-vertical gestures (scroll)
    if (Math.abs(deltaY) > Math.abs(deltaX)) return;

    const isLeftSwipe = deltaX > minSwipeDistance;
    const isRightSwipe = deltaX < -minSwipeDistance;

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: return <Step1DadosSite showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 1: return <Step2Gabinete showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 2: return <Step3FCC showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 3: return <Step4Baterias showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 4: return <Step5Climatizacao showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 5: return <Step6Fibra showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 6: return <Step7Energia showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 7: return <Step9GMGTorre showErrors={showValidationErrors} validationErrors={validation.errors} />;
      case 8: return <Step10Finalizacao showErrors={showValidationErrors} validationErrors={validation.errors} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <VivoLogo size="md" />
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="font-bold text-sm leading-tight">Checklist Telecom</h1>
              <p className="text-[10px] text-muted-foreground">
                {data.siglaSite || 'Novo'} • {data.uf}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => window.location.href = '/dashboard'}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleDarkMode}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <History className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Histórico Local</SheetTitle>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                    onClick={() => window.location.href = '/historico'}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Ver Histórico Completo (Banco)
                  </Button>
                  
                  {savedChecklists.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Nenhum checklist salvo localmente
                    </p>
                  ) : (
                    savedChecklists.map((checklist) => (
                      <div
                        key={checklist.id}
                        className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => loadFromLocal(checklist.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm">
                            {checklist.siglaSite || 'Sem sigla'} - {checklist.uf}
                          </span>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            checklist.sincronizado 
                              ? "bg-success/20 text-success" 
                              : "bg-warning/20 text-warning"
                          )}>
                            {checklist.sincronizado ? 'Sincronizado' : 'Local'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(checklist.updatedAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <ProgressBar value={progress} />

        <div className="mt-3">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />
        </div>
      </header>

      {/* Gabinete Navigator */}
      {isGabineteStep && maxGabinetes > 1 && (
        <div className="bg-muted/50 px-4 py-2 flex items-center justify-center gap-2 border-b">
          {Array.from({ length: maxGabinetes }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentGabinete(i)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-semibold transition-all",
                currentGabinete === i
                  ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "bg-card border border-border hover:border-primary/50"
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <main 
        className="flex-1 overflow-y-auto px-4 py-4"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {renderStep()}
      </main>

      {/* Footer Navigation */}
      <footer className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12"
          onClick={handlePrev}
          disabled={currentStep === 0 && currentGabinete === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Anterior
        </Button>
        <Button
          className="flex-1 h-12"
          onClick={handleNext}
          disabled={currentStep === STEPS.length - 1 && currentGabinete === maxGabinetes - 1}
        >
          Próximo
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </footer>
    </div>
  );
}
