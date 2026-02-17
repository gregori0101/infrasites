// Gamification logic - levels, XP, badges (pure functions, no DB)

export interface TechnicianStats {
  total: number;
  monthly: number;
  today: number;
  rank: number;
  totalTechnicians: number;
  consecutiveDays: number;
  maxInOneDay: number;
}

export interface LevelInfo {
  level: number;
  name: string;
  emoji: string;
  minSurveys: number;
  maxSurveys: number; // -1 = infinite
  xp: number;
  xpForNextLevel: number;
  progress: number; // 0-100
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlocked: boolean;
}

const LEVELS = [
  { level: 1, name: 'Novato', emoji: '🌱', min: 0, max: 4 },
  { level: 2, name: 'Aprendiz', emoji: '📘', min: 5, max: 14 },
  { level: 3, name: 'Inspetor', emoji: '🔍', min: 15, max: 29 },
  { level: 4, name: 'Inspetor Sênior', emoji: '⭐', min: 30, max: 49 },
  { level: 5, name: 'Especialista', emoji: '🏆', min: 50, max: 99 },
  { level: 6, name: 'Mestre', emoji: '👑', min: 100, max: 199 },
  { level: 7, name: 'Lenda', emoji: '🔥', min: 200, max: -1 },
];

const XP_PER_SURVEY = 10;

export function getLevel(totalSurveys: number): LevelInfo {
  let currentLevel = LEVELS[0];
  for (const l of LEVELS) {
    if (totalSurveys >= l.min) currentLevel = l;
  }

  const xp = totalSurveys * XP_PER_SURVEY;
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  let progress = 100;
  let xpForNextLevel = 0;

  if (nextLevel) {
    const surveysInLevel = totalSurveys - currentLevel.min;
    const levelRange = nextLevel.min - currentLevel.min;
    progress = Math.min(100, Math.round((surveysInLevel / levelRange) * 100));
    xpForNextLevel = nextLevel.min * XP_PER_SURVEY;
  }

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    emoji: currentLevel.emoji,
    minSurveys: currentLevel.min,
    maxSurveys: currentLevel.max,
    xp,
    xpForNextLevel,
    progress,
  };
}

export function getBadges(stats: TechnicianStats): BadgeInfo[] {
  return [
    {
      id: 'first',
      name: 'Primeira Vistoria',
      description: 'Completar a primeira vistoria',
      emoji: '🎯',
      unlocked: stats.total >= 1,
    },
    {
      id: 'lightning',
      name: 'Relâmpago',
      description: '3 vistorias em um único dia',
      emoji: '⚡',
      unlocked: stats.maxInOneDay >= 3,
    },
    {
      id: 'marathon',
      name: 'Maratonista',
      description: '5 vistorias em um único dia',
      emoji: '🏃',
      unlocked: stats.maxInOneDay >= 5,
    },
    {
      id: 'consistent',
      name: 'Consistente',
      description: 'Vistorias em 5 dias consecutivos',
      emoji: '📅',
      unlocked: stats.consecutiveDays >= 5,
    },
    {
      id: 'centurion',
      name: 'Centenário',
      description: '100 vistorias no total',
      emoji: '💯',
      unlocked: stats.total >= 100,
    },
  ];
}
