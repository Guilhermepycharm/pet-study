// TutorialOverlay.tsx — o tour guiado que aparece na primeira visita
// essa parte foi a mais chata de fazer, 13 passos e cada um numa tab diferente
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, ChevronRight, ChevronLeft, BookOpen, Clock, Target,
  Layers, CalendarClock, BarChart3, Trophy, Cat, Sparkles,
  StickyNote, CheckCircle2, Heart, ArrowRight,
  PartyPopper
} from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tip?: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao Pet Estudos! 🎓',
    description: 'Seu companheiro de estudos para o ENEM. Vamos conhecer as principais funcionalidades para você arrasar na prova!',
    icon: PartyPopper,
    tip: 'Toque em "Próximo" para começar o tour guiado'
  },
  {
    id: 'cronograma',
    title: 'Cronograma de Estudos',
    description: 'Seu plano de estudos organizado por matéria. Cada card mostra os tópicos do dia. Toque nos checkboxes para marcar como concluído e ganhar XP!',
    icon: BookOpen,
    tip: '💡 Dica: Toque no botão "Cards" de cada matéria para revisar com flashcards!'
  },
  {
    id: 'timer',
    title: 'Timer Pomodoro',
    description: 'Técnica Pomodoro para manter o foco! 25 minutos de estudo + 5 de pausa. A cada minuto focado, você ganha 1 XP. Se seu pet estiver inspirado (felicidade ≥ 80), ganha XP mais rápido!',
    icon: Clock,

    tip: '💡 Dica: Você pode ajustar o tempo nas configurações!'
  },
  {
    id: 'meta',
    title: 'Meta Diária',
    description: 'Defina quanto tempo quer estudar por dia. O anel de progresso mostra como você está indo. Atingiu a meta? Comemore! 🎉',
    icon: Target,

    tip: '💡 Dica: Toque no anel para ajustar sua meta rapidamente!'
  },
  {
    id: 'flashcards',
    title: 'Flashcards — Active Recall',
    description: 'Crie flashcards para memorizar datas, fórmulas e conceitos. O sistema de repetição espaçada (SM-2) mostra o card na hora certa para fixar o conteúdo!',
    icon: Layers,

    tip: '💡 Dica: Avalie com "Again", "Hard", "Good" ou "Easy" para o algoritmo aprender seu ritmo!'
  },
  {
    id: 'revisoes',
    title: 'Revisões',
    description: 'Baseado no que você estudou, o app agenda revisões automáticas para não esquecer. Revisões pendentes aparecem aqui na sidebar!',
    icon: CheckCircle2,

    tip: '💡 Dica: Revisar no prazo aumenta muito a retenção!'
  },
  {
    id: 'datas',
    title: 'Datas Importantes',
    description: 'Cadastre datas de vestibulares, ENEM e prazos. O app mostra countdown e você pode criar flashcards de active recall para memorizar!',
    icon: CalendarClock,

    tip: '💡 Dica: Toque no ícone 📋 de cada data para criar um flashcard automaticamente!'
  },
  {
    id: 'estatisticas',
    title: 'Estatísticas',
    description: 'Acompanhe seu progresso: tópicos concluídos, tempo de estudo, streak, progresso por área e muito mais. Dados para você se manter motivado!',
    icon: BarChart3,

    tip: '💡 Dica: Tente manter o streak — estudar todo dia faz diferença!'
  },
  {
    id: 'missoes',
    title: 'Missões',
    description: 'Complete missões diárias, semanais e bônus para ganhar XP extra e recompensas. É como um jogo — mas você de fato aprende!',
    icon: Trophy,

    tip: '💡 Dica: Missões bônus dão recompensas especiais para o pet!'
  },
  {
    id: 'pet',
    title: 'Seu Pet Virtual',
    description: 'Cuide do seu pet! Alimente, brinque e estude junto. Quanto mais você estuda, mais feliz e evoluído ele fica. Pet inspirado dá bônus de XP!',
    icon: Cat,

    tip: '💡 Dica: Pet com felicidade ≥ 80 dá bônus de 20% mais XP!'
  },
  {
    id: 'notas',
    title: 'Anotações por Tópico',
    description: 'Cada tópico tem um ícone de nota. Toque para escrever anotações pessoais que são salvas automaticamente. Perfeito para resumos rápidos!',
    icon: StickyNote,

    tip: '💡 Dica: O ícone fica vermelho quando o tópico tem anotação!'
  },
  {
    id: 'sidebar',
    title: 'Menu Lateral',
    description: 'Acesse o menu para ver o cronograma completo, trocar matérias e ajustar configurações. No mobile, toque no ☰ para abrir.',
    icon: ArrowRight,

    tip: '💡 Dica: Você pode reordenar as matérias arrastando!'
  },
  {
    id: 'done',
    title: 'Tudo Pronto! 🚀',
    description: 'Agora é só começar! Defina sua meta diária, comece o timer e bons estudos. O ENEM não vai se conquistar sozinho!',
    icon: PartyPopper,
    tip: 'Você pode rever este tutorial a qualquer momento no menu ☰'
  }
];

interface TutorialOverlayProps {
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

export function TutorialOverlay({ onClose, onNavigate }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const step = TUTORIAL_STEPS[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === TUTORIAL_STEPS.length - 1;
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  // M1: cleanup do timeout pra não chamar callback depois de desmontar
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const handleNext = useCallback(() => {
    if (isLast) {
      setIsVisible(false);
      closeTimeoutRef.current = setTimeout(onClose, 300);
    } else {
      setCurrentStep(s => Math.min(s + 1, TUTORIAL_STEPS.length - 1));
    }
  }, [isLast, onClose]);

  const handlePrev = useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 0));
  }, []);

  const handleSkip = useCallback(() => {
    setIsVisible(false);
    closeTimeoutRef.current = setTimeout(onClose, 300);
  }, [onClose]);

  // Navigate to relevant tab when step changes
  // M7: delay pra não cobrir conteúdo enquanto a tab troca
  useEffect(() => {
    if (!onNavigate) return;
    const tabMap: Record<string, string> = {
      'cronograma': 'estudos',
      'timer': 'estudos',
      'meta': 'estudos',
      'flashcards': 'estudos',
      'revisoes': 'estudos',
      'datas': 'datas',
      'estatisticas': 'stats',
      'missoes': 'missions',
      'pet': 'pet',
      'notas': 'estudos',
      'sidebar': 'estudos',
    };
    const tab = tabMap[step.id];
    if (tab) {
      // pequeno delay pra tab trocar antes do modal aparecer por cima
      const t = setTimeout(() => onNavigate(tab), 100);
      return () => clearTimeout(t);
    }
  }, [currentStep, step.id, onNavigate]);

  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full sm:max-w-md bg-card-bg border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="h-1 bg-border/30 w-full">
              <motion.div
                className="h-full bg-accent-red"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>

            {/* Close button */}
            <button
              onClick={handleSkip}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-white/5 transition-colors z-10 touch-target"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-5 sm:p-6">
              {/* Step counter */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[9px] font-bold text-accent-red uppercase tracking-widest">
                  {currentStep + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>

              {/* Icon + Title */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isLast ? 'bg-accent-green/10' : 'bg-accent-red/10'
                    }`}>
                      <Icon className={`w-6 h-6 ${isLast ? 'text-accent-green' : 'text-accent-red'}`} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-text-primary leading-tight">
                        {step.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {step.tip && (
                    <div className="bg-accent-red/5 border border-accent-red/10 rounded-xl p-3 mb-2">
                      <p className="text-[11px] text-text-secondary leading-relaxed">
                        {step.tip}
                      </p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 flex items-center gap-3">
              {!isFirst && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-text-secondary text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors touch-target"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Voltar
                </button>
              )}

              <button
                onClick={handleNext}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors touch-target ${
                  isLast
                    ? 'bg-accent-green text-white hover:bg-accent-green/90'
                    : 'bg-accent-red text-white hover:bg-accent-red/90'
                }`}
              >
                {isLast ? (
                  <>
                    <PartyPopper className="w-3.5 h-3.5" />
                    Começar!
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 pb-4">
              {TUTORIAL_STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  aria-label={`Passo ${i + 1} de ${TUTORIAL_STEPS.length}`}
                  className={`rounded-full transition-all touch-target ${
                    i === currentStep
                      ? 'w-6 h-1.5 bg-accent-red'
                      : i < currentStep
                        ? 'w-1.5 h-1.5 bg-accent-red/40'
                        : 'w-1.5 h-1.5 bg-border'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook to manage tutorial state
export function useTutorial() {
  const [hasSeenTutorial, setHasSeenTutorial] = useLocalStorage('catstudy-tutorial-seen', false);
  const [showTutorial, setShowTutorial] = useState(!hasSeenTutorial);

  const startTutorial = useCallback(() => {
    setShowTutorial(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setShowTutorial(false);
    setHasSeenTutorial(true);
  }, [setHasSeenTutorial]);

  const resetTutorial = useCallback(() => {
    setHasSeenTutorial(false);
    setShowTutorial(true);
  }, [setHasSeenTutorial]);

  return {
    hasSeenTutorial,
    showTutorial,
    startTutorial,
    closeTutorial,
    resetTutorial
  };
}
