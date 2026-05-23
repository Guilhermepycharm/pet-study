import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { Settings } from '../types';

export function useAppSettings() {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [settings, setSettings] = useLocalStorage<Settings>('enem-settings-v2', {
    startDate: today,
    examDate: '2026-11-08',
    focusDate: today,
    delayedMode: true
  });

  const [realToday, setRealToday] = useState(today);

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
  }, [realToday, setSettings]);

  return {
    settings,
    setSettings,
    realToday
  };
}
