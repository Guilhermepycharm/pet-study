import { useEffect, useCallback } from 'react';
import { format, addDays, differenceInDays, parseISO, startOfWeek } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { MissionState, DailyMission, WeeklyGoal, WeeklyMission, PetState } from '../types';

const DEFAULT_MISSIONS: MissionState = {
  daily: [],
  bonus: null,
  weekly: [],
  lastGenerated: '',
  lastDailyGenerated: '',
  lastWeeklyGenerated: '',
  streak: 0,
  lastStreakDate: ''
};

export function useMissions(
  realToday: string,
  pet: PetState | null,
  pendingTopicsCount: number,
  dueReviewsCount: number,
  weeklyHourGoal: number,
  currentWeeklyHours: number
) {
  const [missions, setMissions] = useLocalStorage<MissionState>('enem-missions', DEFAULT_MISSIONS);
  const [weeklyGoal, setWeeklyGoal] = useLocalStorage<WeeklyGoal>('enem-weekly-goal', {
    targetHours: 10,
    currentHours: 0,
    lastWeekReset: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    claimed: false
  });

  // Sync weekly goal hours
  useEffect(() => {
    setWeeklyGoal(prev => ({ ...prev, targetHours: weeklyHourGoal, currentHours: currentWeeklyHours }));
  }, [weeklyHourGoal, currentWeeklyHours, setWeeklyGoal]);

  // Mission Generation Logic
  useEffect(() => {
    const today = realToday;
    const monday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    setMissions(prev => {
      let changed = false;
      let newWeekly = [...prev.weekly];
      let lastWeeklyGenerated = prev.lastWeeklyGenerated;

      if (prev.lastWeeklyGenerated !== monday) {
        newWeekly = [
          {
            id: `weekly_hours_${monday}`,
            type: 'study_hours',
            description: `Estudar ${weeklyGoal.targetHours} horas na semana`,
            target: weeklyGoal.targetHours,
            progress: 0,
            reward: 300,
            completed: false,
            claimed: false
          },
          {
            id: `weekly_modules_${monday}`,
            type: 'complete_modules',
            description: 'Completar 3 módulos',
            target: 3,
            progress: 0,
            reward: 200,
            completed: false,
            claimed: false
          },
          {
            id: `weekly_pet_${monday}`,
            type: 'happy_pet_days',
            description: 'Manter a felicidade do pet ≥ 70% por 5 dias',
            target: 5,
            progress: 0,
            reward: 300,
            completed: false,
            claimed: false
          }
        ];
        lastWeeklyGenerated = monday;
        changed = true;
      }

      const lastDailyGened = prev.lastDailyGenerated || prev.lastGenerated;
      let newDaily = [...prev.daily];
      let newBonus = prev.bonus;
      let newLastDailyGenerated = lastDailyGened;
      let newStreak = prev.streak;

      if (lastDailyGened !== today) {
        // Streak logic
        const yesterday = format(addDays(parseISO(today), -1), 'yyyy-MM-dd');
        const completedYesterday = prev.daily.filter(m => m.completed).length;

        if (lastDailyGened === yesterday) {
          if (completedYesterday >= 2 && prev.lastStreakDate !== today) {
            newStreak += 1;
          }
        } else if (lastDailyGened && differenceInDays(parseISO(today), parseISO(lastDailyGened)) > 1) {
          newStreak = 0;
        }

        const pool: DailyMission[] = [];
        const isWeekend = [0, 6].includes(new Date().getDay());

        if (isWeekend) {
           pool.push(
            { id: `play_${today}`, type: 'play_pet', description: 'Brincar com o pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false },
            { id: `feed_${today}`, type: 'feed_pet', description: 'Alimentar o pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false },
            { id: `study_light_${today}`, type: 'study_time', description: 'Revisar notas por 15 min', target: 15, progress: 0, reward: 15, completed: false, claimed: false },
            { id: `pet_${today}`, type: 'afagar', description: 'Afagar o pet', target: 1, progress: 0, reward: 10, completed: false, claimed: false }
           );
        } else {
          pool.push({
            id: `study_time_${today}`,
            type: 'study_time',
            description: `Estudar 60 minutos`,
            target: 60,
            progress: 0,
            reward: 30,
            completed: false,
            claimed: false
          });

          if (pendingTopicsCount > 0) {
            pool.push({
              id: `topics_${today}`,
              type: 'complete_topics',
              description: `Completar 2 tópicos`,
              target: 2,
              progress: 0,
              reward: 20,
              completed: false,
              claimed: false
            });
          }
        }

        newDaily = pool.sort(() => 0.5 - Math.random()).slice(0, 3);
        newBonus = null;
        newLastDailyGenerated = today;
        changed = true;
      }

      if (changed) {
        return {
          ...prev,
          daily: newDaily,
          bonus: newBonus,
          weekly: newWeekly,
          lastDailyGenerated: newLastDailyGenerated,
          lastGenerated: newLastDailyGenerated,
          lastWeeklyGenerated,
          streak: newStreak
        };
      }
      return prev;
    });
  }, [realToday, pendingTopicsCount, dueReviewsCount, pet?.happiness, weeklyGoal.targetHours]);

  const claimMissionReward = useCallback((missionId: string, isWeekly = false, isBonus = false, onReward: (xp: number) => void) => {
    setMissions(prev => {
      let reward = 0;
      const newDaily = prev.daily.map(m => {
        if (!isWeekly && !isBonus && m.id === missionId && m.completed && !m.claimed) {
          reward = m.reward;
          return { ...m, claimed: true };
        }
        return m;
      });
      
      const newWeekly = prev.weekly.map(m => {
        if (isWeekly && m.id === missionId && m.completed && !m.claimed) {
          reward = m.reward;
          return { ...m, claimed: true };
        }
        return m;
      });

      let newBonus = prev.bonus;
      if (isBonus && prev.bonus?.id === missionId && prev.bonus.completed && !prev.bonus.claimed) {
        reward = prev.bonus.reward;
        newBonus = { ...prev.bonus, claimed: true };
      }

      if (reward > 0) onReward(reward);

      return { ...prev, daily: newDaily, weekly: newWeekly, bonus: newBonus };
    });
  }, [setMissions]);

  return {
    missions,
    setMissions,
    weeklyGoal,
    setWeeklyGoal,
    claimMissionReward
  };
}
