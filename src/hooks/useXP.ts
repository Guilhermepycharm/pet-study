import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';

export function useXP() {
  const [xp, setXp] = useLocalStorage<number>('enem-xp', 0);
  const [studyTimeSeconds, setStudyTimeSeconds] = useLocalStorage<number>('enem-study-time', 0);
  const [dailyStudyLog, setDailyStudyLog] = useLocalStorage<Record<string, number>>('enem-daily-study-log', {});

  const addStudyTime = useCallback((seconds: number, isInspired: boolean) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setDailyStudyLog(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + seconds
    }));

    setStudyTimeSeconds(prev => {
      const newTotal = prev + seconds;
      
      const xpInterval = isInspired ? 50 : 60; 
      const oldXPUnits = Math.floor(prev / xpInterval);
      const newXPUnits = Math.floor(newTotal / xpInterval);
      
      if (newXPUnits > oldXPUnits) {
        setXp(x => x + (newXPUnits - oldXPUnits));
      }
      
      return newTotal;
    });
  }, [setDailyStudyLog, setStudyTimeSeconds, setXp]);

  return {
    xp,
    setXp,
    studyTimeSeconds,
    setStudyTimeSeconds,
    dailyStudyLog,
    addStudyTime
  };
}
