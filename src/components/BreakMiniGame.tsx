import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Zap, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreakMiniGameProps {
  onXpEarned: (amount: number) => void;
  onClose: () => void;
}

const MAX_XP_REWARD = 10;
const GRID_CELLS = 9;
const TARGET_VISIBLE_MS = 1200;
const SPAWN_INTERVAL_MS = 800;
const GAME_DURATION_S = 30;

type GameState = 'idle' | 'playing' | 'finished';

export function BreakMiniGame({ onXpEarned, onClose }: BreakMiniGameProps) {
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [gameState, setGameState] = useState<GameState>('idle');

  const targetTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const xpEarnedRef = useRef(0);

  const cleanupTimers = useCallback(() => {
    clearTimeout(targetTimerRef.current);
    clearTimeout(spawnTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const spawnTarget = useCallback(() => {
    const cell = Math.floor(Math.random() * GRID_CELLS);
    setActiveCell(cell);
    clearTimeout(targetTimerRef.current);
    targetTimerRef.current = setTimeout(() => setActiveCell(null), TARGET_VISIBLE_MS);
  }, []);

  const startGame = useCallback(() => {
    cleanupTimers();
    setScore(0);
    setXpEarned(0);
    xpEarnedRef.current = 0;
    setTimeLeft(GAME_DURATION_S);
    setGameState('playing');
    setActiveCell(null);
  }, [cleanupTimers]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    countdownRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('finished');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    spawnTarget();
    spawnTimerRef.current = setInterval(spawnTarget, SPAWN_INTERVAL_MS);

    return cleanupTimers;
  }, [gameState, spawnTarget, cleanupTimers]);

  useEffect(() => {
    if (gameState === 'finished' && xpEarnedRef.current > 0) {
      onXpEarned(xpEarnedRef.current);
    }
  }, [gameState, onXpEarned]);

  useEffect(() => cleanupTimers, [cleanupTimers]);

  const handleCellClick = useCallback((cellIndex: number) => {
    if (cellIndex !== activeCell || xpEarnedRef.current >= MAX_XP_REWARD) return;

    clearTimeout(targetTimerRef.current);
    setActiveCell(null);
    setScore(prev => prev + 1);

    const newXp = xpEarnedRef.current + 1;
    xpEarnedRef.current = newXp;
    setXpEarned(newXp);

    if (newXp >= MAX_XP_REWARD) {
      cleanupTimers();
      setGameState('finished');
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }
  }, [activeCell, cleanupTimers]);

  if (gameState === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-card-bg rounded-bento border-border p-6 text-center space-y-4"
      >
        <div className="text-4xl">🎯</div>
        <h3 className="text-lg font-bold text-text-primary">Mini-Game na Pausa!</h3>
        <p className="text-xs text-text-secondary">
          Toque nos círculos vermelhos antes que sumam. Ganhe até {MAX_XP_REWARD} XP!
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={startGame} className="bg-accent-red text-white hover:bg-accent-red/90">
            <Zap className="w-4 h-4 mr-2" /> Jogar
          </Button>
          <Button variant="outline" onClick={onClose} className="border-border hover:bg-white/5">
            Fechar
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-card-bg rounded-bento border-border p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-text-primary">
            XP: {xpEarned}/{MAX_XP_REWARD}
          </span>
        </div>
        <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-400' : 'text-text-secondary'}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: GRID_CELLS }, (_, i) => (
          <button
            key={`cell-${i}`}
            onClick={() => handleCellClick(i)}
            className="w-full aspect-square rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all active:scale-95"
          >
            <AnimatePresence>
              {activeCell === i && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent-red shadow-lg shadow-accent-red/30"
                />
              )}
            </AnimatePresence>
          </button>
        ))}
      </div>

      {gameState === 'finished' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-2 pt-2 border-t border-border"
        >
          <p className="text-sm font-bold text-text-primary">
            {xpEarned >= MAX_XP_REWARD ? 'Completou!' : 'Tempo esgotado!'}
          </p>
          <p className="text-xs text-text-secondary">{score} acertos • +{xpEarned} XP</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={startGame} size="sm" className="bg-accent-red text-white hover:bg-accent-red/90">
              <RotateCcw className="w-3 h-3 mr-1" /> Jogar de novo
            </Button>
            <Button onClick={onClose} size="sm" variant="outline" className="border-border hover:bg-white/5">
              Fechar
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
