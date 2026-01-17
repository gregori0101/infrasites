import { ChecklistData, GabineteData, INITIAL_GABINETE, INITIAL_CHECKLIST, INITIAL_FIBRA_OPTICA, INITIAL_ENERGIA } from "@/types/checklist";
import { ReportRow } from "./reportDatabase";
import { v4 as uuid } from "uuid";

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
        fabricante: (report[`${prefix}_fcc_fabricante`] || 'HUAWEI') as any,
        tensaoDC: (report[`${prefix}_fcc_tensao`] || '48V') as any,
        gerenciadaSG: report[`${prefix}_fcc_gerenciado`] === 'SIM',
        gerenciavel: report[`${prefix}_fcc_gerenciavel`] === 'SIM',
        consumoDC: parseInt(report[`${prefix}_fcc_consumo`]) || 0,
        qtdURSuportadas: parseInt(report[`${prefix}_fcc_qtd_ur`]) || 1,
        fotoPanoramica: report[`${prefix}_fcc_foto_panoramica`] || null,
        fotoPainel: report[`${prefix}_fcc_foto_painel`] || null,
      },
      baterias: {
        numBancos: 0,
        bancos: [],
        bancosInterligados: report[`${prefix}_bancos_interligados`] === 'SIM',
        fotoBanco: report[`${prefix}_bat_foto`] || null,
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
        bancos.push({
          tipo: tipo as any,
          fabricante: (report[`${prefix}_bat${j + 1}_fabricante`] || 'NA') as any,
          capacidadeAh: parseInt(report[`${prefix}_bat${j + 1}_capacidade`]) || null,
          dataFabricacao: report[`${prefix}_bat${j + 1}_data_fabricacao`] || '',
          estado: (report[`${prefix}_bat${j + 1}_estado`] || 'OK') as any,
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
  
  return {
    ...INITIAL_CHECKLIST,
    id: report.id || uuid(),
    siglaSite: report.site_code || '',
    uf: (report.state_uf || 'PA') as any,
    qtdGabinetes: report.total_cabinets || 1,
    fotoPanoramica: report.panoramic_photo_url || null,
    gabinetes,
    fibraOptica: { ...INITIAL_FIBRA_OPTICA },
    energia: { 
      ...INITIAL_ENERGIA,
      fotoTransformador: report.energia_foto_transformador || null,
      fotoQuadroGeral: report.energia_foto_quadro_geral || null,
      fotoPlaca: report.energia_foto_placa || null,
      cabos: {
        ...INITIAL_ENERGIA.cabos,
        fotoCabos: report.energia_foto_cabos || null,
      },
    },
    gmg: {
      informar: report.gmg_existe === 'SIM',
      fabricante: report.gmg_fabricante as any,
      potencia: parseInt(report.gmg_potencia) || undefined,
    },
    torre: {
      ninhos: report.torre_ninhos === 'SIM',
      fibrasProtegidas: report.torre_protecao_fibra === 'SIM',
      aterramento: (report.torre_aterramento || 'OK') as any,
      zeladoria: (report.torre_housekeeping || 'OK') as any,
      fotoNinhos: report.torre_foto_ninhos || null,
    },
    observacoes: report.observacoes || '',
    fotoObservacao: report.observacao_foto_url || null,
    assinaturaDigital: report.assinatura_digital || null,
    dataHora: report.created_at || new Date().toISOString(),
    tecnico: report.technician_name || '',
    sincronizado: true,
    createdAt: report.created_at || new Date().toISOString(),
    updatedAt: report.created_at || new Date().toISOString(),
  };
}
