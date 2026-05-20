// ImportantDatesView.tsx — gerencia datas de prova e contagem regressiva
// o negócio de criar flashcard direto da data foi ideia genial se me faço dizer
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CalendarClock, Plus, Trash2, Layers } from 'lucide-react';
import { format, parseISO, differenceInDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from './ErrorBoundary';
import type { ImportantDate } from '../types';

interface ImportantDatesViewProps {
  dates: ImportantDate[];
  upcoming: ImportantDate[];
  getCountdown: (dateStr: string) => number;
  onAdd: (name: string, date: string) => void;
  onRemove: (id: string) => void;
  onCreateFlashcard: (front: string, back: string) => void;
}

export function ImportantDatesView({ dates, upcoming, getCountdown, onAdd, onRemove, onCreateFlashcard }: ImportantDatesViewProps) {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !date) return;
    onAdd(name.trim(), date);
    setName('');
    setDate('');
    setShowForm(false);
  };

  const sortedDates = [...dates].sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  return (
    <ErrorBoundary fallbackLabel="Erro ao carregar datas">
      <div className="max-w-3xl mx-auto space-y-4 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CalendarClock className="w-5 h-5 text-accent-red" />
            <h2 className="text-sm font-bold text-text-primary">Datas Importantes</h2>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-red text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent-red/90 transition-colors touch-target"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar
          </button>
        </div>

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit}
              className="overflow-hidden"
            >
              <Card className="rounded-bento border-border bg-card-bg">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary mb-1 block">Nome</label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="ENEM 2026"
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-black/20 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent-red/40 transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary mb-1 block">Data</label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-border bg-black/20 text-sm text-text-primary focus:outline-none focus:border-accent-red/40 transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-accent-red text-white text-[10px] font-bold uppercase tracking-widest hover:bg-accent-red/90 transition-colors touch-target"
                    >
                      Adicionar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 rounded-xl border border-border text-text-secondary text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors touch-target"
                    >
                      Cancelar
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Dates list */}
        {sortedDates.length === 0 ? (
          <Card className="rounded-bento border-border bg-card-bg">
            <CardContent className="p-8 text-center">
              <CalendarClock className="w-10 h-10 text-text-tertiary/30 mx-auto mb-3" />
              <p className="text-sm font-medium text-text-tertiary">Nenhuma data importante</p>
              <p className="text-[10px] text-text-tertiary/50 mt-1">Adicione datas de vestibulares, ENEM e prazos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedDates.map(d => {
              const days = getCountdown(d.date);
              const isPast = days < 0;
              const isToday = days === 0;
              const dateObj = parseISO(d.date);
              const totalDays = differenceInDays(dateObj, startOfDay(new Date()));
              const createdDays = differenceInDays(startOfDay(new Date()), parseISO(d.date));
              const progressPct = isPast ? 100 : Math.max(0, Math.min(100, Math.abs(createdDays) > 0 ? 0 : 50));

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`rounded-bento border-border bg-card-bg overflow-hidden ${isPast ? 'opacity-50' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Date badge */}
                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                          isToday
                            ? 'bg-accent-red/15'
                            : isPast
                              ? 'bg-text-tertiary/10'
                              : 'bg-accent-red/10'
                        }`}>
                          <span className={`text-lg font-bold leading-none ${
                            isToday ? 'text-accent-red' : isPast ? 'text-text-tertiary' : 'text-text-primary'
                          }`}>
                            {format(dateObj, 'dd')}
                          </span>
                          <span className={`text-[8px] font-bold uppercase leading-none mt-0.5 ${
                            isToday ? 'text-accent-red' : 'text-text-tertiary'
                          }`}>
                            {format(dateObj, 'MMM', { locale: ptBR })}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-text-primary truncate">{d.name}</p>
                          </div>
                          <p className="text-[10px] text-text-tertiary mt-0.5">
                            {format(dateObj, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>

                          {/* Countdown badge */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              isPast
                                ? 'bg-text-tertiary/10 text-text-tertiary'
                                : isToday
                                  ? 'bg-accent-red/10 text-accent-red'
                                  : days <= 7
                                    ? 'bg-orange-500/10 text-orange-400'
                                    : days <= 30
                                      ? 'bg-yellow-500/10 text-yellow-400'
                                      : 'bg-accent-red/10 text-accent-red/70'
                            }`}>
                              {isPast
                                ? `${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''} atrás`
                                : isToday
                                  ? 'É hoje!'
                                  : `${days} dia${days !== 1 ? 's' : ''}`
                              }
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onCreateFlashcard(
                              `Quando é ${d.name}?`,
                              format(dateObj, "dd/MM/yyyy", { locale: ptBR })
                            )}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-accent-red hover:bg-accent-red/5 transition-colors touch-target"
                            title="Criar flashcard"
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onRemove(d.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-accent-red hover:bg-accent-red/5 transition-colors touch-target"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
