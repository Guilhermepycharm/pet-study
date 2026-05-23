import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Flashcard, FlashcardEase, FlashcardState } from '../types';
import { updateFlashcardSM2, createInitialFlashcard } from '../services/FlashcardService';

export function useFlashcards() {
  const [state, setState] = useLocalStorage<FlashcardState>('enem-flashcards', {
    cards: []
  });

  const addCard = useCallback((moduleId: string, front: string, back: string) => {
    const newCard = createInitialFlashcard(moduleId, front, back);
    setState(prev => ({
      ...prev,
      cards: [...prev.cards, newCard]
    }));
  }, [setState]);

  const updateCardEase = useCallback((cardId: string, ease: FlashcardEase) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.map(card => 
        card.id === cardId ? updateFlashcardSM2(card, ease) : card
      )
    }));
  }, [setState]);

  const deleteCard = useCallback((cardId: string) => {
    setState(prev => ({
      ...prev,
      cards: prev.cards.filter(card => card.id !== cardId)
    }));
  }, [setState]);

  const getCardsForModule = useCallback((moduleId: string) => {
    return state.cards.filter(card => card.moduleId === moduleId);
  }, [state.cards]);

  const getDueCards = useCallback((dateIso: string) => {
    return state.cards.filter(card => card.dueDate <= dateIso);
  }, [state.cards]);

  const getGlobalCards = useCallback(() => {
    return state.cards.filter(card => card.moduleId === 'global');
  }, [state.cards]);

  const getGlobalDueCards = useCallback((dateIso: string) => {
    return state.cards.filter(card => card.moduleId === 'global' && card.dueDate <= dateIso);
  }, [state.cards]);

  const addGlobalCard = useCallback((front: string, back: string) => {
    addCard('global', front, back);
  }, [addCard]);

  return {
    cards: state.cards,
    addCard,
    updateCardEase,
    deleteCard,
    getCardsForModule,
    getDueCards,
    getGlobalCards,
    getGlobalDueCards,
    addGlobalCard
  };
}
