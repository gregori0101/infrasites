import * as React from "react";
import { useChecklist } from "@/contexts/ChecklistContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, Camera, PenTool, Send, FileSpreadsheet, 
  Download, CheckCircle, Loader2, AlertCircle, History 
} from "lucide-react";
import { toast } from "sonner";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { generateExcel, downloadExcel } from "@/lib/generateExcel";
import { saveReportToDatabase, updateReportEmailSent } from "@/lib/reportDatabase";
import { format } from "date-fns";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

interface Step10Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step10Finalizacao({ showErrors = false, validationErrors = [] }: Step10Props) {
  const tecnicoError = showErrors && getFieldError(validationErrors, 'tecnico');
  const { data, updateData, saveToLocal, calculateProgress, resetChecklist } = useChecklist();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [savedReportId, setSavedReportId] = React.useState<string | null>(null);
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

  const handleSave = () => {
    updateData('dataHora', new Date().toISOString());
    saveToLocal();
    toast.success('Checklist salvo localmente!', {
      description: 'Os dados foram armazenados no dispositivo.'
    });
  };

  const handleGeneratePDF = async () => {
    if (progress < 30) {
      toast.error('Checklist incompleto', {
        description: 'Preencha mais campos antes de gerar o PDF.'
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      updateData('dataHora', new Date().toISOString());
      const pdfBlob = await generatePDF(data);
      const filename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      downloadPDF(pdfBlob, filename);
      toast.success('PDF gerado com sucesso!', {
        description: filename
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF', {
        description: 'Tente novamente.'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateExcel = async () => {
    if (progress < 30) {
      toast.error('Checklist incompleto', {
        description: 'Preencha mais campos antes de gerar o Excel.'
      });
      return;
    }

    setIsGeneratingExcel(true);
    try {
      updateData('dataHora', new Date().toISOString());
      const excelBlob = generateExcel(data);
      const filename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.xlsx`;
      downloadExcel(excelBlob, filename);
      toast.success('Excel gerado com sucesso!', {
        description: filename
      });
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('Erro ao gerar Excel', {
        description: 'Tente novamente.'
      });
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleSendEmail = async () => {
    if (progress < 50) {
      toast.error('Checklist incompleto', {
        description: 'Preencha pelo menos 50% dos campos para enviar.'
      });
      return;
    }

    setIsSendingEmail(true);
    
    try {
      // Generate both files first
      updateData('dataHora', new Date().toISOString());
      const pdfBlob = await generatePDF(data);
      const excelBlob = generateExcel(data);
      
      const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');
      const pdfFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.pdf`;
      const excelFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.xlsx`;
      
      // Download both files
      downloadPDF(pdfBlob, pdfFilename);
      downloadExcel(excelBlob, excelFilename);

      // Save to database (even if email fails)
      let reportId = savedReportId;
      if (!reportId) {
        const result = await saveReportToDatabase(data, pdfFilename, excelFilename);
        if (result.success && result.id) {
          reportId = result.id;
          setSavedReportId(result.id);
          toast.success('Relatório salvo no banco de dados!');
        } else {
          console.error('Failed to save report:', result.error);
          toast.warning('Relatório não foi salvo no banco', {
            description: result.error
          });
        }
      }

      // Build email body with checklist summary
      const emailBody = `
Checklist Sites Telecom

Site: ${data.siglaSite} - ${data.uf}
Data: ${dateStr}
Técnico: ${data.tecnico || 'N/A'}

Gabinetes: ${data.qtdGabinetes}
${data.gabinetes.map((g, i) => `  • Gabinete ${i + 1}: ${g.tipo} - ${g.tecnologiasAcesso.join(', ') || 'N/A'}`).join('\n')}

GMG: ${data.gmg.informar ? 'Sim' : 'Não'}
Aterramento: ${data.torre.aterramento}
Zeladoria: ${data.torre.zeladoria}

Observações: ${data.observacoes || 'Nenhuma'}

---
Arquivos PDF e Excel foram baixados automaticamente.
Por favor, anexe-os a este email.
      `.trim();

      const subject = `Checklist ${data.siglaSite || 'NOVO'} – ${data.uf} – ${dateStr}`;
      const mailtoLink = `mailto:gregori.jose@telefonica.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      window.open(mailtoLink, '_blank');
      
      // Update email_sent status if we have a report ID
      if (reportId) {
        await updateReportEmailSent(reportId);
      }
      
      toast.success('Email preparado!', {
        description: 'Anexe os arquivos baixados e envie.'
      });
    } catch (error) {
      console.error('Error preparing email:', error);
      toast.error('Erro ao preparar email', {
        description: 'Tente novamente.'
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleViewHistory = () => {
    navigate('/historico');
  };

  const isGenerating = isGeneratingPDF || isGeneratingExcel || isSendingEmail;

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
            <Label>Nome do Técnico</Label>
            <Input
              value={data.tecnico}
              onChange={(e) => updateData('tecnico', e.target.value)}
              placeholder="Seu nome completo"
            />
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

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="h-14 flex-col gap-1"
          onClick={handleGeneratePDF}
          disabled={isGenerating}
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-primary" />
          )}
          <span className="text-xs">Gerar PDF</span>
        </Button>

        <Button
          variant="outline"
          className="h-14 flex-col gap-1"
          onClick={handleGenerateExcel}
          disabled={isGenerating}
        >
          {isGeneratingExcel ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <FileSpreadsheet className="w-5 h-5 text-success" />
          )}
          <span className="text-xs">Gerar Excel</span>
        </Button>
      </div>

      <Button
        className="w-full h-14 text-lg font-semibold gap-2 bg-accent hover:bg-accent/90"
        onClick={handleSendEmail}
        disabled={isGenerating || progress < 50}
      >
        {isSendingEmail ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        Enviar por Email
      </Button>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          className="h-12"
          onClick={handleSave}
        >
          Salvar Localmente
        </Button>

        <Button
          variant="outline"
          className="h-12"
          onClick={handleViewHistory}
        >
          <History className="w-4 h-4 mr-2" />
          Ver Histórico
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Data/Hora: {new Date().toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
