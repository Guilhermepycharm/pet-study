import { useState, useEffect, useCallback } from 'react';

export type PomodoroMode = 'focus' | 'short' | 'long';

export function usePomodoro(onFocusTick: (seconds: number) => void) {
  const [mode, setMode] = useState<PomodoroMode>(() => {
    const saved = sessionStorage.getItem('enem-timer-mode');
    return (saved as any) || 'focus';
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = sessionStorage.getItem('enem-timer-left');
    if (saved) return parseInt(saved);
    if (mode === 'focus') return 25 * 60;
    if (mode === 'short') return 5 * 60;
    return 15 * 60;
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

  const requestNotificationPermission = useCallback(() => {
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
  }, []);

  useEffect(() => {
    sessionStorage.setItem('enem-timer-mode', mode);
    sessionStorage.setItem('enem-timer-left', timeLeft.toString());
    sessionStorage.setItem('enem-timer-active', isActive.toString());
    localStorage.setItem('enem-timer-sound', soundEnabled.toString());
    localStorage.setItem('enem-timer-notify', notificationsEnabled.toString());
  }, [mode, timeLeft, isActive, soundEnabled, notificationsEnabled]);

  const resetTimer = useCallback((newMode?: PomodoroMode) => {
    const m = newMode || mode;
    setIsActive(false);
    if (m === 'focus') setTimeLeft(25 * 60);
    else if (m === 'short') setTimeLeft(5 * 60);
    else if (m === 'long') setTimeLeft(15 * 60);
  }, [mode]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        if (mode === 'focus') {
          onFocusTick(1);
        }
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            // Trigger alarms/notifications here or via a callback
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, mode, timeLeft, onFocusTick]);

  return {
    timeLeft,
    setTimeLeft,
    isActive,
    setIsActive,
    mode,
    setMode,
    resetTimer,
    soundEnabled,
    setSoundEnabled,
    notificationsEnabled,
    setNotificationsEnabled,
    requestNotificationPermission
  };
}
