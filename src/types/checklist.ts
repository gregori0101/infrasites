export type UF = 'PA' | 'AM' | 'MA' | 'RR' | 'AP';

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

// Fibra types
export type AbordagemFibra = 'AÉREA' | 'SUBTERRÂNEA';
export type NumAbordagens = 1 | 2;
export type EstadoCordoes = 'OK' | 'NOK';

// Energia types
export type TipoQuadro = 'QDCA' | 'QGBT' | 'SUBQUADRO';
export type FabricanteQuadro = 'SIEMENS' | 'SCHNEIDER' | 'ABB' | 'WEG' | 'OUTRA';
export type TensaoEntrada = '127V' | '220V' | '380V' | '440V';
export type StatusPlaca = 'OK' | 'NOK' | 'AUSENTE';

export interface ProtecoesData {
  drOK: boolean;
  dpsOK: boolean;
  disjuntoresOK: boolean;
  termomagneticosOK: boolean;
  chaveGeralOK: boolean;
}

export interface CabosData {
  terminaisApertados: boolean;
  isolacaoOK: boolean;
  fotoCabos: string | null;
}

export interface EnergiaData {
  tipoQuadro: TipoQuadro;
  fabricante: FabricanteQuadro;
  potenciaKVA: number;
  tensaoEntrada: TensaoEntrada;
  transformadorOK: boolean;
  fotoTransformador: string | null;
  fotoQuadroGeral: string | null;
  protecoes: ProtecoesData;
  cabos: CabosData;
  placaStatus: StatusPlaca;
  fotoPlaca: string | null;
}

// New Fibra Óptica structures
export interface AbordagemFibraData {
  tipoEntrada: AbordagemFibra;
  descricao: string;
  fotos: string[];
}

export interface DGOFibraData {
  identificacao: string;
  capacidadeFO: number;
  estadoCordoes: EstadoCordoes;
  fotoDGO: string | null;
  fotoCordesDetalhada: string | null; // required if estadoCordoes = NOK
}

export interface FibraOpticaData {
  qtdAbordagens: NumAbordagens;
  abordagens: AbordagemFibraData[];
  qtdCaixasPassagem: number;
  fotosCaixasPassagem: string[];
  qtdCaixasSubterraneas: number;
  fotosCaixasSubterraneas: string[];
  qtdSubidasLaterais: number;
  fotosSubidasLaterais: string[];
  qtdDGOs: number;
  dgos: DGOFibraData[];
}

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
  fotoPanoramicaGabinete: string | null;
  fotoTransmissao: string | null;
  fotoAcesso: string | null;
}

export interface GMGData {
  informar: boolean;
  fabricante?: FCCFabricante;
  potencia?: number;
  autonomia?: number;
  status?: StatusFuncionamento;
  ultimoTeste?: string;
  fotoGMG?: string | null;
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
  fotoPanoramica: string | null;
  gabinetes: GabineteData[];
  fibraOptica: FibraOpticaData;
  energia: EnergiaData;
  gmg: GMGData;
  torre: TorreData;
  observacoes: string;
  fotosObservacao: (string | null)[];
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
  fotoPanoramicaGabinete: null,
  fotoTransmissao: null,
  fotoAcesso: null,
};

export const INITIAL_ABORDAGEM_FIBRA: AbordagemFibraData = {
  tipoEntrada: 'AÉREA',
  descricao: '',
  fotos: [],
};

export const INITIAL_DGO_FIBRA: DGOFibraData = {
  identificacao: '',
  capacidadeFO: 12,
  estadoCordoes: 'OK',
  fotoDGO: null,
  fotoCordesDetalhada: null,
};

export const INITIAL_FIBRA_OPTICA: FibraOpticaData = {
  qtdAbordagens: 1,
  abordagens: [{ ...INITIAL_ABORDAGEM_FIBRA }],
  qtdCaixasPassagem: 0,
  fotosCaixasPassagem: [],
  qtdCaixasSubterraneas: 0,
  fotosCaixasSubterraneas: [],
  qtdSubidasLaterais: 0,
  fotosSubidasLaterais: [],
  qtdDGOs: 0,
  dgos: [],
};

export const INITIAL_ENERGIA: EnergiaData = {
  tipoQuadro: 'QDCA',
  fabricante: 'SCHNEIDER',
  potenciaKVA: 75,
  tensaoEntrada: '220V',
  transformadorOK: true,
  fotoTransformador: null,
  fotoQuadroGeral: null,
  protecoes: {
    drOK: true,
    dpsOK: true,
    disjuntoresOK: true,
    termomagneticosOK: true,
    chaveGeralOK: true,
  },
  cabos: {
    terminaisApertados: true,
    isolacaoOK: true,
    fotoCabos: null,
  },
  placaStatus: 'OK',
  fotoPlaca: null,
};

export const INITIAL_CHECKLIST: Omit<ChecklistData, 'id' | 'createdAt' | 'updatedAt'> = {
  siglaSite: '',
  uf: 'PA',
  qtdGabinetes: 1,
  fotoPanoramica: null,
  gabinetes: [{ ...INITIAL_GABINETE }],
  fibraOptica: { ...INITIAL_FIBRA_OPTICA },
  energia: { ...INITIAL_ENERGIA },
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
  fotosObservacao: [],
  assinaturaDigital: null,
  dataHora: new Date().toISOString(),
  tecnico: '',
  sincronizado: false,
};
