import { CalendarClock, ChevronRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ImportantDate } from '../types';

interface UpcomingDatesProps {
  dates: ImportantDate[];
  getCountdown: (dateStr: string) => number;
  onNavigate: () => void;
}

export function UpcomingDates({ dates, getCountdown, onNavigate }: UpcomingDatesProps) {
  if (dates.length === 0) return null;

  // L8: filtra datas passadas como safety net (o hook já filtra, mas garante)
  const upcoming = dates.filter(d => getCountdown(d.date) >= 0).slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card-bg overflow-hidden">
      <button
        onClick={onNavigate}
        className="w-full flex items-center gap-2.5 p-3 hover:bg-white/5 transition-colors touch-target min-h-[44px]"
      >
        <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0">
          <CalendarClock className="w-4 h-4 text-accent-red" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary flex-1 text-left">
          Próximas Datas
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-text-tertiary" />
      </button>

      <div className="px-3 pb-3 space-y-2">
        {upcoming.map(d => {
          const days = getCountdown(d.date);
          const isPast = days < 0;
          const isToday = days === 0;
          return (
            <div key={d.id} className="flex items-center gap-2.5 py-1.5">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-text-primary truncate">{d.name}</p>
                <p className="text-[9px] text-text-tertiary">
                  {format(parseISO(d.date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                isPast
                  ? 'bg-text-tertiary/10 text-text-tertiary'
                  : isToday
                    ? 'bg-accent-red/10 text-accent-red'
                    : days <= 7
                      ? 'bg-orange-500/10 text-orange-400'
                      : 'bg-accent-red/10 text-accent-red/70'
              }`}>
                {isPast ? 'Passou' : isToday ? 'Hoje!' : `${days}d`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
