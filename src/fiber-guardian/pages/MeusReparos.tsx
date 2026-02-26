import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { FGLayout } from '@/fiber-guardian/components/layout/FGLayout';
import { StatusBadge } from '@/fiber-guardian/components/ui/status-badge';
import { CausaBadge } from '@/fiber-guardian/components/ui/causa-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MeusReparos() {
  const navigate = useNavigate();
  const { reparos, loading } = useReparos();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return reparos;
    return reparos.filter(r => r.ta_titulo.toLowerCase().includes(search.toLowerCase()));
  }, [reparos, search]);

  return (
    <FGLayout title="Meus Reparos" showBack backTo="/auditoria-ta">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Buscar TA..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <p className="text-sm text-muted-foreground">{filtered.length} registro(s)</p>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum registro encontrado.</CardContent></Card>
      ) : (
        filtered.map(reparo => (
          <Card
            key={reparo.id}
            className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
            onClick={() => navigate(`/auditoria-ta/reparo/${reparo.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{reparo.ta_titulo}</h3>
                <StatusBadge status={reparo.status} />
              </div>
              <div className="flex items-center gap-2">
                <CausaBadge causa={reparo.causa} />
                <span className="text-xs text-muted-foreground">
                  {format(new Date(reparo.criado_em), "dd/MM/yy HH:mm", { locale: ptBR })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </FGLayout>
  );
}
