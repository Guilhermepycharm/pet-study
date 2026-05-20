import { useMemo } from 'react';
import { format, differenceInDays, parseISO, subDays, isAfter, startOfDay } from 'date-fns';
import { MODULES } from '../data/modules';
import type { CompletedTopics, ReviewsDone, MissionState, Settings } from '../types';

export interface StatsResult {
  totalTopics: number;
  completedTopicsCount: number;
  overallPct: number;
  totalStudySeconds: number;
  totalStudyHours: number;
  totalStudyMinutes: number;
  xp: number;
  petLevel: number;
  currentStreak: number;
  daysUntilExam: number | null;
  areaProgress: { area: string; completed: number; total: number; pct: number }[];
  weeklyActivity: { day: string; minutes: number; date: string }[];
  dailyAverage: number;
  mostProductiveDay: string;
  totalReviewsDone: number;
  dueReviewsCount: number;
  missionsCompleted: number;
  missionsTotal: number;
}

type ModuleProgress = Record<string, { completed: number; total: number; pct: number }>;
type DailyStudyLog = Record<string, number>;

const AREAS = [
  { id: 'matematica', label: 'Matemática', subjects: ['Matemática'] },
  { id: 'naturezas', label: 'Ciências da Natureza', subjects: ['Biologia', 'Física', 'Química'] },
  { id: 'linguagens', label: 'Linguagens', subjects: ['Português', 'Literatura', 'Redação'] },
  { id: 'humanas', label: 'Ciências Humanas', subjects: ['História', 'Geografia', 'Filosofia', 'Sociologia'] }
];

export function useStats(
  completedTopics: CompletedTopics,
  reviewsDone: ReviewsDone,
  moduleProgress: ModuleProgress,
  studyTimeSeconds: number,
  dailyStudyLog: DailyStudyLog,
  xp: number,
  missions: MissionState,
  dueReviewsCount: number,
  settings: Settings
): StatsResult {
  return useMemo(() => {
    const totalTopics = MODULES.reduce((sum, m) => sum + m.items.length, 0);
    const completedTopicsCount = Object.keys(completedTopics).length;
    const overallPct = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

    const totalStudyHours = Math.floor(studyTimeSeconds / 3600);
    const totalStudyMinutes = Math.floor((studyTimeSeconds % 3600) / 60);

    const petLevel = Math.floor(xp / 100) + 1;

    // Streak calculation
    let currentStreak = 0;
    const today = startOfDay(new Date());
    for (let i = 0; i < 365; i++) {
      const d = subDays(today, i);
      const key = format(d, 'yyyy-MM-dd');
      if (dailyStudyLog[key] && dailyStudyLog[key] > 0) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Days until exam
    let daysUntilExam: number | null = null;
    try {
      const examDate = parseISO(settings.examDate);
      if (isAfter(examDate, new Date())) {
        daysUntilExam = differenceInDays(examDate, new Date());
      }
    } catch {
      // ignore
    }

    // Area progress
    const areaProgress = AREAS.map(area => {
      const areaModules = MODULES.filter(m => area.subjects.includes(m.subject));
      const total = areaModules.reduce((s, m) => s + m.items.length, 0);
      const completed = areaModules.reduce((s, m) => {
        const mp = moduleProgress[m.id];
        return s + (mp?.completed ?? 0);
      }, 0);
      return {
        area: area.label,
        completed,
        total,
        pct: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    // Weekly activity (last 7 days)
    const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyActivity: { day: string; minutes: number; date: string }[] = [];
    let weekTotal = 0;
    let maxMinutes = 0;
    let mostProductiveDay = '-';

    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const key = format(d, 'yyyy-MM-dd');
      const minutes = Math.round((dailyStudyLog[key] ?? 0) / 60);
      const dayLabel = i === 0 ? 'Hoje' : i === 1 ? 'Ontem' : DAY_LABELS[d.getDay()];
      weeklyActivity.push({ day: dayLabel, minutes, date: key });
      weekTotal += minutes;
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        mostProductiveDay = dayLabel;
      }
    }

    const dailyAverage = Math.round(weeklyActivity.reduce((s, d) => s + d.minutes, 0) / 7);

    const totalReviewsDone = Object.keys(reviewsDone).length;
    const allMissions = [
      ...(missions?.daily ?? []),
      ...(missions?.weekly ?? []),
      ...(missions?.bonus ? [missions.bonus] : [])
    ];
    const missionsCompleted = allMissions.filter(m => m.completed).length;
    const missionsTotal = allMissions.length;

    return {
      totalTopics,
      completedTopicsCount,
      overallPct,
      totalStudySeconds: studyTimeSeconds,
      totalStudyHours,
      totalStudyMinutes,
      xp,
      petLevel,
      currentStreak,
      daysUntilExam,
      areaProgress,
      weeklyActivity,
      dailyAverage,
      mostProductiveDay,
      totalReviewsDone,
      dueReviewsCount,
      missionsCompleted,
      missionsTotal
    };
  }, [completedTopics, reviewsDone, moduleProgress, studyTimeSeconds, dailyStudyLog, xp, missions, dueReviewsCount, settings]);
}
