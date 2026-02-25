export type FGAppRole = 'admin' | 'tecnico';
export type CausaReparo = 
  | 'carga_alta'
  | 'ataque_formigas'
  | 'ataque_roedores'
  | 'causa_desconhecida'
  | 'linha_pipa'
  | 'corte_obras'
  | 'corte_troca_poste'
  | 'degradacao_fibra'
  | 'descarga_eletrica'
  | 'incendio'
  | 'atividade_implantacao'
  | 'fibra_quebrada_ceo'
  | 'furto'
  | 'outros'
  | 'poda_arvore'
  | 'pigtail_conexao'
  | 'queda_arvore'
  | 'vandalismo';
export type StatusReparo = 'pendente' | 'enviado' | 'revisao' | 'concluido';
export type ConclusaoTA = 'definitivo' | 'pendente';
export type CategoriaReparo = 'manutencao' | 'melhoria' | 'obras';
export type TipoFoto = 'caixa_emenda' | 'rompimento' | 'caixas_poste' | 'revisao_correcao';
export type TipoRede = 'bbn' | 'bbr' | 'b2b';
export type TipoRevisao = 'admin_comentario' | 'tecnico_resposta';

export interface FGProfile {
  id: string;
  nome: string;
  email: string;
  avatar_url?: string;
  criado_em: string;
}

export interface Reparo {
  id: string;
  usuario_id: string;
  ta_titulo: string;
  trecho?: string;
  causa: CausaReparo;
  latitude?: number;
  longitude?: number;
  status: StatusReparo;
  conclusao_ta: ConclusaoTA;
  categoria: CategoriaReparo;
  tipo_rede?: TipoRede;
  observacoes?: string;
  observacao_prevencao?: string;
  observacao_definitivo?: string;
  tecnicos_reparo?: string;
  criado_em: string;
  atualizado_em: string;
  sincronizado: boolean;
  inicio_trabalho?: string;
  fim_trabalho?: string;
  email_enviado: boolean;
  email_enviado_em?: string;
  rnc_aplicada: boolean;
  rnc_aplicada_em?: string;
  rnc_observacao?: string;
  caixa_bomba: boolean;
  prazo_vistoria?: string;
  // Joined data
  profiles?: FGProfile;
  fotos_reparo?: FotoReparo[];
}

export interface FotoReparo {
  id: string;
  reparo_id: string;
  tipo_foto: TipoFoto;
  titulo?: string;
  caminho_arquivo: string;
  ordem: number;
  criado_em: string;
}

export interface RevisaoReparo {
  id: string;
  reparo_id: string;
  usuario_id: string;
  mensagem: string;
  tipo: TipoRevisao;
  criado_em: string;
  profiles?: FGProfile;
}

export interface ReparoComFotos extends Reparo {
  fotos: FotoReparo[];
  tecnico_nome?: string;
}

export interface PendingSync {
  id: string;
  type: 'reparo' | 'foto';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  created_at: string;
  retries: number;
}

export interface NovoReparoForm {
  ta_titulo: string;
  trecho?: string;
  causa: CausaReparo;
  categoria: CategoriaReparo;
  tipo_rede?: TipoRede;
  latitude?: number;
  longitude?: number;
  conclusao_ta: ConclusaoTA;
  observacoes?: string;
  observacao_prevencao?: string;
  observacao_definitivo?: string;
  tecnicos_reparo?: string;
  caixa_bomba: boolean;
  fotos: {
    rompimento: File[];
    caixa_emenda: File[];
    caixas_poste: File[];
  };
}

export interface MapMarker {
  id: string;
  position: [number, number];
  causa: CausaReparo;
  ta_titulo: string;
  tecnico_nome: string;
  data: string;
  foto_principal?: string;
}

export interface DashboardStats {
  total: number;
  pendentes: number;
  enviados: number;
  revisao: number;
  concluidos: number;
  nao_sincronizados: number;
}
