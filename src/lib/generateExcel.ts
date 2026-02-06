import * as XLSX from 'xlsx';
import { ChecklistData, INITIAL_ABORDAGEM_FIBRA, INITIAL_FIBRA_OPTICA } from '@/types/checklist';
import { format } from 'date-fns';

const TECNOLOGIAS_ACESSO = ['2G', '3G', '4G', '5G'];
const TECNOLOGIAS_TRANSPORTE = ['DWDM', 'GPON', 'HL4', 'HL5D', 'HL5G', 'PDH', 'SDH', 'GWS', 'GWD', 'SWA'];

// Helper function to get photo value - returns link or empty string
const getPhotoValue = (photo: string | null | undefined): string => {
  if (!photo) return '';
  // If it's a data URL, mark as embedded
  if (photo.startsWith('data:')) return '[FOTO INCORPORADA]';
  // Return the URL/link
  return photo;
};

// Helper for array of photos
const getPhotosValue = (photos: string[] | undefined): string => {
  if (!photos || photos.length === 0) return '';
  return photos.map((p, i) => {
    if (p.startsWith('data:')) return `[FOTO ${i + 1} INCORPORADA]`;
    return p;
  }).join(' | ');
};

function buildRowFromChecklist(data: ChecklistData, userOperadora?: string): Record<string, string | number | boolean> {
  const row: Record<string, string | number | boolean> = {};
  const skipped = data.secoesNaoAplicaveis ?? { gabinete: false, fcc: false, baterias: false, climatizacao: false, energia: false, gmgTorre: false };
  
  // GRUPO 1: IDENTIFICAÇÃO
  row['ID_Relatorio'] = data.id;
  row['Operadora'] = userOperadora || data.operadora || 'VIVO';
  row['Data_Preenchimento'] = format(new Date(data.createdAt), 'dd/MM/yyyy');
  row['Hora_Preenchimento'] = format(new Date(data.createdAt), 'HH:mm');
  row['Tecnico'] = data.tecnico || '';
  row['Sigla_Site'] = data.siglaSite;
  row['UF'] = data.uf;
  
  // GRUPO 2: SITE GERAL
  row['Qtd_Gabinetes_Total'] = data.qtdGabinetes;
  row['Foto_Panoramica'] = getPhotoValue(data.fotoPanoramica);
  
  const skipGabinete = skipped.gabinete;
  const skipFCC = skipped.fcc;
  const skipBaterias = skipped.baterias;
  const skipClimatizacao = skipped.climatizacao;
  
  // For each possible gabinete (1-7)
  for (let i = 0; i < 7; i++) {
    const prefix = `Gab${i + 1}`;
    const gab = data.gabinetes[i];
    
    if (gab && !skipGabinete) {
      // GRUPO 3: GABINETE INFO
      row[`${prefix}_Selecionado`] = 'SIM';
      row[`${prefix}_Tipo`] = gab.tipo;
      row[`${prefix}_Com_Protecao`] = gab.comProtecao ? 'SIM' : 'NÃO';
      
      // Tecnologias Acesso (individual columns)
      TECNOLOGIAS_ACESSO.forEach(tec => {
        row[`${prefix}_Tec_Acesso_${tec}`] = gab.tecnologiasAcesso.includes(tec as any) ? 'SIM' : 'NÃO';
      });
      
      // GRUPO 4: TECNOLOGIAS TRANSPORTE
      TECNOLOGIAS_TRANSPORTE.forEach(tec => {
        row[`${prefix}_Tec_Transp_${tec}`] = gab.tecnologiasTransporte.includes(tec as any) ? 'SIM' : 'NÃO';
      });
      
      // GRUPO 5: FCC (multiple FCCs support) - skip if FCC section marked NA
      if (!skipFCC) {
        row[`${prefix}_Num_FCCs`] = gab.fcc.numFCCs;
        for (let f = 0; f < 4; f++) {
          const fcc = gab.fcc.fccs[f];
          if (fcc) {
            row[`${prefix}_FCC${f + 1}_Fabricante`] = fcc.fabricante;
            row[`${prefix}_FCC${f + 1}_TensaoDC`] = fcc.tensaoDC;
            row[`${prefix}_FCC${f + 1}_Gerenciada_SG`] = fcc.gerenciadaSG ? 'SIM' : 'NÃO';
            row[`${prefix}_FCC${f + 1}_Gerenciavel`] = fcc.gerenciavel ? 'SIM' : 'NÃO';
            row[`${prefix}_FCC${f + 1}_Consumo_W`] = fcc.consumoDC;
            row[`${prefix}_FCC${f + 1}_QtdUR_Suportadas`] = fcc.qtdURSuportadas;
            row[`${prefix}_FCC${f + 1}_QtdUR_Instaladas`] = fcc.qtdURInstaladas;
            row[`${prefix}_FCC${f + 1}_Foto_Panoramica`] = getPhotoValue(fcc.fotoPanoramica);
            row[`${prefix}_FCC${f + 1}_Foto_Painel`] = getPhotoValue(fcc.fotoPainel);
          } else {
            row[`${prefix}_FCC${f + 1}_Fabricante`] = '';
            row[`${prefix}_FCC${f + 1}_TensaoDC`] = '';
            row[`${prefix}_FCC${f + 1}_Gerenciada_SG`] = '';
            row[`${prefix}_FCC${f + 1}_Gerenciavel`] = '';
            row[`${prefix}_FCC${f + 1}_Consumo_W`] = '';
            row[`${prefix}_FCC${f + 1}_QtdUR_Suportadas`] = '';
            row[`${prefix}_FCC${f + 1}_QtdUR_Instaladas`] = '';
            row[`${prefix}_FCC${f + 1}_Foto_Panoramica`] = '';
            row[`${prefix}_FCC${f + 1}_Foto_Painel`] = '';
          }
        }
      }
      
      // GRUPO 6: BATERIAS - skip if Baterias section marked NA
      if (!skipBaterias) {
        row[`${prefix}_Num_Bancos`] = gab.baterias.numBancos;
        row[`${prefix}_Bancos_Interligados`] = gab.baterias.bancosInterligados ? 'SIM' : 'NÃO';
        
        for (let j = 0; j < 6; j++) {
          const banco = gab.baterias.bancos[j];
          if (banco) {
            row[`${prefix}_Banco${j + 1}_Tipo`] = banco.tipo;
            row[`${prefix}_Banco${j + 1}_Fabricante`] = banco.fabricante;
            row[`${prefix}_Banco${j + 1}_CapAh`] = banco.capacidadeAh || '';
            row[`${prefix}_Banco${j + 1}_DataFab`] = banco.dataFabricacao || '';
            row[`${prefix}_Banco${j + 1}_Estado`] = banco.estados?.join(', ') || '';
            row[`${prefix}_Banco${j + 1}_Colada`] = banco.colada || 'NA';
            row[`${prefix}_Banco${j + 1}_ComGradil`] = banco.comGradil || 'NA';
            row[`${prefix}_Banco${j + 1}_Foto`] = getPhotoValue(banco.fotoBanco);
          } else {
            row[`${prefix}_Banco${j + 1}_Tipo`] = '';
            row[`${prefix}_Banco${j + 1}_Fabricante`] = '';
            row[`${prefix}_Banco${j + 1}_CapAh`] = '';
            row[`${prefix}_Banco${j + 1}_DataFab`] = '';
            row[`${prefix}_Banco${j + 1}_Estado`] = '';
            row[`${prefix}_Banco${j + 1}_Colada`] = '';
            row[`${prefix}_Banco${j + 1}_ComGradil`] = '';
            row[`${prefix}_Banco${j + 1}_Foto`] = '';
          }
        }
      }
      
      // GRUPO 7: CLIMATIZAÇÃO - skip if Climatização section marked NA
      if (!skipClimatizacao) {
        row[`${prefix}_Clim_Tipo`] = gab.climatizacao.tipo;
        row[`${prefix}_Fan_OK`] = gab.climatizacao.fanOK ? 'SIM' : 'NÃO';
        row[`${prefix}_Qtd_ACs`] = gab.climatizacao.acs.length;
        
        for (let j = 0; j < 4; j++) {
          const ac = gab.climatizacao.acs[j];
          if (ac) {
            row[`${prefix}_AC${j + 1}_Modelo`] = ac.modelo;
            row[`${prefix}_AC${j + 1}_Funcionamento`] = ac.funcionamento;
          } else {
            row[`${prefix}_AC${j + 1}_Modelo`] = '';
            row[`${prefix}_AC${j + 1}_Funcionamento`] = '';
          }
        }
        
        // PLC Lead-Lag: store combined value
        const plcValue = gab.climatizacao.temPlcLeadLag 
          ? `SIM/${gab.climatizacao.plcLeadLagStatus || 'N/A'}` 
          : 'NÃO';
        row[`${prefix}_PLC_Lead_Lag`] = plcValue;
        row[`${prefix}_Foto_PLC`] = getPhotoValue(gab.climatizacao.fotoPlcLeadLag);
        row[`${prefix}_Alarmistica`] = gab.climatizacao.alarmistica;
        row[`${prefix}_Foto_AR1`] = getPhotoValue(gab.climatizacao.fotoAR1);
        row[`${prefix}_Foto_AR2`] = getPhotoValue(gab.climatizacao.fotoAR2);
        row[`${prefix}_Foto_AR3`] = getPhotoValue(gab.climatizacao.fotoAR3);
        row[`${prefix}_Foto_AR4`] = getPhotoValue(gab.climatizacao.fotoAR4);
        row[`${prefix}_Foto_Condensador`] = getPhotoValue(gab.climatizacao.fotoCondensador);
        row[`${prefix}_Foto_Evaporador`] = getPhotoValue(gab.climatizacao.fotoEvaporador);
        row[`${prefix}_Foto_Controlador`] = getPhotoValue(gab.climatizacao.fotoControlador);
      }
      
      // GRUPO 8: FOTOS EQUIPAMENTOS (always include if gabinete active)
      row[`${prefix}_Foto_Transmissao`] = getPhotoValue(gab.fotoTransmissao);
      row[`${prefix}_Foto_Acesso`] = getPhotoValue(gab.fotoAcesso);
    } else {
      // Empty or skipped gabinete
      row[`${prefix}_Selecionado`] = skipGabinete ? 'N/A' : 'NÃO';
    }
  }
  
  // GRUPO FIBRA ÓPTICA (always include - no skip option)
  const fibra = {
    ...INITIAL_FIBRA_OPTICA,
    ...(data.fibraOptica || {}),
    abordagens:
      data.fibraOptica?.abordagens && data.fibraOptica.abordagens.length > 0
        ? data.fibraOptica.abordagens
        : [{ ...INITIAL_ABORDAGEM_FIBRA }],
    dgos: data.fibraOptica?.dgos || [],
  };

  row['Fibra_Abordagens_Qtd'] = fibra.qtdAbordagens;
  fibra.abordagens.forEach((abord, i) => {
    row[`Fibra_Abord${i + 1}_Tipo`] = abord.tipoEntrada;
    row[`Fibra_Abord${i + 1}_Descricao`] = abord.descricao || '';
  });
  row['Fibra_Caixas_Passagem_Qtd'] = fibra.qtdCaixasPassagem;
  row['Fibra_Caixas_Subterraneas_Qtd'] = fibra.qtdCaixasSubterraneas;
  row['Fibra_Subidas_Laterais_Qtd'] = fibra.qtdSubidasLaterais;
  row['Fibra_DGOs_Qtd'] = fibra.qtdDGOs;
  row['Fibra_DGOs_Cordoes_OK_Qtd'] = fibra.dgos.filter((d) => d.estadoCordoes === 'OK').length;
  row['Fibra_DGOs_Cordoes_NOK_Qtd'] = fibra.dgos.filter((d) => d.estadoCordoes === 'NOK').length;

  fibra.dgos.forEach((dgo, i) => {
    row[`Fibra_DGO${i + 1}_ID`] = dgo.identificacao;
    row[`Fibra_DGO${i + 1}_Capacidade`] = `${dgo.capacidadeFO}FO`;
    row[`Fibra_DGO${i + 1}_Cordoes`] = dgo.estadoCordoes;
  });
  
  // GRUPO ENERGIA - skip if energia section marked NA
  const skipEnergia = skipped.energia;
  if (!skipEnergia) {
    row['Energia_Tipo_Quadro'] = data.energia.tipoQuadro || '';
    row['Energia_Fabricante'] = data.energia.fabricante || '';
    row['Energia_Fabricante_Outra'] = data.energia.fabricanteOutra || '';
    row['Energia_Potencia_kVA'] = data.energia.potenciaKVA ?? '';
    row['Energia_Tensao_Entrada'] = data.energia.tensaoEntrada || '';
    row['Energia_Disjuntor_Entrada_A'] = data.energia.capacidadeDisjuntorEntrada ?? '';
    row['Energia_Disjuntor_QDCA_A'] = data.energia.capacidadeDisjuntorQDCA ?? '';
    row['Energia_Protegido_Gradil'] = data.energia.protegidoGradil ? 'SIM' : 'NÃO';
    row['Energia_Protegido_Cadeado'] = data.energia.protegidoCadeado ? 'SIM' : 'NÃO';
    row['Energia_Tem_Transformador'] = data.energia.temTransformador ? 'SIM' : 'NÃO';
    row['Energia_Foto_Transformador'] = getPhotoValue(data.energia.fotoTransformador);
    row['Energia_Foto_Quadro_Geral'] = getPhotoValue(data.energia.fotoQuadroGeral);
    row['Energia_Unidade_Consumidora'] = data.energia.unidadeConsumidora || '';
    row['Energia_Foto_Relogio'] = getPhotoValue(data.energia.fotoRelogio);
  } else {
    row['Energia_Secao'] = 'N/A';
  }
  
  // GRUPO GMG e TORRE - skip if gmgTorre section marked NA
  const skipGmgTorre = skipped.gmgTorre;
  if (!skipGmgTorre) {
    row['GMG_Informado'] = data.gmg.informar ? 'SIM' : 'NÃO';
    row['GMG_Fabricante'] = data.gmg.informar ? (data.gmg.fabricante || '') : '';
    row['GMG_Potencia_kVA'] = data.gmg.informar ? (data.gmg.potencia || '') : '';
    row['GMG_Capacidade_Tanque_L'] = data.gmg.informar ? (data.gmg.capacidadeTanque || '') : '';
    row['GMG_Combustivel_Pct'] = data.gmg.informar ? (data.gmg.combustivelPorcentagem != null ? data.gmg.combustivelPorcentagem : '') : '';
    row['GMG_Status'] = data.gmg.informar ? (data.gmg.status || '') : '';
    row['GMG_Alarme_Ativo'] = data.gmg.informar ? (data.gmg.alarmeAtivo ? 'SIM' : 'NÃO') : '';
    row['GMG_Foto_Alarme'] = data.gmg.informar ? getPhotoValue(data.gmg.fotoAlarme) : '';
    row['GMG_Ultimo_Teste'] = data.gmg.informar ? (data.gmg.ultimoTeste || '') : '';
    row['GMG_Foto_Painel'] = data.gmg.informar ? getPhotoValue(data.gmg.fotoGMG) : '';
    
    row['Torre_Ninhos'] = data.torre.ninhos ? 'SIM' : 'NÃO';
    row['Torre_Foto_Ninhos'] = getPhotoValue(data.torre.fotoNinhos);
    row['Torre_Fibras_Protegidas'] = data.torre.fibrasProtegidas ? 'SIM' : 'NÃO';
    row['Torre_Foto_Fibras_Protegidas'] = getPhotoValue(data.torre.fotoFibrasProtegidas);
    row['Torre_Aterramento'] = data.torre.aterramento;
    row['Torre_Foto_Aterramento'] = getPhotoValue(data.torre.fotoAterramento);
    row['Torre_Zeladoria'] = data.torre.zeladoria;
    row['Torre_Foto_Zeladoria'] = getPhotoValue(data.torre.fotoZeladoria);
  } else {
    row['GMG_Torre_Secao'] = 'N/A';
  }
  
  // GRUPO OBSERVAÇÕES E FINALIZAÇÃO (always include)
  row['Observacoes_Gerais'] = data.observacoes || '';
  row['Fotos_Observacao_Qtd'] = (data.fotosObservacao || []).filter(f => f.foto).length;
  row['Fotos_Observacao'] = (data.fotosObservacao || []).filter(f => f.foto).map((item, i) => `${getPhotoValue(item.foto)}${item.descricao ? ` - ${item.descricao}` : ''}`).join('; ');
  row['Assinatura_Digital'] = getPhotoValue(data.assinaturaDigital);
  row['Data_Hora_Checklist'] = data.dataHora ? format(new Date(data.dataHora), 'dd/MM/yyyy HH:mm:ss') : '';
  row['Timestamp_Envio'] = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
  
  return row;
}

export function generateExcel(data: ChecklistData, userOperadora?: string): Blob {
  const workbook = XLSX.utils.book_new();
  const row = buildRowFromChecklist(data, userOperadora);
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet([row]);
  
  // Set column widths
  const cols = Object.keys(row).map(key => ({ wch: Math.max(key.length, 20) }));
  worksheet['!cols'] = cols;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Checklist');
  
  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function generateConsolidatedExcel(dataList: ChecklistData[]): Blob {
  const workbook = XLSX.utils.book_new();
  
  // Build all rows
  const rows = dataList.map(data => buildRowFromChecklist(data));
  
  // Create worksheet with all rows
  const worksheet = XLSX.utils.json_to_sheet(rows);
  
  // Set column widths based on headers
  if (rows.length > 0) {
    const cols = Object.keys(rows[0]).map(key => ({ wch: Math.max(key.length, 20) }));
    worksheet['!cols'] = cols;
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorios_Consolidados');
  
  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/**
 * Detects if the browser is running on iOS
 */
function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Downloads an Excel file with iOS/Safari compatibility
 */
export function downloadExcel(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  
  // For iOS devices, open in new tab since download attribute doesn't work reliably
  if (isIOS()) {
    const newWindow = window.open(url, '_blank');
    if (!newWindow) {
      window.location.href = url;
    }
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);
    return;
  }
  
  // Standard download for non-iOS browsers
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 250);
}
