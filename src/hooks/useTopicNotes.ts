import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { TopicNotes } from '../types';

export function useTopicNotes() {
  const [notes, setNotes] = useLocalStorage<TopicNotes>('catstudy-notes', {});

  const getNote = useCallback(
    (topicKey: string): string => notes[topicKey] ?? '',
    [notes]
  );

  const setNote = useCallback(
    (topicKey: string, text: string) => {
      setNotes(prev => {
        if (!text.trim()) {
          const next = { ...prev };
          delete next[topicKey];
          return next;
        }
        return { ...prev, [topicKey]: text };
      });
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (topicKey: string) => {
      setNotes(prev => {
        const next = { ...prev };
        delete next[topicKey];
        return next;
      });
    },
    [setNotes]
  );

  const hasNote = useCallback(
    (topicKey: string): boolean => {
      const n = notes[topicKey];
      return typeof n === 'string' && n.trim().length > 0;
    },
    [notes]
  );

  return { notes, getNote, setNote, deleteNote, hasNote };
}
