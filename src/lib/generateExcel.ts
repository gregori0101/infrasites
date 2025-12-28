import * as XLSX from 'xlsx';
import { ChecklistData } from '@/types/checklist';
import { format } from 'date-fns';

const TECNOLOGIAS_ACESSO = ['2G', '3G', '4G', '5G'];
const TECNOLOGIAS_TRANSPORTE = ['DWDM', 'GPON', 'HL4', 'HL5D', 'HL5G', 'PDH', 'SDH', 'GWS', 'GWD', 'SWA'];

function buildRowFromChecklist(data: ChecklistData): Record<string, string | number | boolean> {
  const row: Record<string, string | number | boolean> = {};
  
  // GRUPO 1: IDENTIFICAÇÃO
  row['ID_Relatorio'] = data.id;
  row['Data_Preenchimento'] = format(new Date(data.createdAt), 'dd/MM/yyyy');
  row['Hora_Preenchimento'] = format(new Date(data.createdAt), 'HH:mm');
  row['Tecnico'] = data.tecnico || '';
  row['Sigla_Site'] = data.siglaSite;
  row['UF'] = data.uf;
  
  // GRUPO 2: SITE GERAL
  row['Qtd_Gabinetes_Total'] = data.qtdGabinetes;
  row['Foto_Panoramica'] = data.fotoPanoramica ? 'SIM' : 'NÃO';
  
  // For each possible gabinete (1-7)
  for (let i = 0; i < 7; i++) {
    const prefix = `Gab${i + 1}`;
    const gab = data.gabinetes[i];
    
    if (gab) {
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
      
      // GRUPO 5: FCC
      row[`${prefix}_FCC_Fabricante`] = gab.fcc.fabricante;
      row[`${prefix}_FCC_TensaoDC`] = gab.fcc.tensaoDC;
      row[`${prefix}_FCC_Gerenciada_SG`] = gab.fcc.gerenciadaSG ? 'SIM' : 'NÃO';
      row[`${prefix}_FCC_Gerenciavel`] = gab.fcc.gerenciavel ? 'SIM' : 'NÃO';
      row[`${prefix}_FCC_Consumo_W`] = gab.fcc.consumoDC;
      row[`${prefix}_FCC_QtdUR_Suportadas`] = gab.fcc.qtdURSuportadas;
      row[`${prefix}_FCC_Foto_Panoramica`] = gab.fcc.fotoPanoramica ? 'SIM' : 'NÃO';
      row[`${prefix}_FCC_Foto_Painel`] = gab.fcc.fotoPainel ? 'SIM' : 'NÃO';
      
      // GRUPO 6: BATERIAS
      row[`${prefix}_Num_Bancos`] = gab.baterias.numBancos;
      row[`${prefix}_Bancos_Interligados`] = gab.baterias.bancosInterligados ? 'SIM' : 'NÃO';
      
      // For each possible bank (1-6)
      for (let j = 0; j < 6; j++) {
        const banco = gab.baterias.bancos[j];
        if (banco) {
          row[`${prefix}_Banco${j + 1}_Tipo`] = banco.tipo;
          row[`${prefix}_Banco${j + 1}_Fabricante`] = banco.fabricante;
          row[`${prefix}_Banco${j + 1}_CapAh`] = banco.capacidadeAh || '';
          row[`${prefix}_Banco${j + 1}_DataFab`] = banco.dataFabricacao || '';
          row[`${prefix}_Banco${j + 1}_Estado`] = banco.estado;
        } else {
          row[`${prefix}_Banco${j + 1}_Tipo`] = '';
          row[`${prefix}_Banco${j + 1}_Fabricante`] = '';
          row[`${prefix}_Banco${j + 1}_CapAh`] = '';
          row[`${prefix}_Banco${j + 1}_DataFab`] = '';
          row[`${prefix}_Banco${j + 1}_Estado`] = '';
        }
      }
      
      row[`${prefix}_Foto_Banco`] = gab.baterias.fotoBanco ? 'SIM' : 'NÃO';
      
      // GRUPO 7: CLIMATIZAÇÃO
      row[`${prefix}_Clim_Tipo`] = gab.climatizacao.tipo;
      row[`${prefix}_Fan_OK`] = gab.climatizacao.fanOK ? 'SIM' : 'NÃO';
      row[`${prefix}_Qtd_ACs`] = gab.climatizacao.acs.length;
      
      // For each possible AC (1-4)
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
      
      row[`${prefix}_PLC_Lead_Lag`] = gab.climatizacao.plcLeadLag;
      row[`${prefix}_Alarmistica`] = gab.climatizacao.alarmistica;
      row[`${prefix}_Foto_AR1`] = gab.climatizacao.fotoAR1 ? 'SIM' : 'NÃO';
      row[`${prefix}_Foto_AR2`] = gab.climatizacao.fotoAR2 ? 'SIM' : 'NÃO';
      row[`${prefix}_Foto_Condensador`] = gab.climatizacao.fotoCondensador ? 'SIM' : 'NÃO';
      row[`${prefix}_Foto_Evaporador`] = gab.climatizacao.fotoEvaporador ? 'SIM' : 'NÃO';
      row[`${prefix}_Foto_Controlador`] = gab.climatizacao.fotoControlador ? 'SIM' : 'NÃO';
      
      // GRUPO 8: FOTOS EQUIPAMENTOS
      row[`${prefix}_Foto_Transmissao`] = gab.fotoTransmissao ? 'SIM' : 'NÃO';
      row[`${prefix}_Foto_Acesso`] = gab.fotoAcesso ? 'SIM' : 'NÃO';
    } else {
      // Empty gabinete
      row[`${prefix}_Selecionado`] = 'NÃO';
      row[`${prefix}_Tipo`] = '';
      row[`${prefix}_Com_Protecao`] = '';
      
      TECNOLOGIAS_ACESSO.forEach(tec => {
        row[`${prefix}_Tec_Acesso_${tec}`] = '';
      });
      
      TECNOLOGIAS_TRANSPORTE.forEach(tec => {
        row[`${prefix}_Tec_Transp_${tec}`] = '';
      });
      
      row[`${prefix}_FCC_Fabricante`] = '';
      row[`${prefix}_FCC_TensaoDC`] = '';
      row[`${prefix}_FCC_Gerenciada_SG`] = '';
      row[`${prefix}_FCC_Gerenciavel`] = '';
      row[`${prefix}_FCC_Consumo_W`] = '';
      row[`${prefix}_FCC_QtdUR_Suportadas`] = '';
      row[`${prefix}_FCC_Foto_Panoramica`] = '';
      row[`${prefix}_FCC_Foto_Painel`] = '';
      
      row[`${prefix}_Num_Bancos`] = '';
      row[`${prefix}_Bancos_Interligados`] = '';
      
      for (let j = 0; j < 6; j++) {
        row[`${prefix}_Banco${j + 1}_Tipo`] = '';
        row[`${prefix}_Banco${j + 1}_Fabricante`] = '';
        row[`${prefix}_Banco${j + 1}_CapAh`] = '';
        row[`${prefix}_Banco${j + 1}_DataFab`] = '';
        row[`${prefix}_Banco${j + 1}_Estado`] = '';
      }
      
      row[`${prefix}_Foto_Banco`] = '';
      row[`${prefix}_Clim_Tipo`] = '';
      row[`${prefix}_Fan_OK`] = '';
      row[`${prefix}_Qtd_ACs`] = '';
      
      for (let j = 0; j < 4; j++) {
        row[`${prefix}_AC${j + 1}_Modelo`] = '';
        row[`${prefix}_AC${j + 1}_Funcionamento`] = '';
      }
      
      row[`${prefix}_PLC_Lead_Lag`] = '';
      row[`${prefix}_Alarmistica`] = '';
      row[`${prefix}_Foto_AR1`] = '';
      row[`${prefix}_Foto_AR2`] = '';
      row[`${prefix}_Foto_Condensador`] = '';
      row[`${prefix}_Foto_Evaporador`] = '';
      row[`${prefix}_Foto_Controlador`] = '';
      row[`${prefix}_Foto_Transmissao`] = '';
      row[`${prefix}_Foto_Acesso`] = '';
    }
  }
  
  // GRUPO FIBRA
  row['Fibra_Abordagens'] = data.fibra.numAbordagens;
  row['Fibra_Ab1_Tipo'] = data.fibra.abordagem1.tipo;
  row['Fibra_Ab1_Subida_OK'] = data.fibra.abordagem1.subidaLateralOK ? 'SIM' : 'NÃO';
  if (data.fibra.numAbordagens === 2 && data.fibra.abordagem2) {
    row['Fibra_Ab2_Tipo'] = data.fibra.abordagem2.tipo;
    row['Fibra_Ab2_Subida_OK'] = data.fibra.abordagem2.subidaLateralOK ? 'SIM' : 'NÃO';
    row['Fibra_Convergencia'] = data.fibra.convergencia || '';
  }
  row['Fibra_Caixas_Passagem'] = data.fibra.caixasPassagemExistem ? 'SIM' : 'NÃO';
  row['Fibra_Caixas_Padrao'] = data.fibra.caixasPassagemPadrao ? 'SIM' : 'NÃO';
  row['Fibra_DGOs_Total'] = data.fibra.numDGOs;
  
  // DGOs individuais
  for (let i = 0; i < 10; i++) {
    const dgo = data.fibra.dgos[i];
    if (dgo) {
      row[`Fibra_DGO${i + 1}_Capacidade`] = dgo.capacidade;
      row[`Fibra_DGO${i + 1}_Formato`] = dgo.formatos.join(', ');
      row[`Fibra_DGO${i + 1}_Estado`] = dgo.estadoFisico;
      row[`Fibra_DGO${i + 1}_Cordoes`] = dgo.organizacaoCordoes;
    }
  }
  row['Fibra_Observacoes'] = data.fibra.observacoesDGOs || '';
  
  // GRUPO ENERGIA
  row['Energia_Tipo'] = data.energia.tipoQuadro;
  row['Energia_Fabricante'] = data.energia.fabricante;
  row['Energia_kVA'] = data.energia.potenciaKVA;
  row['Energia_Tensao_Entrada'] = data.energia.tensaoEntrada;
  row['Energia_Transformador_OK'] = data.energia.transformadorOK ? 'SIM' : 'NÃO';
  row['Energia_DR_OK'] = data.energia.protecoes.drOK ? 'SIM' : 'NÃO';
  row['Energia_DPS_OK'] = data.energia.protecoes.dpsOK ? 'SIM' : 'NÃO';
  row['Energia_Disjuntores_OK'] = data.energia.protecoes.disjuntoresOK ? 'SIM' : 'NÃO';
  row['Energia_Termomagneticos_OK'] = data.energia.protecoes.termomagneticosOK ? 'SIM' : 'NÃO';
  row['Energia_Chave_Geral_OK'] = data.energia.protecoes.chaveGeralOK ? 'SIM' : 'NÃO';
  row['Energia_Terminais_OK'] = data.energia.cabos.terminaisApertados ? 'SIM' : 'NÃO';
  row['Energia_Isolacao_OK'] = data.energia.cabos.isolacaoOK ? 'SIM' : 'NÃO';
  row['Energia_Cabos_OK'] = (data.energia.cabos.terminaisApertados && data.energia.cabos.isolacaoOK) ? 'SIM' : 'NÃO';
  row['Energia_Placa_Status'] = data.energia.placaStatus;
  // GRUPO FINAL: GMG E TORRE
  row['GMG_Informado'] = data.gmg.informar ? 'SIM' : 'NÃO';
  row['GMG_Fabricante'] = data.gmg.fabricante || '';
  row['GMG_Potencia'] = data.gmg.potencia || '';
  row['GMG_Autonomia'] = data.gmg.autonomia || '';
  row['GMG_Status'] = data.gmg.status || '';
  row['Ninhos_Torre'] = data.torre.ninhos ? 'SIM' : 'NÃO';
  row['Fibras_Protegidas'] = data.torre.fibrasProtegidas ? 'SIM' : 'NÃO';
  row['Aterramento'] = data.torre.aterramento;
  row['Zeladoria'] = data.torre.zeladoria;
  
  // GRUPO FINAL: OBSERVAÇÕES
  row['Observacoes_Site'] = data.observacoes || '';
  row['Foto_Observacao'] = data.fotoObservacao ? 'SIM' : 'NÃO';
  row['Assinatura_Digital'] = data.assinaturaDigital ? 'SIM' : 'NÃO';
  row['Timestamp_Envio'] = format(new Date(), 'dd/MM/yyyy HH:mm:ss');
  
  return row;
}

export function generateExcel(data: ChecklistData): Blob {
  const workbook = XLSX.utils.book_new();
  const row = buildRowFromChecklist(data);
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet([row]);
  
  // Set column widths
  const cols = Object.keys(row).map(key => ({ wch: Math.max(key.length, 15) }));
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
    const cols = Object.keys(rows[0]).map(key => ({ wch: Math.max(key.length, 15) }));
    worksheet['!cols'] = cols;
  }
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatorios_Consolidados');
  
  // Generate blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

export function downloadExcel(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
