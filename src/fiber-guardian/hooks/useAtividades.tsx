import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Atividade {
  id: string;
  reparo_id: string;
  usuario_id: string;
  tipo: string;
  descricao: string | null;
  criado_em: string;
  usuario_nome?: string;
}

export function useAtividades(reparoId: string | null) {
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAtividades = useCallback(async () => {
    if (!reparoId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('atividades_reparo')
        .select('*')
        .eq('reparo_id', reparoId)
        .order('criado_em', { ascending: false });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(a => a.usuario_id))];
      const { data: profiles } = await supabase
        .from('fg_profiles')
        .select('id, nome')
        .in('id', userIds);

      const profileMap = new Map((profiles || []).map(p => [p.id, p.nome]));

      setAtividades((data || []).map(a => ({
        ...a,
        usuario_nome: profileMap.get(a.usuario_id) || 'Desconhecido',
      })));
    } catch (error) {
      console.error('Error fetching atividades:', error);
    } finally {
      setLoading(false);
    }
  }, [reparoId]);

  useEffect(() => {
    fetchAtividades();
  }, [fetchAtividades]);

  return { atividades, loading, refreshAtividades: fetchAtividades };
}

export async function registrarAtividade(
  reparo_id: string,
  tipo: string,
  descricao?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('atividades_reparo')
    .insert({
      reparo_id,
      usuario_id: user.id,
      tipo,
      descricao: descricao || null,
    });

  if (error) {
    console.error('Error registering activity:', error);
  }
}
