import { supabase } from '@/integrations/supabase/client';
import {
  VandalismoItemState,
  VandalismoVistoriaCompleta,
  VandalismoItemRow,
  VandalismoFoto,
  VandalismoVistoria,
  VANDALISMO_ITENS,
} from '@/types/vandalismo';

interface SaveVistoriaInput {
  siteCode: string;
  descricao: string;
  operadora?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  endereco?: string | null;
  boUrl?: string | null;
  boNome?: string | null;
  tecnico?: string | null;
  estado: string | null;
  municipio?: string | null;
  fotosOcorrido: string[];
  itens: Record<string, VandalismoItemState>;
}

export async function saveVistoriaVandalismo(input: SaveVistoriaInput): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user?.id;
  if (!userId) throw new Error('Sessão expirada. Faça login novamente.');

  const { data: vistoria, error } = await supabase
    .from('vandalismo_vistorias')
    .insert({
      user_id: userId,
      site_code: input.siteCode.trim().toUpperCase(),
      estado: input.estado.trim().toUpperCase(),
      municipio: input.municipio?.trim() || null,
      descricao: input.descricao.trim(),
      operadora: input.operadora ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      endereco: input.endereco ?? null,
      bo_url: input.boUrl ?? null,
      bo_nome: input.boNome ?? null,
      tecnico: input.tecnico ?? null,
    })
    .select('id')
    .single();

  if (error || !vistoria) throw new Error(error?.message || 'Falha ao salvar a vistoria.');

  const vistoriaId = vistoria.id as string;

  // From here on, roll back the vistoria if anything fails, so no partial report is left behind.
  const rollback = async () => {
    await supabase.from('vandalismo_vistorias').delete().eq('id', vistoriaId);
  };

  try {
    if (input.fotosOcorrido.length > 0) {
      const { error: fotosError } = await supabase.from('vandalismo_fotos').insert(
        input.fotosOcorrido.map((url, index) => ({
          vistoria_id: vistoriaId,
          categoria: 'ocorrido',
          url,
          ordem: index,
        })),
      );
      if (fotosError) throw new Error(`Falha ao salvar fotos: ${fotosError.message}`);
    }

    const itensRows = VANDALISMO_ITENS.flatMap((def, index) => {
      const state = input.itens[def.key];
      if (!state || (state.fotos.length === 0 && !state.vulneravel && !state.observacao?.trim())) return [];
      return [
        {
          vistoria_id: vistoriaId,
          item_key: def.key,
          rotulo: def.rotulo,
          vulneravel: state.vulneravel,
          fotos: state.fotos,
          observacao: state.observacao?.trim() || null,
          ordem: index,
        },
      ];
    });

    if (itensRows.length > 0) {
      const { error: itensError } = await supabase.from('vandalismo_itens').insert(itensRows);
      if (itensError) throw new Error(`Falha ao salvar itens: ${itensError.message}`);

      // Verify everything landed (RLS can silently filter rows)
      const { count, error: countError } = await supabase
        .from('vandalismo_itens')
        .select('id', { count: 'exact', head: true })
        .eq('vistoria_id', vistoriaId);
      if (countError) throw new Error(countError.message);
      if ((count ?? 0) < itensRows.length) {
        throw new Error('Os itens do checklist não foram gravados por completo. Tente novamente.');
      }
    }
  } catch (err) {
    await rollback();
    throw err instanceof Error ? err : new Error('Falha ao salvar a vistoria.');
  }


  return vistoriaId;
}

export async function listVistoriasVandalismo(): Promise<VandalismoVistoria[]> {
  const { data, error } = await supabase
    .from('vandalismo_vistorias')
    .select(
      'id,user_id,site_code,estado,municipio,operadora,descricao,latitude,longitude,endereco,bo_url,bo_nome,tecnico,status,created_at,updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) throw new Error(error.message);
  return (data ?? []) as VandalismoVistoria[];
}

export async function getVistoriaVandalismo(id: string): Promise<VandalismoVistoriaCompleta | null> {
  const [{ data: vistoria, error }, { data: fotos }, { data: itens }] = await Promise.all([
    supabase
      .from('vandalismo_vistorias')
      .select(
        'id,user_id,site_code,estado,municipio,operadora,descricao,latitude,longitude,endereco,bo_url,bo_nome,tecnico,status,created_at,updated_at',
      )
      .eq('id', id)
      .maybeSingle(),
    supabase.from('vandalismo_fotos').select('id,vistoria_id,categoria,url,ordem').eq('vistoria_id', id).order('ordem'),
    supabase
      .from('vandalismo_itens')
      .select('id,vistoria_id,item_key,rotulo,vulneravel,fotos,observacao,ordem')
      .eq('vistoria_id', id)
      .order('ordem'),
  ]);

  if (error) throw new Error(error.message);
  if (!vistoria) return null;

  return {
    ...(vistoria as VandalismoVistoria),
    fotos: (fotos ?? []) as VandalismoFoto[],
    itens: ((itens ?? []) as unknown[]).map((row) => {
      const r = row as VandalismoItemRow & { fotos: unknown };
      return { ...r, fotos: Array.isArray(r.fotos) ? (r.fotos as string[]) : [] };
    }),
  };
}

export async function deleteVistoriaVandalismo(id: string): Promise<void> {
  const { error } = await supabase.from('vandalismo_vistorias').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export interface VandalismoVistoriaResumo extends VandalismoVistoria {
  itens: VandalismoItemRow[];
  totalItens: number;
  vulneraveis: number;
  indiceVulnerabilidade: number;
  estado: string | null;
  municipio: string | null;
  totalAnterior?: number;
}

/** Fetch all vistorias with their checklist items (for the manager dashboard). */
export async function listVistoriasComItens(): Promise<VandalismoVistoriaResumo[]> {
  const vistorias = await listVistoriasVandalismo();
  if (vistorias.length === 0) return [];

  const ids = vistorias.map((v) => v.id);
  const { data, error } = await supabase
    .from('vandalismo_itens')
    .select('id,vistoria_id,item_key,rotulo,vulneravel,fotos,observacao,ordem')
    .in('vistoria_id', ids);

  if (error) throw new Error(error.message);

  const byVistoria = new Map<string, VandalismoItemRow[]>();
  for (const row of (data ?? []) as unknown[]) {
    const r = row as VandalismoItemRow & { fotos: unknown };
    const item: VandalismoItemRow = { ...r, fotos: Array.isArray(r.fotos) ? (r.fotos as string[]) : [] };
    const list = byVistoria.get(item.vistoria_id) ?? [];
    list.push(item);
    byVistoria.set(item.vistoria_id, list);
  }

  return vistorias.map((v) => {
    const itens = (byVistoria.get(v.id) ?? []).sort((a, b) => a.ordem - b.ordem);
    // Site plate photo does not enter the denominator for vulnerability calculation (%)
    const filteredItens = itens.filter(i => i.item_key !== 'placa_site');
    const vulneraveis = filteredItens.filter((i) => i.vulneravel).length;
    
    // Calculate previous occurrences for the same site
    const anterior = vistorias.filter(prev => 
      prev.site_code === v.site_code && 
      new Date(prev.created_at) < new Date(v.created_at)
    ).length;

    return {
      ...v,
      itens,
      totalAnterior: anterior,
      totalItens: filteredItens.length,
      vulneraveis,
      indiceVulnerabilidade: filteredItens.length > 0 ? (vulneraveis / filteredItens.length) * 100 : 0,
    };
  });
}

interface UpdateVistoriaInput {
  siteCode?: string;
  descricao?: string;
  operadora?: string | null;
  tecnico?: string | null;
  estado?: string | null;
  municipio?: string | null;
  status?: string;
  boUrl?: string | null;
  boNome?: string | null;
  fotosOcorrido?: string[];
}

export async function updateVistoriaVandalismo(id: string, input: UpdateVistoriaInput): Promise<void> {
  const updates: any = {};
  if (input.siteCode !== undefined) updates.site_code = input.siteCode.trim().toUpperCase();
  if (input.descricao !== undefined) updates.descricao = input.descricao.trim();
  if (input.operadora !== undefined) updates.operadora = input.operadora;
  if (input.tecnico !== undefined) updates.tecnico = input.tecnico;
  if (input.estado !== undefined) updates.estado = input.estado;
  if (input.municipio !== undefined) updates.municipio = input.municipio;
  if (input.status !== undefined) updates.status = input.status;
  if (input.boUrl !== undefined) updates.bo_url = input.boUrl;
  if (input.boNome !== undefined) updates.bo_nome = input.boNome;
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('vandalismo_vistorias')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);

  // Update photos if provided
  if (input.fotosOcorrido !== undefined) {
    // Delete existing photos of this category
    const { error: delError } = await supabase
      .from('vandalismo_fotos')
      .delete()
      .eq('vistoria_id', id)
      .eq('categoria', 'ocorrido');
    
    if (delError) throw new Error(`Falha ao atualizar fotos: ${delError.message}`);

    // Insert new ones
    if (input.fotosOcorrido.length > 0) {
      const { error: insError } = await supabase.from('vandalismo_fotos').insert(
        input.fotosOcorrido.map((url, index) => ({
          vistoria_id: id,
          categoria: 'ocorrido',
          url,
          ordem: index,
        })),
      );
      if (insError) throw new Error(`Falha ao salvar novas fotos: ${insError.message}`);
    }
  }
}

export async function updateVistoriaItem(
  id: string, 
  vulneravel: boolean, 
  observacao?: string | null,
  fotos?: string[]
): Promise<void> {
  const updates: any = { 
    vulneravel, 
    observacao: observacao?.trim() || null 
  };
  
  if (fotos !== undefined) {
    updates.fotos = fotos;
  }

  const { error } = await supabase
    .from('vandalismo_itens')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}
