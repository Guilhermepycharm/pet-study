// useImportantDates.ts — CRUD de datas importantes com countdown
// date-fns faz todo o trabalho pesado, aqui é só orquestrar
import { useCallback, useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { differenceInDays, parseISO, isAfter, startOfDay } from 'date-fns';
import type { ImportantDate } from '../types';

export function useImportantDates() {
  const [dates, setDates] = useLocalStorage<ImportantDate[]>('catstudy-important-dates', []);

  const addDate = useCallback((name: string, date: string) => {
    const newDate: ImportantDate = {
      id: crypto.randomUUID(),
      name,
      date,
    };
    setDates(prev => [...prev, newDate]);
  }, [setDates]);

  const removeDate = useCallback((id: string) => {
    setDates(prev => prev.filter(d => d.id !== id));
  }, [setDates]);

  const upcoming = useMemo(() => {
    const today = startOfDay(new Date());
    return dates
      .filter(d => isAfter(parseISO(d.date), today) || parseISO(d.date).getTime() === today.getTime())
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());
  }, [dates]);

  const getCountdown = useCallback((dateStr: string): number => {
    const today = startOfDay(new Date());
    const target = parseISO(dateStr);
    return differenceInDays(target, today);
  }, []);

  return { dates, addDate, removeDate, upcoming, getCountdown };
}
