import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, format } from 'date-fns';

export interface MetaTecnico {
  id: string;
  user_id: string;
  mes: string;
  meta_reparos: number;
  criado_em: string;
  atualizado_em: string;
}

export function useMetas(mes?: Date) {
  const [metas, setMetas] = useState<MetaTecnico[]>([]);
  const [loading, setLoading] = useState(true);

  const mesStr = format(mes || startOfMonth(new Date()), 'yyyy-MM-01');

  const fetchMetas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('metas_tecnico')
      .select('*')
      .eq('mes', mesStr);

    if (!error && data) {
      setMetas(data as MetaTecnico[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMetas();
  }, [mesStr]);

  const upsertMeta = async (userId: string, metaReparos: number) => {
    const { error } = await supabase
      .from('metas_tecnico')
      .upsert(
        { user_id: userId, mes: mesStr, meta_reparos: metaReparos },
        { onConflict: 'user_id,mes' }
      );

    if (!error) {
      await fetchMetas();
      return true;
    }
    return false;
  };

  return { metas, loading, fetchMetas, upsertMeta };
}
