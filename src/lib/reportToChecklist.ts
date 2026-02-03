import { ChecklistData, GabineteData, INITIAL_GABINETE, INITIAL_CHECKLIST, INITIAL_FIBRA_OPTICA, INITIAL_ENERGIA } from "@/types/checklist";
import { ReportRow } from "./reportDatabase";
import { v4 as uuid } from "uuid";

/**
 * Strip all photos and signature from ChecklistData
 * Used for pre-filling forms without carrying over old photos
 */
function stripPhotosFromChecklist(data: ChecklistData): ChecklistData {
  return {
    ...data,
    // Generate new ID and timestamps for the new checklist
    id: uuid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sincronizado: false,
    
    // Clear site-level photos
    fotoPanoramica: null,
    fotosObservacao: [],
    assinaturaDigital: null,
    
    // Clear technician name (new inspection, new technician)
    tecnico: '',
    
    // Clear gabinete photos
    gabinetes: data.gabinetes.map(gab => ({
      ...gab,
      fotoPanoramicaGabinete: null,
      fotoTransmissao: null,
      fotoAcesso: null,
      fcc: {
        ...gab.fcc,
        fotoPanoramica: null,
        fotoPainel: null,
      },
      baterias: {
        ...gab.baterias,
        fotoBanco: null,
      },
      climatizacao: {
        ...gab.climatizacao,
        fotoAR1: null,
        fotoAR2: null,
        fotoAR3: null,
        fotoAR4: null,
        fotoCondensador: null,
        fotoEvaporador: null,
        fotoControlador: null,
      },
    })),
    
    // Clear fiber optic photos
    fibraOptica: {
      ...data.fibraOptica,
      abordagens: data.fibraOptica.abordagens.map(ab => ({
        ...ab,
        fotos: [],
      })),
      fotosCaixasPassagem: [],
      fotosCaixasSubterraneas: [],
      fotosSubidasLaterais: [],
      dgos: data.fibraOptica.dgos.map(dgo => ({
        ...dgo,
        fotoDGO: null,
        fotoCordesDetalhada: null,
      })),
    },
    
    // Clear energia photos
    energia: {
      ...data.energia,
      fotoTransformador: null,
      fotoQuadroGeral: null,
    },
    
    // Clear GMG photo
    gmg: {
      ...data.gmg,
      fotoGMG: null,
    },
    
    // Clear torre photo
    torre: {
      ...data.torre,
      fotoNinhos: null,
      fotoFibrasProtegidas: null,
    },
  };
}

/**
 * Convert a report row back to ChecklistData WITHOUT photos
 * This is used for pre-filling forms with previous inspection data
 */
export function reportToChecklistWithoutPhotos(report: ReportRow): ChecklistData {
  const fullData = reportToChecklist(report);
  return stripPhotosFromChecklist(fullData);
}

/**
 * Convert a report row back to ChecklistData WITH photos
 * This is used for pre-filling forms including photos from previous inspection
 */
export function reportToChecklistWithPhotos(report: ReportRow): ChecklistData {
  const fullData = reportToChecklist(report);
  // Generate new ID and timestamps for the new checklist, but keep photos
  return {
    ...fullData,
    id: uuid(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sincronizado: false,
    // Clear only technician name and signature (new inspection, new technician)
    tecnico: '',
    assinaturaDigital: null,
  };
}

/**
 * Parse a JSON string that might be a single URL or an array of URLs
 */
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    // If not valid JSON, treat as single URL
    return value ? [value] : [];
  }
}

/**
 * Parse fotosObservacao from JSON - handles both old format (string[]) and new format (FotoObservacao[])
 */
function parseFotosObservacao(value: string | null): { foto: string | null; descricao: string }[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    // Check if it's old format (array of strings) or new format (array of objects)
    return parsed.map((item: any) => {
      if (typeof item === 'string') {
        // Old format: just a URL string
        return { foto: item, descricao: '' };
      } else if (item && typeof item === 'object') {
        // New format: object with foto and descricao
        return { foto: item.foto || null, descricao: item.descricao || '' };
      }
      return { foto: null, descricao: '' };
    }).filter((item: any) => item.foto);
  } catch {
    return [];
  }
}

/**
 * Safe parseInt helper to avoid NaN
 */
function safeParseInt(value: string | null | undefined): number | null {
  if (value == null || value === '') return null;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Reconstruct ChecklistData from a database ReportRow
 * This allows regenerating PDF/Excel from saved reports
 */
export function reportToChecklist(report: ReportRow): ChecklistData {
  const gabinetes: GabineteData[] = [];
  
  for (let i = 0; i < report.total_cabinets; i++) {
    const prefix = `gab${i + 1}`;
    
    const gab: GabineteData = {
      ...INITIAL_GABINETE,
      tipo: (report[`${prefix}_tipo`] || 'CONTAINER') as any,
      comProtecao: report[`${prefix}_protecao`] === 'SIM',
      tecnologiasAcesso: report[`${prefix}_tecnologias_acesso`]?.split(', ').filter(Boolean) || [],
      tecnologiasTransporte: report[`${prefix}_tecnologias_transporte`]?.split(', ').filter(Boolean) || [],
      fcc: {
        numFCCs: 1,
        fccs: [{
          fabricante: (report[`${prefix}_fcc_fabricante`] || 'HUAWEI') as any,
          tensaoDC: (report[`${prefix}_fcc_tensao`] || '48V') as any,
          gerenciadaSG: report[`${prefix}_fcc_gerenciado`] === 'SIM',
          gerenciavel: report[`${prefix}_fcc_gerenciavel`] === 'SIM',
          consumoDC: safeParseInt(report[`${prefix}_fcc_consumo`]) || 0,
          qtdURSuportadas: safeParseInt(report[`${prefix}_fcc_qtd_ur`]),
          qtdURInstaladas: safeParseInt(report[`${prefix}_fcc_qtd_ur_instaladas`]),
          fotoPanoramica: report[`${prefix}_fcc_foto_panoramica`] || null,
          fotoPainel: report[`${prefix}_fcc_foto_painel`] || null,
        }],
      },
      baterias: {
        numBancos: 0,
        bancos: [],
        bancosInterligados: report[`${prefix}_bancos_interligados`] === 'SIM',
      },
      climatizacao: {
        tipo: (report[`${prefix}_climatizacao_tipo`] || 'NA') as any,
        fanOK: report[`${prefix}_ventiladores_status`] === 'OK',
        acs: [],
        plcLeadLag: (report[`${prefix}_plc_status`] || 'NA') as any,
        alarmistica: (report[`${prefix}_alarme_status`] || 'SGINFRA U2020') as any,
        fotoAR1: report[`${prefix}_clima_foto_ar1`] || null,
        fotoAR2: report[`${prefix}_clima_foto_ar2`] || null,
        fotoAR3: report[`${prefix}_clima_foto_ar3`] || null,
        fotoAR4: report[`${prefix}_clima_foto_ar4`] || null,
        fotoCondensador: report[`${prefix}_clima_foto_condensador`] || null,
        fotoEvaporador: report[`${prefix}_clima_foto_evaporador`] || null,
        fotoControlador: report[`${prefix}_clima_foto_controlador`] || null,
      },
      fotoPanoramicaGabinete: report[`${prefix}_foto_panoramica`] || null,
      fotoTransmissao: report[`${prefix}_foto_transmissao`] || null,
      fotoAcesso: report[`${prefix}_foto_acesso`] || null,
    };
    
    // Parse batteries
    const bancos = [];
    for (let j = 0; j < 6; j++) {
      const tipo = report[`${prefix}_bat${j + 1}_tipo`];
      if (tipo) {
        const estadoRaw = report[`${prefix}_bat${j + 1}_estado`] || 'OK';
        const estados = estadoRaw.includes(',') 
          ? estadoRaw.split(',').map((e: string) => e.trim()) 
          : [estadoRaw];
        bancos.push({
          tipo: tipo as any,
          fabricante: (report[`${prefix}_bat${j + 1}_fabricante`] || 'NA') as any,
          capacidadeAh: parseInt(report[`${prefix}_bat${j + 1}_capacidade`]) || null,
          dataFabricacao: report[`${prefix}_bat${j + 1}_data_fabricacao`] || '',
          estados: estados as any,
          colada: (report[`${prefix}_bat${j + 1}_colada`] || 'NA') as any,
          comGradil: (report[`${prefix}_bat${j + 1}_com_gradil`] || 'NA') as any,
          fotoBanco: report[`${prefix}_bat${j + 1}_foto`] || null,
        });
      }
    }
    gab.baterias.bancos = bancos;
    gab.baterias.numBancos = bancos.length;
    
    // Parse ACs
    const acs = [];
    for (let j = 0; j < 4; j++) {
      const modelo = report[`${prefix}_ac${j + 1}_modelo`];
      if (modelo) {
        acs.push({
          modelo: modelo as any,
          funcionamento: (report[`${prefix}_ac${j + 1}_status`] || 'OK') as any,
        });
      }
    }
    gab.climatizacao.acs = acs;
    
    gabinetes.push(gab);
  }
  
  // Ensure at least one gabinete
  if (gabinetes.length === 0) {
    gabinetes.push({ ...INITIAL_GABINETE });
  }
  
  // Parse fiber optic data (up to 4 abordagens)
  const abordagens = [];
  for (let i = 1; i <= 4; i++) {
    const tipo = report[`fibra_abord${i}_tipo`];
    if (tipo) {
      abordagens.push({
        tipoEntrada: tipo as any,
        descricao: report[`fibra_abord${i}_descricao`] || '',
        fotos: report[`fibra_abord${i}_foto`] ? [report[`fibra_abord${i}_foto`]] : [],
      });
    }
  }

  // Parse DGOs
  const dgos = [];
  for (let d = 1; d <= 4; d++) {
    const dgoId = report[`fibra_dgo${d}_id`];
    if (dgoId) {
      dgos.push({
        identificacao: dgoId,
        capacidadeFO: parseInt(report[`fibra_dgo${d}_capacidade`]?.replace('FO', '')) || 12,
        estadoCordoes: (report[`fibra_dgo${d}_cordoes`] || 'OK') as any,
        fotoDGO: report[`fibra_dgo${d}_foto`] || null,
        fotoCordesDetalhada: report[`fibra_dgo${d}_cordoes_foto`] || null,
      });
    }
  }

  return {
    ...INITIAL_CHECKLIST,
    id: report.id || uuid(),
    operadora: (report.operadora || 'VIVO') as any,
    siglaSite: report.site_code || '',
    uf: (report.state_uf || 'PA') as any,
    qtdGabinetes: report.total_cabinets || 1,
    fotoPanoramica: report.panoramic_photo_url || null,
    gabinetes,
    fibraOptica: { 
      ...INITIAL_FIBRA_OPTICA,
      qtdAbordagens: report.fibra_qtd_abordagens || 1,
      abordagens: abordagens.length > 0 ? abordagens : INITIAL_FIBRA_OPTICA.abordagens,
      qtdCaixasPassagem: report.fibra_caixas_passagem_qtd || 0,
      qtdCaixasSubterraneas: report.fibra_caixas_subterraneas_qtd || 0,
      qtdSubidasLaterais: report.fibra_subidas_laterais_qtd || 0,
      qtdDGOs: report.fibra_dgos_qtd || 0,
      dgos,
      fotosCaixasPassagem: report.fibra_foto_caixas_passagem ? [report.fibra_foto_caixas_passagem] : [],
      fotosCaixasSubterraneas: report.fibra_foto_caixas_subterraneas ? [report.fibra_foto_caixas_subterraneas] : [],
      fotosSubidasLaterais: report.fibra_foto_subidas_laterais ? [report.fibra_foto_subidas_laterais] : [],
    },
    energia: { 
      ...INITIAL_ENERGIA,
      fotoTransformador: report.energia_foto_transformador || null,
      fotoQuadroGeral: report.energia_foto_quadro_geral || null,
    },
    gmg: {
      informar: report.gmg_existe === 'SIM',
      fabricante: report.gmg_fabricante as any,
      potencia: parseInt(report.gmg_potencia) || undefined,
      autonomia: parseInt(report.gmg_autonomia) || undefined,
      status: (report.gmg_status as any) || undefined,
      ultimoTeste: report.gmg_ultimo_teste || undefined,
      fotoGMG: report.gmg_foto_painel || null,
    },
    torre: {
      ninhos: report.torre_ninhos === 'SIM',
      fibrasProtegidas: report.torre_protecao_fibra === 'SIM',
      fotoFibrasProtegidas: report.torre_foto_fibras_protegidas || null,
      aterramento: (report.torre_aterramento || 'OK') as any,
      zeladoria: (report.torre_housekeeping || 'OK') as any,
      fotoNinhos: report.torre_foto_ninhos || null,
    },
    observacoes: report.observacoes || '',
    fotosObservacao: parseFotosObservacao(report.observacao_foto_url),
    assinaturaDigital: report.assinatura_digital || null,
    dataHora: report.created_at || new Date().toISOString(),
    tecnico: report.technician_name || '',
    sincronizado: true,
    createdAt: report.created_at || new Date().toISOString(),
    updatedAt: report.created_at || new Date().toISOString(),
  };
}
