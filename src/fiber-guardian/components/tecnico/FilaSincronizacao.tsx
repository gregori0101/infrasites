import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { getPendingSyncs } from '@/fiber-guardian/lib/offlineDb';
import { PendingSync } from '@/fiber-guardian/types/database';

interface FilaSincronizacaoProps { syncing: boolean; onSync: () => void; }

export function FilaSincronizacao({ syncing, onSync }: FilaSincronizacaoProps) {
  const [pendingItems, setPendingItems] = useState<PendingSync[]>([]);

  useEffect(() => {
    const load = async () => { const items = await getPendingSyncs(); setPendingItems(items); };
    load();
    const interval = setInterval(load, 3000);
    return () => clearInterval(interval);
  }, [syncing]);

  if (pendingItems.length === 0) return null;

  const reparos = pendingItems.filter(p => p.type === 'reparo');
  const fotos = pendingItems.filter(p => p.type === 'foto');
  const comErro = pendingItems.filter(p => p.retries > 0);

  return (
    <Card className="border-[hsl(var(--fg-status-pendente))]/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <CloudOff className="w-4 h-4 text-[hsl(var(--fg-status-pendente))]" />Fila de Sincronização
          <Badge variant="secondary" className="ml-auto">{pendingItems.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {syncing && (<div className="space-y-1"><p className="text-xs text-muted-foreground">Sincronizando...</p><Progress value={50} className="h-1.5" /></div>)}
        <div className="space-y-2">
          {reparos.length > 0 && (
            <div className="flex items-center gap-2 text-sm"><Cloud className="w-4 h-4 text-muted-foreground" /><span>{reparos.length} reparo(s)</span>
              <Badge variant="outline" className="text-xs ml-auto">{reparos.filter(r => r.action === 'create').length} novo(s)</Badge></div>
          )}
          {fotos.length > 0 && (<div className="flex items-center gap-2 text-sm"><Cloud className="w-4 h-4 text-muted-foreground" /><span>{fotos.length} foto(s)</span></div>)}
          {comErro.length > 0 && (<div className="flex items-center gap-2 text-sm text-destructive"><AlertCircle className="w-4 h-4" /><span>{comErro.length} item(ns) com erro</span></div>)}
        </div>
        <Button size="sm" className="w-full" onClick={onSync} disabled={syncing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />{syncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </Button>
      </CardContent>
    </Card>
  );
}
