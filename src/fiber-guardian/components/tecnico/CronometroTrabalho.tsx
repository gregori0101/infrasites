import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Square, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface CronometroTrabalhoProps {
  reparoId: string;
  inicioTrabalho?: string | null;
  fimTrabalho?: string | null;
  onUpdate?: (inicio: string | null, fim: string | null) => void;
}

export function CronometroTrabalho({ reparoId, inicioTrabalho, fimTrabalho, onUpdate }: CronometroTrabalhoProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isCompleted = !!inicioTrabalho && !!fimTrabalho;
  const isStarted = !!inicioTrabalho && !fimTrabalho;

  useEffect(() => {
    if (isStarted) {
      setRunning(true);
      const start = new Date(inicioTrabalho!).getTime();
      const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
      tick();
      intervalRef.current = setInterval(tick, 1000);
    } else if (isCompleted) {
      const start = new Date(inicioTrabalho!).getTime();
      const end = new Date(fimTrabalho!).getTime();
      setElapsed(Math.floor((end - start) / 1000));
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [inicioTrabalho, fimTrabalho]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`;
    return `${m}min ${s.toString().padStart(2, '0')}s`;
  };

  const handleStart = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('reparos').update({ inicio_trabalho: now } as any).eq('id', reparoId);
    if (error) { toast.error('Erro ao iniciar cronômetro'); return; }
    onUpdate?.(now, null);
    toast.success('Cronômetro iniciado!');
  };

  const handleStop = async () => {
    const now = new Date().toISOString();
    const { error } = await supabase.from('reparos').update({ fim_trabalho: now } as any).eq('id', reparoId);
    if (error) { toast.error('Erro ao finalizar cronômetro'); return; }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    onUpdate?.(inicioTrabalho!, now);
    toast.success('Trabalho finalizado!');
  };

  return (
    <Card className={`${running ? 'border-primary' : isCompleted ? 'border-[hsl(var(--fg-status-concluido))]/50' : ''}`}>
      <CardContent className="flex items-center justify-between py-3 px-4">
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${running ? 'text-primary' : 'text-muted-foreground'}`} />
          <div>
            <p className="text-sm font-medium">{isCompleted ? 'Tempo total' : running ? 'Em andamento' : 'Cronômetro'}</p>
            <p className={`text-lg font-bold tabular-nums ${running ? 'text-primary' : ''}`}>{elapsed > 0 ? formatTime(elapsed) : '--:--'}</p>
          </div>
        </div>
        {!isCompleted && (
          running ? (
            <Button size="sm" variant="destructive" onClick={handleStop}><Square className="w-4 h-4 mr-1" />Finalizar</Button>
          ) : (
            <Button size="sm" onClick={handleStart}><Play className="w-4 h-4 mr-1" />Iniciar</Button>
          )
        )}
      </CardContent>
    </Card>
  );
}
