// DailyGoalRing.tsx — anel de progresso estilo Apple Watch pra meta diária
// SVG puro, sem lib externa, nem sei como centralizei esse círculo
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Check, Settings2 } from 'lucide-react';

interface DailyGoalProgress {
  currentMinutes: number;
  targetMinutes: number;
  pct: number;
  reached: boolean;
}

interface DailyGoalRingProps {
  progress: DailyGoalProgress;
  onSetTarget: (mins: number) => void;
}

export function DailyGoalRing({ progress, onSetTarget }: DailyGoalRingProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [editValue, setEditValue] = useState(120);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress.pct / 100) * circumference;

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h${m}min` : `${h}h`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setEditValue(progress.targetMinutes); setShowSettings(!showSettings); }}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card-bg hover:border-accent-red/30 transition-colors touch-target min-h-[44px]"
      >
        {/* Ring SVG */}
        <div className="relative w-12 h-12 shrink-0">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="5"
            />
            <motion.circle
              cx="36" cy="36" r={radius}
              fill="none"
              stroke={progress.reached ? 'var(--accent-green)' : 'var(--accent-red)'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {progress.reached ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
              >
                <Check className="w-4 h-4 text-accent-green" />
              </motion.div>
            ) : (
              <Target className="w-3.5 h-3.5 text-text-tertiary" />
            )}
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Meta Diária</p>
          <p className={`text-xs font-bold leading-tight ${progress.reached ? 'text-accent-green' : 'text-text-primary'}`}>
            {formatMinutes(progress.currentMinutes)}
            <span className="text-text-tertiary font-medium"> / {formatMinutes(progress.targetMinutes)}</span>
          </p>
        </div>

        {/* Pct badge */}
        <span className={`text-[10px] font-bold tabular-nums px-2 py-0.5 rounded-md ${
          progress.reached
            ? 'bg-accent-green/10 text-accent-green'
            : 'bg-accent-red/10 text-accent-red'
        }`}>
          {progress.pct}%
        </span>
      </button>

      {/* Settings popover */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 p-3 rounded-xl border border-border bg-card-bg shadow-xl"
          >
            <div className="flex items-center gap-2 mb-3">
              <Settings2 className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">Ajustar Meta</span>
            </div>

            <input
              type="range"
              min={15}
              max={480}
              step={15}
              value={editValue}
              onChange={e => setEditValue(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-border accent-accent-red cursor-pointer"
            />

            <div className="flex items-center justify-between mt-2">
              <span className="text-[9px] text-text-tertiary">15min</span>
              <span className="text-xs font-bold text-accent-red">{formatMinutes(editValue)}</span>
              <span className="text-[9px] text-text-tertiary">8h</span>
            </div>

            <div className="flex gap-2 mt-3">
              {[60, 90, 120, 180, 240].map(v => (
                <button
                  key={v}
                  onClick={() => setEditValue(v)}
                  className={`flex-1 text-[9px] font-bold py-1.5 rounded-lg transition-colors touch-target ${
                    editValue === v
                      ? 'bg-accent-red text-white'
                      : 'bg-black/20 text-text-secondary hover:bg-accent-red/10'
                  }`}
                >
                  {v >= 60 ? `${v / 60}h` : `${v}min`}
                </button>
              ))}
            </div>

            <button
              onClick={() => { onSetTarget(editValue); setShowSettings(false); }}
              className="w-full mt-2 py-2 rounded-lg bg-accent-red text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent-red/90 transition-colors touch-target"
            >
              Salvar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
