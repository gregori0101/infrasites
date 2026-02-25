import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFGAuth } from './useFGAuth';
import { RevisaoReparo, TipoRevisao } from '@/fiber-guardian/types/database';
import { toast } from 'sonner';

export function useRevisoes(reparoId: string | undefined) {
  const { user } = useFGAuth();
  const [revisoes, setRevisoes] = useState<RevisaoReparo[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRevisoes = useCallback(async () => {
    if (!reparoId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('revisoes_reparo')
        .select('*')
        .eq('reparo_id', reparoId)
        .order('criado_em', { ascending: true });

      if (error) throw error;

      const userIds = [...new Set((data || []).map(r => r.usuario_id))];
      const { data: profiles } = await supabase
        .from('fg_profiles')
        .select('id, nome, email, criado_em')
        .in('id', userIds);

      const profilesMap = (profiles || []).reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {} as Record<string, any>);

      setRevisoes((data || []).map(r => ({
        ...r,
        tipo: r.tipo as TipoRevisao,
        profiles: profilesMap[r.usuario_id],
      })));
    } catch (error) {
      console.error('Error fetching revisoes:', error);
    } finally {
      setLoading(false);
    }
  }, [reparoId]);

  useEffect(() => {
    fetchRevisoes();
  }, [fetchRevisoes]);

  const addRevisao = async (mensagem: string, tipo: TipoRevisao) => {
    if (!reparoId || !user?.id || !mensagem.trim()) {
      toast.error('Preencha a mensagem');
      return false;
    }

    try {
      const { error } = await supabase
        .from('revisoes_reparo')
        .insert({
          reparo_id: reparoId,
          usuario_id: user.id,
          mensagem: mensagem.trim(),
          tipo,
        });

      if (error) throw error;
      
      await fetchRevisoes();
      toast.success(tipo === 'admin_comentario' ? 'Comentário adicionado' : 'Resposta enviada');
      return true;
    } catch (error) {
      console.error('Error adding revisao:', error);
      toast.error('Erro ao enviar mensagem');
      return false;
    }
  };

  return {
    revisoes,
    loading,
    addRevisao,
    refreshRevisoes: fetchRevisoes,
  };
}
