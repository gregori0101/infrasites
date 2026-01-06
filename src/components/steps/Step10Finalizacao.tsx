import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, Camera, PenTool, Send, 
  CheckCircle, Loader2, AlertCircle, Upload 
} from "lucide-react";
import { toast } from "sonner";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { generateExcel, downloadExcel } from "@/lib/generateExcel";
import { saveReportToDatabase } from "@/lib/reportDatabase";
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
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = React.useState(false);

  const progress = calculateProgress();

  const handleCanvasStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleCanvasMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const handleCanvasEnd = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      updateData('assinaturaDigital', dataUrl);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    updateData('assinaturaDigital', null);
  };

  const handleSendReport = async () => {
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
      
      // 2. Gerar PDF com as URLs
      setUploadProgress('Gerando PDF...');
      const pdfBlob = await generatePDF(dataWithUrls);
      
      // 3. Gerar Excel
      setUploadProgress('Gerando Excel...');
      const excelBlob = generateExcel(dataWithUrls);
      
      const pdfFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      const excelFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.xlsx`;
      
      // 4. Download dos arquivos
      setUploadProgress('Baixando arquivos...');
      downloadPDF(pdfBlob, pdfFilename);
      downloadExcel(excelBlob, excelFilename);

      // 5. Salvar no banco de dados
      setUploadProgress('Salvando no banco de dados...');
      const result = await saveReportToDatabase(dataWithUrls, pdfFilename, excelFilename);
      
      if (result.success) {
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
        description: 'Tente novamente. Alguns arquivos podem ter sido baixados.'
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

      <FormCard title="Foto Adicional" icon={<Camera className="w-4 h-4" />}>
        <PhotoCapture
          label="Observação específica (opcional)"
          value={data.fotoObservacao}
          onChange={(value) => updateData('fotoObservacao', value)}
        />
      </FormCard>

      <FormCard title="Assinatura Digital" icon={<PenTool className="w-4 h-4" />} variant="accent">
        <div className="space-y-3">
          <div className="border-2 border-dashed border-primary/30 rounded-lg overflow-hidden bg-card">
            <canvas
              ref={canvasRef}
              width={300}
              height={150}
              className="w-full touch-none"
              onMouseDown={handleCanvasStart}
              onMouseMove={handleCanvasMove}
              onMouseUp={handleCanvasEnd}
              onMouseLeave={handleCanvasEnd}
              onTouchStart={handleCanvasStart}
              onTouchMove={handleCanvasMove}
              onTouchEnd={handleCanvasEnd}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Desenhe sua assinatura acima
            </span>
            <Button variant="outline" size="sm" onClick={clearSignature}>
              Limpar
            </Button>
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
        onClick={handleSendReport}
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
        O relatório será salvo no banco de dados e os arquivos PDF e Excel serão baixados automaticamente.
        As fotos serão salvas no servidor para melhor qualidade no PDF.
      </p>

      <p className="text-xs text-center text-muted-foreground">
        Data/Hora: {new Date().toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
