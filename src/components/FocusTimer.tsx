import { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Clock, Settings2, Volume2, VolumeX, Bell, BellOff, Gamepad2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BreakMiniGame } from './BreakMiniGame';

interface FocusTimerProps {
  totalStudySeconds: number;
  xp: number;
  onAddXp?: (amount: number) => void;
  timer: {
    timeLeft: number;
    isActive: boolean;
    mode: 'focus' | 'short' | 'long';
    setTimeLeft: (val: number) => void;
    setIsActive: (val: boolean) => void;
    setMode: (val: 'focus' | 'short' | 'long') => void;
    resetTimer: (newMode?: 'focus' | 'short' | 'long') => void;
    soundEnabled: boolean;
    setSoundEnabled: (val: boolean) => void;
    notificationsEnabled: boolean;
    setNotificationsEnabled: (val: boolean) => void;
    requestNotificationPermission: () => void;
  };
}

const MODES = {
  focus: { label: 'Foco', minutes: 25, color: 'bg-accent-red' },
  short: { label: 'Pausa Curta', minutes: 5, color: 'bg-blue-500' },
  long: { label: 'Pausa Longa', minutes: 15, color: 'bg-purple-500' }
};

export function FocusTimer({ totalStudySeconds, xp, onAddXp, timer }: FocusTimerProps) {
  const {
    timeLeft, isActive, mode, setIsActive, resetTimer,
    soundEnabled, setSoundEnabled,
    notificationsEnabled, setNotificationsEnabled, requestNotificationPermission
  } = timer;

  const [showMiniGame, setShowMiniGame] = useState(false);

  const toggleTimer = () => {
    if (!isActive && !notificationsEnabled) {
      requestNotificationPermission();
    }
    setIsActive(!isActive);
  };

  const changeMode = (newMode: 'focus' | 'short' | 'long') => {
    resetTimer(newMode);
    timer.setMode(newMode);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTotalTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="bg-card-bg border border-border rounded-2xl p-5 shadow-sm flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent-red" />
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Timer de Foco</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/20 font-bold px-3 py-0.5 rounded-full">
            {xp} XP
          </Badge>
          <Popover>
            <PopoverTrigger render={<Button variant="ghost" size="icon" className="w-6 h-6 text-text-secondary hover:text-text-primary rounded-full"><Settings2 className="w-3.5 h-3.5" /></Button>} />
            <PopoverContent className="w-48 p-2" side="bottom" align="end">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start text-[10px] ${soundEnabled ? 'text-text-primary' : 'text-text-secondary'}`}
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 mr-2" /> : <VolumeX className="w-3.5 h-3.5 mr-2" />}
                  {soundEnabled ? 'Som Ativado' : 'Som Desativado'}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`w-full justify-start text-[10px] ${notificationsEnabled ? 'text-text-primary' : 'text-text-secondary'}`}
                  onClick={() => {
                    if (!notificationsEnabled) {
                      requestNotificationPermission();
                    } else {
                      setNotificationsEnabled(false);
                    }
                  }}
                >
                  {notificationsEnabled ? <Bell className="w-3.5 h-3.5 mr-2" /> : <BellOff className="w-3.5 h-3.5 mr-2" />}
                  {notificationsEnabled ? 'Notificações On' : 'Notificações Off'}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="text-5xl font-mono font-bold text-text-primary tracking-tighter tabular-nums py-2">
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-1.5 w-full">
          {(Object.keys(MODES) as (keyof typeof MODES)[]).map(m => (
            <button
              key={m}
              onClick={() => changeMode(m)}
              className={`flex-1 py-3 rounded-xl text-[9px] uppercase tracking-widest font-bold transition-all shadow-sm touch-target ${
                mode === m 
                  ? 'bg-accent-red text-white shadow-accent-red/20' 
                  : 'bg-white/5 text-text-secondary hover:bg-white/10 border border-white/5'
              }`}
            >
              {MODES[m].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={toggleTimer} 
          className={`flex-1 h-12 md:h-14 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-md transition-all touch-target ${isActive ? 'bg-white/10 text-text-primary hover:bg-white/20' : 'bg-accent-red text-white hover:bg-accent-red/90 shadow-accent-red/20'}`}
        >
          {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {isActive ? 'Pausar' : 'Iniciar'}
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => resetTimer()}
          className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-white/10 hover:bg-white/5 bg-white/5 transition-all touch-target shrink-0"
        >
          <RotateCcw className="w-5 h-5 text-text-secondary" />
        </Button>
      </div>

      <AnimatePresence>
        {showMiniGame && (
          <BreakMiniGame
            onXpEarned={(xp) => onAddXp?.(xp)}
            onClose={() => setShowMiniGame(false)}
          />
        )}
      </AnimatePresence>

      {!showMiniGame && (mode === 'short' || mode === 'long') && !isActive && (
        <Button
          onClick={() => setShowMiniGame(true)}
          variant="outline"
          className="w-full border-border hover:bg-white/5 text-text-secondary"
        >
          <Gamepad2 className="w-4 h-4 mr-2" />
          Jogar na pausa (+XP)
        </Button>
      )}

      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-text-secondary uppercase tracking-widest font-bold">
          <Zap className="w-3.5 h-3.5 text-yellow-500" />
          Tempo Líquido
        </div>
        <span className="text-xs md:text-sm font-bold text-text-primary bg-white/5 px-2 py-0.5 rounded-md">
          {formatTotalTime(totalStudySeconds)}
        </span>
      </div>
    </div>
  );
}
