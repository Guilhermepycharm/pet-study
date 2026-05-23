import { useMemo } from 'react';
import { format, parseISO, addDays, differenceInDays } from 'date-fns';
import { MODULES, Module } from '../data/modules';
import { Settings, CalendarDay } from '../types';

export function useCalendar(
  settings: Settings, 
  moduleProgress: Record<string, { pct: number }>,
  completedTopics: Record<string, string>,
  manualAssignments: Record<string, string>,
  subjectOrder: string[],
  realToday: string
) {
  return useMemo(() => {
    const start = parseISO(settings.startDate);
    const exam = parseISO(settings.examDate);
    const todayIso = realToday;
    
    const days: CalendarDay[] = [];
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
      const dayOfWeek = cursor.getDay();
      const weekIndex = Math.floor(differenceInDays(cursor, start) / 7);
      const daysToExam = differenceInDays(exam, cursor);
      const isSprint = daysToExam <= 30;
      const isPast = dateIso < todayIso;
      
      const isOff = dayOfWeek === 0 || dayOfWeek === 6;
      
      let plannedModuleIds: string[] = [];
      if (completedModulesByDate[dateIso]) {
        plannedModuleIds = [...completedModulesByDate[dateIso]];
      }

      if (!isPast) {
        if (manualAssignments[dateIso]) {
          const modId = manualAssignments[dateIso];
          if ((moduleProgress[modId]?.pct || 0) < 100 && !plannedModuleIds.includes(modId)) {
            plannedModuleIds.push(modId);
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
  }, [settings, moduleProgress, completedTopics, manualAssignments, subjectOrder, realToday]);
}
