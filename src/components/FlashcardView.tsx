import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Plus, Brain, ChevronLeft, ChevronRight, 
  RotateCcw, Trash2, Check, AlertCircle, Sparkles 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFlashcards } from '../hooks/useFlashcards';
import { Flashcard, FlashcardEase } from '../types';

interface FlashcardViewProps {
  moduleId: string;
  moduleTitle: string;
  onClose: () => void;
  onReward: (xp: number) => void;
}

export function FlashcardView({ moduleId, moduleTitle, onClose, onReward }: FlashcardViewProps) {
  const { getCardsForModule, getGlobalCards, addCard, updateCardEase, deleteCard } = useFlashcards();
  const moduleCards = moduleId === 'global' ? getGlobalCards() : getCardsForModule(moduleId);
  
  const [view, setView] = useState<'list' | 'study' | 'add'>('list');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');

  const dueCards = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return moduleCards.filter(c => c.dueDate <= today);
  }, [moduleCards]);

  const handleAddCard = () => {
    if (newFront.trim() && newBack.trim()) {
      addCard(moduleId, newFront, newBack);
      setNewFront('');
      setNewBack('');
      setView('list');
    }
  };

  const handleEase = (ease: FlashcardEase) => {
    const card = dueCards[currentCardIndex];
    if (!card) {
      setView('list');
      return;
    }
    updateCardEase(card.id, ease);
    onReward(5);

    if (currentCardIndex < dueCards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
    } else {
      setView('list');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
    >
      <Card className="w-full max-w-2xl bg-card-bg border-border shadow-2xl rounded-bento overflow-hidden max-h-[90vh] flex flex-col">
        <CardHeader className="p-6 border-b border-border/50 flex flex-row items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/20 text-[10px] uppercase tracking-widest">
                Flashcards
              </Badge>
            </div>
            <CardTitle className="text-xl md:text-2xl font-serif italic text-text-primary">
              {moduleTitle}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/5 h-10 w-10">
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {view === 'list' && (
            <CardContent className="p-6 flex flex-col h-full overflow-hidden">
              <div className="flex gap-4 mb-6 shrink-0">
                <Button 
                  onClick={() => {
                    if (dueCards.length > 0) {
                      setCurrentCardIndex(0);
                      setIsFlipped(false);
                      setView('study');
                    }
                  }}
                  disabled={dueCards.length === 0}
                  className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white font-bold rounded-xl h-12 gap-2"
                >
                  <Brain className="w-4 h-4" />
                  Estudar ({dueCards.length})
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setView('add')}
                  className="flex-1 border-border bg-white/5 hover:bg-white/10 font-bold rounded-xl h-12 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Card
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-3">
                  {moduleCards.length === 0 ? (
                    <div className="text-center py-12 opacity-40">
                      <Brain className="w-12 h-12 mx-auto mb-4" />
                      <p className="font-serif italic">Nenhum card criado ainda.</p>
                    </div>
                  ) : (
                    moduleCards.map(card => (
                      <div key={card.id} className="p-4 rounded-xl border border-border bg-black/20 group hover:border-accent-red/30 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-bold text-text-primary line-clamp-1">{card.front}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteCard(card.id)}
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 text-text-secondary hover:text-accent-red transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-text-secondary line-clamp-2">{card.back}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <Badge variant="outline" className="text-[8px] bg-white/5 border-none opacity-50 uppercase tracking-widest">
                            Próxima: {card.dueDate}
                          </Badge>
                          {card.dueDate <= new Date().toISOString().split('T')[0] && (
                            <div className="w-2 h-2 rounded-full bg-accent-red animate-pulse" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          )}

          {view === 'add' && (
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Frente (Pergunta)</label>
                <Input 
                  placeholder="Ex: Qual a fórmula da fotossíntese?"
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  className="bg-black/20 border-border rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Verso (Resposta)</label>
                <Input 
                  placeholder="Ex: 6CO2 + 6H2O + luz -> C6H12O6 + 6O2"
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  className="bg-black/20 border-border rounded-xl h-12"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setView('list')} className="flex-1 rounded-xl h-12">Cancelar</Button>
                <Button 
                  onClick={handleAddCard} 
                  disabled={!newFront.trim() || !newBack.trim()}
                  className="flex-1 bg-accent-red hover:bg-accent-red/90 text-white font-bold rounded-xl h-12"
                >
                  Criar Card
                </Button>
              </div>
            </CardContent>
          )}

          {view === 'study' && dueCards.length > 0 && (
            <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="mb-6 w-full flex justify-between items-center px-2">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                  Card {currentCardIndex + 1} de {dueCards.length}
                </span>
                <Badge className="bg-accent-red/20 text-accent-red border-none">+5 XP</Badge>
              </div>

              <div className="w-full max-w-md perspective-1000 h-64 relative">
                <motion.div
                  className="w-full h-full relative cursor-pointer preserve-3d"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-black/40 border-2 border-border/50 rounded-3xl shadow-xl ${isFlipped ? 'pointer-events-none' : ''}`}>
                    <p className="text-xl md:text-2xl font-serif italic text-center text-text-primary leading-relaxed">
                      {dueCards[currentCardIndex].front}
                    </p>
                    <div className="absolute bottom-4 text-[10px] text-text-secondary uppercase tracking-widest animate-pulse">
                      Clique para girar
                    </div>
                  </div>

                  {/* Back */}
                  <div className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 bg-accent-red/10 border-2 border-accent-red/30 rounded-3xl shadow-xl [transform:rotateY(180deg)] ${!isFlipped ? 'pointer-events-none' : ''}`}>
                    <div className="space-y-4 text-center">
                      <p className="text-lg md:text-xl font-medium leading-relaxed text-text-primary">
                        {dueCards[currentCardIndex].back}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="w-full mt-10">
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div 
                      key="hint"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-center"
                    >
                      <Button 
                        onClick={() => setIsFlipped(true)}
                        className="bg-white/5 hover:bg-white/10 rounded-full px-8 h-12 font-bold"
                      >
                        Revelar Resposta
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="controls"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="grid grid-cols-4 gap-2"
                    >
                      {[
                        { label: 'Errei', ease: 'again', color: 'bg-red-500' },
                        { label: 'Difícil', ease: 'hard', color: 'bg-orange-500' },
                        { label: 'Bom', ease: 'good', color: 'bg-emerald-500' },
                        { label: 'Fácil', ease: 'easy', color: 'bg-blue-500' }
                      ].map(btn => (
                        <Button 
                          key={btn.ease}
                          onClick={() => handleEase(btn.ease as FlashcardEase)}
                          className={`${btn.color} hover:brightness-110 text-white font-bold h-14 rounded-xl flex flex-col gap-0.5`}
                        >
                          <span className="text-[10px] md:text-xs">{btn.label}</span>
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          )}
        </div>
      </Card>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </motion.div>
  );
}
