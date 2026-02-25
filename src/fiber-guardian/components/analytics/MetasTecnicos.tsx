import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Target, Edit2, Users } from 'lucide-react';
import { useMetas } from '@/fiber-guardian/hooks/useMetas';
import { toast } from 'sonner';

interface TechnicianData { id: string; name: string; completed: number; }

interface MetasTecnicosProps { technicians: TechnicianData[]; isAdmin: boolean; }

export function MetasTecnicos({ technicians, isAdmin }: MetasTecnicosProps) {
  const { metas, loading, upsertMeta } = useMetas();
  const [editingTech, setEditingTech] = useState<{ id: string; name: string } | null>(null);
  const [metaValue, setMetaValue] = useState('');

  const handleSave = async () => {
    if (!editingTech) return;
    const value = parseInt(metaValue);
    if (isNaN(value) || value <= 0) { toast.error('Informe um valor válido'); return; }
    const success = await upsertMeta(editingTech.id, value);
    if (success) toast.success(`Meta definida para ${editingTech.name}`);
    else toast.error('Erro ao salvar meta');
    setEditingTech(null);
  };

  if (technicians.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Metas do Mês</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando metas...</p>
          ) : (
            <div className="space-y-4">
              {technicians.map((tech) => {
                const meta = metas.find((m) => m.user_id === tech.id);
                const goal = meta?.meta_reparos || 0;
                const percent = goal > 0 ? Math.min(100, Math.round((tech.completed / goal) * 100)) : 0;
                let statusColor = 'text-muted-foreground';
                let progressClass = '';
                if (goal > 0) {
                  if (percent >= 100) { statusColor = 'text-[hsl(var(--success))]'; progressClass = '[&>div]:bg-[hsl(var(--success))]'; }
                  else if (percent >= 50) { statusColor = 'text-[hsl(var(--warning))]'; progressClass = '[&>div]:bg-[hsl(var(--warning))]'; }
                  else { statusColor = 'text-destructive'; progressClass = '[&>div]:bg-destructive'; }
                }
                return (
                  <div key={tech.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{tech.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${statusColor}`}>{tech.completed}/{goal || '—'}</span>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-7 w-7"
                            onClick={() => { setEditingTech({ id: tech.id, name: tech.name }); setMetaValue(goal > 0 ? String(goal) : ''); }}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {goal > 0 ? (
                      <div className="space-y-1">
                        <Progress value={percent} className={`h-2 ${progressClass}`} />
                        <p className={`text-xs ${statusColor}`}>{percent >= 100 ? '✅ Meta atingida!' : `${percent}% concluído`}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">{isAdmin ? 'Clique no ícone para definir meta' : 'Sem meta definida'}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editingTech} onOpenChange={() => setEditingTech(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Definir Meta - {editingTech?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Reparos concluídos (meta mensal)</label>
            <Input type="number" min={1} value={metaValue} onChange={(e) => setMetaValue(e.target.value)} placeholder="Ex: 15" className="mt-2" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTech(null)}>Cancelar</Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
