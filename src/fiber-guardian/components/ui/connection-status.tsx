import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/fiber-guardian/hooks/useOnlineStatus';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  pendingCount?: number;
  syncing?: boolean;
  className?: string;
}

export function ConnectionStatus({ pendingCount = 0, syncing = false, className }: ConnectionStatusProps) {
  const isOnline = useOnlineStatus();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {syncing ? (
        <div className="flex items-center gap-1.5 text-primary">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">Sincronizando...</span>
        </div>
      ) : isOnline ? (
        <div className="flex items-center gap-1.5 text-[hsl(var(--success))]">
          <Wifi className="h-4 w-4" />
          <span className="text-xs font-medium">Online</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 text-[hsl(var(--warning))]">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-medium">Offline</span>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="flex items-center gap-1 bg-[hsl(var(--warning))]/20 text-foreground px-2 py-0.5 rounded-full">
          <span className="text-xs font-bold">{pendingCount}</span>
          <span className="text-xs">pendente{pendingCount > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}
