export type UF = 'PA' | 'AM' | 'MA' | 'RR' | 'AP';

export type AbrigoType = 'SHARING' | 'GABINETE 1' | 'GABINETE 2' | 'GABINETE 3' | 'GABINETE 4' | 'GABINETE 5' | 'GABINETE 6' | 'GABINETE 7';

export type GabineteType = 
  | 'CONTAINER'
  | 'SHARING'
  | 'HUAWEI 3012'
  | 'HUAWEI APM30'
  | 'HUAWEI APM5930'
  | 'HUAWEI MTS9000A'
  | 'ILLIS-194'
  | 'INDOOR MINI SHELTER 2X2'
  | 'OUTDOOR';

export type TecnologiaAcesso = '2G' | '3G' | '4G' | '5G';
export type TecnologiaTransporte = 'DWDM' | 'GPON' | 'HL4' | 'HL5D' | 'HL5G' | 'PDH' | 'SDH' | 'GWS' | 'GWD' | 'SWA';

export type FCCFabricante = 
  | 'ALCATEL' | 'ALFA' | 'ASCOM' | 'DELTA' | 'ELTEK' | 'EFACEC' 
  | 'EMERSON' | 'HUAWEI' | 'INTERGY' | 'VERTIV' | 'ZTE' | 'OUTRA';

export type TensaoDC = '24V' | '48V';

export type BateriaTipo = 'LÍTIO' | 'POLÍMERO 100A' | 'POLÍMERO 200A' | 'MONOBLOCO 2V' | 'NA';

export type BateriaFabricante = 
  | 'FREEDOM' | 'FULGURIS' | 'GETPOWER' | 'HUAWEI' | 'MOURA' 
  | 'NEWMAX' | 'NORTHSTAR' | 'UNICOBA' | 'ZTE' | 'SHOTO' | 'NA' | 'OUTRA';

export type CapacidadeAh = 100 | 105 | 170 | 200 | 300 | 400 | 430 | 500 | 600 | 640 | 750 | 800 | 1000 | 1250 | 1500 | 2000 | 2500;

export type BateriaEstado = 'OK' | 'ESTUFADA' | 'VAZANDO' | 'TRINCADA' | 'NÃO SEGURA CARGA' | 'NA';

export type ClimatizacaoTipo = 'AR CONDICIONADO' | 'FAN' | 'NA';

export type ACModelo = 
  | 'SPLIT 12 KBTU' | 'SPLIT 18 KBTU' | 'SPLIT 24 KBTU' | 'SPLIT 30 KBTU' | 'SPLIT 36 KBTU' | 'SPLIT 60 KBTU'
  | 'WALL MOUNTED 24' | 'WALL MOUNTED 36' | 'WALL MOUNTED 60'
  | 'JANELA 30' | 'NA';

export type StatusFuncionamento = 'OK' | 'NOK' | 'NA';

export interface BancoBateria {
  tipo: BateriaTipo;
  fabricante: BateriaFabricante;
  capacidadeAh: CapacidadeAh | null;
  dataFabricacao: string;
  estado: BateriaEstado;
}

export interface ArCondicionado {
  modelo: ACModelo;
  funcionamento: StatusFuncionamento;
}

export interface FCCData {
  fabricante: FCCFabricante;
  tensaoDC: TensaoDC;
  gerenciadaSG: boolean;
  gerenciavel: boolean;
  consumoDC: number;
  qtdURSuportadas: number | 'Outra';
  fotoPanoramica: string | null;
  fotoPainel: string | null;
}

export interface BateriasData {
  numBancos: number;
  bancos: BancoBateria[];
  bancosInterligados: boolean;
  fotoBanco: string | null;
}

export interface ClimatizacaoData {
  tipo: ClimatizacaoTipo;
  fanOK: boolean;
  acs: ArCondicionado[];
  plcLeadLag: StatusFuncionamento;
  alarmistica: 'SGINFRA U2020' | 'Outra';
  fotoAR1: string | null;
  fotoAR2: string | null;
  fotoAR3: string | null;
  fotoAR4: string | null;
  fotoCondensador: string | null;
  fotoEvaporador: string | null;
  fotoControlador: string | null;
}

export interface GabineteData {
  tipo: GabineteType;
  comProtecao: boolean;
  tecnologiasAcesso: TecnologiaAcesso[];
  tecnologiasTransporte: TecnologiaTransporte[];
  fcc: FCCData;
  baterias: BateriasData;
  climatizacao: ClimatizacaoData;
  fotoTransmissao: string | null;
  fotoAcesso: string | null;
}

export interface GMGData {
  informar: boolean;
  fabricante?: FCCFabricante;
  potencia?: number;
  autonomia?: number;
  status?: StatusFuncionamento;
}

export interface TorreData {
  ninhos: boolean;
  fotoNinhos?: string | null;
  fibrasProtegidas: boolean;
  aterramento: StatusFuncionamento;
  zeladoria: StatusFuncionamento;
}

export interface ChecklistData {
  id: string;
  siglaSite: string;
  uf: UF;
  qtdGabinetes: number;
  abrigoSelecionado: AbrigoType;
  fotoPanoramica: string | null;
  gabinetes: GabineteData[];
  gmg: GMGData;
  torre: TorreData;
  observacoes: string;
  fotoObservacao: string | null;
  assinaturaDigital: string | null;
  dataHora: string;
  tecnico: string;
  sincronizado: boolean;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_GABINETE: GabineteData = {
  tipo: 'CONTAINER',
  comProtecao: false,
  tecnologiasAcesso: [],
  tecnologiasTransporte: [],
  fcc: {
    fabricante: 'HUAWEI',
    tensaoDC: '48V',
    gerenciadaSG: false,
    gerenciavel: false,
    consumoDC: 0,
    qtdURSuportadas: 1,
    fotoPanoramica: null,
    fotoPainel: null,
  },
  baterias: {
    numBancos: 0,
    bancos: [],
    bancosInterligados: false,
    fotoBanco: null,
  },
  climatizacao: {
    tipo: 'NA',
    fanOK: true,
    acs: [],
    plcLeadLag: 'NA',
    alarmistica: 'SGINFRA U2020',
    fotoAR1: null,
    fotoAR2: null,
    fotoAR3: null,
    fotoAR4: null,
    fotoCondensador: null,
    fotoEvaporador: null,
    fotoControlador: null,
  },
  fotoTransmissao: null,
  fotoAcesso: null,
};

export const INITIAL_CHECKLIST: Omit<ChecklistData, 'id' | 'createdAt' | 'updatedAt'> = {
  siglaSite: '',
  uf: 'PA',
  qtdGabinetes: 1,
  abrigoSelecionado: 'GABINETE 1',
  fotoPanoramica: null,
  gabinetes: [{ ...INITIAL_GABINETE }],
  gmg: {
    informar: false,
  },
  torre: {
    ninhos: false,
    fibrasProtegidas: true,
    aterramento: 'OK',
    zeladoria: 'OK',
  },
  observacoes: '',
  fotoObservacao: null,
  assinaturaDigital: null,
  dataHora: new Date().toISOString(),
  tecnico: '',
  sincronizado: false,
};
