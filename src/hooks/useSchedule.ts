import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, addDays, addHours, differenceInDays, parseISO, isSunday, startOfWeek, endOfWeek, isWithinInterval, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MODULES, Module } from '../data/modules';

import { ACCESSORIES_CATALOG } from '../data/accessories';

export interface CompletedTopics {
  [topicKey: string]: string; // moduleId__index -> doneDateIso
}

export interface ReviewsDone {
  [reviewKey: string]: string; // moduleId__index__stageKey -> doneDateIso
}

export interface Settings {
  startDate: string;
  examDate: string;
  focusDate: string;
  delayedMode: boolean;
}

export const REVIEW_STAGES = [
  { key: 'r1', label: 'R1 (24h)', days: 1 },
  { key: 'r2', label: 'R2 (7d)', days: 7 },
  { key: 'r3', label: 'R3 (21d)', days: 21 },
  { key: 'r4', label: 'R4 (45d)', days: 45 }
];

const AREA_CONFIG: { [key: string]: { label: string; subjects: string[] } } = {
  matematica: { label: 'Matemática', subjects: ['Matemática'] },
  naturezas: { label: 'Ciências da Natureza', subjects: ['Biologia', 'Física', 'Química'] },
  linguagens: { label: 'Linguagens', subjects: ['Português', 'Literatura', 'Redação'] },
  humanas: { label: 'Ciências Humanas', subjects: ['História', 'Geografia', 'Filosofia', 'Sociologia'] }
};

const SUBJECTS = Array.from(new Set(MODULES.map(m => m.subject)));

interface PetDiaryEntry {
  timestamp: string;
  text: string;
}

export interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  wardrobe?: string[];
  activeAccessory?: string | null;
  accessories: {
    owned: string[];
    equipped: {
      facial: string | null;
      head: string | null;
      body: string | null;
      skin: string | null;
    };
  };
  chestTracker: {
    lastOpenedStreak: number;
    obtainedExclusives: string[];
  };
  achievements: string[];
  diary: PetDiaryEntry[];
  lastUpdate: string;
  isSick: boolean;
  dirtiness: number;
  isDead: boolean;
  deathTimestamp: string | null;
  audioEnabled: boolean;
  usedPromoCodes?: { [code: string]: string };
}

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface MissionState {
  daily: DailyMission[];
  bonus: DailyMission | null;
  weekly: WeeklyMission[];
  lastGenerated: string;
  lastDailyGenerated: string;
  lastWeeklyGenerated: string;
  streak: number;
  lastStreakDate: string;
}

export interface WeeklyMission {
  id: string;
  type: WeeklyMissionType;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyGoal {
  targetHours: number;
  currentHours: number;
  lastWeekReset: string;
  claimed: boolean;
}

export type DailyMissionType =
  | 'study_time'
  | 'complete_topics'
  | 'complete_module'
  | 'reviews'
  | 'feed_pet'
  | 'play_pet'
  | 'bath_pet'
  | 'cure_pet'
  | 'afagar';

export type WeeklyMissionType = 'study_hours' | 'complete_modules' | 'happy_pet_days';

export type PetAction =
  | 'feed'
  | 'play'
  | 'clean'
  | 'bath'
  | 'brush'
  | 'sleep'
  | 'coffee'
  | 'medicine'
  | 'revive'
  | 'rub_clean'
  | 'toggle_audio'
  | 'buy_accessory'
  | 'equip_accessory'
  | 'rename'
  | 'debug_set_stats'
  | 'clear_diary'
  | 'open_chest'
  | 'afagar';

const MISSION_TEMPLATES = [
  { type: 'study_time', description: 'Estudar {target} minutos', targets: [30, 60, 90], rewardBase: 0.5 },
  { type: 'complete_topics', description: 'Completar {target} tópicos', targets: [2, 4, 6], rewardBase: 5 },
  { type: 'complete_module', description: 'Completar um módulo inteiro', targets: [1], rewardBase: 30 },
  { type: 'reviews', description: 'Fazer {target} revisões', targets: [2, 4, 8], rewardBase: 3 },
  { type: 'feed_pet', description: 'Alimentar o pet', targets: [1], rewardBase: 20 },
  { type: 'play_pet', description: 'Brincar com o pet', targets: [1], rewardBase: 20 },
  { type: 'bath_pet', description: 'Dê banho no pet', targets: [1], rewardBase: 20 },
  { type: 'cure_pet', description: 'Cure o pet de uma doença', targets: [1], rewardBase: 20 },
] as const;

export function useSchedule() {
  const [settings, setSettings] = useState<Settings>(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    try {
      const saved = localStorage.getItem('enem-settings-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.startDate && parsed.examDate) return { ...parsed, focusDate: today };
      }
    } catch (e) {
      console.error("Error parsing settings", e);
    }
    return {
      startDate: today,
      examDate: '2026-11-08',
      focusDate: today,
      delayedMode: true
    };
  });

  const [realToday, setRealToday] = useState(format(new Date(), 'yyyy-MM-dd'));
  useEffect(() => {
    const interval = setInterval(() => {
      const currentToday = format(new Date(), 'yyyy-MM-dd');
      if (currentToday !== realToday) {
        setRealToday(currentToday);
        setSettings(prev => ({
          ...prev,
          focusDate: currentToday
        }));
      }
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, [realToday]);

  const [studyTimeSeconds, setStudyTimeSeconds] = useState<number>(() => {
    const saved = localStorage.getItem('enem-study-time');
    return saved ? parseInt(saved) : 0;
  });

  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('enem-xp');
    const savedXp = saved ? parseInt(saved) : 0;
    
    const savedTime = localStorage.getItem('enem-study-time');
    const totalSeconds = savedTime ? parseInt(savedTime) : 0;
    const expectedXp = Math.floor(totalSeconds / 60);
    
    if (savedXp === 0 && expectedXp > 0) {
      return expectedXp;
    }
    
    return savedXp;
  });

  const [pet, setPet] = useState<PetState>(() => {
    const defaultPet: PetState = {
      name: "Mimi",
      hunger: 100,
      happiness: 100,
      energy: 100,
      accessories: {
        owned: [],
        equipped: { facial: null, head: null, body: null, skin: null }
      },
      chestTracker: {
        lastOpenedStreak: 0,
        obtainedExclusives: []
      },
      achievements: [],
      diary: [{ timestamp: new Date().toISOString(), text: "Bem-vindo ao seu novo lar! Miau!" }],
      lastUpdate: new Date().toISOString(),
      isSick: false,
      dirtiness: 0,
      isDead: false,
      deathTimestamp: null,
      audioEnabled: false,
      usedPromoCodes: {}
    };
    try {
      const saved = localStorage.getItem('enem-pet');
      if (!saved) return defaultPet;
      
      const parsed = JSON.parse(saved);
      if (!parsed.name) parsed.name = "Gato";
      
      if (parsed.wardrobe) {
        let mappedEquipped = { facial: null, head: null, body: null, skin: null };
        if (parsed.activeAccessory) {
           const catItem = ACCESSORIES_CATALOG.find(a => a.id === parsed.activeAccessory);
           if (catItem) {
             (mappedEquipped as any)[catItem.category] = catItem.id;
           }
        }

        parsed.accessories = {
          owned: parsed.wardrobe || [],
          equipped: mappedEquipped
        };
        delete parsed.wardrobe;
        delete parsed.activeAccessory;
      }
      
      if (!parsed.accessories) {
        parsed.accessories = defaultPet.accessories;
      }
      if (!parsed.chestTracker) {
        parsed.chestTracker = defaultPet.chestTracker;
      }
      if (!parsed.achievements) parsed.achievements = [];
      if (!parsed.diary) parsed.diary = [];
      if (parsed.activeAccessory === undefined) parsed.activeAccessory = null;
      if (parsed.isSick === undefined) parsed.isSick = false;
      if (parsed.dirtiness === undefined) parsed.dirtiness = 0;
      if (parsed.isDead === undefined) parsed.isDead = false;
      if (parsed.deathTimestamp === undefined) parsed.deathTimestamp = null;
      if (parsed.audioEnabled === undefined) parsed.audioEnabled = false;
      if (parsed.usedPromoCodes === undefined) parsed.usedPromoCodes = {};

      const lastUpdate = parseISO(parsed.lastUpdate || new Date().toISOString());
      const now = new Date();
      
      let currentHunger = parsed.hunger || 100;
      let currentEnergy = parsed.energy || 100;
      let currentHappiness = parsed.happiness || 100;
      let currentDirtiness = parsed.dirtiness || 0;
      let currentIsSick = parsed.isSick || false;

      const totalHours = differenceInHours(now, lastUpdate);
      if (totalHours > 0 && !parsed.isDead) {
        let tempDate = lastUpdate;
        const maxHours = Math.min(totalHours, 720); // Max 30 days of simulation
        
        for (let i = 0; i < maxHours; i++) {
          tempDate = addHours(tempDate, 1);
          const dayOfWeek = tempDate.getDay();
          const isRest = dayOfWeek === 0 || dayOfWeek === 6;
          if (!currentIsSick) {
            let sickChance = 0.02;
            if (currentHunger < 30) sickChance += 0.10;
            if (currentHappiness < 30) sickChance += 0.10;
            if (currentEnergy < 20) sickChance += 0.15;
            if (currentDirtiness >= 30) sickChance += 0.10;
            sickChance = Math.min(0.50, sickChance);
            if (Math.random() < sickChance) {
              currentIsSick = true;
            }
          }

          if (isRest) {
            currentHunger -= 0.5;
            currentEnergy += 1;
            currentHappiness -= 0.2;
            currentDirtiness += 1;
          } else {
            currentHunger -= 5;
            currentEnergy -= 3;
            currentHappiness -= 2;
            currentDirtiness += 5;
          }

          if (currentIsSick) {
            currentHappiness -= 4; // Extra decay when sick
          }
          if (currentDirtiness >= 30) {
            currentHappiness -= 1; // Extra decay when dirty
          }

          currentHunger = Math.max(0, currentHunger);
          currentEnergy = Math.min(100, Math.max(0, currentEnergy));
          currentHappiness = Math.max(0, currentHappiness);
          currentDirtiness = Math.min(100, Math.max(0, currentDirtiness));

          if (currentHunger === 0 && currentEnergy === 0 && currentHappiness === 0) {
            return {
              ...parsed,
              hunger: 0,
              energy: 0,
              happiness: 0,
              isDead: true,
              deathTimestamp: tempDate.toISOString(),
              lastUpdate: now.toISOString()
            };
          }
        }

        return {
          ...parsed,
          hunger: currentHunger,
          energy: currentEnergy,
          happiness: currentHappiness,
          dirtiness: currentDirtiness,
          isSick: currentIsSick,
          lastUpdate: now.toISOString()
        };
      }
      return parsed;
    } catch (e) {
      console.error("Error parsing pet", e);
      return defaultPet;
    }
  });

  const [completedTopics, setCompletedTopics] = useState<CompletedTopics>(() => {
    try {
      const saved = localStorage.getItem('enem-completed-topics');
      if (saved) return JSON.parse(saved) || {};
    } catch (e) {
      console.error("Error parsing topics", e);
    }
    return {};
  });

  const [reviewsDone, setReviewsDone] = useState<ReviewsDone>(() => {
    try {
      const saved = localStorage.getItem('enem-reviews-done-v2');
      if (saved) return JSON.parse(saved) || {};
    } catch (e) {
      console.error("Error parsing reviews", e);
    }
    return {};
  });

  const [manualAssignments, setManualAssignments] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('enem-manual-assignments');
      if (saved) return JSON.parse(saved) || {};
    } catch (e) {
      console.error("Error parsing assignments", e);
    }
    return {};
  });

  const [dailyStudyLog, setDailyStudyLog] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('enem-daily-study-log');
      if (saved) return JSON.parse(saved) || {};
    } catch (e) {
      console.error("Error parsing study log", e);
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('enem-daily-study-log', JSON.stringify(dailyStudyLog));
  }, [dailyStudyLog]);

  const [subjectOrder, setSubjectOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('enem-subject-order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Error parsing subject order", e);
    }
    return SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem('enem-subject-order', JSON.stringify(subjectOrder));
  }, [subjectOrder]);

  useEffect(() => {
    localStorage.setItem('enem-completed-topics', JSON.stringify(completedTopics));
  }, [completedTopics]);

  useEffect(() => {
    localStorage.setItem('enem-reviews-done-v2', JSON.stringify(reviewsDone));
  }, [reviewsDone]);

  useEffect(() => {
    localStorage.setItem('enem-manual-assignments', JSON.stringify(manualAssignments));
  }, [manualAssignments]);

  useEffect(() => {
    localStorage.setItem('enem-settings-v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('enem-study-time', studyTimeSeconds.toString());
  }, [studyTimeSeconds]);

  useEffect(() => {
    localStorage.setItem('enem-xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('enem-pet', JSON.stringify(pet));
  }, [pet]);

  const [missions, setMissions] = useState<MissionState>(() => {
    const defaultState: MissionState = {
      daily: [],
      bonus: null,
      weekly: [],
      lastGenerated: '',
      lastDailyGenerated: '',
      lastWeeklyGenerated: '',
      streak: 0,
      lastStreakDate: ''
    };
    try {
      const saved = localStorage.getItem('enem-missions');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error("Error parsing missions", e);
    }
    return defaultState;
  });

  const [weeklyGoal, setWeeklyGoal] = useState<WeeklyGoal>(() => {
    const monday = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const defaultState: WeeklyGoal = {
      targetHours: 10,
      currentHours: 0,
      lastWeekReset: monday,
      claimed: false
    };
    try {
      const saved = localStorage.getItem('enem-weekly-goal');
      if (saved) return JSON.parse(saved) || defaultState;
    } catch (e) {
      console.error("Error parsing weekly goal", e);
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('enem-missions', JSON.stringify(missions));
  }, [missions]);

  useEffect(() => {
    localStorage.setItem('enem-weekly-goal', JSON.stringify(weeklyGoal));
  }, [weeklyGoal]);

  const getPendingTopicsCount = useCallback(() => {
    let pending = 0;
    MODULES.forEach(m => {
      pending += m.items.length - (m.items.filter((_, idx) => !!completedTopics[`${m.id}__${idx}`]).length);
    });
    return pending;
  }, [completedTopics]);

  const getDueReviewsCount = useCallback((todayIso: string) => {
    let count = 0;
    Object.entries(completedTopics).forEach(([key, doneDate]) => {
      const diff = differenceInDays(parseISO(todayIso), parseISO(doneDate as string));
      REVIEW_STAGES.forEach(stage => {
        if (diff >= stage.days) {
          const reviewKey = `${key}__${stage.key}`;
          if (!reviewsDone[reviewKey]) {
            count++;
          }
        }
      });
    });
    return count;
  }, [completedTopics, reviewsDone]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
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
        const yesterdayDate = addDays(new Date(), -1);
        const yesterday = format(yesterdayDate, 'yyyy-MM-dd');
        const yesterdayDayOfWeek = yesterdayDate.getDay();
        const wasYesterdayRestDay = yesterdayDayOfWeek === 0 || yesterdayDayOfWeek === 6;
        const completedYesterday = prev.daily.filter(m => m.completed).length;

        if (lastDailyGened === yesterday) {
          if (completedYesterday >= 2 && prev.lastStreakDate !== today) {
            newStreak += 1;
          } else if (!wasYesterdayRestDay && completedYesterday < 2) {
            newStreak = 0;
          }
        } else if (lastDailyGened && lastDailyGened !== today) {
          const gapDays = differenceInDays(new Date(), parseISO(lastDailyGened));
          if (gapDays > 2) {
             newStreak = 0; 
          } else if (gapDays === 2 && !wasYesterdayRestDay) {
             newStreak = 0;
          }
        }

        const pool: DailyMission[] = [];
        const todayDate = new Date();
        const isWeekend = todayDate.getDay() === 0 || todayDate.getDay() === 6;

        if (isWeekend) {
           pool.push(
            { id: `play_${today}`, type: 'play_pet', description: 'Brincar com o pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false },
            { id: `feed_${today}`, type: 'feed_pet', description: 'Alimentar o pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false },
            { id: `study_light_${today}`, type: 'study_time', description: 'Revisar notas por 15 min', target: 15, progress: 0, reward: 15, completed: false, claimed: false },
            { id: `pet_${today}`, type: 'afagar', description: 'Afagar o pet', target: 1, progress: 0, reward: 10, completed: false, claimed: false }
           );
           if (pet.dirtiness > 30) {
             pool.push({ id: `bath_${today}`, type: 'cure_pet', description: 'Dar banho no pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false });
           }
        } else {
          const minutes = [30, 60, 90][Math.floor(Math.random() * 3)];
          pool.push({
            id: `study_time_${today}`,
            type: 'study_time',
            description: `Estudar ${minutes} minutos`,
            target: minutes,
            progress: 0,
            reward: Math.floor(minutes / 2),
            completed: false,
            claimed: false
          });

          const pending = getPendingTopicsCount();
          if (pending > 0) {
            const target = Math.min(pending, Math.floor(Math.random() * 4) + 1);
            pool.push({
              id: `topics_${today}`,
              type: 'complete_topics',
              description: `Completar ${target} tópico(s)`,
              target,
              progress: 0,
              reward: target * 10,
              completed: false,
              claimed: false
            });
          }

          const reviews = getDueReviewsCount(today);
          if (reviews > 0) {
            const target = Math.min(reviews, Math.floor(Math.random() * reviews) + 1);
            pool.push({
              id: `reviews_${today}`,
              type: 'reviews',
              description: `Fazer ${target} revisão(ões)`,
              target,
              progress: 0,
              reward: target * 5,
              completed: false,
              claimed: false
            });
          }

          pool.push({
            id: `module_${today}`,
            type: 'complete_module',
            description: 'Concluir 1 módulo',
            target: 1,
            progress: 0,
            reward: 50,
            completed: false,
            claimed: false
          });

          if (pet.hunger < 90) {
              pool.push({ id: `feed_${today}`, type: 'feed_pet', description: 'Alimentar o pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false });
          }
          if (pet.energy < 90) {
              pool.push({ id: `play_${today}`, type: 'play_pet', description: 'Brincar com o pet', target: 1, progress: 0, reward: 20, completed: false, claimed: false });
          }
          if (pet.dirtiness >= 30) {
              pool.push({ id: `bathe_${today}`, type: 'bath_pet', description: 'Dar banho no pet', target: 1, progress: 0, reward: 25, completed: false, claimed: false });
          }
          if (pet.isSick) {
              pool.push({ id: `heal_${today}`, type: 'cure_pet', description: 'Curar o pet', target: 1, progress: 0, reward: 30, completed: false, claimed: false });
          }
        }

        const shuffled = pool.sort(() => 0.5 - Math.random());
        newDaily = shuffled.slice(0, 3);
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
          streak: newStreak,
          lastStreakDate: prev.lastStreakDate // handled inside progress
        };
      }
      return prev;
    });
  }, [missions.lastDailyGenerated, missions.lastWeeklyGenerated, getPendingTopicsCount, getDueReviewsCount, pet, weeklyGoal.targetHours]);

  const moduleProgress = useMemo(() => {
    const progress: Record<string, { completed: number; total: number; pct: number }> = {};
    MODULES.forEach(m => {
      const completed = m.items.filter((_, idx) => !!completedTopics[`${m.id}__${idx}`]).length;
      progress[m.id] = {
        completed,
        total: m.items.length,
        pct: (completed / m.items.length) * 100
      };
    });
    return progress;
  }, [completedTopics]);

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setMissions(prev => {
      if (prev.lastDailyGenerated !== today) return prev;

      let changed = false;
      const updateMission = (m: DailyMission | WeeklyMission) => {
        let progress = m.progress;
        
        if (m.type === 'study_time') {
          return m;
        } else if (m.type === 'complete_topics') {
          progress = Object.values(completedTopics).filter(d => d === today).length;
        } else if (m.type === 'reviews') {
          progress = Object.values(reviewsDone).filter(d => d === today).length;
        } else if (m.type === 'complete_module' || m.type === 'complete_modules') {
          const modP = Object.entries(moduleProgress).filter(([id, p]) => {
             return (p as any).pct === 100 && Object.keys(completedTopics).some(k => k.startsWith(id));
          }).length;
          progress = modP;
        } else if (m.type === 'study_hours') {
          progress = Number((studyTimeSeconds / 3600).toFixed(1));
        }

        const completed = progress >= m.target;
        if (progress !== m.progress || completed !== m.completed) {
          changed = true;
          return { ...m, progress, completed };
        }
        return m;
      };

      const newDaily = prev.daily.map(updateMission);
      const newBonus = prev.bonus ? updateMission(prev.bonus) : null;
      let newWeekly = prev.weekly.map(w => {
         if (w.type === 'study_hours') {
             const progress = Number(weeklyGoal.currentHours.toFixed(1));
             const completed = progress >= w.target;
             if (progress !== w.progress || completed !== w.completed) {
                 changed = true;
                 return { ...w, progress, completed };
             }
         }
         return updateMission(w) as WeeklyMission;
      });
      
      if (changed) {
        const completedCount = newDaily.filter(m => m.completed).length as number;
        let newStreak = prev.streak;
        let newLastStreakDate = prev.lastStreakDate;
        
        if (completedCount >= 2 && prev.lastStreakDate !== today) {
          const yesterdayDate = addDays(new Date(), -1);
          const yesterday = format(yesterdayDate, 'yyyy-MM-dd');
          if (prev.lastDailyGenerated === yesterday || prev.streak === 0 || prev.lastStreakDate !== today) {
            newStreak = prev.streak + 1;
            newLastStreakDate = today;
          }
        }

        return { ...prev, daily: newDaily, bonus: newBonus as any, weekly: newWeekly, streak: newStreak, lastStreakDate: newLastStreakDate };
      }
      return prev;
    });
  }, [completedTopics, reviewsDone, moduleProgress, studyTimeSeconds, weeklyGoal.currentHours]);

  const claimMissionReward = (missionId: string, isWeekly = false, isBonus = false) => {
    setMissions(prev => {
      let changed = false;
      let reward = 0;
      let newDaily = [...prev.daily];
      let newWeekly = [...prev.weekly];
      let newBonus = prev.bonus;

      if (isBonus && newBonus && newBonus.id === missionId && newBonus.completed && !newBonus.claimed) {
         reward = newBonus.reward;
         newBonus.claimed = true;
         changed = true;
      } else if (isWeekly) {
         newWeekly = newWeekly.map(m => {
             if (m.id === missionId && m.completed && !m.claimed) {
                 reward += m.reward;
                 changed = true;
                 return { ...m, claimed: true };
             }
             return m;
         });
      } else {
         newDaily = newDaily.map(m => {
             if (m.id === missionId && m.completed && !m.claimed) {
                 reward += m.reward;
                 changed = true;
                 return { ...m, claimed: true };
             }
             return m;
         });
      }

      if (changed) {
        if (reward > 0) setXp(x => x + reward);
        if (!isWeekly && !isBonus && !newBonus) {
           const allClaimed = newDaily.every(m => m.claimed);
           if (allClaimed) {
              const today = format(new Date(), 'yyyy-MM-dd');
              const bonusTemplates = [
                { type: 'study_time', description: 'Estudar 120 minutos hoje', target: 120, reward: 100 },
                { type: 'reviews', description: 'Fazer 5 revisões de tópicos antigos', target: 5, reward: 80 },
                { type: 'complete_module', description: 'Completar um módulo inteiro', target: 1, reward: 150 }
              ];
              const b = bonusTemplates[Math.floor(Math.random() * bonusTemplates.length)];
              newBonus = {
                 id: `bonus_${b.type}_${today}`,
                 type: b.type as any,
                 description: `★ BÔNUS: ${b.description}`,
                 target: b.target,
                 progress: 0,
                 reward: b.reward,
                 completed: false,
                 claimed: false
              };
           }
        }

        return { ...prev, daily: newDaily, weekly: newWeekly, bonus: newBonus };
      }
      return prev;
    });
  };

  const setWeeklyHourGoal = (hours: number) => {
    setWeeklyGoal(prev => ({ ...prev, targetHours: hours }));
  };

  const applySecretCode = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-04"

    if (upperCode === 'XP100') {
      if (pet.usedPromoCodes && pet.usedPromoCodes['XP100'] === currentMonth) {
        return 'Código XP100 já foi usado neste mês!';
      }
      
      setPet(prev => ({
        ...prev,
        usedPromoCodes: { ...(prev.usedPromoCodes || {}), 'XP100': currentMonth }
      }));
      
      setXp(x => x + 100);
      return '100 XP resgatados com sucesso!';
    }

    switch (upperCode) {
      case 'XPINF':
        setXp(x => x + 10000);
        return '10.000 XP adicionados!';
      case 'HORASMAX':
        addStudyTime(50 * 3600); // Adiciona 50 horas
        return '50 horas de estudo adicionadas!';
      case 'OFENSIVA7':
        setMissions(prev => ({ ...prev, streak: prev.streak + 7, lastStreakDate: format(new Date(), 'yyyy-MM-dd') }));
        return 'Ofensiva avançada em +7 dias!';
      case 'PETGOD':
        setPet(prev => ({ ...prev, hunger: 100, happiness: 100, energy: 100, isSick: false, dirtiness: 0 }));
        return 'Status do pet restaurados ao máximo!';
      default:
        return 'Código inválido.';
    }
  };

  const claimWeeklyReward = () => {
    if (weeklyGoal.currentHours >= weeklyGoal.targetHours && !weeklyGoal.claimed) {
      setXp(x => x + 150);
      setWeeklyGoal(prev => ({ ...prev, claimed: true }));
      
      const now = new Date().toISOString();
      setPet(prev => ({
        ...prev,
        diary: [{ timestamp: now, text: "META SEMANAL ATINGIDA! Você é incrível! +150 XP 🌟" }, ...prev.diary]
      }));
    }
  };

  const addStudyTime = useCallback((seconds: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setDailyStudyLog(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + seconds
    }));

    setStudyTimeSeconds(prev => {
      const newTotal = prev + seconds;
      setWeeklyGoal(wg => ({ ...wg, currentHours: wg.currentHours + (seconds / 3600) }));
      setMissions(mState => {
        const daily = mState.daily.map(m => {
          if (m.type === 'study_time') {
            const newProgress = m.progress + (seconds / 60);
            return { ...m, progress: newProgress, completed: newProgress >= m.target };
          }
          return m;
        });
        const bonus = mState.bonus && mState.bonus.type === 'study_time'
          ? { ...mState.bonus, progress: mState.bonus.progress + (seconds / 60), completed: (mState.bonus.progress + (seconds / 60)) >= mState.bonus.target }
          : mState.bonus;
        return { ...mState, daily, bonus };
      });
      const isInspired = pet.happiness >= 80;
      const xpInterval = isInspired ? 50 : 60; // 1.2 XP/min means 1 XP every 50s
      
      const oldXPUnits = Math.floor(prev / xpInterval);
      const newXPUnits = Math.floor(newTotal / xpInterval);
      
      if (newXPUnits > oldXPUnits) {
        setXp(x => x + (newXPUnits - oldXPUnits));
      }
      
      return newTotal;
    });
  }, [pet.happiness]);

  const interactWithPet = (action: PetAction, payload?: string | number) => {
    const now = new Date().toISOString();
    
    setPet(prev => {
      if (prev.isDead && action !== 'revive') return prev;

      let next = { ...prev, lastUpdate: now };
      let diaryText = "";

      if (action === 'revive') {
        const cost = 500;
        if (xp < cost) {
          next = { ...next, hunger: 50, happiness: 50, energy: 50, isDead: false, deathTimestamp: null };
          diaryText = "Renasci das cinzas! Vamos recomeçar? ✨";
        } else {
          setXp(x => x - cost);
          next = { ...next, hunger: 50, happiness: 50, energy: 50, isDead: false, deathTimestamp: null };
          diaryText = "Fui revivido! Obrigado por não desistir de mim! ❤️";
        }
        return { ...next, diary: [{ timestamp: now, text: diaryText }, ...prev.diary].slice(0, 50) };
      }

      if (action === 'rename' && payload) {
        next.name = payload;
        diaryText = `Mudei meu nome para ${payload}!`;
      } else if (action === 'debug_set_stats' && typeof payload === 'string') {
        try {
          const stats = JSON.parse(payload);
          next = { ...next, ...stats };
          diaryText = "Debug: Status alterados via painel.";
        } catch (e) {
          console.error("Erro ao processar debug_set_stats:", e);
        }
      } else if (action === 'afagar') {
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        next.happiness = Math.min(100, prev.happiness + 5);
        diaryText = "Purrrr... Que carinho gostoso! ❤️";
        setMissions(mState => ({
          ...mState,
          daily: mState.daily.map(m => m.type === 'afagar' ? { ...m, progress: Math.min(m.target, m.progress + 1), completed: m.progress + 1 >= m.target } : m)
        }));
      } else if (action === 'feed') {
        if (xp < 20) return prev;
        setXp(x => x - 20);
        next.hunger = Math.min(100, prev.hunger + 40);
        next.happiness = Math.min(100, prev.happiness + 10);
        diaryText = "Fui alimentado! Delícia! 🍗";
        
        setMissions(mState => ({
          ...mState,
          daily: mState.daily.map(m => m.type === 'feed_pet' ? { ...m, progress: Math.min(m.target, m.progress + 1), completed: m.progress + 1 >= m.target } : m)
        }));
      } else if (action === 'play') {
        if (xp < 15) return prev;
        setXp(x => x - 15);
        next.energy = Math.max(0, prev.energy - 25);
        next.happiness = Math.min(100, prev.happiness + 20);
        diaryText = "Brincamos muito! Estou feliz! 😊";

        setMissions(mState => ({
          ...mState,
          daily: mState.daily.map(m => m.type === 'play_pet' ? { ...m, progress: Math.min(m.target, m.progress + 1), completed: m.progress + 1 >= m.target } : m)
        }));
      } else if (action === 'clean') {
        if (xp < 10) return prev;
        setXp(x => x - 10);
        next.happiness = Math.min(100, prev.happiness + 12);
        next.dirtiness = Math.max(0, prev.dirtiness - 15);
        diaryText = "Tudo limpinho agora! ✨";
      } else if (action === 'bath') {
        if (xp < 15) return prev;
        setXp(x => x - 15);
        diaryText = "Hora do banho! Me esfrega! 🧼";
      } else if (action === 'rub_clean') {
        next.dirtiness = Math.max(0, prev.dirtiness - 2);
        if (next.dirtiness === 0 && prev.dirtiness > 0) {
          diaryText = "Pet limpinho! ✨";
          setMissions(mState => ({
            ...mState,
            daily: mState.daily.map(m => m.type === 'bath_pet' ? { ...m, progress: Math.min(m.target, m.progress + 1), completed: m.progress + 1 >= m.target } : m)
          }));
        }
      } else if (action === 'medicine') {
        if (xp < 30) return prev;
        setXp(x => x - 30);
        next.isSick = false;
        next.happiness = Math.min(100, prev.happiness + 20);
        diaryText = "Tomei o remédio e já me sinto melhor! 💊✨";
        setMissions(mState => ({
          ...mState,
          daily: mState.daily.map(m => m.type === 'cure_pet' ? { ...m, progress: Math.min(m.target, m.progress + 1), completed: m.progress + 1 >= m.target } : m)
        }));
      } else if (action === 'toggle_audio') {
        next.audioEnabled = !prev.audioEnabled;
      } else if (action === 'brush') {
        if (xp < 5) return prev;
        setXp(x => x - 5);
        next.happiness = Math.min(100, prev.happiness + 8);
        diaryText = "Dentes escovados! Sorriso brilhante! 🦷🪥";
      } else if (action === 'sleep') {
        next.energy = Math.min(100, prev.energy + 40);
        next.hunger = Math.max(0, prev.hunger - 15);
        diaryText = "Zzz... Que soneca boa! Recuperei minhas energias! 😴💤";
      } else if (action === 'coffee') {
        if (xp < 10) return prev;
        setXp(x => x - 10);
        next.energy = Math.min(100, prev.energy + 25);
        next.happiness = Math.min(100, prev.happiness + 5);
        diaryText = "Cafézinho pra dar aquele gás nos estudos! ☕⚡";
      } else if (action === 'buy_accessory' && payload) {
        const accessory = ACCESSORIES_CATALOG.find(a => a.id === payload);
        if (!accessory) return prev;
        
        if (xp < accessory.cost || prev.accessories.owned.includes(payload) || accessory.exclusive) return prev;
        setXp(x => x - accessory.cost);
        next.accessories = {
          ...prev.accessories,
          owned: [...prev.accessories.owned, payload],
          equipped: {
            ...prev.accessories.equipped,
            [accessory.category]: payload
          }
        };
        diaryText = `Comprei um acessório novo: ${accessory.name}! 🎁`;
      } else if (action === 'equip_accessory' && payload) {
        const accessory = ACCESSORIES_CATALOG.find(a => a.id === payload);
        if (accessory) {
           next.accessories = {
             ...prev.accessories,
             equipped: {
               ...prev.accessories.equipped,
               [accessory.category]: prev.accessories.equipped[accessory.category] === payload ? null : payload
             }
           };
        }
      } else if (action === 'open_chest') {
        const availableExclusives = ACCESSORIES_CATALOG.filter(a => a.exclusive && !(prev.accessories.owned || []).includes(a.id));
        
        let reward: any = null;
        if (availableExclusives.length > 0) {
          const randomIndex = Math.floor(Date.now() / 1000) % availableExclusives.length;
          reward = availableExclusives[randomIndex];
        }

        if (reward) {
          const currentOwned = prev.accessories?.owned || [];
          const currentExclusives = prev.chestTracker?.obtainedExclusives || [];
          
          next.accessories = {
            ...prev.accessories,
            owned: Array.from(new Set([...currentOwned, reward.id]))
          };
          next.chestTracker = {
            ...(prev.chestTracker || {}),
            lastOpenedStreak: Number(payload) || 0,
            obtainedExclusives: Array.from(new Set([...currentExclusives, reward.id]))
          };
          diaryText = `📦 Baú semanal aberto! Miau, você ganhou: ${reward.name} ${reward.emoji || ''}!`;
          setTimeout(() => {
             setSystemMessage(diaryText);
             window.location.reload();
          }, 500);
        } else {
          setTimeout(() => setXp(x => x + 500), 0);
          next.chestTracker = {
            ...(prev.chestTracker || {}),
            lastOpenedStreak: Number(payload) || 0
          };
          diaryText = `📦 Baú semanal aberto! Você já tem todos os itens raros! Tome +500 XP extras!`;
          setTimeout(() => setSystemMessage(diaryText), 100);
        }
      } else if (action === 'clear_diary') {
        next.diary = [];
      }

      if (diaryText) {
        next.diary = [{ timestamp: now, text: diaryText }, ...prev.diary].slice(0, 50);
      }

      return next;
    });
  };
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>(() => {
    const saved = sessionStorage.getItem('enem-timer-mode');
    return (saved as any) || 'focus';
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('enem-timer-left');
    return saved ? parseInt(saved) : 25 * 60;
  });
  const [isActive, setIsActive] = useState(() => {
    const saved = sessionStorage.getItem('enem-timer-active');
    return saved === 'true';
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('enem-timer-sound');
    return saved !== 'false';
  });
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('enem-timer-notify');
    return saved === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('enem-timer-mode', mode);
    sessionStorage.setItem('enem-timer-left', timeLeft.toString());
    sessionStorage.setItem('enem-timer-active', isActive.toString());
    localStorage.setItem('enem-timer-sound', soundEnabled.toString());
    localStorage.setItem('enem-timer-notify', notificationsEnabled.toString());
  }, [mode, timeLeft, isActive, soundEnabled, notificationsEnabled]);

  const resetTimer = (newMode?: 'focus' | 'short' | 'long') => {
    const m = newMode || mode;
    setIsActive(false);
    if (m === 'focus') setTimeLeft(25 * 60);
    else if (m === 'short') setTimeLeft(5 * 60);
    else if (m === 'long') setTimeLeft(15 * 60);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        if (mode === 'focus') {
          addStudyTime(1);
        }
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            if (soundEnabled) {
               const w = window as any;
               if (w.alarmTimeout) clearTimeout(w.alarmTimeout);
               const audio = document.getElementById('timerAlarm') as HTMLAudioElement;
               if (audio) {
                 audio.currentTime = 0;
                 audio.play().catch(e => console.log("Erro ao tocar áudio:", e));
                 w.alarmTimeout = setTimeout(() => {
                   audio.pause();
                   w.alarmTimeout = null;
                 }, 2000);
               }
            }

            if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
              let message = "";
              if (mode === 'focus') message = "🎯 Foco concluído! Hora de uma pausa.";
              else if (mode === 'short') message = "☕ Pausa curta finalizada. Vamos voltar aos estudos!";
              else if (mode === 'long') message = "🌿 Pausa longa finalizada. Pronto para mais um ciclo?";
              new Notification("Cronograma ENEM", { body: message });
            }

            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, mode, addStudyTime, soundEnabled, notificationsEnabled]);
  useEffect(() => {
    const hours = studyTimeSeconds / 3600;
    const now = new Date().toISOString();
    
    setPet(prev => {
      let next = { ...prev };
      let changed = false;
      if (hours >= 100 && !prev.achievements.includes('100h')) {
        next.achievements = [...prev.achievements, '100h'];
        next.diary = [{ timestamp: now, text: "CONQUISTA: Mestre do ENEM! 100 horas de dedicação! 🏆" }, ...prev.diary];
        changed = true;
      }
      const stages = [
        { id: 'jovem', h: 10, name: 'Jovem' },
        { id: 'adulto', h: 50, name: 'Adulto' },
        { id: 'sabio', h: 100, name: 'Sábio' }
      ];

      for (const s of stages) {
        const diaryKey = `evolved_${s.id}`;
        if (hours >= s.h && !prev.diary.some(d => d.text.includes(diaryKey))) {
          next.diary = [{ timestamp: now, text: `EVOLUÇÃO: Cresci para o estágio ${s.name}! Que jornada! 🌱 [${diaryKey}]` }, ...prev.diary];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [studyTimeSeconds]);
  useEffect(() => {
    const interval = setInterval(() => {
      setPet(prev => {
        if (prev.isDead) return prev;

        const now = new Date();
        const nowIso = now.toISOString();
        const isStudying = isActive && mode === 'focus';
        const dayOfWeek = now.getDay();
        const isRestDay = dayOfWeek === 0 || dayOfWeek === 6;
        let hungerDecay = 1.5;
        let happinessDecay = 0.8;
        let energyChange = isStudying ? -2 : 3;
        let dirtinessIncrease = isRestDay ? 0.1 : 0.4; // Approx 5% per hour normally
        let currentIsSick = prev.isSick;
        if (!currentIsSick) {
          let hourlySickChance = 0.02;
          if (prev.hunger < 30) hourlySickChance += 0.10;
          if (prev.happiness < 30) hourlySickChance += 0.10;
          if (prev.energy < 20) hourlySickChance += 0.15;
          if (prev.dirtiness >= 30) hourlySickChance += 0.10;
          hourlySickChance = Math.min(0.50, hourlySickChance);
          
          if (Math.random() < hourlySickChance / 12) {
            currentIsSick = true;
          }
        }

        if (isRestDay) {
          hungerDecay *= 0.2;
          happinessDecay *= 0.2;
          if (!isStudying) energyChange = 5;
        }

        if (currentIsSick) {
          happinessDecay += 0.3; // Extra decay when sick
        }
        if (prev.dirtiness >= 30) {
          happinessDecay += 0.1; // Extra decay when dirty
        }

        const nextHunger = Math.max(0, prev.hunger - hungerDecay);
        const nextHappiness = Math.max(0, prev.happiness - happinessDecay);
        const nextEnergy = Math.min(100, Math.max(0, prev.energy + energyChange));
        const nextDirtiness = Math.min(100, prev.dirtiness + dirtinessIncrease);
        if (nextHunger <= 0 && nextHappiness <= 0 && nextEnergy <= 0) {
          return {
            ...prev,
            hunger: 0, happiness: 0, energy: 0,
            isDead: true,
            deathTimestamp: nowIso,
            lastUpdate: nowIso
          };
        }

        return {
          ...prev,
          hunger: nextHunger,
          happiness: nextHappiness,
          energy: nextEnergy,
          dirtiness: nextDirtiness,
          isSick: currentIsSick,
          lastUpdate: nowIso
        };
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [isActive, mode]);

  useEffect(() => {
    localStorage.setItem('enem-reviews-done-v2', JSON.stringify(reviewsDone));
  }, [reviewsDone]);

  const calendar = useMemo(() => {
    const start = parseISO(settings.startDate);
    const exam = parseISO(settings.examDate);
    const todayIso = realToday;
    const today = parseISO(realToday);
    
    const days: any[] = [];
    const completedModulesByDate: Record<string, string[]> = {};
    const pendingModules: Module[] = [];

    MODULES.forEach(m => {
      const prog = moduleProgress[m.id];
      if (prog && prog.pct === 100) {
        let maxDate = '';
        m.items.forEach((_, idx) => {
          const date = completedTopics[`${m.id}__${idx}`];
          if (date && (!maxDate || date > maxDate)) maxDate = date;
        });
        if (maxDate) {
          if (!completedModulesByDate[maxDate]) completedModulesByDate[maxDate] = [];
          completedModulesByDate[maxDate].push(m.id);
        }
      } else {
        pendingModules.push(m);
      }
    });
    const mathSubjects = ['Matemática'];
    const natureSubjects = ['Biologia', 'Física', 'Química'];
    const languageSubjects = ['Português', 'Literatura', 'Redação'];
    const humanSubjects = ['História', 'Geografia', 'Filosofia', 'Sociologia'];

    const getInterleavedQueue = (areaSubjects: string[]) => {
      const orderedSubjects = subjectOrder.filter(s => areaSubjects.includes(s));
      const bySubject: Record<string, Module[]> = {};
      orderedSubjects.forEach(s => bySubject[s] = pendingModules.filter(m => m.subject === s));
      
      const result: Module[] = [];
      let i = 0;
      let added = true;
      while (added) {
        added = false;
        orderedSubjects.forEach(s => {
          if (bySubject[s][i]) {
            result.push(bySubject[s][i]);
            added = true;
          }
        });
        i++;
      }
      return result;
    };

    const manualIds = new Set(Object.values(manualAssignments));
    const qMath = getInterleavedQueue(mathSubjects).filter(m => !manualIds.has(m.id));
    const qNature = getInterleavedQueue(natureSubjects).filter(m => !manualIds.has(m.id));
    const qLang = getInterleavedQueue(languageSubjects).filter(m => !manualIds.has(m.id));
    const qHum = getInterleavedQueue(humanSubjects).filter(m => !manualIds.has(m.id));
    const moduleUsage: Record<string, number> = {};

    let cursor = start;

    while (cursor <= exam) {
      const dateIso = format(cursor, 'yyyy-MM-dd');
      const dayOfWeek = cursor.getDay(); // 0=Sun, 1=Mon...
      const weekIndex = Math.floor(differenceInDays(cursor, start) / 7);
      const daysToExam = differenceInDays(exam, cursor);
      const isSprint = daysToExam <= 30;
      const isPast = dateIso < todayIso;
      const isToday = dateIso === todayIso;
      
      const isOff = dayOfWeek === 0 || dayOfWeek === 6;
      
      let plannedModuleIds: string[] = [];
      if (completedModulesByDate[dateIso]) {
        plannedModuleIds = [...completedModulesByDate[dateIso]];
      }
      if (!isPast) {
        if (manualAssignments[dateIso]) {
          const modId = manualAssignments[dateIso];
          if ((moduleProgress[modId]?.pct || 0) < 100) {
            if (!plannedModuleIds.includes(modId)) {
              plannedModuleIds.push(modId);
            }
          }
        }
        if (!isOff && plannedModuleIds.length === 0) {
          let targetQueue: Module[] | null = null;
          
          if (isSprint && dayOfWeek === 5) {
            targetQueue = qNature;
          } else {
            switch (dayOfWeek) {
              case 1: case 3: targetQueue = qMath; break;
              case 2: case 4: targetQueue = qNature; break;
              case 5: targetQueue = (weekIndex % 2 === 0) ? qLang : qHum; break;
            }
          }

          if (targetQueue && targetQueue.length > 0) {
            const mod = targetQueue[0];
            plannedModuleIds.push(mod.id);
            moduleUsage[mod.id] = (moduleUsage[mod.id] || 0) + 1;
            if (moduleUsage[mod.id] >= 2) targetQueue.shift();
            if (isSprint && targetQueue.length > 0 && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
              const extra = targetQueue[0];
              if (!plannedModuleIds.includes(extra.id)) {
                plannedModuleIds.push(extra.id);
                moduleUsage[extra.id] = (moduleUsage[extra.id] || 0) + 1;
                if (moduleUsage[extra.id] >= 2) targetQueue.shift();
              }
            }
          }
        }
      }

      days.push({
        date: dateIso,
        isOff: isOff,
        dayType: dayOfWeek === 0 ? 'rest' : dayOfWeek === 6 ? 'review' : 'study',
        plannedModuleIds,
        isSprint,
        isPast
      });
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [settings.startDate, settings.examDate, moduleProgress, manualAssignments, completedTopics, subjectOrder, realToday]);

  const dueReviews = useMemo(() => {
    const due: any[] = [];
    const focus = parseISO(settings.focusDate);
    const exam = parseISO(settings.examDate);

    (Object.entries(completedTopics) as [string, string][]).forEach(([topicKey, doneDateIso]) => {
      const [moduleId, topicIdx] = topicKey.split('__');
      const module = MODULES.find(m => m.id === moduleId);
      if (!module) return;

      const doneDate = parseISO(doneDateIso);

      REVIEW_STAGES.forEach(stage => {
        let reviewDate = addDays(doneDate, stage.days);
        if (isSunday(reviewDate)) reviewDate = addDays(reviewDate, 1);
        
        if (reviewDate <= exam) {
          const reviewKey = `${topicKey}__${stage.key}`;
          const isDone = reviewsDone[reviewKey];
          if (!isDone && reviewDate <= focus) {
            due.push({
              reviewKey,
              topicKey,
              moduleId,
              topicIdx: parseInt(topicIdx),
              module,
              topicTitle: module.items[parseInt(topicIdx)],
              stage,
              dueDate: format(reviewDate, 'yyyy-MM-dd'),
              doneDate: doneDateIso
            });
          }
        }
      });
    });

    return due.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [completedTopics, reviewsDone, settings.focusDate, settings.examDate]);

  const stats = useMemo(() => {
    const totalModules = MODULES.length;
    const progressValues = Object.values(moduleProgress) as { pct: number }[];
    const completedModules = progressValues.filter(p => p.pct === 100).length;
    
    const totalTopics = MODULES.reduce((acc, m) => acc + m.items.length, 0);
    const completedTopicsCount = Object.keys(completedTopics).length;
    
    const daysToExam = differenceInDays(parseISO(settings.examDate), new Date());
    
    const subjectProgress = SUBJECTS.map(s => {
      const mods = MODULES.filter(m => m.subject === s);
      const totalT = mods.reduce((acc, m) => acc + m.items.length, 0);
      const doneT = mods.reduce((acc, m) => {
        return acc + m.items.filter((_, idx) => !!completedTopics[`${m.id}__${idx}`]).length;
      }, 0);
      return { 
        subject: s, 
        total: mods.length, 
        done: mods.filter(m => (moduleProgress[m.id]?.pct || 0) === 100).length, 
        pct: totalT > 0 ? (doneT / totalT) * 100 : 0 
      };
    });

    return { 
      totalModules, 
      completedModules, 
      totalTopics, 
      completedTopicsCount, 
      pct: (completedTopicsCount / totalTopics) * 100, 
      daysToExam, 
      subjectProgress 
    };
  }, [completedTopics, moduleProgress, settings.examDate]);

  const toggleTopic = (moduleId: string, topicIndex: number) => {
    const key = `${moduleId}__${topicIndex}`;
    setCompletedTopics(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        setReviewsDone(rd => {
          const nextRd = { ...rd };
          REVIEW_STAGES.forEach(s => delete nextRd[`${key}__${s.key}`]);
          return nextRd;
        });
      } else {
        next[key] = settings.focusDate;
      }
      return next;
    });
  };

  const markModuleAsRead = (moduleId: string) => {
    const module = MODULES.find(m => m.id === moduleId);
    if (!module) return;
    
    setCompletedTopics(prev => {
      const next = { ...prev };
      module.items.forEach((_, idx) => {
        const key = `${moduleId}__${idx}`;
        if (!next[key]) next[key] = settings.focusDate;
      });
      return next;
    });
  };

  const markReviewDone = (reviewKey: string) => {
    setReviewsDone(prev => ({
      ...prev,
      [reviewKey]: settings.focusDate
    }));
  };

  const changeDayModule = (dateIso: string, moduleId: string) => {
    setManualAssignments(prev => ({
      ...prev,
      [dateIso]: moduleId
    }));
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            setNotificationsEnabled(true);
          }
        });
      }
    }
  };

  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  useEffect(() => {
    if (systemMessage) {
      const timer = setTimeout(() => setSystemMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [systemMessage]);

  return {
    settings,
    setSettings,
    completedTopics,
    reviewsDone,
    manualAssignments,
    calendar,
    dueReviews,
    stats,
    moduleProgress,
    toggleTopic,
    markModuleAsRead,
    markReviewDone,
    changeDayModule,
    studyTimeSeconds,
    dailyStudyLog,
    subjectOrder,
    setSubjectOrder,
    xp,
    setXp,
    pet,
    setPet,
    addStudyTime,
    setStudyTimeSeconds,
    interactWithPet,
    applySecretCode,
    missions,
    claimMissionReward,
    weeklyGoal,
    setWeeklyHourGoal,
    claimWeeklyReward,
    systemMessage,
    clearSystemMessage: () => setSystemMessage(null),
    timer: {
      timeLeft,
      isActive,
      mode,
      setTimeLeft,
      setIsActive,
      setMode,
      resetTimer,
      soundEnabled,
      setSoundEnabled,
      notificationsEnabled,
      setNotificationsEnabled,
      requestNotificationPermission
    }
  };
}
