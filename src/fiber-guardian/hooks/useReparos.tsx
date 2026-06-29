import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFGAuth } from './useFGAuth';
import { useOnlineStatus } from './useOnlineStatus';
import { Reparo, FotoReparo, NovoReparoForm, StatusReparo, CausaReparo, ConclusaoTA, TipoFoto, FGProfile, CategoriaReparo, TipoRede } from '@/fiber-guardian/types/database';
import { 
  saveReparoOffline, 
  getReparosOffline, 
  addPendingSync,
  getPendingSyncs,
  removePendingSync,
  saveFotoOffline,
} from '@/fiber-guardian/lib/offlineDb';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function useReparos() {
  const { user, isAdmin } = useFGAuth();
  const isOnline = useOnlineStatus();
  const [reparos, setReparos] = useState<Reparo[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchReparos = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (isOnline) {
        let query = supabase
          .from('reparos')
          .select(`*, fotos_reparo (*)`)
          .order('criado_em', { ascending: false });

        if (!isAdmin) {
          query = query.eq('usuario_id', user.id);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Fetch profiles from fg_profiles
        const usuarioIds = [...new Set((data || []).map(r => r.usuario_id))];
        const { data: profilesData } = await supabase
          .from('fg_profiles')
          .select('id, nome, email')
          .in('id', usuarioIds);

        const profilesMap = new Map(
          (profilesData || []).map(p => [p.id, p])
        );

        const mappedData = (data || []).map(item => ({
          ...item,
          causa: item.causa as CausaReparo,
          status: item.status as StatusReparo,
          conclusao_ta: item.conclusao_ta as ConclusaoTA,
          categoria: (item.categoria || 'manutencao') as CategoriaReparo,
          tipo_rede: (item.tipo_rede || undefined) as TipoRede | undefined,
          profiles: profilesMap.get(item.usuario_id) as FGProfile | undefined,
          fotos_reparo: (item.fotos_reparo || []).map((foto: any) => ({
            ...foto,
            tipo_foto: foto.tipo_foto as TipoFoto
          }))
        })) as Reparo[];

        setReparos(mappedData);

        // Save to offline storage
        for (const reparo of mappedData) {
          await saveReparoOffline(reparo);
        }
      } else {
        const offlineReparos = await getReparosOffline(isAdmin ? undefined : user.id);
        setReparos(offlineReparos);
      }
    } catch (error) {
      console.error('Error fetching reparos:', error);
      const offlineReparos = await getReparosOffline(isAdmin ? undefined : user.id);
      setReparos(offlineReparos);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isAdmin, isOnline]);

  const syncPendingChanges = useCallback(async () => {
    if (!isOnline || syncing) return;

    try {
      setSyncing(true);
      const pendingSyncs = await getPendingSyncs();

      for (const sync of pendingSyncs) {
        try {
          if (sync.type === 'reparo') {
            if (sync.action === 'create') {
              const reparoData = sync.data as Reparo;
              const { error } = await supabase.from('reparos').insert({
                id: reparoData.id,
                usuario_id: reparoData.usuario_id,
                ta_titulo: reparoData.ta_titulo,
                causa: reparoData.causa,
                latitude: reparoData.latitude,
                longitude: reparoData.longitude,
                status: reparoData.status,
                conclusao_ta: reparoData.conclusao_ta,
                observacoes: reparoData.observacoes,
                sincronizado: true,
              });
              if (error) throw error;
            } else if (sync.action === 'update') {
              const reparoData = sync.data as Partial<Reparo> & { id: string };
              const { error } = await supabase
                .from('reparos')
                .update({ ...reparoData, sincronizado: true })
                .eq('id', reparoData.id);
              if (error) throw error;
            }
          } else if (sync.type === 'foto') {
            if (sync.action === 'create') {
              const fotoData = sync.data as { foto: FotoReparo; blob: Blob };
              const filePath = `${fotoData.foto.reparo_id}/${fotoData.foto.id}`;
              const { error: uploadError } = await supabase.storage
                .from('fotos-reparos')
                .upload(filePath, fotoData.blob);
              if (uploadError) throw uploadError;

              const { data: urlData } = supabase.storage
                .from('fotos-reparos')
                .getPublicUrl(filePath);

              const { error: dbError } = await supabase.from('fotos_reparo').insert({
                id: fotoData.foto.id,
                reparo_id: fotoData.foto.reparo_id,
                tipo_foto: fotoData.foto.tipo_foto,
                titulo: fotoData.foto.titulo,
                caminho_arquivo: urlData.publicUrl,
                ordem: fotoData.foto.ordem,
              });
              if (dbError) throw dbError;
            }
          }
          await removePendingSync(sync.id);
        } catch (error) {
          console.error('Error syncing:', error);
          await addPendingSync({ ...sync, retries: sync.retries + 1 });
        }
      }

      await fetchReparos();
      if (pendingSyncs.length > 0) {
        toast.success(`${pendingSyncs.length} item(s) sincronizado(s)`);
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  }, [isOnline, syncing]);

  useEffect(() => {
    if (isOnline && user) {
      syncPendingChanges();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  useEffect(() => {
    if (user) {
      fetchReparos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin]);

  const createReparo = async (form: NovoReparoForm, statusOverride?: StatusReparo): Promise<{ success: boolean; error?: string; reparoId?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const reparoId = uuidv4();
      const now = new Date().toISOString();

      const reparo: Reparo = {
        id: reparoId,
        usuario_id: user.id,
        ta_titulo: form.ta_titulo,
        trecho: form.trecho,
        causa: form.causa,
        latitude: form.latitude,
        longitude: form.longitude,
        status: statusOverride || 'enviado',
        conclusao_ta: form.conclusao_ta,
        categoria: form.categoria,
        tipo_rede: form.tipo_rede,
        observacoes: form.observacoes,
        observacao_prevencao: form.observacao_prevencao,
        observacao_definitivo: form.observacao_definitivo,
        tecnicos_reparo: form.tecnicos_reparo,
        criado_em: now,
        atualizado_em: now,
        sincronizado: isOnline,
        email_enviado: false,
        rnc_aplicada: false,
        caixa_bomba: form.caixa_bomba,
      };

      if (isOnline) {
        const { error } = await supabase.from('reparos').insert({
          id: reparo.id,
          usuario_id: reparo.usuario_id,
          ta_titulo: reparo.ta_titulo,
          trecho: reparo.trecho,
          causa: reparo.causa,
          categoria: reparo.categoria,
          tipo_rede: reparo.tipo_rede,
          latitude: reparo.latitude,
          longitude: reparo.longitude,
          status: reparo.status,
          conclusao_ta: reparo.conclusao_ta,
          observacoes: reparo.observacoes,
          observacao_prevencao: form.observacao_prevencao,
          observacao_definitivo: form.observacao_definitivo,
          tecnicos_reparo: form.tecnicos_reparo,
          caixa_bomba: form.caixa_bomba,
          sincronizado: true,
        });
        if (error) throw error;

        const allFotos = [
          ...form.fotos.rompimento.map((f, i) => ({ file: f, tipo: 'rompimento' as TipoFoto, ordem: i })),
          ...form.fotos.caixa_emenda.map((f, i) => ({ file: f, tipo: 'caixa_emenda' as TipoFoto, ordem: i })),
          ...form.fotos.caixas_poste.map((f, i) => ({ file: f, tipo: 'caixas_poste' as TipoFoto, ordem: i })),
        ];

        for (const { file, tipo, ordem } of allFotos) {
          const fotoId = uuidv4();
          const filePath = `${user.id}/${reparoId}/${fotoId}`;

          const { error: uploadError } = await supabase.storage
            .from('fotos-reparos')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: urlData, error: signErr } = await supabase.storage
            .from('fotos-reparos')
            .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10);
          if (signErr || !urlData?.signedUrl) {
            console.error('Sign URL error:', signErr);
            continue;
          }

          await supabase.from('fotos_reparo').insert({
            id: fotoId,
            reparo_id: reparoId,
            tipo_foto: tipo,
            titulo: file.name,
            caminho_arquivo: urlData.signedUrl,
            ordem,
          });
        }
      } else {
        await saveReparoOffline(reparo);
        await addPendingSync({
          id: uuidv4(),
          type: 'reparo',
          action: 'create',
          data: reparo,
          created_at: now,
          retries: 0,
        });

        const allFotos = [
          ...form.fotos.rompimento.map((f, i) => ({ file: f, tipo: 'rompimento' as TipoFoto, ordem: i })),
          ...form.fotos.caixa_emenda.map((f, i) => ({ file: f, tipo: 'caixa_emenda' as TipoFoto, ordem: i })),
          ...form.fotos.caixas_poste.map((f, i) => ({ file: f, tipo: 'caixas_poste' as TipoFoto, ordem: i })),
        ];

        for (const { file, tipo, ordem } of allFotos) {
          const fotoId = uuidv4();
          const foto: FotoReparo = {
            id: fotoId,
            reparo_id: reparoId,
            tipo_foto: tipo,
            titulo: file.name,
            caminho_arquivo: URL.createObjectURL(file),
            ordem,
            criado_em: now,
          };
          await saveFotoOffline(foto, file);
          await addPendingSync({
            id: uuidv4(),
            type: 'foto',
            action: 'create',
            data: { foto, blob: file },
            created_at: now,
            retries: 0,
          });
        }
      }

      await fetchReparos();
      return { success: true, reparoId };
    } catch (error) {
      console.error('Error creating reparo:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  const updateReparoStatus = async (id: string, status: StatusReparo): Promise<boolean> => {
    try {
      if (isOnline) {
        const { error } = await supabase
          .from('reparos')
          .update({ status })
          .eq('id', id);
        if (error) throw error;
      } else {
        const reparo = await getReparosOffline().then(r => r.find(rep => rep.id === id));
        if (reparo) {
          await saveReparoOffline({ ...reparo, status, sincronizado: false });
          await addPendingSync({
            id: uuidv4(),
            type: 'reparo',
            action: 'update',
            data: { id, status },
            created_at: new Date().toISOString(),
            retries: 0,
          });
        }
      }
      await fetchReparos();
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      return false;
    }
  };

  const deleteReparo = async (id: string): Promise<boolean> => {
    try {
      if (isOnline) {
        const { data: fotos } = await supabase
          .from('fotos_reparo')
          .select('caminho_arquivo')
          .eq('reparo_id', id);

        if (fotos) {
          for (const foto of fotos) {
            // Path may be embedded in a signed or legacy public URL
            const m = foto.caminho_arquivo.match(/\/fotos-reparos\/([^?]+)/);
            const path = m ? decodeURIComponent(m[1]) : null;
            if (path) {
              await supabase.storage.from('fotos-reparos').remove([path]);
            }
          }
        }

        const { error } = await supabase
          .from('reparos')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }
      await fetchReparos();
      return true;
    } catch (error) {
      console.error('Error deleting reparo:', error);
      return false;
    }
  };

  const updateReparoCategoria = async (id: string, categoria: CategoriaReparo): Promise<boolean> => {
    try {
      if (isOnline) {
        const { error } = await supabase
          .from('reparos')
          .update({ categoria })
          .eq('id', id);
        if (error) throw error;
      } else {
        const reparo = await getReparosOffline().then(r => r.find(rep => rep.id === id));
        if (reparo) {
          await saveReparoOffline({ ...reparo, categoria, sincronizado: false });
          await addPendingSync({
            id: uuidv4(),
            type: 'reparo',
            action: 'update',
            data: { id, categoria },
            created_at: new Date().toISOString(),
            retries: 0,
          });
        }
      }
      await fetchReparos();
      return true;
    } catch (error) {
      console.error('Error updating categoria:', error);
      return false;
    }
  };

  const updateReparo = async (
    id: string,
    form: NovoReparoForm,
    statusOverride?: StatusReparo
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      if (isOnline) {
        const { error } = await supabase
          .from('reparos')
          .update({
            ta_titulo: form.ta_titulo,
            trecho: form.trecho,
            causa: form.causa,
            categoria: form.categoria,
            tipo_rede: form.tipo_rede,
            latitude: form.latitude,
            longitude: form.longitude,
            status: statusOverride || 'enviado',
            conclusao_ta: form.conclusao_ta,
            observacoes: form.observacoes,
            observacao_prevencao: form.observacao_prevencao,
            observacao_definitivo: form.observacao_definitivo,
            tecnicos_reparo: form.tecnicos_reparo,
            caixa_bomba: form.caixa_bomba,
            sincronizado: true,
          })
          .eq('id', id);
        if (error) throw error;

        const allFotos = [
          ...form.fotos.rompimento.map((f, i) => ({ file: f, tipo: 'rompimento' as TipoFoto, ordem: i })),
          ...form.fotos.caixa_emenda.map((f, i) => ({ file: f, tipo: 'caixa_emenda' as TipoFoto, ordem: i })),
          ...form.fotos.caixas_poste.map((f, i) => ({ file: f, tipo: 'caixas_poste' as TipoFoto, ordem: i })),
        ];

        for (const { file, tipo, ordem } of allFotos) {
          const fotoId = uuidv4();
          const filePath = `${user.id}/${id}/${fotoId}`;

          const { error: uploadError } = await supabase.storage
            .from('fotos-reparos')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Upload error:', uploadError);
            continue;
          }

          const { data: urlData } = supabase.storage
            .from('fotos-reparos')
            .getPublicUrl(filePath);

          await supabase.from('fotos_reparo').insert({
            id: fotoId,
            reparo_id: id,
            tipo_foto: tipo,
            titulo: file.name,
            caminho_arquivo: urlData.publicUrl,
            ordem,
          });
        }
      } else {
        const reparo = await getReparosOffline().then(r => r.find(rep => rep.id === id));
        if (reparo) {
          await saveReparoOffline({
            ...reparo,
            ta_titulo: form.ta_titulo,
            trecho: form.trecho,
            causa: form.causa,
            categoria: form.categoria,
            tipo_rede: form.tipo_rede,
            latitude: form.latitude,
            longitude: form.longitude,
            status: statusOverride || 'enviado',
            conclusao_ta: form.conclusao_ta,
            observacoes: form.observacoes,
            observacao_prevencao: form.observacao_prevencao,
            observacao_definitivo: form.observacao_definitivo,
            tecnicos_reparo: form.tecnicos_reparo,
            sincronizado: false,
          });
          await addPendingSync({
            id: uuidv4(),
            type: 'reparo',
            action: 'update',
            data: { id, ...form, status: statusOverride || 'enviado' },
            created_at: new Date().toISOString(),
            retries: 0,
          });
        }
      }

      await fetchReparos();
      return { success: true };
    } catch (error) {
      console.error('Error updating reparo:', error);
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    reparos,
    loading,
    syncing,
    fetchReparos,
    createReparo,
    updateReparo,
    updateReparoStatus,
    updateReparoCategoria,
    deleteReparo,
    syncPendingChanges,
  };
}
