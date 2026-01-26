import { supabase } from "@/integrations/supabase/client";
import { ChecklistData } from "@/types/checklist";
import { format } from "date-fns";

const TECNOLOGIAS_ACESSO = ['2G', '3G', '4G', '5G'];
const TECNOLOGIAS_TRANSPORTE = ['DWDM', 'GPON', 'HL4', 'HL5D', 'HL5G', 'PDH', 'SDH', 'GWS', 'GWD', 'SWA'];

export interface ReportRow {
  id?: string;
  created_at?: string;
  created_date: string;
  created_time: string;
  technician_name: string | null;
  site_code: string;
  state_uf: string | null;
  total_cabinets: number;
  panoramic_photo_url: string | null;
  [key: string]: any;
}

// --- Column builders (avoid fetching heavy photo columns) ---

// Base columns needed for list display (lightweight)
const SUMMARY_COLUMNS = `
  id,
  created_at,
  created_date,
  created_time,
  technician_name,
  site_code,
  state_uf,
  total_cabinets,
  email_sent,
  email_sent_at
`.replace(/\s+/g, '');

// Build columns for dashboard statistics (no photos, includes battery/AC status)
function buildDashboardColumns(): string {
  const cols: string[] = [
    'id',
    'user_id',
    'created_at',
    'created_date',
    'created_time',
    'technician_name',
    'site_code',
    'state_uf',
    'total_cabinets',
    'email_sent',
    'email_sent_at',
    'gmg_existe',
    'gmg_fabricante',
    'gmg_potencia',
    'torre_ninhos',
    'torre_protecao_fibra',
    'torre_aterramento',
    'torre_housekeeping',
    'observacoes',
    // Fibra Óptica columns
    'fibra_qtd_abordagens',
    'fibra_abord1_tipo',
    'fibra_abord1_descricao',
    'fibra_abord2_tipo',
    'fibra_abord2_descricao',
    'fibra_caixas_passagem_qtd',
    'fibra_caixas_subterraneas_qtd',
    'fibra_subidas_laterais_qtd',
    'fibra_dgos_qtd',
    'fibra_dgos_ok_qtd',
    'fibra_dgos_nok_qtd',
  ];

  // Add gabinete columns (no photos)
  for (let g = 1; g <= 7; g++) {
    const prefix = `gab${g}`;
    cols.push(
      `${prefix}_tipo`,
      `${prefix}_protecao`,
      `${prefix}_tecnologias_acesso`,
      `${prefix}_tecnologias_transporte`,
      `${prefix}_fcc_fabricante`,
      `${prefix}_fcc_tensao`,
      `${prefix}_fcc_gerenciado`,
      `${prefix}_fcc_gerenciavel`,
      `${prefix}_fcc_consumo`,
      `${prefix}_fcc_qtd_ur`,
      `${prefix}_bancos_interligados`,
      `${prefix}_climatizacao_tipo`,
      `${prefix}_ventiladores_status`,
      `${prefix}_plc_status`,
      `${prefix}_alarme_status`,
    );

    // Batteries (6 per gabinete)
    for (let b = 1; b <= 6; b++) {
      cols.push(
        `${prefix}_bat${b}_tipo`,
        `${prefix}_bat${b}_fabricante`,
        `${prefix}_bat${b}_capacidade`,
        `${prefix}_bat${b}_data_fabricacao`,
        `${prefix}_bat${b}_estado`,
      );
    }

    // ACs (4 per gabinete)
    for (let a = 1; a <= 4; a++) {
      cols.push(
        `${prefix}_ac${a}_modelo`,
        `${prefix}_ac${a}_status`,
      );
    }
  }

  return cols.join(',');
}

// Build columns for full detail view (no photos by default)
function buildDetailColumns(): string {
  // Same as dashboard + pdf/excel paths
  return buildDashboardColumns() + ',pdf_file_path,excel_file_path,observacao_foto_url,panoramic_photo_url';
}

// Photo columns only (used for on-demand loading / PDF regeneration)
function buildPhotoColumns(): string {
  const cols: string[] = [
    'id',
    'panoramic_photo_url',
    'observacao_foto_url',
    'assinatura_digital',
    'energia_foto_transformador',
    'energia_foto_quadro_geral',
    'energia_foto_placa',
    'energia_foto_cabos',
    'torre_foto_ninhos',
    'gmg_foto_painel',
    // Fiber optic photos
    'fibra_abord1_foto',
    'fibra_abord2_foto',
    'fibra_foto_caixas_passagem',
    'fibra_foto_caixas_subterraneas',
    'fibra_foto_subidas_laterais',
    'fibra_dgo1_foto',
    'fibra_dgo1_cordoes_foto',
    'fibra_dgo2_foto',
    'fibra_dgo2_cordoes_foto',
    'fibra_dgo3_foto',
    'fibra_dgo3_cordoes_foto',
    'fibra_dgo4_foto',
    'fibra_dgo4_cordoes_foto',
  ];

  for (let g = 1; g <= 7; g++) {
    const prefix = `gab${g}`;
    cols.push(
      `${prefix}_fcc_foto_panoramica`,
      `${prefix}_fcc_foto_painel`,
      `${prefix}_bat_foto`,
      `${prefix}_clima_foto_ar1`,
      `${prefix}_clima_foto_ar2`,
      `${prefix}_clima_foto_ar3`,
      `${prefix}_clima_foto_ar4`,
      `${prefix}_clima_foto_condensador`,
      `${prefix}_clima_foto_evaporador`,
      `${prefix}_clima_foto_controlador`,
      `${prefix}_foto_panoramica`,
      `${prefix}_foto_transmissao`,
      `${prefix}_foto_acesso`,
    );
  }

  return cols.join(',');
}

// --- Build report row from checklist data ---

export function buildReportRow(data: ChecklistData): ReportRow {
  const now = new Date();
  const row: ReportRow = {
    created_date: format(now, 'dd/MM/yyyy'),
    created_time: format(now, 'HH:mm'),
    technician_name: data.tecnico || null,
    site_code: data.siglaSite || 'NOVO',
    state_uf: data.uf || null,
    total_cabinets: data.qtdGabinetes,
    panoramic_photo_url: data.fotoPanoramica || null,
  };

  // For each gabinete (1-7)
  for (let i = 0; i < 7; i++) {
    const prefix = `gab${i + 1}`;
    const gab = data.gabinetes[i];

    if (gab) {
      row[`${prefix}_tipo`] = gab.tipo || null;
      row[`${prefix}_protecao`] = gab.comProtecao ? 'SIM' : 'NÃO';
      row[`${prefix}_tecnologias_acesso`] = gab.tecnologiasAcesso.join(', ') || null;
      row[`${prefix}_tecnologias_transporte`] = gab.tecnologiasTransporte.join(', ') || null;
      
      // FCC
      row[`${prefix}_fcc_fabricante`] = gab.fcc.fabricante || null;
      row[`${prefix}_fcc_tensao`] = gab.fcc.tensaoDC || null;
      row[`${prefix}_fcc_gerenciado`] = gab.fcc.gerenciadaSG ? 'SIM' : 'NÃO';
      row[`${prefix}_fcc_gerenciavel`] = gab.fcc.gerenciavel ? 'SIM' : 'NÃO';
      row[`${prefix}_fcc_consumo`] = gab.fcc.consumoDC?.toString() || null;
      row[`${prefix}_fcc_qtd_ur`] = gab.fcc.qtdURSuportadas?.toString() || null;
      row[`${prefix}_fcc_foto_panoramica`] = gab.fcc.fotoPanoramica || null;
      row[`${prefix}_fcc_foto_painel`] = gab.fcc.fotoPainel || null;
      
      // Batteries (up to 6)
      for (let j = 0; j < 6; j++) {
        const banco = gab.baterias.bancos[j];
        if (banco) {
          row[`${prefix}_bat${j + 1}_tipo`] = banco.tipo || null;
          row[`${prefix}_bat${j + 1}_fabricante`] = banco.fabricante || null;
          row[`${prefix}_bat${j + 1}_capacidade`] = banco.capacidadeAh?.toString() || null;
          row[`${prefix}_bat${j + 1}_data_fabricacao`] = banco.dataFabricacao || null;
          row[`${prefix}_bat${j + 1}_estado`] = banco.estado || null;
        }
      }
      row[`${prefix}_bancos_interligados`] = gab.baterias.bancosInterligados ? 'SIM' : 'NÃO';
      row[`${prefix}_bat_foto`] = gab.baterias.fotoBanco || null;
      
      // Climatization
      row[`${prefix}_climatizacao_tipo`] = gab.climatizacao.tipo || null;
      row[`${prefix}_ventiladores_status`] = gab.climatizacao.fanOK ? 'OK' : 'NOK';
      
      // ACs (up to 4)
      for (let j = 0; j < 4; j++) {
        const ac = gab.climatizacao.acs[j];
        if (ac) {
          row[`${prefix}_ac${j + 1}_modelo`] = ac.modelo || null;
          row[`${prefix}_ac${j + 1}_status`] = ac.funcionamento || null;
        }
      }
      
      row[`${prefix}_plc_status`] = gab.climatizacao.plcLeadLag || null;
      row[`${prefix}_alarme_status`] = gab.climatizacao.alarmistica || null;
      row[`${prefix}_clima_foto_ar1`] = gab.climatizacao.fotoAR1 || null;
      row[`${prefix}_clima_foto_ar2`] = gab.climatizacao.fotoAR2 || null;
      row[`${prefix}_clima_foto_ar3`] = gab.climatizacao.fotoAR3 || null;
      row[`${prefix}_clima_foto_ar4`] = gab.climatizacao.fotoAR4 || null;
      row[`${prefix}_clima_foto_condensador`] = gab.climatizacao.fotoCondensador || null;
      row[`${prefix}_clima_foto_evaporador`] = gab.climatizacao.fotoEvaporador || null;
      row[`${prefix}_clima_foto_controlador`] = gab.climatizacao.fotoControlador || null;
      
      // Equipment photos
      row[`${prefix}_foto_panoramica`] = gab.fotoPanoramicaGabinete || null;
      row[`${prefix}_foto_transmissao`] = gab.fotoTransmissao || null;
      row[`${prefix}_foto_acesso`] = gab.fotoAcesso || null;
    }
  }

  // GMG and Tower
  row.gmg_existe = data.gmg.informar ? 'SIM' : 'NÃO';
  row.gmg_fabricante = data.gmg.fabricante || null;
  row.gmg_potencia = data.gmg.potencia || null;
  row.gmg_combustivel = null; // Not in current data structure
  row.gmg_ultimo_teste = data.gmg.ultimoTeste || null;
  row.gmg_foto_painel = data.gmg.fotoGMG || null;
  row.torre_ninhos = data.torre.ninhos ? 'SIM' : 'NÃO';
  row.torre_protecao_fibra = data.torre.fibrasProtegidas ? 'SIM' : 'NÃO';
  row.torre_aterramento = data.torre.aterramento || null;
  row.torre_housekeeping = data.torre.zeladoria || null;

  // Energia photos
  row.energia_foto_transformador = data.energia?.fotoTransformador || null;
  row.energia_foto_quadro_geral = data.energia?.fotoQuadroGeral || null;
  row.energia_foto_placa = data.energia?.fotoPlaca || null;
  row.energia_foto_cabos = data.energia?.cabos?.fotoCabos || null;

  // Torre photos
  row.torre_foto_ninhos = data.torre?.fotoNinhos || null;

  // Observations
  row.observacoes = data.observacoes || null;
  // Store multiple observation photos as JSON array
  const validPhotos = (data.fotosObservacao || []).filter(Boolean);
  row.observacao_foto_url = validPhotos.length > 0 ? JSON.stringify(validPhotos) : null;
  
  // Assinatura
  row.assinatura_digital = data.assinaturaDigital || null;

  // Fibra Óptica
  row.fibra_qtd_abordagens = data.fibraOptica?.qtdAbordagens || 1;
  // Map up to 4 abordagens
  for (let i = 0; i < 4; i++) {
    const abord = data.fibraOptica?.abordagens?.[i];
    if (abord) {
      row[`fibra_abord${i + 1}_tipo`] = abord.tipoEntrada || null;
      row[`fibra_abord${i + 1}_descricao`] = abord.descricao || null;
    }
  }
  row.fibra_caixas_passagem_qtd = data.fibraOptica?.qtdCaixasPassagem || 0;
  row.fibra_caixas_subterraneas_qtd = data.fibraOptica?.qtdCaixasSubterraneas || 0;
  row.fibra_subidas_laterais_qtd = data.fibraOptica?.qtdSubidasLaterais || 0;
  row.fibra_dgos_qtd = data.fibraOptica?.qtdDGOs || 0;
  row.fibra_dgos_ok_qtd = data.fibraOptica?.dgos?.filter(d => d.estadoCordoes === 'OK').length || 0;
  row.fibra_dgos_nok_qtd = data.fibraOptica?.dgos?.filter(d => d.estadoCordoes === 'NOK').length || 0;
  
  // Abordagens photos (up to 4)
  for (let i = 0; i < 4; i++) {
    const abord = data.fibraOptica?.abordagens?.[i];
    if (abord?.fotos?.length) {
      row[`fibra_abord${i + 1}_foto`] = abord.fotos[0] || null;
    }
  }

  // Infrastructure photos (store first photo of each array)
  row.fibra_foto_caixas_passagem = data.fibraOptica?.fotosCaixasPassagem?.[0] || null;
  row.fibra_foto_caixas_subterraneas = data.fibraOptica?.fotosCaixasSubterraneas?.[0] || null;
  row.fibra_foto_subidas_laterais = data.fibraOptica?.fotosSubidasLaterais?.[0] || null;

  // DGO details (up to 4)
  for (let i = 0; i < 4; i++) {
    const dgo = data.fibraOptica?.dgos?.[i];
    if (dgo) {
      row[`fibra_dgo${i + 1}_id`] = dgo.identificacao || null;
      row[`fibra_dgo${i + 1}_capacidade`] = `${dgo.capacidadeFO}FO`;
      row[`fibra_dgo${i + 1}_cordoes`] = dgo.estadoCordoes || null;
      row[`fibra_dgo${i + 1}_foto`] = dgo.fotoDGO || null;
      row[`fibra_dgo${i + 1}_cordoes_foto`] = dgo.fotoCordesDetalhada || null;
    }
  }

  return row;
}

export async function saveReportToDatabase(
  data: ChecklistData,
  pdfPath?: string,
  excelPath?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const row = buildReportRow(data);
    row.pdf_file_path = pdfPath || null;
    row.excel_file_path = excelPath || null;
    row.email_sent = false;
    row.user_id = user?.id || null;

    const { data: inserted, error } = await supabase
      .from('reports')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('Error saving report:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: inserted.id };
  } catch (err: any) {
    console.error('Exception saving report:', err);
    return { success: false, error: err.message };
  }
}

export async function updateReportEmailSent(reportId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ 
        email_sent: true, 
        email_sent_at: new Date().toISOString() 
      })
      .eq('id', reportId);

    return !error;
  } catch {
    return false;
  }
}

// --- Fetch functions (optimized to avoid photo columns) ---

/**
 * Fetch lightweight summary for list display (no photos, no gabinete details)
 */
export async function fetchReportsSummary(filters?: {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReportRow[]> {
  const pageSize = 1000;
  let page = 0;
  let all: ReportRow[] = [];

  while (true) {
    let query = supabase
      .from('reports')
      .select(SUMMARY_COLUMNS)
      .order('created_at', { ascending: false });

    if (filters?.siteCode) {
      query = query.ilike('site_code', `%${filters.siteCode}%`);
    }
    if (filters?.stateUf) {
      query = query.eq('state_uf', filters.stateUf);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to);

    if (error) {
      console.error('Error fetching reports summary:', error);
      throw new Error(`Erro ao buscar relatórios: ${error.message}`);
    }

    const batch = (data || []) as unknown as ReportRow[];
    all = all.concat(batch);

    if (batch.length < pageSize) break;
    page += 1;
    if (page > 50) break;
  }

  return all;
}

/**
 * Fetch reports with dashboard-needed columns (battery/AC status, no photos)
 */
export async function fetchReportsForDashboard(filters?: {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReportRow[]> {
  const pageSize = 1000;
  let page = 0;
  let all: ReportRow[] = [];
  const columns = buildDashboardColumns();

  while (true) {
    let query = supabase
      .from('reports')
      .select(columns)
      .order('created_at', { ascending: false });

    if (filters?.siteCode) {
      query = query.ilike('site_code', `%${filters.siteCode}%`);
    }
    if (filters?.stateUf) {
      query = query.eq('state_uf', filters.stateUf);
    }
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to);

    if (error) {
      console.error('Error fetching reports for dashboard:', error);
      throw new Error(`Erro ao buscar relatórios: ${error.message}`);
    }

    const batch = (data || []) as unknown as ReportRow[];
    all = all.concat(batch);

    if (batch.length < pageSize) break;
    page += 1;
    if (page > 50) break;
  }

  return all;
}

/**
 * Legacy fetchReports - now uses dashboard columns (no photos) for compatibility
 */
export async function fetchReports(filters?: {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReportRow[]> {
  return fetchReportsForDashboard(filters);
}

/**
 * Fetch single report by ID (sem fotos por padrão para velocidade)
 */
export async function fetchReportById(id: string): Promise<ReportRow | null> {
  const columns = buildDashboardColumns();

  const { data, error } = await supabase
    .from('reports')
    .select(columns)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching report:', error);
    throw new Error(`Erro ao buscar relatório: ${error.message}`);
  }

  return data as unknown as ReportRow | null;
}

/**
 * Fetch single report by ID WITH photos (para gerar PDF/Excel com imagens)
 */
export async function fetchReportByIdWithPhotos(id: string): Promise<ReportRow | null> {
  // Busca colunas leves + todas as URLs de fotos necessárias para o PDF
  const columns = buildDetailColumns() + ',' + buildPhotoColumns();

  const { data, error } = await supabase
    .from('reports')
    .select(columns)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching report (with photos):', error);
    throw new Error(`Erro ao buscar relatório (com fotos): ${error.message}`);
  }

  return data as unknown as ReportRow | null;
}

/**
 * Fetch photos only for a specific report (on-demand loading)
 */
export async function fetchReportPhotos(id: string): Promise<Partial<ReportRow> | null> {
  const columns = buildPhotoColumns();
  
  const { data, error } = await supabase
    .from('reports')
    .select(columns)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching report photos:', error);
    throw new Error(`Erro ao buscar fotos: ${error.message}`);
  }

  return data as Partial<ReportRow> | null;
}

/**
 * Fetch full report with photos (use sparingly - only for exports)
 */
export async function fetchFullReportById(id: string): Promise<ReportRow | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching full report:', error);
    throw new Error(`Erro ao buscar relatório completo: ${error.message}`);
  }

  return data as ReportRow | null;
}

/**
 * Delete a report by ID.
 * RLS: only administrators are allowed to delete.
 */
export async function deleteReportById(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    console.error('Error deleting report:', error);
    throw new Error(`Erro ao excluir relatório: ${error.message}`);
  }
}
