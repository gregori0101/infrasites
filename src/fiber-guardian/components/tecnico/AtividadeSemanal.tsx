import { useMemo } from 'react';
import { useFGAuth } from '@/fiber-guardian/hooks/useFGAuth';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity } from 'lucide-react';

export function AtividadeSemanal() {
  const { user } = useFGAuth();
  const { reparos } = useReparos();

  const data = useMemo(() => {
    const meusReparos = reparos.filter(r => r.usuario_id === user?.id);
    const inicio = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const dia = addDays(inicio, i);
      const count = meusReparos.filter(r => isSameDay(parseISO(r.criado_em), dia)).length;
      return { dia: format(dia, 'EEE', { locale: ptBR }), reparos: count };
    });
  }, [reparos, user?.id]);

  const totalSemana = data.reduce((s, d) => s + d.reparos, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4" />Atividade da Semana
          <span className="ml-auto text-xs font-normal text-muted-foreground">{totalSemana} reparos</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={data} barSize={20}>
            <XAxis dataKey="dia" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide allowDecimals={false} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(value: number) => [`${value} reparo(s)`, 'Reparos']} />
            <Bar dataKey="reparos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
