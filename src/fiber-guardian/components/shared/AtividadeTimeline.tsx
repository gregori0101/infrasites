import { useAtividades } from '@/fiber-guardian/hooks/useAtividades';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Send, RotateCcw, MessageSquare, Mail, FileWarning, CheckCircle, ArrowRightLeft, Edit, History } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TIPO_CONFIG: Record<string, { icon: typeof History; color: string; label: string }> = {
  criado: { icon: PlusCircle, color: 'text-primary', label: 'Criado' },
  enviado: { icon: Send, color: 'text-[hsl(var(--fg-status-enviado))]', label: 'Enviado' },
  revisao: { icon: RotateCcw, color: 'text-[hsl(var(--fg-status-revisao))]', label: 'Devolvido para revisão' },
  resposta: { icon: MessageSquare, color: 'text-primary', label: 'Resposta do técnico' },
  email_enviado: { icon: Mail, color: 'text-accent', label: 'Email enviado' },
  rnc_aplicada: { icon: FileWarning, color: 'text-destructive', label: 'RNC aplicada' },
  concluido: { icon: CheckCircle, color: 'text-[hsl(var(--fg-status-concluido))]', label: 'Concluído' },
  categoria_alterada: { icon: ArrowRightLeft, color: 'text-muted-foreground', label: 'Categoria alterada' },
  editado: { icon: Edit, color: 'text-muted-foreground', label: 'Editado' },
};

interface AtividadeTimelineProps { reparoId: string; }

export function AtividadeTimeline({ reparoId }: AtividadeTimelineProps) {
  const { atividades, loading } = useAtividades(reparoId);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><History className="w-5 h-5" />Histórico de Atividades</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3"><Skeleton className="w-8 h-8 rounded-full shrink-0" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div></div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (atividades.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><History className="w-5 h-5" />Histórico de Atividades</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground text-center py-4">Nenhuma atividade registrada ainda.</p></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><History className="w-5 h-5" />Histórico de Atividades ({atividades.length})</CardTitle></CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {atividades.map((atividade) => {
              const config = TIPO_CONFIG[atividade.tipo] || { icon: History, color: 'text-muted-foreground', label: atividade.tipo };
              const Icon = config.icon;
              return (
                <div key={atividade.id} className="relative flex gap-3 pl-0">
                  <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-border shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm font-medium">{config.label}</p>
                    {atividade.descricao && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{atividade.descricao}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {atividade.usuario_nome} · {formatDistanceToNow(new Date(atividade.criado_em), { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
