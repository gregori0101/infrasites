import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, RefreshCw, ClipboardList, Clock, CheckCircle2, AlertTriangle, ThumbsUp, ThumbsDown, Users } from "lucide-react";
import { fetchAuditOrders, fetchAuditOrderItems, type AuditOrder } from "@/lib/auditoriaDatabase";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/dashboard/StatCard";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pendente: "hsl(var(--warning))",
  em_andamento: "hsl(var(--primary))",
  concluido: "hsl(var(--success))",
};

const RESULT_COLORS = {
  aprovado: "hsl(var(--success))",
  reprovado: "hsl(var(--destructive))",
};

export default function AuditoriaOSDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<AuditOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [techEmails, setTechEmails] = useState<Record<string, string>>({});
  const [auditResults, setAuditResults] = useState<Record<string, "aprovado" | "reprovado" | null>>({});

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

  // KPIs
  const total = orders.length;
  const pendentes = orders.filter(o => o.status === "pendente").length;
  const emAndamento = orders.filter(o => o.status === "em_andamento").length;
  const concluidos = orders.filter(o => o.status === "concluido").length;
  const aprovados = Object.values(auditResults).filter(r => r === "aprovado").length;
  const reprovados = Object.values(auditResults).filter(r => r === "reprovado").length;

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
    orders.forEach(o => {
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
  }, [orders, auditResults]);

  // By technician bar
  const techData = useMemo(() => {
    const map: Record<string, { total: number; concluido: number }> = {};
    orders.forEach(o => {
      const key = o.technician_id;
      if (!map[key]) map[key] = { total: 0, concluido: 0 };
      map[key].total++;
      if (o.status === "concluido") map[key].concluido++;
    });
    return Object.entries(map)
      .map(([id, v]) => ({ name: techEmails[id] || id.slice(0, 8), ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [orders, techEmails]);

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

        <main className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard title="Total OS" value={total} icon={ClipboardList} iconBg="bg-primary/10 text-primary" />
            <StatCard title="Pendentes" value={pendentes} icon={Clock} iconBg="bg-warning/10 text-warning" />
            <StatCard title="Em Andamento" value={emAndamento} icon={AlertTriangle} iconBg="bg-primary/10 text-primary" />
            <StatCard title="Vistoriados" value={concluidos} icon={CheckCircle2} iconBg="bg-success/10 text-success" />
            <StatCard title="Aprovados" value={aprovados} icon={ThumbsUp} iconBg="bg-success/10 text-success" />
            <StatCard title="Reprovados" value={reprovados} icon={ThumbsDown} iconBg="bg-destructive/10 text-destructive" />
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
                    <Bar dataKey="aprovado" name="Aprovado" fill="hsl(var(--success))" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="reprovado" name="Reprovado" fill="hsl(var(--destructive))" stackId="a" />
                    <Bar dataKey="concluido" name="Vistoriado (sem resultado)" fill="hsl(var(--primary))" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* By Technician */}
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
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="concluido" name="Vistoriado" fill="hsl(var(--success))" stackId="a" />
                    <Bar dataKey="total" name="Total" fill="hsl(var(--primary))" />
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
