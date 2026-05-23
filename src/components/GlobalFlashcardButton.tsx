import { Layers } from 'lucide-react';

interface GlobalFlashcardButtonProps {
  dueCount: number;
  totalCount: number;
  onClick: () => void;
}

export function GlobalFlashcardButton({ dueCount, totalCount, onClick }: GlobalFlashcardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-xl border border-border bg-card-bg hover:border-accent-red/30 transition-colors touch-target min-h-[44px]"
    >
      <div className="w-9 h-9 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0">
        <Layers className="w-4 h-4 text-accent-red" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary">Flashcards</p>
        <p className="text-xs font-bold text-text-primary">
          {totalCount === 0 ? 'Criar cards' : `${totalCount} card${totalCount !== 1 ? 's' : ''}`}
        </p>
      </div>
      {dueCount > 0 && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-accent-red/10 text-accent-red animate-pulse">
          {dueCount} revisão{dueCount !== 1 ? 'ões' : ''}
        </span>
      )}
    </button>
  );
}
