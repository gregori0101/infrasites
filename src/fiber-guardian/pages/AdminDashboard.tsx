import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { StatusBadge } from '@/fiber-guardian/components/ui/status-badge';
import { CausaBadge } from '@/fiber-guardian/components/ui/causa-badge';
import { CategoriaBadge } from '@/fiber-guardian/components/ui/categoria-badge';
import { TipoRedeBadge } from '@/fiber-guardian/components/ui/tipo-rede-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, BarChart3, Trophy, Download, Loader2 } from 'lucide-react';
import { VivoLogo } from '@/components/ui/vivo-logo';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusReparo, CausaReparo } from '@/fiber-guardian/types/database';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading } = useFGAuth();
  const { reparos, loading: reparosLoading } = useReparos();
  const [search, setSearch] = useState('');

  const stats = useMemo(() => {
    const total = reparos.length;
    const pendentes = reparos.filter(r => r.status === 'pendente').length;
    const enviados = reparos.filter(r => r.status === 'enviado').length;
    const revisao = reparos.filter(r => r.status === 'revisao').length;
    const concluidos = reparos.filter(r => r.status === 'concluido').length;
    return { total, pendentes, enviados, revisao, concluidos };
  }, [reparos]);

  const filteredReparos = useMemo(() => {
    if (!search) return reparos;
    return reparos.filter(r => r.ta_titulo.toLowerCase().includes(search.toLowerCase()));
  }, [reparos, search]);

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
        <title>Admin Dashboard | Auditoria TA</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Auditoria TA</h1>
              <p className="text-xs text-muted-foreground">Painel Administrativo</p>
            </div>
          </div>
          <VivoLogo className="h-7 w-auto" />
        </header>

        <main className="flex-1 p-4 space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-foreground' },
              { label: 'Pendentes', value: stats.pendentes, color: 'text-[hsl(var(--fg-status-pendente))]' },
              { label: 'Enviados', value: stats.enviados, color: 'text-[hsl(var(--fg-status-enviado))]' },
              { label: 'Revisão', value: stats.revisao, color: 'text-[hsl(var(--fg-status-revisao))]' },
              { label: 'Concluídos', value: stats.concluidos, color: 'text-[hsl(var(--fg-status-concluido))]' },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Links */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/analytics')}>
              <BarChart3 className="h-4 w-4 mr-1" /> Analytics
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/ranking')}>
              <Trophy className="h-4 w-4 mr-1" /> Ranking
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/exportar')}>
              <Download className="h-4 w-4 mr-1" /> Exportar
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por TA..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {/* Reparos List */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{filteredReparos.length} registro(s)</p>
            {reparosLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredReparos.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum registro encontrado.</CardContent></Card>
            ) : (
              filteredReparos.slice(0, 50).map(reparo => (
                <Card
                  key={reparo.id}
                  className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                  onClick={() => navigate(`/auditoria-ta/reparo/${reparo.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{reparo.ta_titulo}</h3>
                        <p className="text-xs text-muted-foreground">
                          {reparo.profiles?.nome || 'Técnico'} • {format(new Date(reparo.criado_em), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <StatusBadge status={reparo.status} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <CausaBadge causa={reparo.causa} />
                      <CategoriaBadge categoria={reparo.categoria} />
                      {reparo.tipo_rede && <TipoRedeBadge tipoRede={reparo.tipo_rede} />}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
