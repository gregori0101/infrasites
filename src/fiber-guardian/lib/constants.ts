import { CausaReparo, StatusReparo, ConclusaoTA, TipoFoto, CategoriaReparo, TipoRede } from '@/fiber-guardian/types/database';

export const CAUSAS: { value: CausaReparo; label: string; color: string }[] = [
  { value: 'carga_alta', label: 'Carga alta', color: 'bg-causa-carga-alta' },
  { value: 'ataque_formigas', label: 'Ataque de formigas', color: 'bg-causa-ataque-formigas' },
  { value: 'ataque_roedores', label: 'Ataque de roedores', color: 'bg-causa-ataque-roedores' },
  { value: 'causa_desconhecida', label: 'Causa desconhecida', color: 'bg-causa-desconhecida' },
  { value: 'linha_pipa', label: 'Linha de pipa', color: 'bg-causa-linha-pipa' },
  { value: 'corte_obras', label: 'Corte por terceiros - OBRAS', color: 'bg-causa-corte-obras' },
  { value: 'corte_troca_poste', label: 'Corte por terceiros - Troca de poste', color: 'bg-causa-corte-poste' },
  { value: 'degradacao_fibra', label: 'Degradação de fibra', color: 'bg-causa-degradacao' },
  { value: 'descarga_eletrica', label: 'Descarga elétrica', color: 'bg-causa-descarga' },
  { value: 'incendio', label: 'Incêndio', color: 'bg-causa-incendio' },
  { value: 'atividade_implantacao', label: 'Atividade implantação', color: 'bg-causa-implantacao' },
  { value: 'fibra_quebrada_ceo', label: 'Fibra quebrada na CEO', color: 'bg-causa-fibra-ceo' },
  { value: 'furto', label: 'Furto fibra/CEO', color: 'bg-causa-furto' },
  { value: 'outros', label: 'Outros', color: 'bg-causa-outros' },
  { value: 'poda_arvore', label: 'Poda de árvore', color: 'bg-causa-poda' },
  { value: 'pigtail_conexao', label: 'Pigtail/conexão/cordão', color: 'bg-causa-pigtail' },
  { value: 'queda_arvore', label: 'Queda de árvore', color: 'bg-causa-queda' },
  { value: 'vandalismo', label: 'Vandalismo', color: 'bg-causa-vandalismo' },
];

export const STATUS: { value: StatusReparo; label: string; color: string }[] = [
  { value: 'pendente', label: 'Pendente', color: 'bg-status-pendente' },
  { value: 'enviado', label: 'Enviado', color: 'bg-status-enviado' },
  { value: 'revisao', label: 'Revisão', color: 'bg-status-revisao' },
  { value: 'concluido', label: 'Concluído', color: 'bg-status-concluido' },
];

export const CONCLUSAO_TA: { value: ConclusaoTA; label: string }[] = [
  { value: 'definitivo', label: 'Definitivo' },
  { value: 'pendente', label: 'Pendente' },
];

export const CATEGORIAS: { value: CategoriaReparo; label: string; icon: string }[] = [
  { value: 'manutencao', label: 'Manutenção', icon: 'wrench' },
  { value: 'melhoria', label: 'Melhoria', icon: 'trending-up' },
  { value: 'obras', label: 'Obras', icon: 'hard-hat' },
];

export const TIPOS_REDE: { value: TipoRede; label: string }[] = [
  { value: 'bbn', label: 'BBN' },
  { value: 'bbr', label: 'BBR' },
  { value: 'b2b', label: 'B2B' },
];

export const TIPO_FOTO: { value: TipoFoto; label: string; minRequired: number; opcional?: boolean; isRevisao?: boolean }[] = [
  { value: 'rompimento', label: 'Foto do rompimento', minRequired: 0, opcional: true },
  { value: 'caixa_emenda', label: 'Foto da caixa de emenda aberta', minRequired: 1 },
  { value: 'caixas_poste', label: 'Foto das caixas acomodadas no poste', minRequired: 1 },
  { value: 'revisao_correcao', label: 'Foto da correção (revisão)', minRequired: 0, opcional: true, isRevisao: true },
];

export const CAUSA_COLORS: Record<CausaReparo, string> = {
  carga_alta: '#f97316',
  ataque_formigas: '#84cc16',
  ataque_roedores: '#22c55e',
  causa_desconhecida: '#6b7280',
  linha_pipa: '#06b6d4',
  corte_obras: '#8b5cf6',
  corte_troca_poste: '#a855f7',
  degradacao_fibra: '#eab308',
  descarga_eletrica: '#facc15',
  incendio: '#ef4444',
  atividade_implantacao: '#14b8a6',
  fibra_quebrada_ceo: '#f43f5e',
  furto: '#dc2626',
  outros: '#6b7280',
  poda_arvore: '#10b981',
  pigtail_conexao: '#0ea5e9',
  queda_arvore: '#059669',
  vandalismo: '#ef4444',
};

export const STATUS_COLORS: Record<StatusReparo, string> = {
  pendente: '#eab308',
  enviado: '#3b82f6',
  revisao: '#f97316',
  concluido: '#22c55e',
};

export const getCausaLabel = (causa: CausaReparo): string => {
  return CAUSAS.find(c => c.value === causa)?.label || causa;
};

export const getStatusLabel = (status: StatusReparo): string => {
  return STATUS.find(s => s.value === status)?.label || status;
};

export const getConclusaoLabel = (conclusao: ConclusaoTA): string => {
  return CONCLUSAO_TA.find(c => c.value === conclusao)?.label || conclusao;
};

export const getCategoriaLabel = (categoria: CategoriaReparo): string => {
  return CATEGORIAS.find(c => c.value === categoria)?.label || categoria;
};

export const getTipoRedeLabel = (tipo: TipoRede): string => {
  return TIPOS_REDE.find(t => t.value === tipo)?.label || tipo.toUpperCase();
};
