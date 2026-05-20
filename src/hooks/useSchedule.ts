import { useState, useEffect, useMemo, useCallback } from 'react';
import { format, parseISO, isSunday, addDays, differenceInDays } from 'date-fns';

import { useAppSettings } from './useAppSettings';
import { useStudyState } from './useStudyState';
import { useXP } from './useXP';
import { usePetState } from './usePetState';
import { usePomodoro } from './usePomodoro';
import { useMissions } from './useMissions';
import { useCalendar } from './useCalendar';
import { useFlashcards } from './useFlashcards';

import { MODULES } from '../data/modules';
import { REVIEW_STAGES } from '../types';

export { REVIEW_STAGES };

export function useSchedule() {
  const { settings, setSettings, realToday } = useAppSettings();
  const { xp, setXp, studyTimeSeconds, setStudyTimeSeconds, dailyStudyLog, addStudyTime } = useXP();
  
  const isInspired = useMemo(() => {
    // Logic for inspired status
    return false; // To be implemented with pet state
  }, []);

  const { 
    completedTopics, moduleProgress, toggleTopic, markModuleAsRead, 
    markReviewDone, changeDayModule, subjectOrder, setSubjectOrder,
    reviewsDone, manualAssignments
  } = useStudyState(settings.focusDate);

  const { pet, setPet, interactWithPet } = usePetState(xp, setXp);
  
  const { timer: pomodoro } = {
    timer: usePomodoro((secs) => addStudyTime(secs, pet.happiness >= 80))
  };

  const calendar = useCalendar(
    settings, moduleProgress, completedTopics, 
    manualAssignments, subjectOrder, realToday
  );

  const { missions, claimMissionReward, weeklyGoal, setWeeklyGoal } = useMissions(
    realToday, pet, Object.keys(completedTopics).length, 0, 10, 0
  );

  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  const dueReviews = useMemo(() => {
    const due: any[] = [];
    const focus = parseISO(settings.focusDate);
    const exam = parseISO(settings.examDate);

    Object.entries(completedTopics).forEach(([topicKey, doneDateIso]) => {
      const [moduleId, topicIdx] = topicKey.split('__');
      const module = MODULES.find(m => m.id === moduleId);
      if (!module) return;

      const doneDate = parseISO(doneDateIso as string);

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
    
    const subjects = Array.from(new Set(MODULES.map(m => m.subject)));
    const subjectProgress = subjects.map(s => {
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
      pct: totalTopics > 0 ? (completedTopicsCount / totalTopics) * 100 : 0, 
      daysToExam, 
      subjectProgress 
    };
  }, [completedTopics, moduleProgress, settings.examDate]);

  const applySecretCode = (code: string) => {
    const upperCode = code.trim().toUpperCase();
    switch (upperCode) {
      case 'PETGOD':
        setPet(prev => ({ ...prev, hunger: 100, happiness: 100, energy: 100, isSick: false, dirtiness: 0 }));
        return 'Status do pet restaurados!';
      case 'XPINF':
        setXp(x => x + 10000);
        return '10.000 XP adicionados!';
      default:
        return 'Código inválido.';
    }
  };

  const setWeeklyHourGoal = (hours: number) => {
    setWeeklyGoal(prev => ({ ...prev, targetHours: hours }));
  };

  const claimWeeklyReward = () => {
    if (weeklyGoal.currentHours >= weeklyGoal.targetHours && !weeklyGoal.claimed) {
      setXp(x => x + 150);
      setWeeklyGoal(prev => ({ ...prev, claimed: true }));
      setSystemMessage("Meta semanal atingida! +150 XP");
    }
  };

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
    claimMissionReward: (id: string, isWeekly?: boolean, isBonus?: boolean) => 
      claimMissionReward(id, isWeekly, isBonus, (reward) => setXp(x => x + reward)),
    weeklyGoal,
    setWeeklyHourGoal,
    claimWeeklyReward,
    systemMessage,
    clearSystemMessage: () => setSystemMessage(null),
    timer: pomodoro
  };
}
