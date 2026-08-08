export interface VandalismoItemDef {
  key: string;
  rotulo: string;
  minFotos: number;
  maxFotos: number;
  grupo: string;
  /** Gabinete number when the item belongs to an optional cabinet (2..4) */
  gabineteOpcional?: 2 | 3 | 4;
}

export interface VandalismoItemState {
  vulneravel: boolean;
  fotos: string[];
}

export interface VandalismoVistoria {
  id: string;
  user_id: string;
  site_code: string;
  operadora: string | null;
  descricao: string;
  latitude: number | null;
  longitude: number | null;
  endereco: string | null;
  bo_url: string | null;
  bo_nome: string | null;
  tecnico: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VandalismoFoto {
  id: string;
  vistoria_id: string;
  categoria: string;
  url: string;
  ordem: number;
}

export interface VandalismoItemRow {
  id: string;
  vistoria_id: string;
  item_key: string;
  rotulo: string;
  vulneravel: boolean;
  fotos: string[];
  ordem: number;
}

export interface VandalismoVistoriaCompleta extends VandalismoVistoria {
  fotos: VandalismoFoto[];
  itens: VandalismoItemRow[];
}

export const VANDALISMO_MIN_FOTOS_OCORRIDO = 3;
export const VANDALISMO_MAX_FOTOS_OCORRIDO = 20;

export const VANDALISMO_ITENS: VandalismoItemDef[] = [
  { key: 'placa_site', rotulo: 'Foto da placa do site', minFotos: 1, maxFotos: 4, grupo: 'Perímetro' },
  { key: 'frente_site', rotulo: 'Foto da frente do site', minFotos: 1, maxFotos: 4, grupo: 'Perímetro' },
  { key: 'laterais_site', rotulo: 'Fotos das laterais do site', minFotos: 2, maxFotos: 6, grupo: 'Perímetro' },
  { key: 'portao_site', rotulo: 'Foto do portão do site', minFotos: 1, maxFotos: 4, grupo: 'Perímetro' },
  { key: 'cadeado_portao', rotulo: 'Foto do cadeado do portão do site', minFotos: 1, maxFotos: 4, grupo: 'Perímetro' },
  { key: 'concertinas', rotulo: '4 fotos das concertinas do site', minFotos: 4, maxFotos: 8, grupo: 'Perímetro' },

  { key: 'gab1_panoramica', rotulo: 'Gab1 - Foto panorâmica do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes' },
  { key: 'gab1_cadeado', rotulo: 'Gab1 - Foto do cadeado do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes' },
  { key: 'gab2_panoramica', rotulo: 'Gab2 - Foto panorâmica do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes', gabineteOpcional: 2 },
  { key: 'gab2_cadeado', rotulo: 'Gab2 - Foto do cadeado do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes', gabineteOpcional: 2 },
  { key: 'gab3_panoramica', rotulo: 'Gab3 - Foto panorâmica do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes', gabineteOpcional: 3 },
  { key: 'gab3_cadeado', rotulo: 'Gab3 - Foto do cadeado do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes', gabineteOpcional: 3 },
  { key: 'gab4_panoramica', rotulo: 'Gab4 - Foto panorâmica do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes', gabineteOpcional: 4 },
  { key: 'gab4_cadeado', rotulo: 'Gab4 - Foto do cadeado do gabinete', minFotos: 1, maxFotos: 4, grupo: 'Gabinetes', gabineteOpcional: 4 },

  { key: 'esteiramento_horizontal', rotulo: 'Foto esteiramento horizontal', minFotos: 1, maxFotos: 4, grupo: 'Infraestrutura' },
  { key: 'esteiramento_vertical', rotulo: 'Foto esteiramento vertical', minFotos: 1, maxFotos: 4, grupo: 'Infraestrutura' },
  { key: 'cme_panoramica', rotulo: 'Foto panorâmica do CME padrão da concessionária', minFotos: 1, maxFotos: 4, grupo: 'Infraestrutura' },
  { key: 'cme_cadeado', rotulo: 'Foto do cadeado do CME padrão concessionária', minFotos: 1, maxFotos: 4, grupo: 'Infraestrutura' },
  { key: 'qdca_panoramica', rotulo: 'Foto panorâmica do QDCA', minFotos: 1, maxFotos: 4, grupo: 'Infraestrutura' },
  { key: 'qdca_cadeado', rotulo: 'Foto do cadeado do QDCA', minFotos: 1, maxFotos: 4, grupo: 'Infraestrutura' },
  { key: 'luminaria', rotulo: '2 fotos da luminária ou falta de luminária no site', minFotos: 2, maxFotos: 4, grupo: 'Infraestrutura' },
];

export const VANDALISMO_GRUPOS = ['Perímetro', 'Gabinetes', 'Infraestrutura'] as const;
