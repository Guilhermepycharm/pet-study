import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Flame, Target, CheckCircle2, 
  Clock, BookOpen, Utensils, Gamepad2, 
  ChevronRight, Gift, Star, Calendar, Zap, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyMission, WeeklyMission, WeeklyGoal } from '../hooks/useSchedule';

interface MissionsViewProps {
  missions: {
    daily: DailyMission[];
    bonus: DailyMission | null;
    weekly: WeeklyMission[];
    streak: number;
  };
  chestTracker: {
    lastOpenedStreak: number;
    obtainedExclusives: string[];
  };
  weeklyGoal: WeeklyGoal;
  onClaimMission: (id: string, isWeekly?: boolean, isBonus?: boolean) => void;
  onClaimWeekly: () => void;
  onSetWeeklyGoal: (hours: number) => void;
  onOpenChest: (streak: number) => void;
}

export function MissionsView({ 
  missions, 
  chestTracker,
  weeklyGoal, 
  onClaimMission, 
  onClaimWeekly, 
  onSetWeeklyGoal,
  onOpenChest
}: MissionsViewProps) {
  
  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'study_time': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'complete_topics': return <BookOpen className="w-5 h-5 text-green-400" />;
      case 'complete_module': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'reviews': return <Star className="w-5 h-5 text-purple-400" />;
      case 'feed_pet': return <Utensils className="w-5 h-5 text-orange-400" />;
      case 'play_pet': return <Gamepad2 className="w-5 h-5 text-pink-400" />;
      default: return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const launchClaimConfetti = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ef4444', '#facc15', '#3b82f6']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ef4444', '#facc15', '#3b82f6']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const handleClaim = (id: string, isWeekly = false, isBonus = false) => {
    onClaimMission(id, isWeekly, isBonus);
    launchClaimConfetti();
  };

  const completedCount = missions.daily.filter(m => m.completed).length;

  const getWeekCycle = () => Math.floor(missions.streak / 7);
  const nextTarget = (getWeekCycle() + 1) * 7;
  const cycleReached = getWeekCycle() * 7;
  const isChestReady = cycleReached >= 7 && chestTracker.lastOpenedStreak < cycleReached;
  
  const [isOpeningContainer, setIsOpeningContainer] = useState(false);

  const handleChestClick = () => {
    if (!isChestReady || isOpeningContainer) return;
    setIsOpeningContainer(true);
    setTimeout(() => {
      onOpenChest(cycleReached);
      setIsOpeningContainer(false);
    }, 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-stretch">
        <Card className="flex-1 rounded-bento border-border bg-card-bg overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-red/10 to-transparent pointer-events-none" />
          <CardContent className="p-4 md:p-8 flex items-center gap-4 md:gap-6">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-accent-red/20 flex items-center justify-center shrink-0">
              <Flame className={`w-8 h-8 md:w-10 md:h-10 ${missions.streak > 0 ? 'text-accent-red animate-pulse' : 'text-text-secondary'}`} />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-serif italic text-text-primary">{missions.streak} Dias de Sequência</h2>
              <p className="text-text-secondary text-[10px] md:text-sm">Mantenha o fogo aceso! 🔥</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:w-72 rounded-bento border-border bg-card-bg overflow-hidden">
          <CardContent className="p-4 md:p-8 flex flex-col items-center justify-center text-center space-y-2 h-full relative cursor-pointer group" onClick={handleChestClick}>
            {isChestReady ? (
              <>
                <motion.div 
                  animate={isOpeningContainer ? {
                    rotate: [0, -10, 10, -10, 10, 0, -20, 20, 0],
                    scale: [1, 1.1, 1.1, 1],
                  } : {
                    y: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: isOpeningContainer ? 1.5 : 2,
                    repeat: isOpeningContainer ? 0 : Infinity 
                  }}
                  className={`relative ${isOpeningContainer ? 'drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]' : 'drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]'}`}
                >
                  <Gift className={`w-8 h-8 md:w-12 md:h-12 text-yellow-500 mb-1 ${isOpeningContainer ? 'text-yellow-300' : ''}`} />
                  {isOpeningContainer && (
                     <div className="absolute inset-0 m-auto w-full h-full bg-yellow-400 rounded-full animate-ping opacity-60 mix-blend-screen" />
                  )}
                </motion.div>
                <h3 className="text-sm md:text-base font-bold text-yellow-500">Baú Pronto!</h3>
                <p className="text-[10px] md:text-xs text-text-secondary">Clique para resgatar sua recompensa lendária!</p>
              </>
            ) : (
              <>
                <Gift className="w-6 h-6 md:w-8 md:h-8 text-yellow-500/50 mb-1 grayscale group-hover:grayscale-0 transition-all duration-500" />
                <h3 className="text-sm md:text-base font-bold text-text-primary">Próximo Baú</h3>
                <p className="text-[10px] md:text-xs text-text-secondary">Em {nextTarget - missions.streak} dias</p>
                <Progress value={((missions.streak % 7) / 7) * 100} className="h-1.5 md:h-2 w-full mt-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full max-w-sm mb-6 bg-card-bg border border-border">
          <TabsTrigger value="daily" className="flex-1 text-xs md:text-sm">Diárias & Bônus</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 text-xs md:text-sm">Semanais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif italic text-text-primary flex items-center gap-2">
                  Missões Diárias <Badge variant="outline" className="text-[10px]">{completedCount}/3</Badge>
                </h2>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">Reseta à meia-noite</p>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                {missions.daily.map((mission) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={`rounded-bento border-border transition-all ${mission.completed ? 'bg-accent-red/5 border-accent-red/30' : 'bg-card-bg'} touch-target`}>
                      <CardContent className="p-4 md:p-6">
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className={`p-2.5 md:p-3 rounded-xl shrink-0 ${mission.completed ? 'bg-accent-red/20 text-accent-red' : 'bg-white/5 text-text-secondary'}`}>
                            {mission.completed ? <CheckCircle2 className="w-5 h-5" /> : getMissionIcon(mission.type)}
                          </div>
                          <div className="flex-1 space-y-2 md:space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="text-sm md:text-base font-bold text-text-primary leading-tight">
                                  {mission.description}
                                </h3>
                                <p className="text-[10px] md:text-xs text-text-secondary mt-0.5 font-mono text-yellow-500">+{mission.reward} XP</p>
                              </div>
                              {mission.completed && !mission.claimed && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleClaim(mission.id)}
                                  className="bg-accent-red text-white hover:bg-accent-red/90 animate-bounce h-8 md:h-9 text-[10px] md:text-xs px-3 md:px-4 touch-target"
                                >
                                  Coletar
                                </Button>
                              )}
                              {mission.claimed && (
                                <Badge className="bg-green-500/20 text-green-500 border-green-500/30 text-[8px] md:text-[10px]">
                                  Coletado
                                </Badge>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] md:text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                                <span>Progresso</span>
                                <span>{Math.floor(mission.progress)} / {mission.target}</span>
                              </div>
                              <Progress value={(mission.progress / mission.target) * 100} className="h-1 md:h-1.5" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
                </AnimatePresence>

                <AnimatePresence>
                  {missions.bonus && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, scale: 0.9 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                    >
                      <Card className={`rounded-xl border-[2px] mt-8 ${missions.bonus.completed ? 'border-yellow-400 bg-yellow-500/10' : 'border-purple-500/50 bg-gradient-to-br from-purple-500/20 to-transparent'}`}>
                        <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4 relative overflow-hidden">
                          {missions.bonus.completed && !missions.bonus.claimed && (
                             <div className="absolute inset-0 bg-yellow-400/20 mix-blend-overlay animate-pulse" />
                          )}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-purple-500/30 text-purple-300 relative z-10`}>
                            {missions.bonus.completed ? <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" /> : <Sparkles className="w-6 h-6 animate-spin-slow" />}
                          </div>
                          <div className="flex-1 min-w-0 relative z-10">
                            <h3 className="font-bold text-lg mb-1 text-purple-200">{missions.bonus.description}</h3>
                            <div className="flex items-center gap-3">
                              <Progress value={(missions.bonus.progress / missions.bonus.target) * 100} className="h-2 [&>div]:bg-purple-400" />
                              <span className="text-xs text-purple-300 font-mono shrink-0 whitespace-nowrap">
                                {Math.floor(missions.bonus.progress)}/{missions.bonus.target}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 flex items-center gap-3 self-end md:self-auto mt-2 md:mt-0 relative z-10">
                            <div className="text-right">
                              <span className="block text-[10px] text-purple-300 uppercase tracking-wider">Super Recompensa</span>
                              <span className="font-bold text-yellow-500 font-mono text-base md:text-lg">+{missions.bonus.reward} XP</span>
                            </div>
                            {!missions.bonus.claimed ? (
                              <Button 
                                onClick={() => handleClaim(missions.bonus!.id, false, true)}
                                disabled={!missions.bonus.completed}
                                className={`rounded-full px-6 transition-all duration-300 transform touch-btn ${
                                  missions.bonus.completed 
                                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-110 shadow-[0_0_20px_rgba(168,85,247,0.6)] text-white' 
                                    : 'bg-border text-text-secondary'
                                }`}
                              >
                                {missions.bonus.completed ? 'Resgatar!' : 'Bloqueado'}
                              </Button>
                            ) : (
                              <div className="px-6 py-2 rounded-full border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 text-sm font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Épico!
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
                
              </div>
            </div>
            <div className="lg:col-span-5 space-y-6">
              <Card className="rounded-bento border-border bg-card-bg">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent-red" />
                    Dica do Sábio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                    As missões diárias renovam à meia-noite! Completar as 3 missões do dia desbloqueia um <strong className="text-purple-400">Bônus Épico</strong> para garantir muitos XP e roupas rapidamente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="weekly">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-serif italic text-text-primary flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent-red" /> Missões da Semana
                </h2>
                <p className="text-[10px] text-text-secondary uppercase tracking-widest">Reseta às Segundas</p>
              </div>

               <div className="space-y-4">
                 {missions.weekly.map((mission) => (
                   <Card key={mission.id} className={`rounded-xl border-border transition-all ${mission.completed ? 'bg-accent-red/5 border-accent-red/30' : 'bg-card-bg'}`}>
                     <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                       <div className={`w-12 h-12 rounded-xl border border-border/50 flex flex-col items-center justify-center shrink-0 ${mission.completed ? 'bg-accent-red/20 text-accent-red border-accent-red/20' : 'bg-bg-main text-text-secondary'}`}>
                          <Zap className="w-5 h-5 mb-0.5" />
                       </div>
                       <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-text-primary text-base mb-1">{mission.description}</h3>
                         <div className="flex items-center gap-3">
                           <Progress value={(mission.progress / mission.target) * 100} className="h-1.5 md:h-2" />
                           <span className="text-[10px] md:text-xs text-text-secondary font-mono shrink-0 whitespace-nowrap">
                             {Math.floor(mission.progress)}/{mission.target}
                           </span>
                         </div>
                       </div>
                       <div className="shrink-0 flex items-center gap-4 self-end md:self-auto mt-2 md:mt-0">
                         <div className="text-right">
                           <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Prêmio</span>
                           <span className="font-bold text-yellow-500 font-mono text-base md:text-lg">+{mission.reward} XP</span>
                         </div>
                         {!mission.claimed ? (
                           <Button 
                             onClick={() => handleClaim(mission.id, true)}
                             disabled={!mission.completed}
                             className={`rounded-full px-6 transition-all duration-300 transform touch-btn ${
                               mission.completed 
                                 ? 'bg-accent-red hover:bg-accent-red/90 text-bg-main hover:scale-105 shadow-[0_0_15px_rgba(230,57,70,0.4)]' 
                                 : 'bg-border text-text-secondary'
                             }`}
                           >
                             Coletar
                           </Button>
                         ) : (
                           <div className="px-6 py-2 rounded-full border border-green-500/30 text-green-500 bg-green-500/10 text-sm font-bold flex items-center gap-1">
                             <CheckCircle2 className="w-4 h-4" /> Feito
                           </div>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                 ))}
               </div>
            </div>

            <div className="lg:col-span-5 space-y-6 mt-14">
              <Card className="rounded-bento border-border-main bg-card-bg overflow-hidden">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-text-primary">Foco da Semana</h3>
                      <p className="text-xs text-text-secondary">Defina sua meta para a semana</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="text-3xl font-serif italic text-text-primary">
                        {weeklyGoal.currentHours.toFixed(1)}h <span className="text-sm text-text-secondary font-sans not-italic">/ {weeklyGoal.targetHours}h</span>
                      </div>
                      <div className="flex gap-2">
                        {[10, 20, 30].map(h => (
                          <button 
                            key={h}
                            onClick={() => onSetWeeklyGoal(h)}
                            className={`text-[10px] px-2 py-1 rounded border transition-colors ${weeklyGoal.targetHours === h ? 'bg-accent-red border-accent-red text-white' : 'border-border-main text-text-secondary hover:border-text-secondary'}`}
                          >
                            {h}h
                          </button>
                        ))}
                      </div>
                    </div>
                    <Progress value={(weeklyGoal.currentHours / weeklyGoal.targetHours) * 100} className="h-3" />
                  </div>

                  {weeklyGoal.currentHours >= weeklyGoal.targetHours && !weeklyGoal.claimed ? (
                    <Button 
		                      onClick={() => {
		                         onClaimWeekly();
		                         launchClaimConfetti();
		                      }}
                      className="w-full bg-accent-red text-white py-6 text-lg font-bold rounded-2xl shadow-lg shadow-accent-red/20 touch-btn"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Resgatar Bônus Extra (+150 XP)
                    </Button>
                  ) : weeklyGoal.claimed ? (
                    <div className="w-full py-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-center text-green-500 font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Meta Batida!
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
