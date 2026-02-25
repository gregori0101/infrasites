import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { useSidebarCounts } from '@/fiber-guardian/hooks/useSidebarCounts';
import { ConnectionStatus } from '@/fiber-guardian/components/ui/connection-status';
import { MiniRankingCard } from '@/fiber-guardian/components/tecnico/MiniRankingCard';
import { MetaMensalCard } from '@/fiber-guardian/components/tecnico/MetaMensalCard';
import { AtividadeSemanal } from '@/fiber-guardian/components/tecnico/AtividadeSemanal';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, FileText, BarChart3, Trophy, Loader2 } from 'lucide-react';
import { VivoLogo } from '@/components/ui/vivo-logo';

export default function TecnicoDashboard() {
  const navigate = useNavigate();
  const { profile, loading } = useFGAuth();
  const counts = useSidebarCounts();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Técnico | Auditoria TA</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Auditoria TA</h1>
              <p className="text-xs text-muted-foreground">Olá, {profile?.nome || 'Técnico'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ConnectionStatus />
            <VivoLogo className="h-7 w-auto" />
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate('/auditoria-ta/novo-registro')}>
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Novo Registro</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate('/auditoria-ta/meus-reparos')}>
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Meus Reparos</span>
                {counts.revisaoTecnico > 0 && (
                  <span className="text-xs text-muted-foreground">{counts.revisaoTecnico} em revisão</span>
                )}
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate('/auditoria-ta/ranking')}>
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Ranking</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={() => navigate('/auditoria-ta/analytics')}>
              <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm font-medium">Estatísticas</span>
              </CardContent>
            </Card>
          </div>

          {/* Gamification */}
          <MiniRankingCard />
          <MetaMensalCard />
          <AtividadeSemanal />
        </main>
      </div>
    </>
  );
}
