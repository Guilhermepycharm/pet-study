import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Trash2, StickyNote } from 'lucide-react';

interface TopicNoteEditorProps {
  topicKey: string;
  moduleTitle: string;
  topicLabel: string;
  initialNote: string;
  onSave: (topicKey: string, text: string) => void;
  onDelete: (topicKey: string) => void;
  onClose: () => void;
}

export function TopicNoteEditor({ topicKey, moduleTitle, topicLabel, initialNote, onSave, onDelete, onClose }: TopicNoteEditorProps) {
  const [text, setText] = useState(initialNote);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleChange = useCallback((value: string) => {
    setText(value);
    setSaved(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSave(topicKey, value);
      setSaved(true);
    }, 500);
  }, [topicKey, onSave]);

  const handleDelete = useCallback(() => {
    onDelete(topicKey);
    onClose();
  }, [topicKey, onDelete, onClose]);

  const handleClose = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSave(topicKey, text);
    onClose();
  }, [topicKey, text, onSave, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full sm:max-w-lg bg-card-bg border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent-red/10 flex items-center justify-center shrink-0">
              <StickyNote className="w-4 h-4 text-accent-red" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-tertiary truncate">{moduleTitle}</p>
              <p className="text-xs font-bold text-text-primary truncate">{topicLabel}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor */}
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => handleChange(e.target.value)}
            placeholder="Escreva suas anotações aqui..."
            className="w-full h-48 sm:h-56 bg-black/20 border border-border rounded-xl p-3 text-sm text-text-primary placeholder:text-text-tertiary resize-none focus:outline-none focus:border-accent-red/40 transition-colors leading-relaxed"
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-text-tertiary font-medium">
                {text.length} caracteres
              </span>
              {saved && text.length > 0 && (
                <motion.span
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-[10px] text-accent-red/70 font-medium"
                >
                  Salvo ✓
                </motion.span>
              )}
            </div>
            {text.trim().length > 0 && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-tertiary hover:text-accent-red transition-colors px-2 py-1 rounded-lg hover:bg-accent-red/5"
              >
                <Trash2 className="w-3 h-3" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
