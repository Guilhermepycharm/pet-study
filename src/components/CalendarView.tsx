import { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MODULES } from '../data/modules';

interface CalendarViewProps {
  calendar: any[];
  focusDate: string;
  onDateSelect: (date: string) => void;
  moduleProgress: Record<string, { completed: number; total: number; pct: number }>;
}

export function CalendarView({ calendar = [], focusDate, onDateSelect, moduleProgress = {} }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayData = (date: Date) => {
    const dateIso = format(date, 'yyyy-MM-dd');
    return calendar.find(d => d.date === dateIso);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="rounded-bento border-border bg-card-bg p-3 md:p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex flex-col">
            <h2 className="text-lg md:text-2xl font-serif italic text-text-primary capitalize">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <span className="text-[8px] md:text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">
              Navegue pelos seus estudos
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-xl border-border h-10 w-10 md:h-12 md:w-12 touch-target hover:bg-white/5">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-xl border-border h-10 w-10 md:h-12 md:w-12 touch-target hover:bg-white/5">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border/20 rounded-xl overflow-hidden border border-border/20">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
            <div key={idx} className="bg-black/40 py-2 md:py-3 text-center text-[10px] font-bold text-text-secondary uppercase tracking-widest">
              {day}
            </div>
          ))}
          
          {days.map((day, idx) => {
            const dateIso = format(day, 'yyyy-MM-dd');
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = focusDate === dateIso;
            const isToday = isSameDay(day, new Date());
            
            const modules = dayData?.plannedModuleIds.map((id: string) => MODULES.find(m => m.id === id)).filter(Boolean) || [];
            const isDone = modules.length > 0 && modules.every((m: any) => moduleProgress[m.id]?.pct === 100);
            
            return (
              <div 
                key={idx}
                onClick={() => onDateSelect(dateIso)}
                className={`min-h-[60px] md:min-h-[100px] p-1 md:p-2 transition-all cursor-pointer relative group flex flex-col items-center md:items-start ${
                  isCurrentMonth ? 'bg-card-bg' : 'bg-black/40 opacity-30'
                } ${isSelected ? 'ring-2 ring-accent-red ring-inset z-10' : 'hover:bg-white/5'}`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className={`text-[10px] md:text-xs font-bold ${
                    isToday ? 'bg-accent-red text-white w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full' : 
                    isSelected ? 'text-accent-red' : 'text-text-secondary'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {isDone && <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent-red" />}
                </div>

                <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1 w-full overflow-hidden">
                  {modules.slice(0, 2).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-1 w-full">
                      <div className={`w-1 h-1 rounded-full shrink-0 ${moduleProgress[m.id]?.pct === 100 ? 'bg-accent-red' : 'bg-accent-red/30'}`} />
                      <span className="text-[8px] md:text-[9px] text-text-secondary truncate font-medium">
                        {m.title}
                      </span>
                    </div>
                  ))}
                  {modules.length > 2 && (
                    <div className="text-[7px] md:text-[8px] text-text-secondary/50 font-bold ml-2">
                      +{modules.length - 2}
                    </div>
                  )}
                </div>

                {isToday && !isSelected && (
                  <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-accent-red" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-bento border-border-main bg-card-bg p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-red/10 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-accent-red" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Dias Concluídos</p>
            <p className="text-xl font-serif italic text-text-primary">
              {calendar.filter(d => d.plannedModuleIds.length > 0 && d.plannedModuleIds.every((id: string) => moduleProgress[id]?.pct === 100)).length}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
