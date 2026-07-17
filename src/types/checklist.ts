export type Operadora = 'VIVO' | 'TEL';

export type UF = 'PA' | 'AM' | 'MA' | 'RR' | 'AP';

export type GabineteType =
  | 'ABRIGO'
  | 'CONTAINER'
  | 'SHARING'
  | 'HUAWEI 3012'
  | 'HUAWEI APM30'
  | 'HUAWEI APM5930'
  | 'HUAWEI MTS9000A'
  | 'ILLIS-194'
  | 'INDOOR MINI SHELTER 2X2'
  | 'OUTDOOR'
  | 'OUTROS';

export type TecnologiaAcesso = '2G' | '3G' | '4G' | '5G';
export type TecnologiaTransporte = 'DWDM' | 'GPON' | 'HL3' | 'HL4' | 'HL5D' | 'HL5G' | 'PDH' | 'SDH' | 'GWS' | 'GWD' | 'SWA';

export type FCCFabricante = 
  | 'ALCATEL' | 'ALFA' | 'ASCOM' | 'DELTA' | 'ELTEK' | 'EFACEC' 
  | 'EMERSON' | 'HUAWEI' | 'INTERGY' | 'VERTIV' | 'ZTE' | 'OUTRA';

export type TensaoDC = '24V' | '48V';

export type BateriaTipo = 'LÍTIO' | 'POLÍMERO' | 'MONOBLOCO';

export type BateriaFabricante = 
  | 'ERICSSON' | 'FREEDOM' | 'FULGURIS' | 'GETPOWER' | 'HUAWEI' | 'MOURA' 
  | 'NEWMAX' | 'NORTHSTAR' | 'UNICOBA' | 'ZTE' | 'SHOTO' | 'NA' | 'OUTRA';

export type CapacidadeAh = 100 | 105 | 170 | 200 | 300 | 400 | 430 | 500 | 600 | 640 | 750 | 800 | 1000 | 1250 | 1500 | 2000 | 2500;

export type BateriaEstado = 'OK' | 'ESTUFADA' | 'ESTOURADA' | 'VAZANDO' | 'TRINCADA' | 'NÃO SEGURA CARGA';

export type BateriaColada = 'SIM' | 'NÃO' | 'NA';

export type ClimatizacaoTipo = 'AR CONDICIONADO' | 'FAN' | 'NA';

export type ACModelo = 
  | 'SPLIT 12 KBTU' | 'SPLIT 18 KBTU' | 'SPLIT 24 KBTU' | 'SPLIT 30 KBTU' | 'SPLIT 36 KBTU' | 'SPLIT 60 KBTU'
  | 'WALL MOUNTED 24' | 'WALL MOUNTED 36' | 'WALL MOUNTED 60'
  | 'JANELA 30' | 'NA';

export type StatusFuncionamento = 'OK' | 'NOK' | 'NA';

// Fibra types
export type AbordagemFibra = 'AÉREA' | 'SUBTERRÂNEA';
export type NumAbordagens = 1 | 2 | 3 | 4;
export type EstadoCordoes = 'OK' | 'NOK';

// Energia types
export type TipoQuadro = 'QDCA' | 'QGBT' | 'SUBQUADRO';
export type FabricanteQuadro = 'SIEMENS' | 'SCHNEIDER' | 'ABB' | 'WEG' | 'OUTRA';
export type TensaoEntrada = '127V' | '220V' | '380V' | '440V';


export interface EnergiaData {
  tipoQuadro: TipoQuadro | null;
  fabricante: FabricanteQuadro | null;
  fabricanteOutra?: string;
  potenciaKVA: number | null;
  tensaoEntrada: TensaoEntrada | null;
  capacidadeDisjuntorEntrada: number | null;
  capacidadeDisjuntorQDCA: number | null;
  protegidoGradil: boolean;
  protegidoCadeado: boolean;
  temTransformador: boolean;
  potenciaTransformador: string | null;
  fotoTransformador: string | null;
  fotoQuadroGeral: string | null;
  unidadeConsumidora: string | null;
  fotoRelogio: string | null;
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
  tipo: BateriaTipo | null;
  tipoIA?: 'LÍTIO' | 'POLÍMERO' | null;
  fabricante: BateriaFabricante | null;
  fabricanteOutra?: string;
  capacidadeAh: CapacidadeAh | null;
  dataFabricacao: string;
  estados: BateriaEstado[];
  colada: BateriaColada | null;
  comGradil: BateriaColada | null;
  fotoBanco: string | null;
}

export interface ArCondicionado {
  modelo: ACModelo;
  funcionamento: StatusFuncionamento;
}

export interface FCCItem {
  fabricante: FCCFabricante;
  fabricanteOutra?: string;
  tensaoDC: TensaoDC;
  gerenciadaSG: boolean;
  gerenciavel: boolean;
  consumoDC: number;
  qtdURSuportadas: number | null;
  qtdURInstaladas: number | null;
  fotoPanoramica: string | null;
  fotoPainel: string | null;
}

export interface FCCData {
  numFCCs: number;
  fccs: FCCItem[];
}

export interface BateriasData {
  numBancos: number;
  bancos: BancoBateria[];
  bancosInterligados: boolean;
}

export interface ClimatizacaoData {
  tipo: ClimatizacaoTipo;
  fanOK: boolean;
  acs: ArCondicionado[];
  temPlcLeadLag: boolean;
  plcLeadLagStatus: 'OK' | 'NOK' | null;
  fotoPlcLeadLag: string | null;
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
  tipoOutro?: string;
  ativo: boolean;
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
  fabricanteOutra?: string;
  potencia?: number;
  capacidadeTanque?: number;
  combustivelPorcentagem?: number;
  status?: StatusFuncionamento;
  alarmeAtivo?: boolean;
  fotoAlarme?: string | null;
  ultimoTeste?: string;
  fotoGMG?: string | null;
}

export interface TorreData {
  ninhos: boolean;
  fotoNinhos?: string | null;
  fibrasProtegidas: StatusFuncionamento;
  fotoFibrasProtegidas?: string | null;
  aterramento: StatusFuncionamento;
  fotoAterramento?: string | null;
  zeladoria: StatusFuncionamento;
  fotoZeladoria?: string | null;
  esteiramentoHorizontal?: StatusFuncionamento;
  fotoEsteiramentoHorizontal?: string | null;
  esteiramentoVertical?: StatusFuncionamento;
  fotoEsteiramentoVertical?: string | null;
}

// Sections that can be marked as "Não se Aplica"
export interface SecoesNaoAplicaveis {
  gabinete: boolean;
  fcc: boolean;
  baterias: boolean;
  climatizacao: boolean;
  energia: boolean;
  gmgTorre: boolean;
}

export const INITIAL_SECOES_NAO_APLICAVEIS: SecoesNaoAplicaveis = {
  gabinete: false,
  fcc: false,
  baterias: false,
  climatizacao: false,
  energia: false,
  gmgTorre: false,
};

export interface GeolocalizacaoData {
  latitude: number | null;
  longitude: number | null;
  endereco: string | null;
  capturadoEm: string | null;
}

export const INITIAL_GEOLOCALIZACAO: GeolocalizacaoData = {
  latitude: null,
  longitude: null,
  endereco: null,
  capturadoEm: null,
};

export interface FotoObservacao {
  foto: string | null;
  descricao: string;
}

// Extra photos storage - keyed by field identifier
export interface FotosExtras {
  [fieldKey: string]: string[];
}

export interface ChecklistData {
  id: string;
  operadora: Operadora;
  siglaSite: string;
  uf: UF;
  qtdGabinetes: number;
  fotoPanoramica: string | null;
  geolocalizacao: GeolocalizacaoData;
  gabinetes: GabineteData[];
  fibraOptica: FibraOpticaData;
  energia: EnergiaData;
  gmg: GMGData;
  torre: TorreData;
  observacoes: string;
  fotosObservacao: FotoObservacao[];
  assinaturaDigital: string | null;
  dataHora: string;
  tecnico: string;
  sincronizado: boolean;
  secoesNaoAplicaveis: SecoesNaoAplicaveis;
  fotosExtras: FotosExtras;
  createdAt: string;
  updatedAt: string;
}

export const INITIAL_GABINETE: GabineteData = {
  tipo: null as unknown as GabineteType,
  tipoOutro: '',
  ativo: true,
  comProtecao: false,
  tecnologiasAcesso: [],
  tecnologiasTransporte: [],
  fcc: {
    numFCCs: 0,
    fccs: [],
  },
  baterias: {
    numBancos: 0,
    bancos: [],
    bancosInterligados: false,
  },
  climatizacao: {
    tipo: 'NA',
    fanOK: true,
    acs: [],
    temPlcLeadLag: false,
    plcLeadLagStatus: null,
    fotoPlcLeadLag: null,
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
  tipoQuadro: null,
  fabricante: null,
  fabricanteOutra: '',
  potenciaKVA: null,
  tensaoEntrada: null,
  capacidadeDisjuntorEntrada: null,
  capacidadeDisjuntorQDCA: null,
  protegidoGradil: false,
  protegidoCadeado: false,
  temTransformador: false,
  potenciaTransformador: null,
  fotoTransformador: null,
  fotoQuadroGeral: null,
  unidadeConsumidora: null,
  fotoRelogio: null,
};

export const INITIAL_CHECKLIST: Omit<ChecklistData, 'id' | 'createdAt' | 'updatedAt'> = {
  operadora: 'VIVO',
  siglaSite: '',
  uf: 'PA',
  qtdGabinetes: 1,
  fotoPanoramica: null,
  geolocalizacao: { ...INITIAL_GEOLOCALIZACAO },
  gabinetes: [{ ...INITIAL_GABINETE }],
  fibraOptica: { ...INITIAL_FIBRA_OPTICA },
  energia: { ...INITIAL_ENERGIA },
  gmg: {
    informar: false,
  },
  torre: {
    ninhos: false,
    fibrasProtegidas: 'OK',
    aterramento: 'OK',
    zeladoria: 'OK',
  },
  observacoes: '',
  fotosObservacao: [],
  assinaturaDigital: null,
  dataHora: new Date().toISOString(),
  tecnico: '',
  sincronizado: false,
  secoesNaoAplicaveis: { ...INITIAL_SECOES_NAO_APLICAVEIS },
  fotosExtras: {},
};
