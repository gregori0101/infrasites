import type { StatusReparo, CategoriaReparo } from '@/fiber-guardian/types/database';

export const POINTS = {
  reparo_registrado: 10,
  reparo_enviado: 15,
  reparo_concluido: 30,
  manutencao_bonus: 5,
  melhoria_bonus: 10,
  obras_bonus: 8,
  prazo_cumprido: 20,
  prazo_vencido_penalty: -10,
} as const;

export interface BadgeDefinition {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  corBg: string;
  criterio: (stats: TecnicoStats) => boolean;
}

export interface TecnicoStats {
  totalReparos: number;
  concluidos: number;
  enviados: number;
  manutencao: number;
  melhoria: number;
  obras: number;
  taxaConclusao: number;
  pontos: number;
  prazosNoPrazo: number;
  prazosVencidos: number;
  diasAtivo: number;
}

export const BADGES: BadgeDefinition[] = [
  { id: 'primeiro_reparo', nome: 'Primeiro Passo', descricao: 'Registrou o primeiro reparo', icone: '🎯', cor: 'text-blue-700 dark:text-blue-400', corBg: 'bg-blue-500/15', criterio: (s) => s.totalReparos >= 1 },
  { id: 'ativo', nome: 'Ativo', descricao: '5+ reparos concluídos', icone: '💪', cor: 'text-sky-700 dark:text-sky-400', corBg: 'bg-sky-500/15', criterio: (s) => s.concluidos >= 5 },
  { id: 'dedicado', nome: 'Dedicado', descricao: '15+ reparos concluídos', icone: '🔥', cor: 'text-orange-700 dark:text-orange-400', corBg: 'bg-orange-500/15', criterio: (s) => s.concluidos >= 15 },
  { id: 'expert', nome: 'Expert', descricao: '30+ reparos concluídos', icone: '⭐', cor: 'text-purple-700 dark:text-purple-400', corBg: 'bg-purple-500/15', criterio: (s) => s.concluidos >= 30 },
  { id: 'lenda', nome: 'Lenda', descricao: '50+ reparos concluídos', icone: '🏆', cor: 'text-yellow-700 dark:text-yellow-400', corBg: 'bg-yellow-500/15', criterio: (s) => s.concluidos >= 50 },
  { id: 'perfeicao', nome: 'Perfeição', descricao: '90%+ taxa de conclusão (mín. 5)', icone: '✅', cor: 'text-green-700 dark:text-green-400', corBg: 'bg-green-500/15', criterio: (s) => s.taxaConclusao >= 90 && s.totalReparos >= 5 },
  { id: 'volume', nome: 'Alto Volume', descricao: '20+ reparos registrados', icone: '📊', cor: 'text-indigo-700 dark:text-indigo-400', corBg: 'bg-indigo-500/15', criterio: (s) => s.totalReparos >= 20 },
  { id: 'manutencao_master', nome: 'Mestre da Manutenção', descricao: '20+ reparos de manutenção', icone: '🔧', cor: 'text-slate-700 dark:text-slate-400', corBg: 'bg-slate-500/15', criterio: (s) => s.manutencao >= 20 },
  { id: 'melhorador', nome: 'Inovador', descricao: '10+ melhorias realizadas', icone: '💡', cor: 'text-amber-700 dark:text-amber-400', corBg: 'bg-amber-500/15', criterio: (s) => s.melhoria >= 10 },
  { id: 'pontual', nome: 'Pontual', descricao: '10+ vistorias dentro do prazo', icone: '⏱️', cor: 'text-teal-700 dark:text-teal-400', corBg: 'bg-teal-500/15', criterio: (s) => s.prazosNoPrazo >= 10 },
  { id: 'construtor', nome: 'Construtor', descricao: '10+ reparos de obras', icone: '🏗️', cor: 'text-rose-700 dark:text-rose-400', corBg: 'bg-rose-500/15', criterio: (s) => s.obras >= 10 },
  { id: 'centuriao', nome: 'Centurião', descricao: '100+ reparos registrados', icone: '🛡️', cor: 'text-red-700 dark:text-red-400', corBg: 'bg-red-500/15', criterio: (s) => s.totalReparos >= 100 },
];

export interface NivelDefinition {
  nivel: number;
  nome: string;
  pontosMin: number;
  cor: string;
}

export const NIVEIS: NivelDefinition[] = [
  { nivel: 1, nome: 'Iniciante', pontosMin: 0, cor: 'from-slate-400 to-slate-500' },
  { nivel: 2, nome: 'Aprendiz', pontosMin: 100, cor: 'from-blue-400 to-blue-600' },
  { nivel: 3, nome: 'Competente', pontosMin: 300, cor: 'from-green-400 to-green-600' },
  { nivel: 4, nome: 'Habilidoso', pontosMin: 600, cor: 'from-purple-400 to-purple-600' },
  { nivel: 5, nome: 'Experiente', pontosMin: 1000, cor: 'from-orange-400 to-orange-600' },
  { nivel: 6, nome: 'Mestre', pontosMin: 1500, cor: 'from-red-400 to-red-600' },
  { nivel: 7, nome: 'Grão-Mestre', pontosMin: 2500, cor: 'from-yellow-400 to-yellow-600' },
  { nivel: 8, nome: 'Lenda', pontosMin: 4000, cor: 'from-amber-300 to-yellow-500' },
];

export function calcularPontos(reparo: {
  status: StatusReparo;
  categoria: CategoriaReparo;
  prazo_vistoria?: string | null;
}): number {
  let pontos = POINTS.reparo_registrado;
  if (reparo.status === 'enviado' || reparo.status === 'revisao' || reparo.status === 'concluido') {
    pontos += POINTS.reparo_enviado;
  }
  if (reparo.status === 'concluido') {
    pontos += POINTS.reparo_concluido;
  }
  if (reparo.categoria === 'manutencao') pontos += POINTS.manutencao_bonus;
  else if (reparo.categoria === 'melhoria') pontos += POINTS.melhoria_bonus;
  else if (reparo.categoria === 'obras') pontos += POINTS.obras_bonus;
  return pontos;
}

export function getNivel(pontos: number): NivelDefinition {
  let nivel = NIVEIS[0];
  for (const n of NIVEIS) {
    if (pontos >= n.pontosMin) nivel = n;
  }
  return nivel;
}

export function getProximoNivel(pontos: number): NivelDefinition | null {
  const atual = getNivel(pontos);
  const idx = NIVEIS.findIndex(n => n.nivel === atual.nivel);
  return idx < NIVEIS.length - 1 ? NIVEIS[idx + 1] : null;
}

export function getProgressoNivel(pontos: number): number {
  const atual = getNivel(pontos);
  const proximo = getProximoNivel(pontos);
  if (!proximo) return 100;
  const range = proximo.pontosMin - atual.pontosMin;
  const progresso = pontos - atual.pontosMin;
  return Math.min(100, Math.round((progresso / range) * 100));
}

export function getBadgesConquistadas(stats: TecnicoStats): BadgeDefinition[] {
  return BADGES.filter(b => b.criterio(stats));
}
