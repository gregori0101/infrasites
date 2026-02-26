import { useMemo } from 'react';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { FGLayout } from '@/fiber-guardian/components/layout/FGLayout';
import { CAUSAS, STATUS, CAUSA_COLORS, STATUS_COLORS } from '@/fiber-guardian/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Analytics() {
  const { reparos, loading } = useReparos();

  const statusData = useMemo(() => {
    return STATUS.map(s => ({
      name: s.label,
      value: reparos.filter(r => r.status === s.value).length,
      color: STATUS_COLORS[s.value],
    }));
  }, [reparos]);

  const causaData = useMemo(() => {
    return CAUSAS
      .map(c => ({
        name: c.label,
        value: reparos.filter(r => r.causa === c.value).length,
        color: CAUSA_COLORS[c.value],
      }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [reparos]);

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months = eachMonthOfInterval({ start: subMonths(now, 5), end: now });
    return months.map(month => {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      const count = reparos.filter(r => {
        const d = new Date(r.criado_em);
        return d >= start && d <= end;
      }).length;
      return {
        name: format(month, 'MMM/yy', { locale: ptBR }),
        total: count,
      };
    });
  }, [reparos]);

  if (loading) {
    return (
      <FGLayout title="Analytics" showBack>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </FGLayout>
    );
  }

  return (
    <FGLayout title="Analytics" showBack>
      {/* Evolução Mensal */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Evolução Mensal</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Pie */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Por Status</CardTitle></CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Causas Bar */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Por Causa</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={causaData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="name" className="text-xs" width={80} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {causaData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </FGLayout>
  );
}
