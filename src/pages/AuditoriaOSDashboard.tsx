import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, RefreshCw, ClipboardList, Clock, CheckCircle2, AlertTriangle, ThumbsUp, ThumbsDown, Users, Percent, CalendarClock, Activity } from "lucide-react";
import { fetchAuditOrders, fetchAuditOrderItems, type AuditOrder } from "@/lib/auditoriaDatabase";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressBar } from "@/components/ui/progress-bar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import { format, isAfter, subDays, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  pendente: "hsl(var(--warning))",
  em_andamento: "hsl(var(--primary))",
  concluido: "hsl(var(--success))",
};

const RESULT_COLORS = {
  aprovado: "hsl(var(--success))",
  reprovado: "hsl(var(--destructive))",
};

type PeriodFilter = "all" | "7" | "30" | "90";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

export default function AuditoriaOSDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AuditOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [techEmails, setTechEmails] = useState<Record<string, string>>({});
  const [auditResults, setAuditResults] = useState<Record<string, "aprovado" | "reprovado" | null>>({});
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAuditOrders();
      setOrders(data);

      const techIds = [...new Set(data.map(o => o.technician_id))];
      if (techIds.length > 0) {
        const { data: fnData } = await supabase.functions.invoke("get-technician-emails", {
          body: { technicianIds: techIds },
        });
        if (fnData?.technicians) {
          const map: Record<string, string> = {};
          fnData.technicians.forEach((e: { id: string; email: string }) => { map[e.id] = e.email; });
          setTechEmails(map);
        }
      }

      const concluded = data.filter(o => o.status === "concluido");
      const results: Record<string, "aprovado" | "reprovado" | null> = {};
      await Promise.all(concluded.map(async (order) => {
        try {
          const items = await fetchAuditOrderItems(order.id);
          if (items.length === 0) { results[order.id] = null; return; }
          results[order.id] = items.some(i => i.status === "nao_conforme") ? "reprovado" : "aprovado";
        } catch { results[order.id] = null; }
      }));
      setAuditResults(results);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtered orders by period
  const filteredOrders = useMemo(() => {
    if (periodFilter === "all") return orders;
    const cutoff = subDays(new Date(), Number(periodFilter));
    return orders.filter(o => isAfter(new Date(o.created_at), cutoff));
  }, [orders, periodFilter]);

  // KPIs
  const total = filteredOrders.length;
  const pendentes = filteredOrders.filter(o => o.status === "pendente").length;
  const emAndamento = filteredOrders.filter(o => o.status === "em_andamento").length;
  const concluidos = filteredOrders.filter(o => o.status === "concluido").length;
  const aprovados = filteredOrders.filter(o => auditResults[o.id] === "aprovado").length;
  const reprovados = filteredOrders.filter(o => auditResults[o.id] === "reprovado").length;

  const taxaConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;
  const taxaAprovacao = concluidos > 0 ? Math.round((aprovados / concluidos) * 100) : 0;

  // Deadline stats
  const deadlineStats = useMemo(() => {
    const now = new Date();
    const in7days = addDays(now, 7);
    let vencidas = 0;
    let proximasPrazo = 0;
    filteredOrders.forEach(o => {
      if (!o.deadline || o.status === "concluido") return;
      const dl = new Date(o.deadline);
      if (isBefore(dl, now)) vencidas++;
      else if (isBefore(dl, in7days)) proximasPrazo++;
    });
    return { vencidas, proximasPrazo };
  }, [filteredOrders]);

  // Top 5 motivos
  const motivoData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const m = o.motivo || "Sem motivo";
      map[m] = (map[m] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = sorted[0]?.[1] || 1;
    return sorted.map(([name, count]) => ({ name, count, pct: Math.round((count / max) * 100) }));
  }, [filteredOrders]);

  // Recent activity (last 5 concluded)
  const recentActivity = useMemo(() => {
    return filteredOrders
      .filter(o => o.status === "concluido" && o.completed_at)
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5);
  }, [filteredOrders]);

  // Status pie
  const statusData = useMemo(() => [
    { name: "Pendente", value: pendentes, color: STATUS_COLORS.pendente },
    { name: "Em Andamento", value: emAndamento, color: STATUS_COLORS.em_andamento },
    { name: "Vistoriado", value: concluidos, color: STATUS_COLORS.concluido },
  ].filter(d => d.value > 0), [pendentes, emAndamento, concluidos]);

  // Result pie
  const resultData = useMemo(() => [
    { name: "Aprovado", value: aprovados, color: RESULT_COLORS.aprovado },
    { name: "Reprovado", value: reprovados, color: RESULT_COLORS.reprovado },
  ].filter(d => d.value > 0), [aprovados, reprovados]);

  // By UF bar
  const ufData = useMemo(() => {
    const map: Record<string, { total: number; concluido: number; aprovado: number; reprovado: number }> = {};
    filteredOrders.forEach(o => {
      const uf = o.site_code.slice(0, 2).toUpperCase();
      if (!map[uf]) map[uf] = { total: 0, concluido: 0, aprovado: 0, reprovado: 0 };
      map[uf].total++;
      if (o.status === "concluido") {
        map[uf].concluido++;
        if (auditResults[o.id] === "aprovado") map[uf].aprovado++;
        if (auditResults[o.id] === "reprovado") map[uf].reprovado++;
      }
    });
    return Object.entries(map).map(([uf, v]) => ({ uf, ...v })).sort((a, b) => b.total - a.total);
  }, [filteredOrders, auditResults]);

  // By technician bar (enhanced with aprovados)
  const techData = useMemo(() => {
    const map: Record<string, { total: number; concluido: number; aprovado: number }> = {};
    filteredOrders.forEach(o => {
      const key = o.technician_id;
      if (!map[key]) map[key] = { total: 0, concluido: 0, aprovado: 0 };
      map[key].total++;
      if (o.status === "concluido") {
        map[key].concluido++;
        if (auditResults[o.id] === "aprovado") map[key].aprovado++;
      }
    });
    return Object.entries(map)
      .map(([id, v]) => ({
        name: techEmails[id] || id.slice(0, 8),
        ...v,
        taxaAprov: v.concluido > 0 ? Math.round((v.aprovado / v.concluido) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredOrders, techEmails, auditResults]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-muted-foreground">
            <span style={{ color: p.color }} className="font-medium">{p.name}: </span>{p.value}
          </p>
        ))}
      </div>
    );
  };

  const TechTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const entry = techData.find(t => t.name === label);
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-muted-foreground">
            <span style={{ color: p.color }} className="font-medium">{p.name}: </span>{p.value}
          </p>
        ))}
        {entry && (
          <p className="text-muted-foreground mt-1 border-t border-border pt-1">
            Taxa Aprovação: <span className="font-bold text-foreground">{entry.taxaAprov}%</span>
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard Auditoria OS | InfraSites Vivo</title>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => navigate("/auditoria")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-foreground">Dashboard Auditoria OS</h1>
          <div className="flex-1" />
          <Button variant="outline" size="icon" onClick={load}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </header>

        {/* Period filter */}
        <div className="px-4 pt-4 max-w-5xl mx-auto w-full">
          <div className="flex gap-2 flex-wrap">
            {PERIOD_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                variant={periodFilter === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriodFilter(opt.value)}
                className="text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <main className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-6">
          {/* KPI Cards Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Total OS" value={total} icon={ClipboardList} iconBg="bg-primary/10 text-primary" />
            <StatCard title="Pendentes" value={pendentes} icon={Clock} iconBg="bg-warning/10 text-warning" />
            <StatCard title="Em Andamento" value={emAndamento} icon={AlertTriangle} iconBg="bg-primary/10 text-primary" />
            <StatCard title="Vistoriados" value={concluidos} icon={CheckCircle2} iconBg="bg-success/10 text-success" />
          </div>

          {/* KPI Cards Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard title="Aprovados" value={aprovados} icon={ThumbsUp} iconBg="bg-success/10 text-success" />
            <StatCard title="Reprovados" value={reprovados} icon={ThumbsDown} iconBg="bg-destructive/10 text-destructive" />
            <StatCard
              title="Vencidas"
              value={deadlineStats.vencidas}
              icon={CalendarClock}
              iconBg="bg-destructive/10 text-destructive"
              badge={deadlineStats.vencidas > 0 ? { text: "Atenção", variant: "destructive" } : undefined}
            />
            <StatCard
              title="Próx. do Prazo"
              value={deadlineStats.proximasPrazo}
              icon={CalendarClock}
              iconBg="bg-warning/10 text-warning"
              badge={deadlineStats.proximasPrazo > 0 ? { text: "7 dias", variant: "warning" } : undefined}
            />
          </div>

          {/* Taxas */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-primary/10"><Percent className="w-4 h-4 text-primary" /></div>
                    <span className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{taxaConclusao}%</span>
                </div>
                <ProgressBar value={taxaConclusao} showLabel={false} />
                <p className="text-[11px] text-muted-foreground">{concluidos} de {total} OS vistoriadas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-success/10"><ThumbsUp className="w-4 h-4 text-success" /></div>
                    <span className="text-sm font-medium text-muted-foreground">Taxa de Aprovação</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{taxaAprovacao}%</span>
                </div>
                <ProgressBar value={taxaAprovacao} showLabel={false} />
                <p className="text-[11px] text-muted-foreground">{aprovados} de {concluidos} aprovadas</p>
              </CardContent>
            </Card>
          </div>

          {/* Motivos + Atividade Recente */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Top 5 Motivos */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Top 5 Motivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {motivoData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">Sem dados</p>
                ) : (
                  motivoData.map((m, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground font-medium truncate mr-2">{m.name}</span>
                        <span className="text-muted-foreground shrink-0">{m.count}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                  <Activity className="w-4 h-4" /> Atividade Recente
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma OS concluída</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map(o => {
                      const result = auditResults[o.id];
                      return (
                        <div key={o.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{o.site_code}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {o.completed_at ? format(new Date(o.completed_at), "dd MMM yyyy", { locale: ptBR }) : "—"}
                            </p>
                          </div>
                          <Badge
                            variant={result === "aprovado" ? "default" : result === "reprovado" ? "destructive" : "secondary"}
                            className="text-[10px] shrink-0"
                          >
                            {result === "aprovado" ? "Aprovado" : result === "reprovado" ? "Reprovado" : "—"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Status Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Por Status</CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Sem dados</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Result Pie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Resultado Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                {resultData.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">Sem auditorias concluídas</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={resultData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                        {resultData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* By UF */}
          {ufData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Por UF</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(200, ufData.length * 40)}>
                  <BarChart data={ufData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="uf" tick={{ fontSize: 11 }} width={40} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="aprovado" name="Aprovado" fill="hsl(var(--success))" stackId="a" />
                    <Bar dataKey="reprovado" name="Reprovado" fill="hsl(var(--destructive))" stackId="a" />
                    <Bar dataKey="concluido" name="Vistoriado (sem resultado)" fill="hsl(var(--primary))" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* By Technician (enhanced) */}
          {techData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Por Técnico (Top 10)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={Math.max(200, techData.length * 40)}>
                  <BarChart data={techData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip content={<TechTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="aprovado" name="Aprovado" fill="hsl(var(--success))" stackId="a" />
                    <Bar dataKey="concluido" name="Vistoriado" fill="hsl(var(--primary))" stackId="a" />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--muted-foreground))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
