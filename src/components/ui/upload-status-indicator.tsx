import { useEffect, useState } from 'react';
import { CheckCircle2, CloudUpload, Loader2, RefreshCw, WifiOff, X, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useUploadStatus, uploadStatus } from '@/lib/uploadStatus';
import { cn } from '@/lib/utils';

/**
 * Floating indicator showing how many photos were uploaded, how many are pending
 * and when an automatic retry happens.
 */
export function UploadStatusIndicator() {
  const { total, enviadas, pendentes, falhas, retentando, ultimaRetentativa, syncLabel } = useUploadStatus();
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const active = pendentes > 0 || !!syncLabel || retentando;

  useEffect(() => {
    if (active) setDismissed(false);
  }, [active]);

  // Auto-hide shortly after everything finished
  useEffect(() => {
    if (!active && total > 0 && falhas === 0) {
      const timer = setTimeout(() => uploadStatus.reset(), 4000);
      return () => clearTimeout(timer);
    }
  }, [active, total, falhas]);

  if (dismissed || (total === 0 && !syncLabel)) return null;

  const percent = total > 0 ? Math.round((enviadas / total) * 100) : syncLabel ? 100 : 0;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[4000] w-[min(92vw,26rem)] pointer-events-auto">
      <div className="rounded-xl border bg-card/95 backdrop-blur shadow-lg p-3 space-y-2">
        <div className="flex items-center gap-2">
          {!online ? (
            <WifiOff className="h-4 w-4 text-destructive shrink-0" />
          ) : active ? (
            <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
          ) : falhas > 0 ? (
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <p className="text-sm font-medium text-foreground flex-1 min-w-0 truncate">
            {!online
              ? 'Sem conexão — envio em espera'
              : syncLabel
                ? `Sincronizando: ${syncLabel}`
                : active
                  ? 'Enviando fotos...'
                  : falhas > 0
                    ? 'Envio concluído com falhas'
                    : 'Envio concluído'}
          </p>
          <button
            type="button"
            aria-label="Fechar status de envio"
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {total > 0 && <Progress value={percent} className="h-2" />}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CloudUpload className="h-3 w-3" /> {enviadas}/{total} enviadas
          </span>
          <span className={cn(pendentes > 0 && 'text-primary font-medium')}>{pendentes} pendente(s)</span>
          {falhas > 0 && <span className="text-destructive font-medium">{falhas} com falha</span>}
        </div>

        {ultimaRetentativa && (
          <p className="text-xs flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <RefreshCw className={cn('h-3 w-3', retentando && 'animate-spin')} />
            Retentativa: {ultimaRetentativa}
          </p>
        )}
      </div>
    </div>
  );
}
