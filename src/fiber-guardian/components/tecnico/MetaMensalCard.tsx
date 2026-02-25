import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { useMetas } from '@/fiber-guardian/hooks/useMetas';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Check } from 'lucide-react';
import { startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

export function MetaMensalCard() {
  const { user } = useFGAuth();
  const { reparos } = useReparos();
  const { metas } = useMetas();

  const meta = metas.find(m => m.user_id === user?.id);
  if (!meta) return null;

  const inicioMes = startOfMonth(new Date());
  const fimMes = endOfMonth(new Date());

  const concluidos = reparos.filter(
    r => r.usuario_id === user?.id && r.status === 'concluido' &&
      isWithinInterval(parseISO(r.atualizado_em), { start: inicioMes, end: fimMes })
  ).length;

  const progresso = Math.min(100, Math.round((concluidos / meta.meta_reparos) * 100));
  const atingiu = concluidos >= meta.meta_reparos;

  return (
    <Card className={atingiu ? 'border-accent bg-accent/5' : ''}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3 mb-2">
          {atingiu ? (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center"><Check className="w-4 h-4 text-accent-foreground" /></div>
          ) : (<Target className="w-8 h-8 text-muted-foreground" />)}
          <div className="flex-1">
            <p className="text-sm font-medium">{atingiu ? 'Meta atingida! 🎉' : 'Meta mensal'}</p>
            <p className="text-xs text-muted-foreground">{concluidos} / {meta.meta_reparos} reparos concluídos</p>
          </div>
          <span className="text-lg font-bold">{progresso}%</span>
        </div>
        <Progress value={progresso} className="h-2" />
      </CardContent>
    </Card>
  );
}
