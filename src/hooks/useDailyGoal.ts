// useDailyGoal.ts — hook simples pra meta de minutos por dia
// salva tudo no localStorage, essa API é só a gambiarra mas funciona
import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface DailyGoal {
  targetMinutes: number;
}

interface DailyGoalProgress {
  currentMinutes: number;
  targetMinutes: number;
  pct: number;
  reached: boolean;
}

export function useDailyGoal() {
  const [goal, setGoal] = useLocalStorage<DailyGoal>('catstudy-daily-goal', { targetMinutes: 120 });

  const setTargetMinutes = useCallback((mins: number) => {
    setGoal({ targetMinutes: Math.max(15, Math.min(480, mins)) });
  }, [setGoal]);

  // M9: memoiza corretamente — goal.targetMinutes muda entre renders
  const getProgress = useCallback((todaySeconds: number): DailyGoalProgress => {
    const currentMinutes = Math.floor(todaySeconds / 60);
    const targetMinutes = goal.targetMinutes;
    const pct = targetMinutes > 0 ? Math.min(100, Math.round((currentMinutes / targetMinutes) * 100)) : 0;
    return { currentMinutes, targetMinutes, pct, reached: currentMinutes >= targetMinutes };
  }, [goal.targetMinutes]);

  return { goal, setTargetMinutes, getProgress };
}
