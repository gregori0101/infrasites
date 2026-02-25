import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { calcularPontos, getNivel, getProgressoNivel, getBadgesConquistadas, TecnicoStats } from '@/fiber-guardian/lib/gamification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Trophy, Loader2 } from 'lucide-react';

export default function RankingGamificado() {
  const navigate = useNavigate();
  const { user, loading } = useFGAuth();
  const { reparos, loading: reparosLoading } = useReparos();

  const ranking = useMemo(() => {
    const byUser = new Map<string, { nome: string; reparos: typeof reparos }>();
    reparos.forEach(r => {
      const uid = r.usuario_id;
      const nome = r.profiles?.nome || 'Técnico';
      if (!byUser.has(uid)) byUser.set(uid, { nome, reparos: [] });
      byUser.get(uid)!.reparos.push(r);
    });

    return Array.from(byUser.entries())
      .map(([uid, { nome, reparos: userReparos }]) => {
        const pontos = userReparos.reduce((sum, r) => sum + calcularPontos(r), 0);
        const nivel = getNivel(pontos);
        const progresso = getProgressoNivel(pontos);
        const stats: TecnicoStats = {
          totalReparos: userReparos.length,
          concluidos: userReparos.filter(r => r.status === 'concluido').length,
          enviados: userReparos.filter(r => r.status === 'enviado').length,
          manutencao: userReparos.filter(r => r.categoria === 'manutencao').length,
          melhoria: userReparos.filter(r => r.categoria === 'melhoria').length,
          obras: userReparos.filter(r => r.categoria === 'obras').length,
          taxaConclusao: userReparos.length > 0 ? Math.round((userReparos.filter(r => r.status === 'concluido').length / userReparos.length) * 100) : 0,
          pontos,
          prazosNoPrazo: 0,
          prazosVencidos: 0,
          diasAtivo: 0,
        };
        const badges = getBadgesConquistadas(stats);
        return { uid, nome, pontos, nivel, progresso, badges, total: userReparos.length, isCurrentUser: uid === user?.id };
      })
      .sort((a, b) => b.pontos - a.pontos);
  }, [reparos, user?.id]);

  if (loading || reparosLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <>
      <Helmet><title>Ranking | Auditoria TA</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Trophy className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">Ranking</h1>
        </header>

        <main className="flex-1 p-4 space-y-3">
          {ranking.length === 0 ? (
            <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum dado disponível.</CardContent></Card>
          ) : (
            ranking.map((r, i) => (
              <Card key={r.uid} className={`${r.isCurrentUser ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center">{i < 3 ? medals[i] : `${i + 1}º`}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">{r.nome}</p>
                        {r.isCurrentUser && <span className="text-xs text-primary font-medium">(você)</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium bg-gradient-to-r ${r.nivel.cor} bg-clip-text text-transparent`}>
                          Nv.{r.nivel.nivel} {r.nivel.nome}
                        </span>
                        <span className="text-xs text-muted-foreground">• {r.pontos} pts • {r.total} reparos</span>
                      </div>
                      <Progress value={r.progresso} className="h-1.5 mt-1.5" />
                    </div>
                  </div>
                  {r.badges.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap pl-11">
                      {r.badges.slice(0, 5).map(b => (
                        <span key={b.id} title={b.descricao} className="text-sm">{b.icone}</span>
                      ))}
                      {r.badges.length > 5 && <span className="text-xs text-muted-foreground">+{r.badges.length - 5}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </main>
      </div>
    </>
  );
}
