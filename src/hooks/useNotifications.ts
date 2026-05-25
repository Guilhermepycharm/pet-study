import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface NotificationSettings {
  enabled: boolean;
  reminderTimes: string[];
  lastNotified: string;
}

const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  enabled: false,
  reminderTimes: [],
  lastNotified: ''
};

function formatCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function useNotifications() {
  const [settings, setSettings] = useLocalStorage<NotificationSettings>(
    'enem-notifications',
    DEFAULT_NOTIFICATIONS
  );

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  const addReminderTime = (time: string) => {
    setSettings(prev => {
      if (prev.reminderTimes.includes(time)) return prev;
      return { ...prev, reminderTimes: [...prev.reminderTimes, time].sort() };
    });
  };

  const removeReminderTime = (time: string) => {
    setSettings(prev => ({
      ...prev,
      reminderTimes: prev.reminderTimes.filter(t => t !== time)
    }));
  };

  const toggleEnabled = async () => {
    if (!settings.enabled) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  useEffect(() => {
    if (!settings.enabled || settings.reminderTimes.length === 0) return;

    const checkReminder = () => {
      const current = settingsRef.current;
      if (!current.enabled) return;

      const now = formatCurrentTime();
      const shouldNotify = current.reminderTimes.includes(now) && current.lastNotified !== now;

      if (shouldNotify && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Hora de estudar!', {
          body: 'Seu pet está te esperando. Vamos lá!',
          tag: 'study-reminder'
        });
        setSettings(prev => ({ ...prev, lastNotified: now }));
      }
    };

    const intervalId = setInterval(checkReminder, 60_000);
    return () => clearInterval(intervalId);
  }, [settings.enabled, settings.reminderTimes.length, setSettings]);

  return {
    settings,
    toggleEnabled,
    addReminderTime,
    removeReminderTime,
    requestPermission
  } as const;
}
