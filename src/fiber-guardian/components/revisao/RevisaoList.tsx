import { useState } from 'react';
import { RevisaoReparo } from '@/fiber-guardian/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare, User, Send, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RevisaoListProps {
  revisoes: RevisaoReparo[];
  loading: boolean;
  canRespond: boolean;
  onRespond?: (mensagem: string) => Promise<boolean>;
  sendingResponse?: boolean;
}

export function RevisaoList({ revisoes, loading, canRespond, onRespond, sendingResponse }: RevisaoListProps) {
  const [resposta, setResposta] = useState('');

  const handleSendResponse = async () => {
    if (!onRespond || !resposta.trim()) return;
    const success = await onRespond(resposta);
    if (success) setResposta('');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3"><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-20 w-full" /></CardContent>
      </Card>
    );
  }

  if (revisoes.length === 0 && !canRespond) return null;

  return (
    <Card className="border-[hsl(var(--fg-status-revisao))]/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[hsl(var(--fg-status-revisao))]" />
          Histórico de Revisão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {revisoes.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum comentário ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {revisoes.map((revisao) => (
              <div key={revisao.id} className={cn("p-3 rounded-lg",
                revisao.tipo === 'admin_comentario'
                  ? "bg-[hsl(var(--fg-status-revisao))]/10 border border-[hsl(var(--fg-status-revisao))]/20"
                  : "bg-primary/10 border border-primary/20 ml-4"
              )}>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{revisao.profiles?.nome || 'Usuário'}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full",
                    revisao.tipo === 'admin_comentario'
                      ? "bg-[hsl(var(--fg-status-revisao))]/20 text-[hsl(var(--fg-status-revisao))]"
                      : "bg-primary/20 text-primary"
                  )}>
                    {revisao.tipo === 'admin_comentario' ? 'Admin' : 'Técnico'}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{revisao.mensagem}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(revisao.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        )}

        {canRespond && (
          <div className="pt-3 border-t space-y-3">
            <Textarea placeholder="Descreva as correções realizadas..." value={resposta}
              onChange={(e) => setResposta(e.target.value)} rows={3} className="resize-none" />
            <Button onClick={handleSendResponse} disabled={!resposta.trim() || sendingResponse} className="w-full">
              <Send className="w-4 h-4 mr-2" />{sendingResponse ? 'Enviando...' : 'Enviar Resposta'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
