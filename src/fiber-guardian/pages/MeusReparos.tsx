import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useReparos } from '@/fiber-guardian/hooks/useReparos';
import { StatusBadge } from '@/fiber-guardian/components/ui/status-badge';
import { CausaBadge } from '@/fiber-guardian/components/ui/causa-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
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
    <>
      <Helmet><title>Meus Reparos | Auditoria TA</title></Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b bg-card px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <Button variant="ghost" size="icon" onClick={() => navigate('/auditoria-ta')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Meus Reparos</h1>
        </header>

        <main className="flex-1 p-4 space-y-3">
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
        </main>
      </div>
    </>
  );
}
