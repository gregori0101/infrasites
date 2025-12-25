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
  Download, CheckCircle, Loader2, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

export function Step8Finalizacao() {
  const { data, updateData, saveToLocal, calculateProgress } = useChecklist();
  const [isGenerating, setIsGenerating] = React.useState(false);
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
    if (progress < 50) {
      toast.error('Checklist incompleto', {
        description: 'Preencha pelo menos 50% dos campos obrigatórios.'
      });
      return;
    }

    setIsGenerating(true);
    // Simulate PDF generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    toast.success('PDF gerado com sucesso!', {
      description: `Checklist_${data.siglaSite}_${data.uf}.pdf`
    });
  };

  const handleGenerateExcel = async () => {
    if (progress < 50) {
      toast.error('Checklist incompleto', {
        description: 'Preencha pelo menos 50% dos campos obrigatórios.'
      });
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    toast.success('Excel gerado com sucesso!', {
      description: `Checklist_${data.siglaSite}_${data.uf}.xlsx`
    });
  };

  const handleSendEmail = async () => {
    if (progress < 80) {
      toast.error('Checklist incompleto', {
        description: 'Preencha pelo menos 80% dos campos para enviar.'
      });
      return;
    }

    if (!data.assinaturaDigital) {
      toast.error('Assinatura obrigatória', {
        description: 'Assine o checklist antes de enviar.'
      });
      return;
    }

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsGenerating(false);
    toast.success('Relatório enviado!', {
      description: 'Enviado para gregori.jose@telefonica.com'
    });
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
          {isGenerating ? (
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
          {isGenerating ? (
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
        disabled={isGenerating || progress < 80}
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
        Enviar por Email
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        onClick={handleSave}
      >
        Salvar Localmente
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Data/Hora: {new Date().toLocaleString('pt-BR')}
      </p>
    </div>
  );
}
