import { motion, AnimatePresence } from 'motion/react';
import { Cat, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMemo } from 'react';

interface MiniPetWidgetProps {
  pet: {
    name: string;
    happiness: number;
    hunger: number;
    energy: number;
    isSick: boolean;
    isDead: boolean;
  };
  onClick: () => void;
}

export function MiniPetWidget({ pet, onClick }: MiniPetWidgetProps) {
  const message = useMemo(() => {
    if (pet.isDead) return "Zzz... 👻";
    if (pet.isSick) return "Me ajuda... 🤕";
    if (pet.hunger < 30) return "Com fome! 🍗";
    if (pet.energy < 20) return "Zzz... 😴";
    if (pet.happiness < 30) return "Triste... 😿";
    if (pet.happiness > 80) return "Bora estudar! ✨";
    return "Tô de olho! 😸";
  }, [pet]);

  const statusColor = useMemo(() => {
    if (pet.isDead) return "bg-gray-500";
    if (pet.isSick || pet.hunger < 20 || pet.happiness < 20) return "bg-red-500";
    if (pet.hunger < 40 || pet.energy < 40 || pet.happiness < 40) return "bg-orange-500";
    return "bg-emerald-500";
  }, [pet]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] cursor-pointer group touch-target"
    >
      <div className="relative">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute -top-10 md:-top-12 right-0 bg-white text-black text-[9px] md:text-[10px] font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full shadow-lg border border-gray-100 whitespace-nowrap flex items-center gap-1 md:gap-1.5"
          >
            <MessageSquare className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent-red" />
            {message}
          </motion.div>
        </AnimatePresence>
        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full ${statusColor} border-2 border-white shadow-xl flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
          {pet.isDead ? (
            <span className="text-xl md:text-2xl">👻</span>
          ) : (
            <Cat className={`w-6 h-6 md:w-8 md:h-8 text-white ${pet.isSick ? 'grayscale' : ''}`} />
          )}
          {(pet.hunger < 20 || pet.isSick) && (
            <motion.div 
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 bg-red-400"
            />
          )}
        </div>
        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border-2 border-white ${statusColor}`} />
      </div>
 
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
        <Badge className="bg-black/80 backdrop-blur-sm text-[10px] uppercase tracking-widest whitespace-nowrap">
          Clique para cuidar do {pet.name}
        </Badge>
      </div>
    </motion.div>
  );
}
