import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFGAuth } from './useFGAuth';

interface SidebarCounts {
  pendentesRevisao: number;
  vistoriasProximas: number;
  revisaoTecnico: number;
}

export function useSidebarCounts() {
  const { user, isAdmin } = useFGAuth();
  const [counts, setCounts] = useState<SidebarCounts>({
    pendentesRevisao: 0,
    vistoriasProximas: 0,
    revisaoTecnico: 0,
  });

  const fetchCounts = useCallback(async () => {
    if (!user) return;

    try {
      if (isAdmin) {
        const { count: pendentesRevisao } = await supabase
          .from('reparos')
          .select('*', { count: 'exact', head: true })
          .in('status', ['pendente', 'revisao']);

        const in7days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const { count: vistoriasProximas } = await supabase
          .from('reparos')
          .select('*', { count: 'exact', head: true })
          .not('prazo_vistoria', 'is', null)
          .lte('prazo_vistoria', in7days)
          .in('status', ['pendente', 'enviado', 'revisao']);

        setCounts({
          pendentesRevisao: pendentesRevisao || 0,
          vistoriasProximas: vistoriasProximas || 0,
          revisaoTecnico: 0,
        });
      } else {
        const { count: revisaoTecnico } = await supabase
          .from('reparos')
          .select('*', { count: 'exact', head: true })
          .eq('usuario_id', user.id)
          .eq('status', 'revisao');

        setCounts({
          pendentesRevisao: 0,
          vistoriasProximas: 0,
          revisaoTecnico: revisaoTecnico || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching sidebar counts:', error);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchCounts();
    // Polling instead of realtime subscription: the `reparos` table is no
    // longer published to Supabase Realtime to prevent broad channel access.
    const interval = setInterval(fetchCounts, 60_000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return counts;
}
