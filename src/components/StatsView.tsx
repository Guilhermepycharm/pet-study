import { motion } from 'motion/react';
import {
  BookOpen, Clock, Flame, Star, Target,
  BarChart3, Calendar, Trophy, Zap, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from './ErrorBoundary';
import type { StatsResult } from '../hooks/useStats';

interface StatsViewProps {
  stats: StatsResult;
}

function formatTime(hours: number, minutes: number): string {
  if (hours === 0) return `${minutes}min`;
  return `${hours}h ${minutes}min`;
}

function StatCard({ icon: Icon, label, value, sub, color = 'text-accent-red', delay = 0 }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="rounded-bento border-border bg-card-bg overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0">
              <Icon className={`w-4.5 h-4.5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">{label}</p>
              <p className="text-lg font-bold text-text-primary leading-tight mt-0.5">{value}</p>
              {sub && <p className="text-[10px] text-text-secondary mt-0.5">{sub}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function StatsView({ stats }: StatsViewProps) {
  const maxWeeklyMinutes = Math.max(...stats.weeklyActivity.map(d => d.minutes), 1);

  return (
    <ErrorBoundary fallbackLabel="Erro ao carregar estatísticas">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={Target}
            label="Tópicos"
            value={`${stats.completedTopicsCount}/${stats.totalTopics}`}
            sub={`${stats.overallPct}% concluído`}
            color="text-accent-red"
            delay={0}
          />
          <StatCard
            icon={Clock}
            label="Tempo Total"
            value={formatTime(stats.totalStudyHours, stats.totalStudyMinutes)}
            sub="de estudo"
            color="text-blue-400"
            delay={0.05}
          />
          <StatCard
            icon={Star}
            label="XP Total"
            value={stats.xp.toLocaleString('pt-BR')}
            sub={`Nível ${stats.petLevel}`}
            color="text-yellow-400"
            delay={0.1}
          />
          <StatCard
            icon={Flame}
            label="Streak"
            value={`${stats.currentStreak} dias`}
            sub={stats.currentStreak > 0 ? 'Continue assim!' : 'Comece hoje!'}
            color="text-orange-400"
            delay={0.15}
          />
          <StatCard
            icon={Calendar}
            label="ENEM"
            value={stats.daysUntilExam !== null ? `${stats.daysUntilExam}` : '—'}
            sub={stats.daysUntilExam !== null ? 'dias restantes' : 'Defina a data'}
            color="text-purple-400"
            delay={0.2}
          />
        </div>

        {/* Area Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
        >
          <Card className="rounded-bento border-border bg-card-bg overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-accent-red" />
                Progresso por Área
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.areaProgress.map(area => (
                <div key={area.area}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-text-primary">{area.area}</span>
                    <span className="text-[10px] font-bold text-text-tertiary tabular-nums">
                      {area.completed}/{area.total} ({area.pct}%)
                    </span>
                  </div>
                  <Progress value={area.pct} indicatorClassName="bg-accent-red" className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Activity + Reviews side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Weekly Activity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Card className="rounded-bento border-border bg-card-bg overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-accent-red" />
                  Atividade Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-28">
                  {stats.weeklyActivity.map((day, i) => {
                    const heightPct = maxWeeklyMinutes > 0 ? (day.minutes / maxWeeklyMinutes) * 100 : 0;
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[8px] text-text-tertiary font-medium tabular-nums">
                          {day.minutes > 0 ? `${day.minutes}` : ''}
                        </span>
                        <div className="w-full relative rounded-t-sm bg-muted/30 min-h-[4px]" style={{ height: '80px' }}>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(heightPct, 2)}%` }}
                            transition={{ delay: 0.35 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                            className="absolute bottom-0 left-0 right-0 rounded-t-sm bg-accent-red/70"
                          />
                        </div>
                        <span className="text-[8px] text-text-tertiary font-medium">{day.day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-[10px] text-text-tertiary">Média diária</span>
                  <span className="text-[10px] font-bold text-text-secondary">{stats.dailyAverage}min</span>
                </div>
                {stats.mostProductiveDay !== '-' && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-text-tertiary">Mais produtivo</span>
                    <span className="text-[10px] font-bold text-accent-red">{stats.mostProductiveDay}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Reviews & Missions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="space-y-4"
          >
            {/* Reviews */}
            <Card className="rounded-bento border-border bg-card-bg overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent-red" />
                  Revisões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Concluídas</span>
                  <span className="text-xs font-bold text-text-primary">{stats.totalReviewsDone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Pendentes</span>
                  <span className={`text-xs font-bold ${stats.dueReviewsCount > 0 ? 'text-accent-red' : 'text-text-primary'}`}>
                    {stats.dueReviewsCount}
                  </span>
                </div>
                {stats.dueReviewsCount > 0 && (
                  <p className="text-[10px] text-accent-red/70 font-medium">
                    ⚡ Hora de revisar!
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Missions */}
            <Card className="rounded-bento border-border bg-card-bg overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent-red" />
                  Missões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Completadas</span>
                  <span className="text-xs font-bold text-text-primary">
                    {stats.missionsCompleted}/{stats.missionsTotal}
                  </span>
                </div>
                <Progress
                  value={stats.missionsTotal > 0 ? Math.round((stats.missionsCompleted / stats.missionsTotal) * 100) : 0}
                  indicatorClassName="bg-accent-red"
                  className="h-1.5"
                />
              </CardContent>
            </Card>

            {/* Pet Level */}
            <Card className="rounded-bento border-border bg-card-bg overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent-red" />
                  Pet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-secondary">Nível atual</span>
                  <span className="text-lg font-bold text-accent-red">{stats.petLevel}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-text-tertiary">Próximo nível</span>
                  <span className="text-[10px] font-bold text-text-tertiary">
                    {stats.xp % 100}/100 XP
                  </span>
                </div>
                <Progress
                  value={stats.xp % 100}
                  indicatorClassName="bg-accent-red"
                  className="h-1.5 mt-2"
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
