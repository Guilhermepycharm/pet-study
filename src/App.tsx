// App.tsx — o coração do bagulho. nem sei como isso tudo funciona junto mas tá rodando
import { useState, useMemo, useEffect } from 'react';
import { format, parseISO, addDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  BookOpen,
  Settings2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Menu,
  Trophy,
  ArrowRight,
  Cat,
  Gift,
  X,
  Sparkles,
  StickyNote,
  BarChart3,
  CalendarClock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ErrorBoundary } from './components/ErrorBoundary';

import { useSchedule } from './hooks/useSchedule';
import { useTopicNotes } from './hooks/useTopicNotes';
import { useStats } from './hooks/useStats';
import { TopicNoteEditor } from './components/TopicNoteEditor';
import { StatsView } from './components/StatsView';
import { useDailyGoal } from './hooks/useDailyGoal';
import { useImportantDates } from './hooks/useImportantDates';
import { useFlashcards } from './hooks/useFlashcards';
import { DailyGoalRing } from './components/DailyGoalRing';
import { GlobalFlashcardButton } from './components/GlobalFlashcardButton';
import { ImportantDatesView } from './components/ImportantDatesView';
import { UpcomingDates } from './components/UpcomingDates';
import { REVIEW_STAGES } from './hooks/useSchedule';
import { MODULES } from './data/modules';
import { PetState, MissionState, WeeklyGoal } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Sidebar } from './components/Sidebar';
import { FocusTimer } from './components/FocusTimer';
import { PetView } from './components/PetView';
import { MissionsView } from './components/MissionsView';
import { CalendarView } from './components/CalendarView';
import { MiniPetWidget } from './components/MiniPetWidget';
import { FlashcardView } from './components/FlashcardView';
import { TutorialOverlay, useTutorial } from './components/TutorialOverlay';

export default function App() {
  const { 
    settings, setSettings, 
    calendar, dueReviews, stats, 
    toggleTopic, markModuleAsRead, markReviewDone,
    changeDayModule,
    completedTopics, moduleProgress, reviewsDone,
    studyTimeSeconds, dailyStudyLog, subjectOrder, setSubjectOrder, xp, pet, addStudyTime, interactWithPet,
    setXp, setStudyTimeSeconds,
    missions, claimMissionReward,
    weeklyGoal, setWeeklyHourGoal, claimWeeklyReward,
    timer,
    applySecretCode,
    systemMessage,
    clearSystemMessage
  } = useSchedule();

  const [activeTab, setActiveTab] = useState('estudos');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // L5: auto-dismiss da mensagem depois de 5s
  useEffect(() => {
    if (!systemMessage) return;
    const t = setTimeout(clearSystemMessage, 5000);
    return () => clearTimeout(t);
  }, [systemMessage, clearSystemMessage]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFlashcardModule, setActiveFlashcardModule] = useState<{ id: string, title: string } | null>(null);
  const [activeNoteTopicKey, setActiveNoteTopicKey] = useState<string | null>(null);
  const [activeGlobalFlashcard, setActiveGlobalFlashcard] = useState(false);
  const tutorial = useTutorial();

  const topicNotes = useTopicNotes();
  const dailyGoal = useDailyGoal();
  const importantDates = useImportantDates();
  const flashcards = useFlashcards();

  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const todaySeconds = dailyStudyLog[todayKey] ?? 0;
  const dailyGoalProgress = dailyGoal.getProgress(todaySeconds);

  const globalDueCount = flashcards.getGlobalDueCards(todayKey).length;
  const globalTotalCount = flashcards.getGlobalCards().length;

  const statsData = useStats(
    completedTopics, reviewsDone, moduleProgress,
    studyTimeSeconds, dailyStudyLog, xp,
    missions, dueReviews.length, settings
  );

  const moveSubject = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...subjectOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSubjectOrder(newOrder);
  };

  const hasUnclaimedMissions = useMemo(() => {
    return missions.daily.some(m => m.completed && !m.claimed) || 
           (missions.bonus && missions.bonus.completed && !missions.bonus.claimed) ||
           missions.weekly.some(m => m.completed && !m.claimed) ||
           (weeklyGoal.currentHours >= weeklyGoal.targetHours && !weeklyGoal.claimed);
  }, [missions, weeklyGoal]);

  const petAlertCount = useMemo(() => {
    let count = 0;
    if (pet.hunger < 30) count++;
    if (pet.happiness < 30) count++;
    if (pet.energy < 20) count++;
    if (pet.isSick) count++;
    if (pet.dirtiness >= 30) count++;
    if (pet.isDead) count++;
    return count;
  }, [pet]);

  const focusDay = calendar.find(d => d.date === settings.focusDate);
  const focusModules = focusDay?.plannedModuleIds.map(id => MODULES.find(m => m.id === id)).filter((m): m is typeof MODULES[number] => !!m) || [];

  const recommendations = useMemo(() => {
    return MODULES
      .filter(m => {
        const prog = moduleProgress[m.id];
        return prog && prog.pct < 100;
      })
      .sort((a, b) => {
        const aPri = (a.subject === 'Matemática' || ['Biologia', 'Física', 'Química'].includes(a.subject)) ? 0 : 1;
        const bPri = (b.subject === 'Matemática' || ['Biologia', 'Física', 'Química'].includes(b.subject)) ? 0 : 1;
        if (aPri !== bPri) return aPri - bPri;
        const aProg = moduleProgress[a.id]?.pct || 0;
        const bProg = moduleProgress[b.id]?.pct || 0;
        return aProg - bProg;
      })
      .slice(0, 3);
  }, [moduleProgress, focusModules]);

  return (
    <div className="min-h-screen bg-bg-main text-text-primary font-sans selection:bg-accent-red/20 selection:text-text-primary">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        completedTopics={completedTopics}
        toggleTopic={toggleTopic}
        moduleProgress={moduleProgress}
        applySecretCode={applySecretCode}
      />
      <AnimatePresence>
        {systemMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[150] bg-accent-red text-white font-bold px-6 py-4 rounded-bento shadow-2xl flex items-center justify-between gap-4 max-w-[90vw] md:max-w-md"
          >
            <div className="flex items-center gap-3">
              <Gift className="w-6 h-6 shrink-0" />
              <p className="text-sm md:text-base leading-tight">{systemMessage}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={clearSystemMessage} className="text-white hover:bg-white/20 shrink-0 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/5 text-text-primary h-10 w-10 touch-target"
              onClick={() => setIsSidebarOpen(true)}
              data-tutorial="sidebar"
            >
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] hidden xs:block">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </span>
              <h1 className="font-serif italic text-base md:text-xl text-text-primary leading-tight">Cronograma ENEM</h1>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Progresso Geral</span>
              <div className="flex items-center gap-3 w-40">
                <Progress value={stats.pct} className="h-2 bg-white/10" indicatorClassName="bg-accent-red" />
                <span className="text-xs font-bold text-accent-red">{Math.round(stats.pct)}%</span>
              </div>
            </div>
            <div className="h-8 w-px bg-border text-transparent" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1">Prova em</span>
              <span className="text-xl font-serif italic text-accent-red">{stats.daysToExam} dias</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="lg:hidden flex flex-col items-end mr-2">
              <span className="text-[8px] font-bold text-accent-red uppercase">{stats.daysToExam} dias p/ prova</span>
              <Progress value={stats.pct} className="h-1 w-16 bg-white/10" indicatorClassName="bg-accent-red" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-text-primary h-10 w-10 touch-target"
              onClick={tutorial.startTutorial}
              title="Tutorial"
            >
              <Sparkles className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-text-primary h-10 w-10 touch-target" onClick={() => document.getElementById('settings-card')?.scrollIntoView({ behavior: 'smooth' })}>
              <Settings2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-6 md:py-10 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
          <div className="flex overflow-x-auto scrollbar-none -mx-4 px-4 pb-2">
            <TabsList className="bg-card-bg border border-border p-1 rounded-2xl h-12 md:h-14 flex-nowrap shrink-0 w-max min-w-full sm:min-w-0 sm:mx-auto">
              <TabsTrigger value="estudos" data-tutorial="estudos" className="rounded-xl px-3.5 md:px-8 h-10 md:h-12 data-[state=active]:bg-accent-red data-[state=active]:text-white font-bold transition-all gap-2 text-xs md:text-sm whitespace-nowrap">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Estudos</span>
              </TabsTrigger>
              <TabsTrigger value="pet" data-tutorial="pet" className="rounded-xl px-3.5 md:px-8 h-10 md:h-12 data-[state=active]:bg-accent-red data-[state=active]:text-white font-bold transition-all gap-2 relative text-xs md:text-sm whitespace-nowrap">
                <Cat className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Meu Pet</span>
                {petAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-600 rounded-full border-2 border-card-bg flex items-center justify-center text-[10px] text-white font-bold px-1 scale-90">
                    {pet.isDead ? '!' : petAlertCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="missions" data-tutorial="missions" className="rounded-xl px-3.5 md:px-8 h-10 md:h-12 data-[state=active]:bg-accent-red data-[state=active]:text-white font-bold transition-all gap-2 relative text-xs md:text-sm whitespace-nowrap">
                <Trophy className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Missões</span>
                {hasUnclaimedMissions && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent-red rounded-full border-2 border-card-bg animate-pulse" />
                )}
              </TabsTrigger>
              <TabsTrigger value="stats" data-tutorial="stats" className="rounded-xl px-3.5 md:px-8 h-10 md:h-12 data-[state=active]:bg-accent-red data-[state=active]:text-white font-bold transition-all gap-2 text-xs md:text-sm whitespace-nowrap">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Estatísticas</span>
              </TabsTrigger>
              <TabsTrigger value="datas" data-tutorial="datas" className="rounded-xl px-3.5 md:px-8 h-10 md:h-12 data-[state=active]:bg-accent-red data-[state=active]:text-white font-bold transition-all gap-2 text-xs md:text-sm whitespace-nowrap">
                <CalendarClock className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Datas</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="rounded-xl px-3.5 md:px-8 h-10 md:h-12 data-[state=active]:bg-accent-red data-[state=active]:text-white font-bold transition-all gap-2 text-xs md:text-sm whitespace-nowrap">
                <CalendarIcon className="w-4 h-4 shrink-0" />
                <span className="shrink-0">Calendário</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="estudos" className="mt-0 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between bg-card-bg p-1 md:p-2 rounded-full border border-border shadow-sm">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full hover:bg-white/5 text-text-secondary h-10 w-10 md:h-12 md:w-12 touch-target"
                    onClick={() => setSettings(s => ({ ...s, focusDate: format(subDays(parseISO(s.focusDate), 1), 'yyyy-MM-dd') }))}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger render={<Button variant="ghost" className="font-serif italic text-sm md:text-xl hover:bg-white/5 text-text-primary px-3 md:px-6 truncate"><CalendarIcon className="w-3 md:w-4 h-3 md:h-4 mr-2 md:mr-3 text-accent-red shrink-0" /><span className="truncate">{format(parseISO(settings.focusDate), "EE, d 'de' MMM", { locale: ptBR })}</span></Button>} />
                    <PopoverContent className="w-auto p-0 rounded-bento border-border shadow-bento bg-card-bg" align="center">
                      <Calendar
                        mode="single"
                        selected={parseISO(settings.focusDate)}
                        onSelect={(date) => date && setSettings(s => ({ ...s, focusDate: format(date, 'yyyy-MM-dd') }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full hover:bg-white/5 text-text-secondary h-10 w-10 md:h-12 md:w-12 touch-target"
                    onClick={() => setSettings(s => ({ ...s, focusDate: format(addDays(parseISO(s.focusDate), 1), 'yyyy-MM-dd') }))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em]">Foco de Hoje</h2>
                    {focusModules.length > 0 && (
                      <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/20 animate-pulse">
                        Em Progresso
                      </Badge>
                    )}
                  </div>
                  
                  {focusModules.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {focusModules.map(module => (
                        <Card key={module!.id} className="rounded-bento border-border bg-card-bg overflow-hidden shadow-sm">
                          <CardHeader className="p-4 md:p-6 pb-4 border-b border-border/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-accent-red uppercase tracking-[0.15em]">
                                  {module!.subject}
                                </span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-7 px-2 rounded-lg bg-accent-red/10 text-accent-red hover:bg-accent-red hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest gap-1.5"
                                  onClick={() => setActiveFlashcardModule({ id: module!.id, title: module!.title })}
                                >
                                  <Sparkles className="w-3 h-3" />
                                  Cards
                                </Button>
                                <Popover>
                                  <PopoverTrigger render={<Button variant="ghost" size="icon" className="w-7 h-7 rounded-full hover:bg-white/5 md:w-8 md:h-8 touch-target"><Settings2 className="w-3.5 h-3.5 text-text-secondary" /></Button>} />
                                  <PopoverContent className="w-[85vw] max-w-sm bg-card-bg border-border p-4 rounded-2xl shadow-2xl z-50">
                                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3">Trocar Matéria</h4>
                                    <ScrollArea className="h-64 pr-2">
                                      <div className="space-y-1">
                                        {MODULES.filter(m => (moduleProgress[m.id]?.pct ?? 0) < 100).map(m => (
                                          <Button 
                                            key={m.id}
                                            variant="ghost" 
                                            className="w-full justify-start text-left text-[11px] h-auto py-3 px-3 rounded-xl hover:bg-accent-red hover:text-white transition-colors"
                                            onClick={() => changeDayModule(settings.focusDate, m.id)}
                                          >
                                            <div className="flex flex-col gap-0.5">
                                              <span className="font-bold opacity-60 uppercase text-[8px] tracking-widest">{m.subject}</span>
                                              <span className="truncate font-serif italic text-sm">{m.title}</span>
                                            </div>
                                          </Button>
                                        ))}
                                      </div>
                                    </ScrollArea>
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <Badge variant="outline" className="rounded-full border-border text-text-secondary font-bold text-[10px]">
                                {moduleProgress[module!.id]?.completed || 0} / {moduleProgress[module!.id]?.total || 0} tópicos
                              </Badge>
                            </div>
                            <CardTitle className="text-xl md:text-2xl mt-2 font-serif italic text-text-primary leading-tight">
                              {module!.title}
                            </CardTitle>
                            <div className="pt-3">
                              <Progress value={moduleProgress[module!.id]?.pct || 0} className="h-2.5 bg-white/10 w-full" indicatorClassName="bg-accent-red" />
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3" data-tutorial="notas">
                              {module!.items.map((item, idx) => {
                                const isDone = !!completedTopics[`${module!.id}__${idx}`];
                                const topicKey = `${module!.id}__${idx}`;
                                const hasNote = topicNotes.hasNote(topicKey);
                                return (
                                  <div
                                    key={idx}
                                    className={`flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all cursor-pointer touch-target ${
                                      isDone
                                        ? 'bg-accent-red/5 border-accent-red/20'
                                        : 'bg-black/20 border-border hover:border-accent-red/30'
                                    }`}
                                    onClick={() => toggleTopic(module!.id, idx)}
                                  >
                                    <Checkbox
                                      checked={isDone}
                                      onCheckedChange={() => toggleTopic(module!.id, idx)}
                                      className="mt-0.5 border-border data-[state=checked]:bg-accent-red data-[state=checked]:border-accent-red"
                                    />
                                    <span className={`text-xs md:text-sm leading-relaxed flex-1 ${isDone ? 'text-text-secondary/40 line-through' : 'text-text-secondary'}`}>
                                      {item}
                                    </span>
                                    <button
                                      onClick={e => { e.stopPropagation(); setActiveNoteTopicKey(topicKey); }}
                                      className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                        hasNote
                                          ? 'bg-accent-red/10 text-accent-red'
                                          : 'text-text-tertiary hover:text-text-secondary hover:bg-white/5'
                                      }`}
                                      title={hasNote ? 'Ver/editar anotação' : 'Adicionar anotação'}
                                    >
                                      <StickyNote className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full rounded-xl border-border hover:bg-accent-red hover:text-white hover:border-accent-red transition-all font-bold text-[10px] md:text-xs uppercase tracking-widest h-12 touch-target"
                              onClick={() => markModuleAsRead(module!.id)}
                            >
                              Marcar todos como concluídos
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="rounded-bento border-border bg-card-bg p-6 md:p-12 text-center shadow-sm">
                      <div className="bg-white/5 w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                        {focusDay?.dayType === 'review' ? (
                          <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-accent-red/40" />
                        ) : (
                          <Trophy className="w-6 h-6 md:w-8 md:h-8 text-accent-red/40" />
                        )}
                      </div>
                      <h3 className="text-lg md:text-xl font-serif italic text-text-primary mb-2">
                        {focusDay?.dayType === 'review' ? 'Revisão Livre' : 'Dia de Descanso! 🏝️'}
                      </h3>
                      <p className="text-text-secondary text-xs md:text-sm max-w-xs mx-auto leading-relaxed">
                        {focusDay?.dayType === 'review' 
                          ? 'Aproveite hoje para revisar conteúdos passados e fortalecer sua base.' 
                          : 'Hoje seu único compromisso é relaxar. Recarregue as energias para a próxima semana!'}
                      </p>
                    </Card>
                  )}
                </div>
                <div className="px-2 pt-4">
                  <div className="bg-accent-red/5 border border-accent-red/10 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-accent-red shrink-0 mt-0.5" />
                    <p className="text-[10px] text-text-secondary leading-relaxed">
                      <strong className="text-accent-red">Dica:</strong> O cronograma é dinâmico. Se você terminar todos os tópicos de um módulo hoje, o próximo módulo da sua lista de prioridades aparecerá automaticamente aqui!
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-4">
                  <h2 className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em] px-2">Progresso por Matéria</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjectOrder.map(subject => {
                      const subjectModules = MODULES.filter(m => m.subject === subject);
                      const completed = subjectModules.reduce((acc, m) => acc + (moduleProgress[m.id]?.completed || 0), 0);
                      const total = subjectModules.reduce((acc, m) => acc + (moduleProgress[m.id]?.total || 0), 0);
                      const pct = total > 0 ? (completed / total) * 100 : 0;
                      const isCurrent = focusModules.some(m => m?.subject === subject);

                      return (
                        <Card key={subject} className={"rounded-bento border-border bg-card-bg p-4 hover:border-accent-red/20 transition-all" + (isCurrent ? ' ring-1 ring-accent-red/30' : '')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold">{subject}</span>
                              {isCurrent && <span className="w-1.5 h-1.5 bg-accent-red rounded-full animate-ping" />}
                            </div>
                            <span className="text-[10px] font-mono text-text-secondary">{Math.round(pct)}%</span>
                          </div>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shrink-0">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              className="h-full bg-accent-red/60"
                            />
                          </div>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {subjectModules.map(m => {
                              const pct = moduleProgress[m.id]?.pct ?? 0;
                              return (
                                <div
                                  key={m.id}
                                  className={`w-2 h-2 rounded-full ${pct === 100 ? 'bg-accent-red' : pct > 0 ? 'bg-accent-red/40' : 'bg-white/5'}`}
                                  title={m.title}
                                />
                              );
                            })}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {recommendations.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-4"
                    >
                      <div className="flex items-center justify-between px-2">
                        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-[0.2em]">Recomendações</h2>
                        {dailyGoalProgress.reached && (
                          <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 text-[10px]">Meta Diária Batida! ✨</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {recommendations.map(module => (
                          <Card key={module.id} className="rounded-bento border-border bg-card-bg p-4 md:p-5 hover:border-accent-red/30 transition-all group">
                            <span className="text-[9px] font-bold text-accent-red uppercase tracking-widest">{module.subject}</span>
                            <h4 className="text-sm font-bold text-text-primary mt-1 mb-3 md:mb-4 line-clamp-2 leading-tight h-10">
                              {module.title}
                            </h4>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-between text-[10px] md:text-xs font-bold text-text-secondary group-hover:text-accent-red p-0 h-auto touch-target"
                              onClick={() => setIsSidebarOpen(true)}
                            >
                              Estudar agora
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Card>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {stats.subjectProgress.map(s => (
                    <Card key={s.subject} className="rounded-bento border-border bg-card-bg p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-serif italic text-xl text-text-primary">{s.subject}</span>
                        <Badge variant="outline" className="rounded-full border-border text-text-secondary font-bold">
                          {Math.round(s.pct)}%
                        </Badge>
                      </div>
                      <Progress value={s.pct} className="h-1.5 bg-white/5" indicatorClassName="bg-accent-red" />
                      <div className="text-[10px] text-text-secondary/40 font-bold uppercase tracking-[0.2em]">
                        {s.done} de {s.total} módulos concluídos
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div data-tutorial="timer">
                  <FocusTimer
                    totalStudySeconds={studyTimeSeconds}
                    xp={xp}
                    timer={timer}
                  />
                </div>
                <div data-tutorial="meta">
                  <DailyGoalRing
                    progress={dailyGoalProgress}
                    onSetTarget={dailyGoal.setTargetMinutes}
                  />
                </div>
                <div data-tutorial="flashcards">
                  <GlobalFlashcardButton
                    dueCount={globalDueCount}
                    totalCount={globalTotalCount}
                    onClick={() => setActiveGlobalFlashcard(true)}
                  />
                </div>
                <Card className="rounded-bento border-border bg-card-bg shadow-sm" data-tutorial="revisoes">
                  <CardHeader className="p-4 md:p-6 pb-4 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg md:text-xl font-serif italic flex items-center gap-3 text-text-primary">
                        <Clock className="w-5 h-5 text-accent-red" />
                        Revisões
                      </CardTitle>
                      <Badge className="bg-accent-red rounded-full px-2 md:px-3 text-[10px]">{dueReviews.length}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <div className="space-y-4">
                      {dueReviews.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {dueReviews.slice(0, 3).map((review) => (
                              <motion.div
                                key={review.reviewKey}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 rounded-xl border border-border bg-black/20 hover:border-accent-red/30 transition-all shadow-sm"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <Badge variant="outline" className="text-[8px] md:text-[9px] bg-accent-red/5 border-accent-red/20 text-accent-red font-bold uppercase tracking-wider">
                                    {review.stage.label}
                                  </Badge>
                                  <span className="text-[9px] font-bold text-text-secondary/40 uppercase">
                                    {format(parseISO(review.dueDate), 'dd/MM')}
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-text-primary leading-tight mb-1 truncate">
                                  {review.module.subject}: {review.module.title}
                                </h4>
                                <Button 
                                  size="sm" 
                                  className="w-full h-8 mt-2 text-[10px] rounded-lg bg-accent-red/5 text-accent-red hover:bg-accent-red hover:text-white border border-accent-red/20 font-bold uppercase tracking-widest transition-all touch-target"
                                  onClick={() => markReviewDone(review.reviewKey)}
                                >
                                  Concluir
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                          {dueReviews.length > 3 && (
                            <Button 
                              variant="ghost" 
                              className="w-full text-[10px] font-bold uppercase tracking-widest text-text-secondary hover:text-accent-red h-10 touch-target"
                              onClick={() => setActiveTab('calendar')}
                            >
                              Ver mais {dueReviews.length - 3} revisões
                              <ChevronRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <CheckCircle2 className="w-8 h-8 text-white/5 mb-4" />
                          <p className="text-text-primary font-serif italic text-base">Tudo em dia!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <UpcomingDates
                  dates={importantDates.upcoming}
                  getCountdown={importantDates.getCountdown}
                  onNavigate={() => setActiveTab('datas')}
                />
                <button
                  onClick={tutorial.startTutorial}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card-bg hover:border-accent-red/30 transition-colors touch-target min-h-[44px] group"
                >
                  <div className="w-9 h-9 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0 group-hover:bg-accent-red/15 transition-colors">
                    <Sparkles className="w-4 h-4 text-accent-red" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Ajuda</p>
                    <p className="text-xs font-bold text-text-primary">Ver Tutorial</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-text-tertiary group-hover:text-text-secondary transition-colors" />
                </button>
                <Card id="settings-card" className="rounded-bento border-border bg-card-bg shadow-sm scroll-mt-20">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-serif italic flex items-center gap-3 text-text-primary">
                      <Settings2 className="w-5 h-5 text-text-secondary/30" />
                      Ajustes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Início</label>
                      <Input 
                        type="date" 
                        value={settings.startDate} 
                        onChange={(e) => setSettings(s => ({ ...s, startDate: e.target.value }))}
                        className="rounded-xl border-border bg-black/20 h-11 text-text-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em]">Prova</label>
                      <Input 
                        type="date" 
                        value={settings.examDate} 
                        onChange={(e) => setSettings(s => ({ ...s, examDate: e.target.value }))}
                        className="rounded-xl border-border bg-black/20 h-11 text-text-primary"
                      />
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <Button 
                        variant="ghost" 
                        className="w-full text-accent-red hover:bg-accent-red/10 rounded-xl text-[10px] font-bold uppercase tracking-widest h-11"
                        onClick={() => {
                          if (window.confirm("Isso apagará TODO o seu progresso (estudos, pet, conquistas). Tem certeza?")) {
                            // M6: limpa só as chaves do app, não tudo do domínio
                            const keysToRemove = Object.keys(localStorage).filter(
                              k => k.startsWith('catstudy-') || k.startsWith('enem-')
                            );
                            keysToRemove.forEach(k => localStorage.removeItem(k));
                            window.location.reload();
                          }
                        }}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Resetar Todo o Progresso
                      </Button>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </div>
            <MiniPetWidget pet={pet} onClick={() => setActiveTab('pet')} />
          </TabsContent>

          <TabsContent value="pet" className="mt-0 outline-none">
            <ErrorBoundary fallbackLabel="Erro ao carregar o pet">
              <PetView pet={pet} xp={xp} studyTimeSeconds={studyTimeSeconds} isActive={timer.isActive} mode={timer.mode} onInteract={interactWithPet} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="missions" className="mt-0 outline-none">
            <ErrorBoundary fallbackLabel="Erro ao carregar missões">
              <MissionsView
                missions={missions}
                chestTracker={pet?.chestTracker}
                weeklyGoal={weeklyGoal}
                onClaimMission={claimMissionReward}
                onClaimWeekly={claimWeeklyReward}
                onSetWeeklyGoal={setWeeklyHourGoal}
                onOpenChest={(streak) => interactWithPet('open_chest', streak)}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="stats" className="mt-0 outline-none">
            <ErrorBoundary fallbackLabel="Erro ao carregar estatísticas">
              <StatsView stats={statsData} />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="datas" className="mt-0 outline-none">
            <ErrorBoundary fallbackLabel="Erro ao carregar datas importantes">
              <ImportantDatesView
                dates={importantDates.dates}
                upcoming={importantDates.upcoming}
                getCountdown={importantDates.getCountdown}
                onAdd={importantDates.addDate}
                onRemove={importantDates.removeDate}
                onCreateFlashcard={flashcards.addGlobalCard}
              />
            </ErrorBoundary>
          </TabsContent>

          <TabsContent value="calendar" className="mt-0 outline-none">
            <ErrorBoundary fallbackLabel="Erro ao carregar calendário">
              <CalendarView
                calendar={calendar}
                focusDate={settings.focusDate}
                onDateSelect={(date) => setSettings(s => ({ ...s, focusDate: date }))}
                moduleProgress={moduleProgress}
              />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="container mx-auto px-6 py-12 border-t border-border mt-16 text-center">
        <p className="text-xs text-text-secondary/40 font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
          Feito com carinho <span className="text-accent-red text-lg">♥</span>
        </p>
      </footer>
      <audio id="timerAlarm" src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto" />
      
      <AnimatePresence>
        {activeFlashcardModule && (
          <ErrorBoundary fallbackLabel="Erro nos flashcards">
            <FlashcardView
              moduleId={activeFlashcardModule.id}
              moduleTitle={activeFlashcardModule.title}
              onClose={() => setActiveFlashcardModule(null)}
              onReward={(val) => setXp(x => x + val)}
            />
          </ErrorBoundary>
        )}
        {activeNoteTopicKey && (() => {
          const [modId, idxStr] = activeNoteTopicKey.split('__');
          const idx = parseInt(idxStr, 10);
          const mod = MODULES.find(m => m.id === modId);
          const topicLabel = mod?.items?.[idx] ?? '';
          return (
            <TopicNoteEditor
              topicKey={activeNoteTopicKey}
              moduleTitle={mod?.title ?? ''}
              topicLabel={topicLabel}
              initialNote={topicNotes.getNote(activeNoteTopicKey)}
              onSave={topicNotes.setNote}
              onDelete={topicNotes.deleteNote}
              onClose={() => setActiveNoteTopicKey(null)}
            />
          );
        })()}
        {activeGlobalFlashcard && (
          <ErrorBoundary fallbackLabel="Erro nos flashcards">
            <FlashcardView
              moduleId="global"
              moduleTitle="Flashcards — Active Recall"
              onClose={() => setActiveGlobalFlashcard(false)}
              onReward={(val) => setXp(x => x + val)}
            />
          </ErrorBoundary>
        )}
      </AnimatePresence>

      {tutorial.showTutorial && (
        <TutorialOverlay
          onClose={tutorial.closeTutorial}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      )}
    </div>
  );
}
