import { addDays, format } from 'date-fns';
import { Flashcard, FlashcardEase } from '../types';

/**
 * Algoritmo SM-2 simplificado para repetição espaçada.
 * 
 * @param card O flashcard a ser atualizado
 * @param ease O nível de dificuldade relatado pelo usuário
 * @returns O card atualizado com novo intervalo e próxima data
 */
export function updateFlashcardSM2(card: Flashcard, ease: FlashcardEase): Flashcard {
  let { interval, repetition, efactor } = card;
  let grade = 0;

  switch (ease) {
    case 'again': grade = 0; break;
    case 'hard': grade = 3; break;
    case 'good': grade = 4; break;
    case 'easy': grade = 5; break;
  }

  // SM-2 Algorithm
  if (grade >= 3) {
    if (repetition === 0) {
      interval = 1;
    } else if (repetition === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * efactor);
    }
    repetition++;
  } else {
    repetition = 0;
    interval = 1;
  }

  efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  const dueDate = format(addDays(new Date(), interval), 'yyyy-MM-dd');

  return {
    ...card,
    interval,
    repetition,
    efactor,
    dueDate
  };
}

export function createInitialFlashcard(moduleId: string, front: string, back: string): Flashcard {
  return {
    id: crypto.randomUUID(),
    moduleId,
    front,
    back,
    createdAt: new Date().toISOString(),
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    dueDate: format(new Date(), 'yyyy-MM-dd')
  };
}
