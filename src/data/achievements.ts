import {
  Trophy, Star, Zap, Heart, Clock, BookOpen, Flame, Moon,
  Target, Crown, GraduationCap, Swords, Brain, Calendar, Sparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type AchievementCategory = 'study' | 'pet' | 'streak' | 'special';

export interface AchievementContext {
  studyTimeSeconds: number;
  completedTopics: Record<string, string>;
  moduleProgress: Record<string, { completed: number; total: number; pct: number }>;
  xp: number;
  petLevel: number;
  currentStreak: number;
  petHappiness: number;
  petHunger: number;
  totalReviewsDone: number;
  missionsCompleted: number;
  hourOfDay: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: LucideIcon;
  category: AchievementCategory;
  check: (ctx: AchievementContext) => boolean;
}

const SECONDS_IN_10H = 36_000;
const SECONDS_IN_100H = 360_000;

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_module',
    name: 'Primeiro Módulo',
    desc: 'Completou o primeiro módulo',
    icon: BookOpen,
    category: 'study',
    check: (ctx) => Object.values(ctx.moduleProgress).some(p => p.pct === 100),
  },
  {
    id: 'first_10h',
    name: 'Primeiras 10h',
    desc: '10 horas de estudo',
    icon: Clock,
    category: 'study',
    check: (ctx) => ctx.studyTimeSeconds >= SECONDS_IN_10H,
  },
  {
    id: '100h',
    name: 'Mestre do ENEM',
    desc: '100 horas líquidas de estudo',
    icon: Trophy,
    category: 'study',
    check: (ctx) => ctx.studyTimeSeconds >= SECONDS_IN_100H,
  },
  {
    id: '500_topics',
    name: 'Maratonista',
    desc: '500 tópicos estudados',
    icon: Target,
    category: 'study',
    check: (ctx) => Object.keys(ctx.completedTopics).length >= 500,
  },
  {
    id: 'half_marathon',
    name: 'Meio Caminho',
    desc: '50% do conteúdo concluído',
    icon: GraduationCap,
    category: 'study',
    check: (ctx) => {
      const total = Object.values(ctx.moduleProgress).reduce((sum, p) => sum + p.total, 0);
      const done = Object.keys(ctx.completedTopics).length;
      return total > 0 && done / total >= 0.5;
    },
  },
  {
    id: 'all_reviews',
    name: 'Revisionista',
    desc: '50+ revisões concluídas',
    icon: Brain,
    category: 'study',
    check: (ctx) => ctx.totalReviewsDone >= 50,
  },
  {
    id: 'week',
    name: 'Foco Semanal',
    desc: '7 dias de estudo consecutivos',
    icon: Star,
    category: 'streak',
    check: (ctx) => ctx.currentStreak >= 7,
  },
  {
    id: '30_streak',
    name: 'Imparável',
    desc: '30 dias de sequência',
    icon: Flame,
    category: 'streak',
    check: (ctx) => ctx.currentStreak >= 30,
  },
  {
    id: 'happy',
    name: 'Pet Radiante',
    desc: 'Pet com felicidade alta',
    icon: Heart,
    category: 'pet',
    check: (ctx) => ctx.petHappiness >= 80,
  },
  {
    id: 'max_level',
    name: 'Pet Lendário',
    desc: 'Pet alcançou nível 50+',
    icon: Crown,
    category: 'pet',
    check: (ctx) => ctx.petLevel >= 50,
  },
  {
    id: 'hungry_hero',
    name: 'Herói da Fome',
    desc: 'Manteve o pet bem alimentado',
    icon: Calendar,
    category: 'pet',
    check: (ctx) => ctx.petHunger >= 70,
  },
  {
    id: 'early',
    name: 'Madrugador',
    desc: 'Estudou antes das 8h',
    icon: Zap,
    category: 'special',
    check: (ctx) => ctx.hourOfDay < 8 && ctx.studyTimeSeconds > 0,
  },
  {
    id: 'night_owl',
    name: 'Coruja Noturna',
    desc: 'Estudou depois da meia-noite',
    icon: Moon,
    category: 'special',
    check: (ctx) => ctx.hourOfDay < 5 && ctx.studyTimeSeconds > 0,
  },
  {
    id: '5000_xp',
    name: 'Colecionador',
    desc: 'Acumulou 5.000 XP',
    icon: Sparkles,
    category: 'special',
    check: (ctx) => ctx.xp >= 5000,
  },
  {
    id: 'missions_10',
    name: 'Missioneiro',
    desc: '10 missões completadas',
    icon: Swords,
    category: 'special',
    check: (ctx) => ctx.missionsCompleted >= 10,
  },
];

export const CATEGORY_LABELS: Record<AchievementCategory | 'all', string> = {
  all: 'Todos',
  study: 'Estudo',
  pet: 'Pet',
  streak: 'Sequência',
  special: 'Especial',
};
