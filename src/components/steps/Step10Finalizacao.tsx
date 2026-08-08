import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useChecklist } from "@/contexts/ChecklistContext";
import { useAuth } from "@/contexts/AuthContext";
import { FormCard } from "@/components/ui/form-card";
import { PhotoCapture } from "@/components/ui/photo-capture";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  FileText, Camera, Send, 
  CheckCircle, Loader2, AlertCircle, Upload, FileDown, Pencil, LayoutDashboard, Plus
} from "lucide-react";
import { toast } from "sonner";
import { generatePDF, downloadPDF } from "@/lib/generatePDF";
import { generateExcel, downloadExcel } from "@/lib/generateExcel";
import { saveReportToDatabase, updateReportInDatabase } from "@/lib/reportDatabase";
import { updateAssignmentStatus } from "@/lib/assignmentDatabase";
import { uploadAllPhotos } from "@/lib/photoStorage";
import { format } from "date-fns";
import { ValidationError, getFieldError } from "@/hooks/use-validation";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Step10Props {
  showErrors?: boolean;
  validationErrors?: ValidationError[];
}

export function Step10Finalizacao({ showErrors = false, validationErrors = [] }: Step10Props) {
  const tecnicoError = showErrors && getFieldError(validationErrors, 'tecnico');
  const { data, updateData, calculateProgress, resetChecklist, editingReportId, clearEditingMode } = useChecklist();
  const { user, isGestor, isAdmin } = useAuth();
  const [isSending, setIsSending] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string>('');
  const [userOperadora, setUserOperadora] = React.useState<string>('VIVO');
  const [showDownloadDialog, setShowDownloadDialog] = React.useState(false);
  const [downloadPdfOption, setDownloadPdfOption] = React.useState<boolean | null>(null);
  const [showCompletionActions, setShowCompletionActions] = React.useState(false);

  const progress = calculateProgress();

  // Fetch user operadora on mount
  React.useEffect(() => {
    const fetchOperadora = async () => {
      if (user?.id) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('operadora')
          .eq('user_id', user.id)
          .single();
        if (roleData?.operadora) {
          setUserOperadora(roleData.operadora);
        }
      }
    };
    fetchOperadora();
  }, [user?.id]);

  const handleSendClick = () => {
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

    // Show dialog to ask about PDF download
    setShowDownloadDialog(true);
  };

  const handleConfirmSend = async (shouldDownloadPdf: boolean) => {
    setShowDownloadDialog(false);
    setDownloadPdfOption(shouldDownloadPdf);

    setIsSending(true);
    
    // CRITICAL: Wrap EVERYTHING in outer try-catch to prevent unhandled rejections
    try {
      try {
        // Atualizar data/hora
        const updatedData = { ...data, dataHora: new Date().toISOString() };
        updateData('dataHora', updatedData.dataHora);
        
        // 1. Verificar autenticação antes de começar
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Sessão expirada', {
            description: 'Faça login novamente para enviar o relatório.',
            duration: 8000
          });
          return;
        }
        
        // 2. Upload das fotos para o Storage (sequencial para iOS)
        setUploadProgress('Enviando fotos... (pode demorar alguns minutos)');
        const siteCode = data.siglaSite || `site_${Date.now()}`;
        
        let dataWithUrls;
        try {
          dataWithUrls = await uploadAllPhotos(updatedData, siteCode);
          setUploadProgress('Fotos enviadas com sucesso!');
        } catch (uploadError) {
          console.error('[Step10] Photo upload error:', uploadError);
          const errorMsg = uploadError instanceof Error ? uploadError.message : 'Erro desconhecido';
          
          // Check for permission-related errors
          if (errorMsg.includes('permissão') || errorMsg.includes('policy') || errorMsg.includes('403')) {
            toast.error('Sem permissão para enviar fotos', {
              description: 'Seu usuário pode não estar aprovado. Entre em contato com o administrador.',
              duration: 10000
            });
          } else {
            toast.error('Erro no upload das fotos', {
              description: errorMsg,
              duration: 8000
            });
          }
          return; // Early return, finally will clean up
        }
        
        // Small delay for iOS stability
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // 2. Gerar PDF (apenas se o usuário quiser baixar)
        let pdfBlob = null;
        if (shouldDownloadPdf) {
          setUploadProgress('Gerando PDF...');
          try {
            pdfBlob = await generatePDF(dataWithUrls, userOperadora);
          } catch (pdfError) {
            console.error('[Step10] PDF generation error:', pdfError);
            toast.error('Erro ao gerar PDF', {
              description: 'Continuando sem download do PDF.'
            });
            pdfBlob = null;
          }
        }
        
        // Small delay for iOS stability
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 3. Gerar Excel (sempre para salvar no banco)
        setUploadProgress('Gerando Excel...');
        let excelBlob;
        try {
          excelBlob = generateExcel(dataWithUrls, userOperadora);
        } catch (excelError) {
          console.error('[Step10] Excel generation error:', excelError);
          excelBlob = null;
        }

        // 4. Salvar no banco de dados
        setUploadProgress(editingReportId ? 'Atualizando relatório...' : 'Salvando no banco de dados...');
        const pdfFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.pdf`;
        const excelFilename = `Checklist_${data.siglaSite || 'NOVO'}_${data.uf}_${format(new Date(), 'ddMMyyyy')}.xlsx`;
        
        let result: { success: boolean; id?: string; error?: string };
        try {
          if (editingReportId) {
            // Update existing report
            result = await updateReportInDatabase(editingReportId, dataWithUrls);
            if (result.success) {
              result.id = editingReportId;
            }
          } else {
            // Create new report
            result = await saveReportToDatabase(dataWithUrls, pdfFilename, excelFilename);
          }
        } catch (dbError) {
          console.error('[Step10] Database save error:', dbError);
          toast.error('Erro ao salvar no banco', {
            description: dbError instanceof Error ? dbError.message : 'Tente novamente.'
          });
          return;
        }
        
        if (result.success) {
          // 5. Download dos arquivos (apenas se solicitado)
          if (shouldDownloadPdf && pdfBlob) {
            setUploadProgress('Baixando PDF...');
            try {
              // iOS Safari needs a small delay before download
              await new Promise(resolve => setTimeout(resolve, 300));
              downloadPDF(pdfBlob, pdfFilename);
            } catch (downloadError) {
              console.error('[Step10] PDF download error:', downloadError);
              toast.warning('Não foi possível baixar o PDF automaticamente', {
                description: 'O relatório foi salvo no servidor.'
              });
            }
          }
          
          // 6. Vincular à atribuição se houver (apenas para novos relatórios)
          if (!editingReportId) {
            const assignmentId = sessionStorage.getItem('currentAssignmentId');
            if (assignmentId && result.id) {
              try {
                setUploadProgress('Finalizando atribuição...');
                await updateAssignmentStatus(assignmentId, 'concluido', result.id);
                sessionStorage.removeItem('currentAssignmentId');
              } catch (assignmentError) {
                console.error('[Step10] Assignment update error:', assignmentError);
              }
            }
          }
          
          toast.success(editingReportId ? 'Relatório atualizado com sucesso!' : 'Relatório enviado com sucesso!', {
            description: editingReportId ? 'As alterações foram salvas.' : 'Os dados foram salvos no servidor.'
          });
          
          // Mantém o resultado visível para oferecer um próximo passo claro,
          // sem adicionar atalhos permanentes ao cabeçalho.
          setShowCompletionActions(true);
        } else {
          throw new Error(result.error || 'Erro ao salvar no banco');
        }
      } catch (innerError) {
        // Inner catch for specific operation errors
        console.error('[Step10] Inner error:', innerError);
        toast.error('Erro ao enviar relatório', {
          description: innerError instanceof Error ? innerError.message : 'Tente novamente.'
        });
      }
    } catch (outerError) {
      // Outer catch for any unhandled errors - prevents page crash
      console.error('[Step10] Outer error (prevented crash):', outerError);
      toast.error('Erro inesperado', {
        description: 'Por favor, tente novamente.'
      });
    } finally {
      setIsSending(false);
      setUploadProgress('');
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {editingReportId && (
        <div className="rounded-lg p-3 bg-accent/10 border border-accent/30 flex items-center gap-3">
          <Pencil className="w-5 h-5 text-accent-foreground" />
          <div>
            <p className="font-semibold text-sm">Modo de Edição</p>
            <p className="text-xs text-muted-foreground">
              Editando relatório do site {data.siglaSite || '—'}
            </p>
          </div>
        </div>
      )}

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
              (data.fotosObservacao?.filter(f => f.foto).length || 0) > 0 
                ? "bg-success/20 text-success" 
                : "bg-muted text-muted-foreground"
            )}>
              {data.fotosObservacao?.filter(f => f.foto).length || 0} foto(s)
            </span>
          </div>
          
          <div className="space-y-4">
            {(data.fotosObservacao || []).map((item, index) => (
              <div key={index} className="border rounded-lg p-3 space-y-3 bg-muted/30">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Foto {index + 1}</span>
                </div>
                <PhotoCapture
                  label={`Foto de Observação ${index + 1}`}
                  value={item.foto}
                  onChange={(value) => {
                    const newFotos = [...(data.fotosObservacao || [])];
                    if (value) {
                      newFotos[index] = { ...newFotos[index], foto: value };
                    } else {
                      // Remove the photo from array
                      newFotos.splice(index, 1);
                    }
                    updateData('fotosObservacao', newFotos);
                  }}
                  siteCode={data.siglaSite}
                  category={`observacao_${index}`}
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Descrição da foto</Label>
                  <Textarea
                    value={item.descricao || ''}
                    onChange={(e) => {
                      const newFotos = [...(data.fotosObservacao || [])];
                      newFotos[index] = { ...newFotos[index], descricao: e.target.value };
                      updateData('fotosObservacao', newFotos);
                    }}
                    placeholder="Descreva o que esta foto documenta..."
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            ))}
            
            {/* Add new photo slot */}
            <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-3">
              <PhotoCapture
                label={`Adicionar nova foto`}
                value={null}
                onChange={(value) => {
                  if (value) {
                    const newFotos = [...(data.fotosObservacao || []), { foto: value, descricao: '' }];
                    updateData('fotosObservacao', newFotos);
                  }
                }}
                siteCode={data.siglaSite}
                category={`observacao_${data.fotosObservacao?.length || 0}`}
              />
            </div>
          </div>
        </div>
      </FormCard>


      {uploadProgress && (
        <div className="rounded-lg p-3 bg-primary/10 border border-primary/30 flex items-center gap-3">
          <Upload className="w-5 h-5 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">{uploadProgress}</span>
        </div>
      )}

      {!showCompletionActions && (
        <Button
          className="w-full h-16 text-lg font-semibold gap-3 bg-primary hover:bg-primary/90"
          onClick={handleSendClick}
          disabled={isSending || progress < 50}
        >
          {isSending ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              {uploadProgress || (editingReportId ? 'Salvando...' : 'Enviando...')}
            </>
          ) : (
            <>
              <Send className="w-6 h-6" />
              {editingReportId ? 'Salvar Alterações' : 'Enviar Relatório'}
            </>
          )}
        </Button>
      )}

      {showCompletionActions && (
        <div className="rounded-lg border border-success/30 bg-success/10 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-success">Gabinete salvo com sucesso</p>
              <p className="text-sm text-muted-foreground">
                Escolha o próximo destino para continuar o trabalho.
              </p>
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(isGestor || isAdmin) && (
              <Button
                className="w-full gap-2"
                onClick={() => {
                  if (editingReportId) clearEditingMode();
                  resetChecklist();
                  navigate('/dashboard');
                }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Voltar ao Painel Gestor
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (editingReportId) clearEditingMode();
                resetChecklist();
                setShowCompletionActions(false);
              }}
            >
              <Plus className="w-4 h-4" />
              Novo checklist
            </Button>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground">
        As fotos serão comprimidas e salvas no servidor.
      </p>

      <p className="text-xs text-center text-muted-foreground">
        Data/Hora: {new Date().toLocaleString('pt-BR')}
      </p>

      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileDown className="w-5 h-5 text-primary" />
              Baixar PDF do Relatório?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deseja baixar o PDF do relatório após o envio? O relatório será salvo no servidor de qualquer forma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => handleConfirmSend(false)}
              className="w-full sm:w-auto"
            >
              Não, apenas enviar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleConfirmSend(true)}
              className="w-full sm:w-auto bg-primary"
            >
              Sim, baixar PDF
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
