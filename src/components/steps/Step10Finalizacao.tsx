import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, Camera, Send, 
  CheckCircle, Loader2, AlertCircle, Upload
} from "lucide-react";
import { toast } from "sonner";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { generateExcel, downloadExcel } from "@/lib/generateExcel";
import { saveReportToDatabase } from "@/lib/reportDatabase";
import { updateAssignmentStatus } from "@/lib/assignmentDatabase";
import { uploadAllPhotos } from "@/lib/photoStorage";
import { format } from "date-fns";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";

interface Step10Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step10Finalizacao({ showErrors = false, validationErrors = [] }: Step10Props) {
  const tecnicoError = showErrors && getFieldError(validationErrors, 'tecnico');
  const { data, updateData, calculateProgress, resetChecklist } = useChecklist();
  const [isSending, setIsSending] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string>('');

  const progress = calculateProgress();

  const handleDirectSend = async () => {
    if (progress < 50) {
      toast.error('Checklist incompleto', {
        description: 'Preencha pelo menos 50% dos campos para enviar.'
      });
      return;
    }

    if (!data.tecnico) {
      toast.error('Nome do técnico obrigatório', {
        description: 'Preencha o nome do técnico antes de enviar.'
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Atualizar data/hora
      const updatedData = { ...data, dataHora: new Date().toISOString() };
      updateData('dataHora', updatedData.dataHora);
      
      // 1. Upload das fotos para o Storage
      setUploadProgress('Fazendo upload das fotos...');
      const siteCode = data.siglaSite || `site_${Date.now()}`;
      const dataWithUrls = await uploadAllPhotos(updatedData, siteCode);
      
      // 2. Gerar PDF
      setUploadProgress('Gerando PDF...');
      const pdfBlob = await generatePDF(dataWithUrls);
      
      // 3. Download do PDF
      const pdfFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      downloadPDF(pdfBlob, pdfFilename);
      
      // 4. Gerar e baixar Excel
      setUploadProgress('Gerando Excel...');
      const excelBlob = generateExcel(dataWithUrls);
      const excelFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.xlsx`;
      downloadExcel(excelBlob, excelFilename);

      // 5. Salvar no banco de dados
      setUploadProgress('Salvando no banco de dados...');
      const result = await saveReportToDatabase(dataWithUrls, pdfFilename, excelFilename);
      
      if (result.success) {
        // 6. Vincular à atribuição se houver
        const assignmentId = sessionStorage.getItem('currentAssignmentId');
        if (assignmentId && result.id) {
          try {
            setUploadProgress('Finalizando atribuição...');
            await updateAssignmentStatus(assignmentId, 'concluido', result.id);
            sessionStorage.removeItem('currentAssignmentId');
          } catch (assignmentError) {
            console.error('Error updating assignment:', assignmentError);
            // Don't fail the whole operation, just log the error
          }
        }
        
        toast.success('Relatório enviado com sucesso!', {
          description: 'Os dados foram salvos e os arquivos foram baixados.'
        });
        
        // Reset do formulário após envio bem-sucedido
        setTimeout(() => {
          resetChecklist();
        }, 2000);
      } else {
        throw new Error(result.error || 'Erro ao salvar no banco');
      }
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('Erro ao enviar relatório', {
        description: 'Tente novamente.'
      });
    } finally {
      setIsSending(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      <div className={`rounded-lg p-4 flex items-center gap-3 ${
        progress >= 80 ? 'bg-success/10 border border-success/30' : 
        progress >= 50 ? 'bg-warning/10 border border-warning/30' :
        'bg-destructive/10 border border-destructive/30'
      }`}>
        {progress >= 80 ? (
          <CheckCircle className="w-6 h-6 text-success" />
        ) : progress >= 50 ? (
          <AlertCircle className="w-6 h-6 text-warning" />
        ) : (
          <AlertCircle className="w-6 h-6 text-destructive" />
        )}
        <div>
          <p className="font-semibold">
            {progress >= 80 ? 'Pronto para enviar!' : 
             progress >= 50 ? 'Quase lá...' : 'Checklist incompleto'}
          </p>
          <p className="text-sm text-muted-foreground">
            {progress}% preenchido
          </p>
        </div>
      </div>

      <FormCard title="Informações do Técnico" icon={<FileText className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className={cn(tecnicoError && "text-destructive")}>
              Nome do Técnico *
            </Label>
            <Input
              value={data.tecnico}
              onChange={(e) => updateData('tecnico', e.target.value)}
              placeholder="Seu nome completo"
              className={cn(tecnicoError && "border-destructive")}
            />
            {tecnicoError && (
              <p className="text-xs text-destructive">Campo obrigatório</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Observações do Site</Label>
            <Textarea
              value={data.observacoes}
              onChange={(e) => updateData('observacoes', e.target.value)}
              placeholder="Observações gerais, problemas encontrados, recomendações..."
              rows={4}
            />
          </div>
        </div>
      </FormCard>

      <FormCard title="Fotos de Observação" icon={<Camera className="w-4 h-4" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Adicione quantas fotos precisar para documentar observações
            </span>
            <span className={cn(
              "text-xs font-bold px-2 py-0.5 rounded-full",
              (data.fotosObservacao?.filter(Boolean).length || 0) > 0 
                ? "bg-success/20 text-success" 
                : "bg-muted text-muted-foreground"
            )}>
              {data.fotosObservacao?.filter(Boolean).length || 0} foto(s)
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {(data.fotosObservacao || []).map((foto, index) => (
              <PhotoCapture
                key={index}
                label={`Observação ${index + 1}`}
                value={foto}
                onChange={(value) => {
                  const newFotos = [...(data.fotosObservacao || [])];
                  if (value) {
                    newFotos[index] = value;
                  } else {
                    // Remove the photo from array
                    newFotos.splice(index, 1);
                  }
                  updateData('fotosObservacao', newFotos);
                }}
              />
            ))}
            
            {/* Add new photo slot */}
            <PhotoCapture
              label={`Nova foto ${(data.fotosObservacao?.length || 0) + 1}`}
              value={null}
              onChange={(value) => {
                if (value) {
                  const newFotos = [...(data.fotosObservacao || []), value];
                  updateData('fotosObservacao', newFotos);
                }
              }}
            />
          </div>
        </div>
      </FormCard>


      {uploadProgress && (
        <div className="rounded-lg p-3 bg-primary/10 border border-primary/30 flex items-center gap-3">
          <Upload className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">{uploadProgress}</span>
        </div>
      )}

      <Button
        className="w-full h-16 text-lg font-semibold gap-3 bg-primary hover:bg-primary/90"
        onClick={handleDirectSend}
        disabled={isSending || progress < 50}
      >
        {isSending ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            {uploadProgress || 'Enviando...'}
          </>
        ) : (
          <>
            <Send className="w-6 h-6" />
            Enviar Relatório
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        As fotos serão comprimidas e salvas no servidor. O PDF e Excel serão baixados automaticamente.
      </p>

      <p className="text-xs text-center text-muted-foreground">
        Data/Hora: {new Date().toLocaleString('pt-BR')}
      </p>

    </div>
  );
}
