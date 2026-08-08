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
  }

  return vistoriaId;
}

export async function listVistoriasVandalismo(): Promise<VandalismoVistoria[]> {
  const { data, error } = await supabase
    .from('vandalismo_vistorias')
    .select(
      'id,user_id,site_code,operadora,descricao,latitude,longitude,endereco,bo_url,bo_nome,tecnico,status,created_at,updated_at',
    )
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return (data ?? []) as VandalismoVistoria[];
}

export async function getVistoriaVandalismo(id: string): Promise<VandalismoVistoriaCompleta | null> {
  const [{ data: vistoria, error }, { data: fotos }, { data: itens }] = await Promise.all([
    supabase
      .from('vandalismo_vistorias')
      .select(
        'id,user_id,site_code,operadora,descricao,latitude,longitude,endereco,bo_url,bo_nome,tecnico,status,created_at,updated_at',
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
    const vulneraveis = itens.filter((i) => i.vulneravel).length;
    return {
      ...v,
      itens,
      totalItens: itens.length,
      vulneraveis,
      indiceVulnerabilidade: itens.length > 0 ? (vulneraveis / itens.length) * 100 : 0,
    };
  });
}
