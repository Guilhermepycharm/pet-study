import { useMemo } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { CompletedTopics, ReviewsDone } from '../types';
import { MODULES } from '../data/modules';

export function useStudyState(focusDate: string) {
  const [completedTopics, setCompletedTopics] = useLocalStorage<CompletedTopics>('enem-completed-topics', {});
  const [reviewsDone, setReviewsDone] = useLocalStorage<ReviewsDone>('enem-reviews-done-v2', {});
  const [manualAssignments, setManualAssignments] = useLocalStorage<Record<string, string>>('enem-manual-assignments', {});
  const [subjectOrder, setSubjectOrder] = useLocalStorage<string[]>('enem-subject-order', Array.from(new Set(MODULES.map(m => m.subject))));

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

  const toggleTopic = (moduleId: string, topicIndex: number) => {
    const key = `${moduleId}__${topicIndex}`;
    setCompletedTopics(prev => {
      const next = { ...prev };
      if (next[key]) {
        delete next[key];
        // Note: review cleanup logic will be handled where REVIEW_STAGES is available or via a service
      } else {
        next[key] = focusDate;
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
        if (!next[key]) next[key] = focusDate;
      });
      return next;
    });
  };

  const markReviewDone = (reviewKey: string) => {
    setReviewsDone(prev => ({
      ...prev,
      [reviewKey]: focusDate
    }));
  };

  const changeDayModule = (dateIso: string, moduleId: string) => {
    setManualAssignments(prev => ({
      ...prev,
      [dateIso]: moduleId
    }));
  };

  return {
    completedTopics,
    setCompletedTopics,
    reviewsDone,
    setReviewsDone,
    manualAssignments,
    setManualAssignments,
    subjectOrder,
    setSubjectOrder,
    moduleProgress,
    toggleTopic,
    markModuleAsRead,
    markReviewDone,
    changeDayModule
  };
}
