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
      row[`${prefix}_foto_transmissao`] = gab.fotoTransmissao || null;
      row[`${prefix}_foto_acesso`] = gab.fotoAcesso || null;
    }
  }

  // GMG and Tower
  row.gmg_existe = data.gmg.informar ? 'SIM' : 'NÃO';
  row.gmg_fabricante = data.gmg.fabricante || null;
  row.gmg_potencia = data.gmg.potencia || null;
  row.gmg_combustivel = null; // Not in current data structure
  row.gmg_ultimo_teste = null;
  row.torre_ninhos = data.torre.ninhos ? 'SIM' : 'NÃO';
  row.torre_protecao_fibra = data.torre.fibrasProtegidas ? 'SIM' : 'NÃO';
  row.torre_aterramento = data.torre.aterramento || null;
  row.torre_housekeeping = data.torre.zeladoria || null;

  // Observations
  row.observacoes = data.observacoes || null;
  row.observacao_foto_url = data.fotoObservacao || null;

  return row;
}

export async function saveReportToDatabase(
  data: ChecklistData,
  pdfPath?: string,
  excelPath?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const row = buildReportRow(data);
    row.pdf_file_path = pdfPath || null;
    row.excel_file_path = excelPath || null;
    row.email_sent = false;

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

export async function fetchReports(filters?: {
  siteCode?: string;
  stateUf?: string;
  startDate?: string;
  endDate?: string;
}): Promise<ReportRow[]> {
  try {
    let query = supabase
      .from('reports')
      .select('*')
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

    const { data, error } = await query.limit(100);

    if (error) {
      console.error('Error fetching reports:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Exception fetching reports:', err);
    return [];
  }
}

export async function fetchReportById(id: string): Promise<ReportRow | null> {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching report:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching report:', err);
    return null;
  }
}
