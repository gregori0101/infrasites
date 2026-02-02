import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, FileText, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PrefillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteCode: string;
  lastInspectionDate: string | null;
  onUsePreviousData: () => void;
  onStartFresh: () => void;
}

export function PrefillDialog({
  open,
  onOpenChange,
  siteCode,
  lastInspectionDate,
  onUsePreviousData,
  onStartFresh,
}: PrefillDialogProps) {
  const formattedDate = lastInspectionDate
    ? format(new Date(lastInspectionDate), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Dados Anteriores Encontrados
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">
              O site <span className="font-mono font-bold text-foreground">{siteCode}</span> foi
              vistoriado anteriormente.
            </span>
            {formattedDate && (
              <span className="flex items-center gap-2 text-xs bg-muted px-2 py-1 rounded">
                <Calendar className="h-3 w-3" />
                Última vistoria: {formattedDate}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-3 rounded-lg border bg-primary/5 border-primary/20">
            <h4 className="font-medium text-sm mb-1">Carregar dados anteriores</h4>
            <p className="text-xs text-muted-foreground">
              Pré-preenche o formulário com as informações e fotos da última vistoria.
              <span className="block mt-1 text-primary">
                Apenas a assinatura e o nome do técnico precisarão ser preenchidos novamente.
              </span>
            </p>
          </div>
          
          <div className="p-3 rounded-lg border">
            <h4 className="font-medium text-sm mb-1">Iniciar em branco</h4>
            <p className="text-xs text-muted-foreground">
              Começa uma vistoria nova sem dados pré-preenchidos.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onStartFresh} className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" />
            Iniciar em Branco
          </Button>
          <Button onClick={onUsePreviousData} className="w-full sm:w-auto">
            <History className="h-4 w-4 mr-2" />
            Usar Dados Anteriores
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
