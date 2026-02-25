import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getNivel, getProximoNivel, getProgressoNivel, calcularPontos, getBadgesConquistadas } from '@/fiber-guardian/lib/gamification';
import type { TecnicoStats } from '@/fiber-guardian/lib/gamification';
import { Trophy } from 'lucide-react';

export function MiniRankingCard() {
  const { user } = useFGAuth();
  const { reparos } = useReparos();

  const meusReparos = reparos.filter(r => r.usuario_id === user?.id);
  const pontos = meusReparos.reduce((acc, r) => acc + calcularPontos(r), 0);
  const nivel = getNivel(pontos);
  const proximo = getProximoNivel(pontos);
  const progresso = getProgressoNivel(pontos);

  const stats: TecnicoStats = {
    totalReparos: meusReparos.length,
    concluidos: meusReparos.filter(r => r.status === 'concluido').length,
    enviados: meusReparos.filter(r => r.status === 'enviado').length,
    manutencao: meusReparos.filter(r => r.categoria === 'manutencao').length,
    melhoria: meusReparos.filter(r => r.categoria === 'melhoria').length,
    obras: meusReparos.filter(r => r.categoria === 'obras').length,
    taxaConclusao: meusReparos.length > 0 ? Math.round((meusReparos.filter(r => r.status === 'concluido').length / meusReparos.length) * 100) : 0,
    pontos, prazosNoPrazo: 0, prazosVencidos: 0, diasAtivo: 0,
  };

  const badges = getBadgesConquistadas(stats);

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${nivel.cor} flex items-center justify-center shadow-md`}>
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-sm">Nível {nivel.nivel}</span>
              <span className="text-xs text-muted-foreground">{nivel.nome}</span>
            </div>
            <p className="text-lg font-bold">{pontos} XP</p>
          </div>
          {badges.length > 0 && (
            <div className="flex -space-x-1">
              {badges.slice(0, 3).map(b => (<span key={b.id} className="text-lg" title={b.nome}>{b.icone}</span>))}
              {badges.length > 3 && (<span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">+{badges.length - 3}</span>)}
            </div>
          )}
        </div>
        {proximo && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground"><span>{nivel.nome}</span><span>{proximo.nome} ({proximo.pontosMin} XP)</span></div>
            <Progress value={progresso} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
