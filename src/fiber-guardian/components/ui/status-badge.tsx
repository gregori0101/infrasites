import { StatusReparo } from '@/fiber-guardian/types/database';
import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/fiber-guardian/lib/constants';

interface StatusBadgeProps {
  status: StatusReparo;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colors: Record<StatusReparo, string> = {
    pendente: 'bg-[hsl(var(--fg-status-pendente))] text-foreground',
    enviado: 'bg-[hsl(var(--fg-status-enviado))] text-primary-foreground',
    revisao: 'bg-[hsl(var(--fg-status-revisao))] text-primary-foreground',
    concluido: 'bg-[hsl(var(--fg-status-concluido))] text-primary-foreground',
  };

  return (
    <span className={cn(
      'fg-status-badge',
      colors[status],
      className
    )}>
      {getStatusLabel(status)}
    </span>
  );
}
