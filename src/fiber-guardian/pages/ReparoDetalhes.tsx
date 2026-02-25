import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { useRevisoes } from '@/fiber-guardian/hooks/useRevisoes';
import { StatusBadge } from '@/fiber-guardian/components/ui/status-badge';
import { CausaBadge } from '@/fiber-guardian/components/ui/causa-badge';
import { CategoriaBadge } from '@/fiber-guardian/components/ui/categoria-badge';
import { TipoRedeBadge } from '@/fiber-guardian/components/ui/tipo-rede-badge';
import { AtividadeTimeline } from '@/fiber-guardian/components/shared/AtividadeTimeline';
import { RevisaoDialog } from '@/fiber-guardian/components/revisao/RevisaoDialog';
import { EditarReparoDialog } from '@/fiber-guardian/components/admin/EditarReparoDialog';
import { getConclusaoLabel } from '@/fiber-guardian/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, CheckCircle, RotateCcw, Pencil, Trash2, Loader2, AlertTriangle, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate as useNav, useParams } from 'react-router-dom';
import { Reparo } from '@/fiber-guardian/types/database';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ReparoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, user } = useFGAuth();
  const { reparos, updateReparoStatus, deleteReparo, loading } = useReparos();
  const { revisoes, loading: revisoesLoading, addRevisao } = useRevisoes(id || '');
  const [editOpen, setEditOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);

  const reparo = useMemo(() => reparos.find(r => r.id === id), [reparos, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reparo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <AlertTriangle className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Reparo não encontrado</p>
        <Button variant="outline" onClick={() => navigate('/auditoria-ta')}>Voltar</Button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'enviado' | 'concluido' | 'revisao') => {
    const success = await updateReparoStatus(reparo.id, newStatus);
    if (success) toast.success(`Status alterado para ${newStatus}`);
    else toast.error('Erro ao alterar status');
  };

  const handleDelete = async () => {
    const success = await deleteReparo(reparo.id);
    if (success) {
      toast.success('Reparo excluído');
      navigate('/auditoria-ta');
    } else {
      toast.error('Erro ao excluir');
    }
  };

  const handleReviewConfirm = async (comentario: string) => {
    setReviewLoading(true);
    try {
      await addRevisao(comentario, isAdmin ? 'admin_comentario' : 'tecnico_resposta');
      if (isAdmin) await updateReparoStatus(reparo.id, 'revisao');
      setReviewOpen(false);
      toast.success('Revisão enviada');
    } catch {
      toast.error('Erro ao enviar revisão');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditSave = (updatedReparo: Reparo) => {
    toast.success('Reparo atualizado');
    setEditOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>{reparo.ta_titulo} | Auditoria TA</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{reparo.ta_titulo}</h1>
              <p className="text-xs text-muted-foreground">{reparo.profiles?.nome || 'Técnico'}</p>
            </div>
          </div>
          <StatusBadge status={reparo.status} />
        </header>

        <main className="flex-1 p-4 space-y-4 pb-32">
          {/* Info Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <CausaBadge causa={reparo.causa} />
                <CategoriaBadge categoria={reparo.categoria} />
                {reparo.tipo_rede && <TipoRedeBadge tipoRede={reparo.tipo_rede} />}
                {reparo.caixa_bomba && <Badge variant="destructive">Caixa Bomba</Badge>}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Conclusão</p>
                  <p className="font-medium">{getConclusaoLabel(reparo.conclusao_ta)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Criado em</p>
                  <p className="font-medium">{format(new Date(reparo.criado_em), "dd/MM/yy HH:mm", { locale: ptBR })}</p>
                </div>
                {reparo.trecho && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Trecho</p>
                    <p className="font-medium">{reparo.trecho}</p>
                  </div>
                )}
                {reparo.tecnicos_reparo && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Técnicos</p>
                    <p className="font-medium">{reparo.tecnicos_reparo}</p>
                  </div>
                )}
              </div>

              {(reparo.latitude && reparo.longitude) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{reparo.latitude.toFixed(5)}, {reparo.longitude.toFixed(5)}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {(reparo.observacoes || reparo.observacao_prevencao || reparo.observacao_definitivo) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {reparo.observacoes && <div><p className="text-muted-foreground mb-1">Geral</p><p>{reparo.observacoes}</p></div>}
                {reparo.observacao_prevencao && <div><p className="text-muted-foreground mb-1">Prevenção</p><p>{reparo.observacao_prevencao}</p></div>}
                {reparo.observacao_definitivo && <div><p className="text-muted-foreground mb-1">Definitivo</p><p>{reparo.observacao_definitivo}</p></div>}
              </CardContent>
            </Card>
          )}

          {/* Fotos */}
          {reparo.fotos_reparo && reparo.fotos_reparo.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Fotos ({reparo.fotos_reparo.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {reparo.fotos_reparo.map(foto => (
                    <a key={foto.id} href={foto.caminho_arquivo} target="_blank" rel="noopener noreferrer">
                      <img src={foto.caminho_arquivo} alt={foto.titulo || foto.tipo_foto} className="w-full aspect-square object-cover rounded-lg" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Revisões */}
          {revisoes.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Revisões ({revisoes.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {revisoes.map(rev => (
                  <div key={rev.id} className="text-sm border-l-2 border-muted pl-3">
                    <p className="text-muted-foreground text-xs">
                      {rev.tipo === 'admin_comentario' ? 'Admin' : 'Técnico'} • {format(new Date(rev.criado_em), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                    <p className="mt-1">{rev.mensagem}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <AtividadeTimeline reparoId={reparo.id} />
        </main>

        {/* Bottom Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 z-50">
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <>
                {reparo.status !== 'concluido' && (
                  <Button size="sm" onClick={() => handleStatusChange('concluido')}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)}>
                  <RotateCcw className="h-4 w-4 mr-1" /> Devolver
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="h-4 w-4 mr-1" /> Editar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4 mr-1" /> Excluir</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir reparo?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
            {!isAdmin && reparo.status === 'revisao' && (
              <Button size="sm" onClick={() => setReviewOpen(true)}>
                <Send className="h-4 w-4 mr-1" /> Responder revisão
              </Button>
            )}
          </div>
        </div>
      </div>

      <RevisaoDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        onConfirm={handleReviewConfirm}
        loading={reviewLoading}
      />

      {isAdmin && (
        <EditarReparoDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          reparo={reparo}
          onSave={handleEditSave}
        />
      )}
    </>
  );
}
