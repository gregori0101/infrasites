import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { FGLayout } from '@/fiber-guardian/components/layout/FGLayout';
import { StatusBadge } from '@/fiber-guardian/components/ui/status-badge';
import { CausaBadge } from '@/fiber-guardian/components/ui/causa-badge';
import { CategoriaBadge } from '@/fiber-guardian/components/ui/categoria-badge';
import { TipoRedeBadge } from '@/fiber-guardian/components/ui/tipo-rede-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Search, BarChart3, Trophy, Download, Loader2, Map,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Clock, CheckCircle2,
  Filter, X,
} from 'lucide-react';
import { format, subDays, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusReparo, CategoriaReparo, TipoRede } from '@/fiber-guardian/types/database';
import { CATEGORIAS, TIPOS_REDE, getCausaLabel } from '@/fiber-guardian/lib/constants';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { loading } = useFGAuth();
  const { reparos, loading: reparosLoading } = useReparos();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusReparo | null>(null);
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaReparo | null>(null);
  const [tipoRedeFilter, setTipoRedeFilter] = useState<TipoRede | null>(null);
  const [showRncOnly, setShowRncOnly] = useState(false);

  const stats = useMemo(() => {
    const total = reparos.length;
    const pendentes = reparos.filter(r => r.status === 'pendente').length;
    const enviados = reparos.filter(r => r.status === 'enviado').length;
    const revisao = reparos.filter(r => r.status === 'revisao').length;
    const concluidos = reparos.filter(r => r.status === 'concluido').length;
    const rnc = reparos.filter(r => r.rnc_aplicada).length;
    const caixaBomba = reparos.filter(r => r.caixa_bomba).length;

    // Last 7 days
    const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
    const fourteenDaysAgo = startOfDay(subDays(new Date(), 14));
    const last7 = reparos.filter(r => isAfter(new Date(r.criado_em), sevenDaysAgo)).length;
    const prev7 = reparos.filter(r => {
      const d = new Date(r.criado_em);
      return isAfter(d, fourteenDaysAgo) && !isAfter(d, sevenDaysAgo);
    }).length;

    const taxaConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    return { total, pendentes, enviados, revisao, concluidos, rnc, caixaBomba, last7, prev7, taxaConclusao };
  }, [reparos]);

  const topCausas = useMemo(() => {
    const counts: Record<string, number> = {};
    reparos.forEach(r => {
      counts[r.causa] = (counts[r.causa] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([causa, count]) => ({ causa, label: getCausaLabel(causa as any), count }));
  }, [reparos]);

  const topTecnicos = useMemo(() => {
    const counts: Record<string, { nome: string; total: number; concluidos: number }> = {};
    reparos.forEach(r => {
      const nome = r.profiles?.nome || 'Desconhecido';
      const id = r.usuario_id;
      if (!counts[id]) counts[id] = { nome, total: 0, concluidos: 0 };
      counts[id].total++;
      if (r.status === 'concluido') counts[id].concluidos++;
    });
    return Object.values(counts)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [reparos]);

  const hasActiveFilter = statusFilter || categoriaFilter || tipoRedeFilter || showRncOnly;

  const filteredReparos = useMemo(() => {
    let result = reparos;
    if (search) result = result.filter(r => r.ta_titulo.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) result = result.filter(r => r.status === statusFilter);
    if (categoriaFilter) result = result.filter(r => r.categoria === categoriaFilter);
    if (tipoRedeFilter) result = result.filter(r => r.tipo_rede === tipoRedeFilter);
    if (showRncOnly) result = result.filter(r => r.rnc_aplicada);
    return result;
  }, [reparos, search, statusFilter, categoriaFilter, tipoRedeFilter, showRncOnly]);

  const clearFilters = () => {
    setStatusFilter(null);
    setCategoriaFilter(null);
    setTipoRedeFilter(null);
    setShowRncOnly(false);
    setSearch('');
  };

  const trendIcon = stats.last7 > stats.prev7
    ? <TrendingUp className="h-3.5 w-3.5 text-green-500" />
    : stats.last7 < stats.prev7
    ? <TrendingDown className="h-3.5 w-3.5 text-red-500" />
    : <Minus className="h-3.5 w-3.5 text-muted-foreground" />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <FGLayout title="Auditoria TA" subtitle="Painel Administrativo" showBack backTo="/">
      {/* Performance Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Taxa de Conclusão</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.taxaConclusao}%</p>
            <Progress value={stats.taxaConclusao} className="h-1.5 mt-1" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Últimos 7 dias</span>
              {trendIcon}
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.last7}</p>
            <p className="text-[10px] text-muted-foreground">vs {stats.prev7} semana anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-5 gap-2">
        {([
          { label: 'Total', value: stats.total, status: null as StatusReparo | null, color: '' },
          { label: 'Pend.', value: stats.pendentes, status: 'pendente' as StatusReparo, color: 'text-yellow-500' },
          { label: 'Env.', value: stats.enviados, status: 'enviado' as StatusReparo, color: 'text-blue-500' },
          { label: 'Rev.', value: stats.revisao, status: 'revisao' as StatusReparo, color: 'text-orange-500' },
          { label: 'Concl.', value: stats.concluidos, status: 'concluido' as StatusReparo, color: 'text-green-500' },
        ]).map(s => (
          <Card
            key={s.label}
            className={`cursor-pointer transition-all ${statusFilter === s.status ? 'ring-2 ring-primary' : 'hover:shadow-sm'}`}
            onClick={() => setStatusFilter(statusFilter === s.status ? null : s.status)}
          >
            <CardContent className="p-2 text-center">
              <p className={`text-lg font-bold ${s.color || 'text-foreground'}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts row */}
      {(stats.rnc > 0 || stats.caixaBomba > 0) && (
        <div className="flex gap-2">
          {stats.rnc > 0 && (
            <Badge
              variant={showRncOnly ? 'default' : 'outline'}
              className="cursor-pointer gap-1"
              onClick={() => setShowRncOnly(!showRncOnly)}
            >
              <AlertTriangle className="h-3 w-3" />
              {stats.rnc} RNC
            </Badge>
          )}
          {stats.caixaBomba > 0 && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {stats.caixaBomba} Caixa Bomba
            </Badge>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/analytics')}>
          <BarChart3 className="h-4 w-4 mr-1" /> Analytics
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/ranking')}>
          <Trophy className="h-4 w-4 mr-1" /> Ranking
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/mapa')}>
          <Map className="h-4 w-4 mr-1" /> Mapa
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/auditoria-ta/exportar')}>
          <Download className="h-4 w-4 mr-1" /> Exportar
        </Button>
      </div>

      {/* Top Causas & Técnicos side-by-side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-semibold">Top 5 Causas</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 space-y-1.5">
            {topCausas.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            ) : topCausas.map((c, i) => (
              <div key={c.causa} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-xs truncate">{c.label}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] px-1.5 shrink-0">{c.count}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 pb-1">
            <CardTitle className="text-sm font-semibold">Top 5 Técnicos</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-1 space-y-1.5">
            {topTecnicos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Sem dados</p>
            ) : topTecnicos.map((t, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                  <span className="text-xs truncate">{t.nome}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant="secondary" className="text-[10px] px-1.5">{t.total}</Badge>
                  <span className="text-[10px] text-green-500">{t.concluidos > 0 ? `✓${t.concluidos}` : ''}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por TA..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category & network type chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          {CATEGORIAS.map(c => (
            <Badge
              key={c.value}
              variant={categoriaFilter === c.value ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] shrink-0"
              onClick={() => setCategoriaFilter(categoriaFilter === c.value ? null : c.value)}
            >
              {c.label}
            </Badge>
          ))}
          {TIPOS_REDE.map(t => (
            <Badge
              key={t.value}
              variant={tipoRedeFilter === t.value ? 'default' : 'outline'}
              className="cursor-pointer text-[10px] shrink-0"
              onClick={() => setTipoRedeFilter(tipoRedeFilter === t.value ? null : t.value)}
            >
              {t.label}
            </Badge>
          ))}
        </div>

        {hasActiveFilter && (
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={clearFilters}>
            <X className="h-3 w-3 mr-1" /> Limpar filtros
          </Button>
        )}
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
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-foreground truncate">{reparo.ta_titulo}</h3>
                      {reparo.rnc_aplicada && (
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {reparo.profiles?.nome || 'Técnico'} • {format(new Date(reparo.criado_em), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <StatusBadge status={reparo.status} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <CausaBadge causa={reparo.causa} />
                  <CategoriaBadge categoria={reparo.categoria} />
                  {reparo.tipo_rede && <TipoRedeBadge tipoRede={reparo.tipo_rede} />}
                  {reparo.caixa_bomba && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/30 text-destructive">
                      Cx. Bomba
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </FGLayout>
  );
}
