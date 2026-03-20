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
  fotos_extras?: Record<string, string[]> | null;
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
    'gmg_autonomia',
    'gmg_status',
    'gmg_combustivel',
    'gmg_alarme_ativo',
    'gmg_ultimo_teste',
    'torre_protecao_fibra',
    'torre_aterramento',
    'torre_housekeeping',
    'torre_ninhos',
    'observacoes',
    // JSONB (leve) - necessário para exibir/gerar PDF com fotos extras
    'fotos_extras',
    // Energia columns (all non-photo fields for PDF generation)
    'energia_tipo_quadro',
    'energia_fabricante',
    'energia_fabricante_outra',
    'energia_potencia_kva',
    'energia_tensao_entrada',
    'energia_disjuntor_entrada',
    'energia_disjuntor_qdca',
    'energia_protegido_gradil',
    'energia_protegido_cadeado',
    'energia_transformador_ok',
    'energia_potencia_transformador',
    'energia_unidade_consumidora',
    // Fibra Óptica columns
    'fibra_qtd_abordagens',
    'fibra_abord1_tipo',
    'fibra_abord1_descricao',
    'fibra_abord2_tipo',
    'fibra_abord2_descricao',
    'fibra_abord3_tipo',
    'fibra_abord3_descricao',
    'fibra_abord4_tipo',
    'fibra_abord4_descricao',
    'fibra_caixas_passagem_qtd',
    'fibra_caixas_subterraneas_qtd',
    'fibra_subidas_laterais_qtd',
    'fibra_dgos_qtd',
    'fibra_dgos_ok_qtd',
    'fibra_dgos_nok_qtd',
    'fibra_dgo1_id',
    'fibra_dgo1_capacidade',
    'fibra_dgo1_cordoes',
    'fibra_dgo2_id',
    'fibra_dgo2_capacidade',
    'fibra_dgo2_cordoes',
    'fibra_dgo3_id',
    'fibra_dgo3_capacidade',
    'fibra_dgo3_cordoes',
    'fibra_dgo4_id',
    'fibra_dgo4_capacidade',
    'fibra_dgo4_cordoes',
    // Geolocation
    'geo_latitude',
    'geo_longitude',
    'geo_endereco',
    'geo_capturado_em',
    // Operadora
    'operadora',
  ];

  // Add gabinete columns (no photos)
  for (let g = 1; g <= 7; g++) {
    const prefix = `gab${g}`;
    cols.push(
      `${prefix}_tipo`,
      `${prefix}_ativo`,
      `${prefix}_protecao`,
      `${prefix}_tecnologias_acesso`,
      `${prefix}_tecnologias_transporte`,
      `${prefix}_fcc_fabricante`,
      `${prefix}_fcc_tensao`,
      `${prefix}_fcc_gerenciado`,
      `${prefix}_fcc_gerenciavel`,
      `${prefix}_fcc_consumo`,
      `${prefix}_fcc_qtd_ur`,
      `${prefix}_fcc_qtd_ur_instaladas`,
      `${prefix}_bancos_interligados`,
      `${prefix}_bat_foto`,
      `${prefix}_climatizacao_tipo`,
      `${prefix}_ventiladores_status`,
      `${prefix}_plc_status`,
      `${prefix}_alarme_status`,
    );

    // Batteries (12 per gabinete)
    for (let b = 1; b <= 12; b++) {
      cols.push(
        `${prefix}_bat${b}_tipo`,
        `${prefix}_bat${b}_fabricante`,
        `${prefix}_bat${b}_capacidade`,
        `${prefix}_bat${b}_data_fabricacao`,
        `${prefix}_bat${b}_estado`,
        `${prefix}_bat${b}_colada`,
        `${prefix}_bat${b}_com_gradil`,
      );
    }

    // ACs (4 per gabinete)
    for (let a = 1; a <= 4; a++) {
      cols.push(`${prefix}_ac${a}_modelo`, `${prefix}_ac${a}_status`);
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
    'energia_foto_relogio',
    'energia_foto_placa',
    'energia_foto_cabos',
    'torre_foto_ninhos',
    'torre_foto_fibras_protegidas',
    'torre_foto_aterramento',
    'torre_foto_zeladoria',
    'gmg_foto_painel',
    // Fiber optic photos
    'fibra_abord1_foto',
    'fibra_abord2_foto',
    'fibra_abord3_foto',
    'fibra_abord4_foto',
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
  // Add gmg_foto_alarme to photo columns
  cols.push('gmg_foto_alarme');

  return cols.join(',');
}

/**
 * Fetch the latest report for a specific site code (without photos)
 * Respects RLS and operadora filtering
 */
export async function fetchLatestReportBySiteCode(siteCode: string): Promise<ReportRow | null> {
  try {
    // All columns needed for pre-fill (excluding photos)
    const columns = buildDashboardColumns() + ',operadora';
    
    const { data, error } = await supabase
      .from('reports')
      .select(columns)
      .ilike('site_code', siteCode)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest report by site code:', error);
      return null;
    }

    return data as unknown as ReportRow | null;
  } catch (err) {
    console.error('Exception fetching latest report:', err);
    return null;
  }
}

/**
 * Fetch the latest report for a specific site code INCLUDING all photos
 * Used for pre-filling forms with complete data from previous inspection
 * Uses a security definer function to bypass RLS - allows technicians to access previous reports
 */
export async function fetchLatestReportWithPhotosBySiteCode(siteCode: string): Promise<ReportRow | null> {
  try {
    // Use the security definer function to bypass RLS restrictions
    // This allows technicians to access previous inspection data for pre-filling
    const { data, error } = await supabase
      .rpc('get_latest_report_for_prefill', { p_site_code: siteCode })
      .maybeSingle();

    if (error) {
      console.error('Error fetching latest report with photos by site code:', error);
      return null;
    }

    return data as unknown as ReportRow | null;
  } catch (err) {
    console.error('Exception fetching latest report with photos:', err);
    return null;
  }
}

// --- Build report row from checklist data ---

export function buildReportRow(data: ChecklistData): ReportRow {
  const now = new Date();
  const skipped = data.secoesNaoAplicaveis ?? { gabinete: false, fcc: false, baterias: false, climatizacao: false, energia: false, gmgTorre: false };
  
  const row: ReportRow = {
    created_date: format(now, 'dd/MM/yyyy'),
    created_time: format(now, 'HH:mm'),
    technician_name: data.tecnico || null,
    site_code: data.siglaSite || 'NOVO',
    state_uf: data.uf || null,
    total_cabinets: data.qtdGabinetes,
    panoramic_photo_url: data.fotoPanoramica || null,
    operadora: data.operadora || 'VIVO',
    // Geolocation data
    geo_latitude: data.geolocalizacao?.latitude || null,
    geo_longitude: data.geolocalizacao?.longitude || null,
    geo_endereco: data.geolocalizacao?.endereco || null,
    geo_capturado_em: data.geolocalizacao?.capturadoEm || null,
  };

  // Skip gabinete-related sections if marked NA
  const skipGabinete = skipped.gabinete;
  const skipFCC = skipped.fcc;
  const skipBaterias = skipped.baterias;
  const skipClimatizacao = skipped.climatizacao;
  
  // For each gabinete (1-7)
  for (let i = 0; i < 7; i++) {
    const prefix = `gab${i + 1}`;
    const gab = data.gabinetes[i];

    if (gab && !skipGabinete) {
      row[`${prefix}_tipo`] = gab.tipo || null;
      row[`${prefix}_ativo`] = gab.ativo === true ? 'SIM' : gab.ativo === false ? 'NÃO' : null;
      row[`${prefix}_protecao`] = gab.comProtecao === true ? 'SIM' : gab.comProtecao === false ? 'NÃO' : null;
      row[`${prefix}_tecnologias_acesso`] = gab.tecnologiasAcesso?.length ? gab.tecnologiasAcesso.join(', ') : null;
      row[`${prefix}_tecnologias_transporte`] = gab.tecnologiasTransporte?.length ? gab.tecnologiasTransporte.join(', ') : null;
      
      // FCC (first FCC for backwards compatibility) - skip if FCC section marked NA
      if (!skipFCC) {
        const firstFCC = gab.fcc.fccs[0];
        if (firstFCC) {
          row[`${prefix}_fcc_fabricante`] = firstFCC.fabricante || null;
          row[`${prefix}_fcc_tensao`] = firstFCC.tensaoDC || null;
          row[`${prefix}_fcc_gerenciado`] = firstFCC.gerenciadaSG === true ? 'SIM' : firstFCC.gerenciadaSG === false ? 'NÃO' : null;
          row[`${prefix}_fcc_gerenciavel`] = firstFCC.gerenciavel === true ? 'SIM' : firstFCC.gerenciavel === false ? 'NÃO' : null;
          row[`${prefix}_fcc_consumo`] = firstFCC.consumoDC != null ? firstFCC.consumoDC.toString() : null;
          row[`${prefix}_fcc_qtd_ur`] = firstFCC.qtdURSuportadas != null ? firstFCC.qtdURSuportadas.toString() : null;
          row[`${prefix}_fcc_qtd_ur_instaladas`] = firstFCC.qtdURInstaladas != null ? firstFCC.qtdURInstaladas.toString() : null;
          row[`${prefix}_fcc_foto_panoramica`] = firstFCC.fotoPanoramica || null;
          row[`${prefix}_fcc_foto_painel`] = firstFCC.fotoPainel || null;
        }
      }
      
      // Batteries (up to 12) - skip if Baterias section marked NA
      if (!skipBaterias) {
        for (let j = 0; j < 12; j++) {
          const banco = gab.baterias.bancos[j];
          if (banco) {
            row[`${prefix}_bat${j + 1}_tipo`] = banco.tipo || null;
            const fabricanteValue = banco.fabricante === 'OUTRA' && banco.fabricanteOutra 
              ? banco.fabricanteOutra 
              : banco.fabricante;
            row[`${prefix}_bat${j + 1}_fabricante`] = fabricanteValue || null;
            row[`${prefix}_bat${j + 1}_capacidade`] = banco.capacidadeAh != null ? banco.capacidadeAh.toString() : null;
            row[`${prefix}_bat${j + 1}_data_fabricacao`] = banco.dataFabricacao || null;
            row[`${prefix}_bat${j + 1}_estado`] = banco.estados?.join(', ') || null;
            row[`${prefix}_bat${j + 1}_colada`] = banco.colada || null;
            row[`${prefix}_bat${j + 1}_com_gradil`] = banco.comGradil || null;
            if (j === 0 && banco.fotoBanco) {
              row[`${prefix}_bat_foto`] = banco.fotoBanco;
            }
          }
        }
        row[`${prefix}_bancos_interligados`] = gab.baterias.bancosInterligados === true ? 'SIM' : gab.baterias.bancosInterligados === false ? 'NÃO' : null;
      }
      
      // Climatization - skip if Climatização section marked NA
      if (!skipClimatizacao) {
        row[`${prefix}_climatizacao_tipo`] = gab.climatizacao.tipo || null;
        row[`${prefix}_ventiladores_status`] = gab.climatizacao.fanOK === true ? 'OK' : gab.climatizacao.fanOK === false ? 'NOK' : null;
        
        for (let j = 0; j < 4; j++) {
          const ac = gab.climatizacao.acs[j];
          if (ac) {
            row[`${prefix}_ac${j + 1}_modelo`] = ac.modelo || null;
            row[`${prefix}_ac${j + 1}_status`] = ac.funcionamento || null;
          }
        }
        
        // PLC Lead-Lag: store combined value (SIM/OK, SIM/NOK, or NÃO)
        const plcValue = gab.climatizacao.temPlcLeadLag 
          ? `SIM/${gab.climatizacao.plcLeadLagStatus || 'N/A'}` 
          : 'NÃO';
        row[`${prefix}_plc_status`] = plcValue;
        row[`${prefix}_alarme_status`] = gab.climatizacao.alarmistica || null;
        row[`${prefix}_clima_foto_ar1`] = gab.climatizacao.fotoAR1 || null;
        row[`${prefix}_clima_foto_ar2`] = gab.climatizacao.fotoAR2 || null;
        row[`${prefix}_clima_foto_ar3`] = gab.climatizacao.fotoAR3 || null;
        row[`${prefix}_clima_foto_ar4`] = gab.climatizacao.fotoAR4 || null;
        row[`${prefix}_clima_foto_condensador`] = gab.climatizacao.fotoCondensador || null;
        row[`${prefix}_clima_foto_evaporador`] = gab.climatizacao.fotoEvaporador || null;
        row[`${prefix}_clima_foto_controlador`] = gab.climatizacao.fotoControlador || null;
      }
      
      // Equipment photos (always include if gabinete is active)
      row[`${prefix}_foto_panoramica`] = gab.fotoPanoramicaGabinete || null;
      row[`${prefix}_foto_transmissao`] = gab.fotoTransmissao || null;
      row[`${prefix}_foto_acesso`] = gab.fotoAcesso || null;
    }
  }

  // GMG and Tower - skip if gmgTorre section marked NA
  const skipGmgTorre = skipped.gmgTorre;
  if (!skipGmgTorre) {
    row.gmg_existe = data.gmg?.informar === true ? 'SIM' : data.gmg?.informar === false ? 'NÃO' : null;
    row.gmg_fabricante = data.gmg?.fabricante || null;
    row.gmg_potencia = data.gmg?.potencia != null ? data.gmg.potencia : null;
    row.gmg_autonomia = data.gmg?.capacidadeTanque != null ? data.gmg.capacidadeTanque : null;
    row.gmg_status = data.gmg?.status || null;
    row.gmg_combustivel = data.gmg?.combustivelPorcentagem != null ? String(data.gmg.combustivelPorcentagem) : null;
    row.gmg_alarme_ativo = data.gmg?.alarmeAtivo ? 'SIM' : 'NÃO';
    row.gmg_foto_alarme = data.gmg?.fotoAlarme || null;
    row.gmg_ultimo_teste = data.gmg?.ultimoTeste || null;
    row.gmg_foto_painel = data.gmg?.fotoGMG || null;
    row.torre_protecao_fibra = data.torre?.fibrasProtegidas === true ? 'SIM' : data.torre?.fibrasProtegidas === false ? 'NÃO' : null;
    row.torre_foto_fibras_protegidas = data.torre?.fotoFibrasProtegidas || null;
    row.torre_ninhos = data.torre?.ninhos === true ? 'SIM' : data.torre?.ninhos === false ? 'NÃO' : null;
    row.torre_foto_ninhos = data.torre?.fotoNinhos || null;
    row.torre_aterramento = data.torre?.aterramento || null;
    row.torre_foto_aterramento = data.torre?.fotoAterramento || null;
    row.torre_housekeeping = data.torre?.zeladoria || null;
    row.torre_foto_zeladoria = data.torre?.fotoZeladoria || null;
  }

  // Energia data - skip if energia section marked NA
  const skipEnergia = skipped.energia;
  if (!skipEnergia) {
    row.energia_tipo_quadro = data.energia?.tipoQuadro || null;
    row.energia_fabricante = data.energia?.fabricante || null;
    row.energia_fabricante_outra = data.energia?.fabricanteOutra || null;
    row.energia_potencia_kva = data.energia?.potenciaKVA != null ? data.energia.potenciaKVA : null;
    row.energia_tensao_entrada = data.energia?.tensaoEntrada || null;
    row.energia_disjuntor_entrada = data.energia?.capacidadeDisjuntorEntrada != null ? data.energia.capacidadeDisjuntorEntrada : null;
    row.energia_disjuntor_qdca = data.energia?.capacidadeDisjuntorQDCA != null ? data.energia.capacidadeDisjuntorQDCA : null;
    row.energia_protegido_gradil = data.energia?.protegidoGradil ? 'SIM' : 'NÃO';
    row.energia_protegido_cadeado = data.energia?.protegidoCadeado ? 'SIM' : 'NÃO';
    row.energia_transformador_ok = data.energia?.temTransformador ? 'SIM' : 'NÃO';
    row.energia_potencia_transformador = data.energia?.potenciaTransformador || null;
    row.energia_foto_transformador = data.energia?.fotoTransformador || null;
    row.energia_foto_quadro_geral = data.energia?.fotoQuadroGeral || null;
    row.energia_unidade_consumidora = data.energia?.unidadeConsumidora || null;
    row.energia_foto_relogio = data.energia?.fotoRelogio || null;
  }

  // Observations (always include)
  row.observacoes = data.observacoes || null;
  const validPhotos = (data.fotosObservacao || []).filter((item: any) => item?.foto);
  row.observacao_foto_url = validPhotos.length > 0 ? JSON.stringify(validPhotos) : null;
  
  // Assinatura (always include)
  row.assinatura_digital = data.assinaturaDigital || null;

  // Fibra Óptica (always include - no skip option)
  row.fibra_qtd_abordagens = data.fibraOptica?.qtdAbordagens != null ? data.fibraOptica.qtdAbordagens : null;
  for (let i = 0; i < 4; i++) {
    const abord = data.fibraOptica?.abordagens?.[i];
    if (abord) {
      row[`fibra_abord${i + 1}_tipo`] = abord.tipoEntrada || null;
      row[`fibra_abord${i + 1}_descricao`] = abord.descricao || null;
    }
  }
  row.fibra_caixas_passagem_qtd = data.fibraOptica?.qtdCaixasPassagem != null ? data.fibraOptica.qtdCaixasPassagem : null;
  row.fibra_caixas_subterraneas_qtd = data.fibraOptica?.qtdCaixasSubterraneas != null ? data.fibraOptica.qtdCaixasSubterraneas : null;
  row.fibra_subidas_laterais_qtd = data.fibraOptica?.qtdSubidasLaterais != null ? data.fibraOptica.qtdSubidasLaterais : null;
  row.fibra_dgos_qtd = data.fibraOptica?.qtdDGOs != null ? data.fibraOptica.qtdDGOs : null;
  row.fibra_dgos_ok_qtd = data.fibraOptica?.dgos?.filter(d => d.estadoCordoes === 'OK').length ?? null;
  row.fibra_dgos_nok_qtd = data.fibraOptica?.dgos?.filter(d => d.estadoCordoes === 'NOK').length ?? null;
  
  for (let i = 0; i < 4; i++) {
    const abord = data.fibraOptica?.abordagens?.[i];
    if (abord?.fotos?.length) {
      row[`fibra_abord${i + 1}_foto`] = abord.fotos[0] || null;
    }
  }

  // Store fiber photos as JSON arrays to support multiple photos per category
  const validCaixasPassagem = (data.fibraOptica?.fotosCaixasPassagem || []).filter((f): f is string => !!f);
  row.fibra_foto_caixas_passagem = validCaixasPassagem.length > 0 ? JSON.stringify(validCaixasPassagem) : null;
  
  const validCaixasSubterraneas = (data.fibraOptica?.fotosCaixasSubterraneas || []).filter((f): f is string => !!f);
  row.fibra_foto_caixas_subterraneas = validCaixasSubterraneas.length > 0 ? JSON.stringify(validCaixasSubterraneas) : null;
  
  const validSubidasLaterais = (data.fibraOptica?.fotosSubidasLaterais || []).filter((f): f is string => !!f);
  row.fibra_foto_subidas_laterais = validSubidasLaterais.length > 0 ? JSON.stringify(validSubidasLaterais) : null;

  const dgosArray = data.fibraOptica?.dgos || [];
  for (let i = 0; i < 4; i++) {
    const dgo = dgosArray[i];
    if (dgo) {
      row[`fibra_dgo${i + 1}_id`] = dgo.identificacao || null;
      row[`fibra_dgo${i + 1}_capacidade`] = dgo.capacidadeFO ? `${dgo.capacidadeFO}FO` : null;
      row[`fibra_dgo${i + 1}_cordoes`] = dgo.estadoCordoes || null;
      row[`fibra_dgo${i + 1}_foto`] = dgo.fotoDGO || null;
      row[`fibra_dgo${i + 1}_cordoes_foto`] = dgo.fotoCordesDetalhada || null;
    }
  }

  // Fotos extras - store as JSON
  if (data.fotosExtras && typeof data.fotosExtras === 'object') {
    // Filter out empty arrays and only keep non-empty photo arrays
    const validExtras: Record<string, string[]> = {};
    for (const [key, photos] of Object.entries(data.fotosExtras)) {
      if (Array.isArray(photos)) {
        const validPhotos = photos.filter((p): p is string => typeof p === 'string' && p.length > 0);
        if (validPhotos.length > 0) {
          validExtras[key] = validPhotos;
        }
      }
    }
    if (Object.keys(validExtras).length > 0) {
      row.fotos_extras = validExtras;
    }
  }

  return row;
}

/**
 * Update a single field of a report inline
 */
export async function updateReportField(
  reportId: string,
  fieldName: string,
  value: string | number | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('reports')
      .update({ [fieldName]: value })
      .eq('id', reportId);

    if (error) {
      console.error('Error updating report field:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Exception updating report field:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing report in the database (for admin editing)
 */
export async function updateReportInDatabase(
  reportId: string,
  data: ChecklistData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = buildReportRow(data);
    // Remove fields that shouldn't be updated during editing
    delete row.id;
    delete row.created_at;
    delete row.created_date;   // preserve original creation date
    delete row.created_time;   // preserve original creation time
    delete row.operadora;      // preserve original company (TEL/VIVO)
    delete row.user_id;        // preserve original author

    const { error } = await supabase
      .from('reports')
      .update(row)
      .eq('id', reportId);

    if (error) {
      console.error('Error updating report:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Exception updating report:', err);
    return { success: false, error: err.message };
  }
}

export async function saveReportToDatabase(
  data: ChecklistData,
  pdfPath?: string,
  excelPath?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Fetch user's operadora from user_roles
    let userOperadora = 'VIVO';
    if (user?.id) {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('operadora')
        .eq('user_id', user.id)
        .single();
      if (roleError) {
        console.error('Error fetching user operadora for report:', roleError);
      }
      if (roleData?.operadora) {
        userOperadora = roleData.operadora;
      } else {
        console.warn('User operadora not found, defaulting to VIVO for user:', user.id);
      }
    }
    
    const row = buildReportRow(data);
    row.pdf_file_path = pdfPath || null;
    row.excel_file_path = excelPath || null;
    row.email_sent = false;
    row.user_id = user?.id || null;
    // Use user's operadora instead of data.operadora
    row.operadora = userOperadora;

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

// --- Fetch functions (optimized to avoid photo columns) ---

/**
 * Fetch lightweight summary for list display (no photos, no gabinete details)
 */
export async function fetchReportsSummary(filters?: {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
  operadora?: string; // 'VIVO', 'TEL', or 'all'
}): Promise<ReportRow[]> {
  const pageSize = 1000;
  let page = 0;
  let all: ReportRow[] = [];

  while (true) {
    let query = supabase
      .from('reports')
      .select(SUMMARY_COLUMNS + ',operadora')
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
    // Filter by operadora if specified and not 'all'
    if (filters?.operadora && filters.operadora !== 'all') {
      query = query.eq('operadora', filters.operadora);
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
  operadora?: string; // 'VIVO', 'TEL', or 'all'
}): Promise<ReportRow[]> {
  const pageSize = 1000;
  let page = 0;
  let all: ReportRow[] = [];
  const columns = buildDashboardColumns() + ',operadora';

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
    // Filter by operadora if specified and not 'all'
    if (filters?.operadora && filters.operadora !== 'all') {
      query = query.eq('operadora', filters.operadora);
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
 * Fetch reports with all data columns needed for Excel export (dashboard cols + photo cols)
 * This is heavier than summary but needed for accurate Excel generation
 */
export async function fetchReportsForExcel(filters?: {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
  operadora?: string;
}): Promise<ReportRow[]> {
  const pageSize = 500; // Smaller pages since we fetch more columns
  let page = 0;
  let all: ReportRow[] = [];
  const columns = buildDetailColumns() + ',' + buildPhotoColumns();

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
    if (filters?.operadora && filters.operadora !== 'all') {
      query = query.eq('operadora', filters.operadora);
    }

    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await query.range(from, to);

    if (error) {
      console.error('Error fetching reports for Excel export:', error);
      throw new Error(`Erro ao buscar relatórios para exportação: ${error.message}`);
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
 * Uses explicit column list instead of SELECT * for performance
 */
export async function fetchFullReportById(id: string): Promise<ReportRow | null> {
  const columns = buildDetailColumns() + ',' + buildPhotoColumns();

  const { data, error } = await supabase
    .from('reports')
    .select(columns)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching full report:', error);
    throw new Error(`Erro ao buscar relatório completo: ${error.message}`);
  }

  return data as unknown as ReportRow | null;
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

// --- Technician Gamification Stats ---

export interface TechnicianStatsRaw {
  total: number;
  monthly: number;
  today: number;
  rank: number;
  totalTechnicians: number;
  consecutiveDays: number;
  maxInOneDay: number;
}

export async function fetchTechnicianStats(userId: string): Promise<TechnicianStatsRaw> {
  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch all user reports dates for consecutive days and max-in-one-day calc
  const { data: userReports, error: userError } = await supabase
    .from('reports')
    .select('created_date, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (userError) {
    console.error('Error fetching technician stats:', userError);
    return { total: 0, monthly: 0, today: 0, rank: 1, totalTechnicians: 1, consecutiveDays: 0, maxInOneDay: 0 };
  }

  const allReports = userReports || [];
  const total = allReports.length;
  const today = allReports.filter((r) => r.created_date === todayStr).length;
  const monthly = allReports.filter((r) => r.created_at && r.created_at >= monthStart).length;

  // Max in one day
  const dayCounts: Record<string, number> = {};
  for (const r of allReports) {
    if (r.created_date) {
      dayCounts[r.created_date] = (dayCounts[r.created_date] || 0) + 1;
    }
  }
  const maxInOneDay = Object.values(dayCounts).length > 0 ? Math.max(...Object.values(dayCounts)) : 0;

  // Consecutive days (from today backwards)
  let consecutiveDays = 0;
  const uniqueDays = new Set(allReports.map((r) => r.created_date).filter(Boolean));
  const checkDate = new Date(now);
  checkDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < 365; i++) {
    const dateStr = `${String(checkDate.getDate()).padStart(2, '0')}/${String(checkDate.getMonth() + 1).padStart(2, '0')}/${checkDate.getFullYear()}`;
    if (uniqueDays.has(dateStr)) {
      consecutiveDays++;
    } else if (i > 0) {
      break; // Allow today to be missing (hasn't done one yet today)
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Ranking: count reports per user_id for all technicians
  // We need to get all report counts grouped by user - use a simple approach
  const { data: allCounts, error: countError } = await supabase
    .from('reports')
    .select('user_id');

  let rank = 1;
  let totalTechnicians = 1;

  if (!countError && allCounts) {
    const userTotals: Record<string, number> = {};
    for (const r of allCounts) {
      if (r.user_id) {
        userTotals[r.user_id] = (userTotals[r.user_id] || 0) + 1;
      }
    }
    totalTechnicians = Object.keys(userTotals).length || 1;
    const myTotal = userTotals[userId] || 0;
    rank = Object.values(userTotals).filter((count) => count > myTotal).length + 1;
  }

  return { total, monthly, today, rank, totalTechnicians, consecutiveDays, maxInOneDay };
}

// --- All Technicians Ranking ---

export interface TechnicianRankingEntry {
  userId: string;
  email: string;
  total: number;
  monthly: number;
  consecutiveDays: number;
  maxInOneDay: number;
}

export async function fetchAllTechniciansRanking(): Promise<TechnicianRankingEntry[]> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // Fetch all reports (user_id, created_date, created_at)
  const { data: allReports, error } = await supabase
    .from('reports')
    .select('user_id, created_date, created_at');

  if (error || !allReports) {
    console.error('Error fetching ranking data:', error);
    return [];
  }

  // Group by user_id
  const userMap: Record<string, { dates: string[]; createdAts: string[] }> = {};
  for (const r of allReports) {
    if (!r.user_id) continue;
    if (!userMap[r.user_id]) userMap[r.user_id] = { dates: [], createdAts: [] };
    if (r.created_date) userMap[r.user_id].dates.push(r.created_date);
    if (r.created_at) userMap[r.user_id].createdAts.push(r.created_at);
  }

  // Fetch emails via edge function
  let emailMap: Record<string, string> = {};
  try {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;
    if (token) {
      const resp = await supabase.functions.invoke('get-technician-emails', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.data?.technicians) {
        for (const t of resp.data.technicians) {
          emailMap[t.id] = t.email;
        }
      }
    }
  } catch (e) {
    console.error('Error fetching technician emails for ranking:', e);
  }

  const entries: TechnicianRankingEntry[] = Object.entries(userMap).map(([userId, { dates, createdAts }]) => {
    const total = dates.length;
    const monthly = createdAts.filter(ca => ca >= monthStart).length;

    // Max in one day
    const dayCounts: Record<string, number> = {};
    for (const d of dates) dayCounts[d] = (dayCounts[d] || 0) + 1;
    const maxInOneDay = Object.values(dayCounts).length > 0 ? Math.max(...Object.values(dayCounts)) : 0;

    // Consecutive days
    let consecutiveDays = 0;
    const uniqueDays = new Set(dates);
    const checkDate = new Date(now);
    checkDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const dateStr = `${String(checkDate.getDate()).padStart(2, '0')}/${String(checkDate.getMonth() + 1).padStart(2, '0')}/${checkDate.getFullYear()}`;
      if (uniqueDays.has(dateStr)) {
        consecutiveDays++;
      } else if (i > 0) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      userId,
      email: emailMap[userId] || userId,
      total,
      monthly,
      consecutiveDays,
      maxInOneDay,
    };
  });

  // Sort by total desc
  entries.sort((a, b) => b.total - a.total);
  return entries;
}

/**
 * Fetch battery photo for a specific gabinete from a report
 * Used for on-demand photo loading in battery detail modal
 */
export async function fetchBatteryPhoto(reportId: string, gabineteNum: number): Promise<string | null> {
  try {
    const photoColumn = `gab${gabineteNum}_bat_foto`;
    
    const { data, error } = await supabase
      .from('reports')
      .select(photoColumn)
      .eq('id', reportId)
      .single();

    if (error) {
      console.error('Error fetching battery photo:', error);
      return null;
    }

    if (!data) return null;
    
    // Access the photo column dynamically
    const photoUrl = (data as unknown as Record<string, string | null>)[photoColumn];
    return photoUrl || null;
  } catch (err) {
    console.error('Exception fetching battery photo:', err);
    return null;
  }
}
