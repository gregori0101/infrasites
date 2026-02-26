import { useNavigate } from 'react-router-dom';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useSidebarCounts } from '@/fiber-guardian/hooks/useSidebarCounts';
import { FGLayout } from '@/fiber-guardian/components/layout/FGLayout';
import { MiniRankingCard } from '@/fiber-guardian/components/tecnico/MiniRankingCard';
import { MetaMensalCard } from '@/fiber-guardian/components/tecnico/MetaMensalCard';
import { AtividadeSemanal } from '@/fiber-guardian/components/tecnico/AtividadeSemanal';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, BarChart3, Trophy, Loader2 } from 'lucide-react';

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
    <FGLayout
      title="Auditoria TA"
      subtitle={`Olá, ${profile?.nome || 'Técnico'}`}
      showBack
      backTo="/"
    >
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
    </FGLayout>
  );
}
