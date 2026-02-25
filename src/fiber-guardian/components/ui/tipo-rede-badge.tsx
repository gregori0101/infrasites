import { TipoRede } from '@/fiber-guardian/types/database';
import { getTipoRedeLabel } from '@/fiber-guardian/lib/constants';
import { cn } from '@/lib/utils';
import { Network } from 'lucide-react';

interface TipoRedeBadgeProps {
  tipoRede: TipoRede | null | undefined;
  showIcon?: boolean;
  className?: string;
}

const TIPO_REDE_STYLES: Record<TipoRede, string> = {
  bbn: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
  bbr: 'bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] dark:bg-[hsl(var(--success))]/20',
  b2b: 'bg-accent/10 text-accent dark:bg-accent/20',
};

export function TipoRedeBadge({ tipoRede, showIcon = false, className }: TipoRedeBadgeProps) {
  const tipo = tipoRede || 'bbn';
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        TIPO_REDE_STYLES[tipo],
        className
      )}
    >
      {showIcon && <Network className="w-3 h-3" />}
      {getTipoRedeLabel(tipo)}
    </span>
  );
}
