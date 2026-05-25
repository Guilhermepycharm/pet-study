import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Zap, Utensils, Sparkles, ShoppingBag, 
  MessageSquare, Gamepad2, Edit2, Book, Trophy, 
  History, Star, ChevronRight, ChevronLeft,
  Bath, Scissors, Moon, Coffee, AlertTriangle,
  Stethoscope, Volume2, VolumeX, Ghost, RefreshCw,
  Bug, Skull, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ACCESSORIES_CATALOG, AccessoryCategory } from '../data/accessories';
import { ACHIEVEMENTS, CATEGORY_LABELS, type Achievement } from '../data/achievements';
import { PetAction, PetState } from '../types';

interface PetDiaryEntry {
  timestamp: string;
  text: string;
}

interface PetViewProps {
  pet: PetState;
  xp: number;
  studyTimeSeconds: number;
  isActive: boolean;
  mode: string;
  onInteract: (action: PetAction, payload?: string | number) => void;
}

const MESSAGES_BY_STAGE: Record<string, string[]> = {
  filhote: [
    "Não me esquece, tá? 🥺",
    "Você é minha favorita, não deixa o papai saber disso!",
    "Vamos estudar juntos? 🐾",
    "Miau! O que vamos aprender hoje?",
    "Quero ser um gato sábio como você!"
  ],
  jovem: [
    "Vamos arrasar hoje! 🔥",
    "Estudar é cansativo, mas com você é legal! 😊",
    "Bora pra mais uma sessão? 🚀",
    "Eu acredito em você mamãe!",
    "Miau! Já bateu a meta?"
  ],
  adulto: [
    "Você está mandando muito bem! ✨",
    "Foco mamãe",
    "Disciplina é tudo para o sucesso.",
    "O ENEM que se cuide, estamos prontos!",
    "Cada parágrafo lido é uma vitória."
  ],
  sabio: [
    "Lembre-se das revisões espaçadas... 🧠",
    "O conhecimento é a única coisa que ninguém pode tirar de você.",
    "Cada minuto estudado é um passo à frente.",
    "A constância vence o talento.",
    "Respire fundo. Imagina o teteus."
  ]
};

const STAGES = [
  { id: 'filhote', name: 'Filhote', emoji: '🐱', minHours: 0 },
  { id: 'jovem', name: 'Jovem', emoji: '😺', minHours: 10 },
  { id: 'adulto', name: 'Adulto', emoji: '😸', minHours: 50 },
  { id: 'sabio', name: 'Sábio', emoji: '😇', minHours: 100 },
];

const MESSAGES = [
  "Miau! Vamos estudar?",
  "Estou com um pouco de fome...",
  "Você está indo muito bem!",
  "Que tal uma pausa para brincar?",
  "Foco total no ENEM!",
  "Zzz... quase dormindo aqui.",
  "Sinto que hoje vamos aprender muito!",
];

interface PetAvatarProps {
  stage: string;
  accessories: PetState['accessories'];
  isInspired: boolean;
  hunger: number;
  energy: number;
  happiness: number;
  xp: number;
  isSick: boolean;
  dirtiness: number;
  isDead: boolean;
  isBathing?: boolean;
  onRub?: () => void;
}

const getSkinColors = (skinId: string | null) => {
  switch (skinId) {
    case 'skin_preto': return {
      primary: '#212121', secondary: '#424242', headColor: '#212121',
      hasWhiskers: true, roundEars: false, earInner: '#111', nose: '#000', 
      tailWidth: 8, tailColor: '#212121', body: '#212121', belly: '#424242', eyePatch: false
    };
    case 'skin_siames': return {
      primary: '#EBE2D5', secondary: '#F5ECE1', headColor: '#F5ECE1',
      muzzleColor: undefined, hasWhiskers: true, roundEars: false,
      earInner: '#111111', nose: '#000', tailWidth: 8, tailColor: '#1A1110',
      body: '#EBE2D5', belly: '#EBE2D5', eyePatch: false,
      faceMask: '#1A1110', eyeColor: '#90CAF9', pointColor: '#1A1110'
    };
    case 'skin_laranja': return {
      primary: '#EF8228', secondary: '#F5A869', headColor: '#EF8228',
      hasWhiskers: true, roundEars: false, earInner: '#FFA726', nose: '#FFCC80', 
      tailWidth: 8, tailColor: '#EF8228', body: '#EF8228', belly: '#F5A869', eyePatch: false,
      stripeColor: '#D35400'
    };
    case 'skin_cinza': return {
      primary: '#9E9E9E', secondary: '#BDBDBD', headColor: '#9E9E9E',
      hasWhiskers: true, roundEars: false,
      earInner: '#757575', nose: '#616161', tailWidth: 8, tailColor: '#9E9E9E',
      body: '#9E9E9E', belly: '#BDBDBD', eyePatch: false
    };
    case 'skin_calico': return {
      primary: '#EF8228', secondary: '#1A1A1A', headColor: '#FFFFFF',
      muzzleColor: undefined, hasWhiskers: true, roundEars: false,
      earInner: '#EF8228', nose: '#FFCC80', tailWidth: 8, tailColor: '#EF8228',
      body: '#1A1A1A', belly: '#FFFFFF', eyePatch: true, tailPuff: false,
    };
    case 'skin_tabby': return {
      primary: '#FFA726', secondary: '#FFE0B2', headColor: '#FFA726',
      hasWhiskers: true, roundEars: false,
      earInner: '#E65100', nose: '#E65100', tailWidth: 8, tailColor: '#FFA726',
      body: '#FFA726', belly: '#FFE0B2', eyePatch: false, stripeColor: '#212121'
    };
    case 'skin_esfinge': return {
      primary: '#FFCCBC', secondary: '#FBE9E7', headColor: '#FFCCBC',
      hasWhiskers: false, roundEars: false,
      earInner: '#FFAB91', nose: '#FF8A65', tailWidth: 4, tailColor: '#FFCCBC',
      body: '#FFCCBC', belly: '#FFCCBC', eyePatch: false
    };
    case 'pelagem_dourada': return {
      primary: 'url(#goldFluff)', secondary: '#FFF3E0', headColor: 'url(#goldFluff)',
      muzzleColor: '#FFFFFF', hasWhiskers: true, roundEars: false,
      earInner: '#F3E5F5', nose: '#F48FB1', tailWidth: 14, tailColor: 'url(#goldFluff)',
      body: 'url(#goldFluff)', belly: '#FFF3E0', eyePatch: false,
      eyeColor: '#4DB6AC', fluff: true // we will use this flag in the render
    };
    case 'skin_arcoiris': return {
      primary: '#FF4081', secondary: '#00E5FF', headColor: '#FFEB3B',
      hasWhiskers: true, roundEars: false,
      earInner: '#E040FB', nose: '#FF4081', tailWidth: 10, tailColor: '#69F0AE',
      body: '#E040FB', belly: '#00E5FF', eyePatch: false
    };
    case 'skin_fantasma': return {
      primary: 'rgba(255, 255, 255, 0.4)', secondary: 'rgba(255, 255, 255, 0.6)', headColor: 'rgba(255, 255, 255, 0.5)',
      hasWhiskers: false, roundEars: false,
      earInner: 'rgba(200, 200, 255, 0.3)', nose: 'rgba(100, 100, 200, 0.5)', tailWidth: 9, tailColor: 'rgba(200, 255, 255, 0.4)',
      body: 'rgba(255, 255, 255, 0.3)', belly: 'rgba(255, 255, 255, 0.2)', eyePatch: false, tailPuff: true
    };
    default: return { 
      primary: '#FFFFFF',
      secondary: '#FFFFFF',
      headColor: '#FFFFFF',
      hasWhiskers: true,
      roundEars: false,
      earInner: '#FFC0CB',
      nose: '#FFC0CB',
      tailWidth: 7,
      tailColor: '#FFFFFF',
      body: '#FFFFFF',
      belly: '#FFFFFF',
      eyePatch: false
    };
  }
};

function PetAvatar({ stage, accessories, isInspired, hunger, energy, happiness, xp, isSick, dirtiness, isDead, isBathing, onRub }: PetAvatarProps) {
  const isFilhote = stage === 'filhote';
  const isSabio = stage === 'sabio';
  const [isJumping, setIsJumping] = useState(false);
  useEffect(() => {
    if (xp > 0 && !isDead) {
      setIsJumping(true);
      const timer = setTimeout(() => setIsJumping(false), 500);
      return () => clearTimeout(timer);
    }
  }, [xp, isDead]);
  
  const equippedSkin = accessories.equipped['skin'] || null;
  const equippedBody = accessories.equipped['body'] || null;
  const equippedHead = accessories.equipped['head'] || null;
  const equippedFacial = accessories.equipped['facial'] || null;

  const colors = getSkinColors(equippedSkin);

  const bodyProps = {
    x: isFilhote ? 32 : 28,
    y: 50,
    width: isFilhote ? 36 : 44,
    height: isFilhote ? 30 : 35,
    rx: 18
  };
  const bodyAnimation = energy < 20 ? { height: [bodyProps.height, bodyProps.height-5, bodyProps.height], y: [50, 55, 50] } : {};

  return (
    <div 
      className={`relative w-80 h-80 flex items-center justify-center ${isBathing ? 'cursor-[url(https://img.icons8.com/emoji/48/sponge-emoji.png),_pointer]' : ''}`}
      onMouseMove={isBathing ? onRub : undefined}
    >
      {(hunger < 10 || energy < 10 || happiness < 10) && !isDead && (
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute top-0 right-0 z-50"
        >
          <AlertTriangle className="w-10 h-10 text-red-500 fill-red-100" />
        </motion.div>
      )}
      {isSick && !isDead && (
        <motion.div 
          className="absolute top-0 left-0 z-50 bg-white p-2 rounded-full shadow-lg"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Stethoscope className="w-8 h-8 text-indigo-500" />
        </motion.div>
      )}
      {isDead && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Ghost className="w-48 h-48 text-white/20 animate-bounce" />
          <div className="bg-black/60 px-4 py-2 rounded-full border border-white/20">
            <span className="text-white text-sm font-bold uppercase tracking-widest">Descansando em Paz...</span>
          </div>
        </motion.div>
      )}

      {!isDead && (
        <>
          {hunger < 30 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-lg z-50"
            >
              <Utensils className="w-6 h-6 text-orange-500 animate-bounce" />
            </motion.div>
          )}
          {energy < 30 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-10 right-10 bg-white p-2 rounded-full shadow-lg z-50"
            >
              <span className="text-xl font-bold text-blue-500 animate-pulse">Zzz</span>
            </motion.div>
          )}
          {dirtiness >= 30 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    y: [-10, -30, -10], 
                    x: [0, Math.sin(i) * 10, 0],
                    opacity: [0.4, 0.8, 0.4] 
                  }}
                  transition={{ duration: 2 + i % 3, repeat: Infinity }}
                  className="absolute"
                  style={{ 
                    top: `${40 + (i * 10)}%`, 
                    left: `${30 + (i * 15)}%` 
                  }}
                >
                  <Bug className="w-4 h-4 text-brown-800 opacity-60" />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            animate={isJumping ? { y: [0, -40, 0], scale: [1, 1.1, 1] } : energy < 20 ? { scaleX: [1, 1.1, 1], x: [0, 5, 0] } : {}}
            transition={isJumping ? { duration: 0.5, ease: "easeOut" } : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`w-full h-full flex items-center justify-center ${isSick ? 'grayscale contrast-125 brightness-90' : ''}`}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl overflow-visible">
              <defs>
                <linearGradient id="invisGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#81D4FA" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#B39DDB" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="goldFluff" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FFA000" />
                  <stop offset="30%" stopColor="#FFC107" />
                  <stop offset="50%" stopColor="#FFF8E1" />
                  <stop offset="70%" stopColor="#FFCA28" />
                  <stop offset="100%" stopColor="#FF8F00" />
                </linearGradient>
              </defs>
              <ellipse cx="50" cy="92" rx="30" ry="5" fill="black" fillOpacity="0.15" />
              <motion.g 
                transform={isFilhote ? "scale(0.85) translate(8.8, 15)" : isSabio ? "scale(1.05) translate(-2.3, -5)" : "scale(1) translate(0, 0)"}
                animate={energy < 20 ? { y: [0, 2, 0] } : { y: [0, -1, 0] }} 
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {colors.tailPuff ? (
                  <motion.circle 
                     cx="68" cy="80" r="7" fill={colors.tailColor} 
                     animate={energy < 30 ? { x: [0, 2, 0] } : { y: [0, -2, 0] }}
                     transition={{ duration: 3, repeat: Infinity }}
                  />
                ) : (
                  <motion.g 
                     animate={energy < 30 ? { rotate: [0, 5, 0], opacity: 0.8 } : undefined}
                     transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                     style={{ transformOrigin: "58px 75px" }}
                  >
                    <motion.path
                      d="M 58 75 Q 85 85 80 50 T 90 20"
                      fill="none"
                      stroke={colors.tailColor}
                      strokeWidth={colors.tailWidth}
                      strokeLinecap="round"
                      animate={energy >= 30 ? { 
                        d: [
                          "M 58 75 Q 85 85 80 50 T 90 20", 
                          "M 58 75 Q 90 90 85 55 T 95 25", 
                          "M 58 75 Q 85 85 80 50 T 90 20"
                        ] 
                      } : undefined}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    {colors.stripeColor && (
                      <motion.path
                        d="M 58 75 Q 85 85 80 50 T 90 20"
                        fill="none"
                        stroke={colors.stripeColor}
                        strokeWidth={colors.tailWidth}
                        strokeLinecap="round"
                        strokeDasharray="4 15"
                        opacity="0.85"
                        animate={energy >= 30 ? { 
                          d: [
                            "M 58 75 Q 85 85 80 50 T 90 20", 
                            "M 58 75 Q 90 90 85 55 T 95 25", 
                            "M 58 75 Q 85 85 80 50 T 90 20"
                          ] 
                        } : undefined}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </motion.g>
                )}
                {equippedBody === 'capa_heroi' && (
                  <motion.path 
                    d="M 35 55 C 20 60 15 90 20 100 C 50 105 80 100 80 100 C 85 90 80 60 65 55 Z" 
                    fill="#D32F2F" 
                    animate={isJumping ? { scaleY: [1, 0.8, 1] } : { scaleX: [1, 1.05, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                {equippedBody === 'asas_dragao' && (
                  <motion.g animate={energy < 20 ? { y: [0, 5, 0] } : { y: [0, -4, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <defs>
                      <linearGradient id="dragonWingMembrane" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1C1111" />
                        <stop offset="50%" stopColor="#8A0B0B" />
                        <stop offset="100%" stopColor="#E61919" />
                      </linearGradient>
                      <linearGradient id="dragonWingBone" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#0B090A" />
                        <stop offset="100%" stopColor="#2A2426" />
                      </linearGradient>
                    </defs>
                    <g transform="rotate(-5 20 40)">
                      <path d="M 35 55 Q 10 20 -5 -5 C -20 15 -25 40 -15 60 Q -2 48 5 70 Q 15 52 25 65 Q 30 55 35 55 Z" fill="url(#dragonWingMembrane)" />
                      <path d="M 35 55 Q 10 20 -5 -5" fill="none" stroke="url(#dragonWingBone)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M -5 -5 C -20 15 -25 40 -15 60" fill="none" stroke="url(#dragonWingBone)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M -5 -5 Q -2 25 5 70" fill="none" stroke="url(#dragonWingBone)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M -5 -5 Q 15 25 25 65" fill="none" stroke="url(#dragonWingBone)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M -5 -5 Q -8 -13 -2 -16 Q 0 -11 -5 -5 Z" fill="#b30000" />
                    </g>
                    <g transform="rotate(5 80 40)">
                      <path d="M 65 55 Q 90 20 105 -5 C 120 15 125 40 115 60 Q 102 48 95 70 Q 85 52 75 65 Q 70 55 65 55 Z" fill="url(#dragonWingMembrane)" />
                      <path d="M 65 55 Q 90 20 105 -5" fill="none" stroke="url(#dragonWingBone)" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 105 -5 C 120 15 125 40 115 60" fill="none" stroke="url(#dragonWingBone)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 105 -5 Q 102 25 95 70" fill="none" stroke="url(#dragonWingBone)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 105 -5 Q 85 25 75 65" fill="none" stroke="url(#dragonWingBone)" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 105 -5 Q 108 -13 102 -16 Q 100 -11 105 -5 Z" fill="#b30000" />
                    </g>
                  </motion.g>
                )}
                {equippedBody === 'asas_anjo' && (
                  <motion.g animate={energy < 20 ? { y: [0, 5, 0], rotate: [0, 2, 0] } : { y: [0, -4, 0], rotate: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
                    <g transform="translate(15, 30) scale(1.6) rotate(-20) translate(-8, -10)">
                      <path d="M 20 20 C -10 -15 -35 -20 -40 -10 C -45 0 -40 10 -30 15 C -45 20 -40 30 -25 35 C -35 45 -25 55 -15 50 C -25 65 -10 70 0 60 C -10 80 5 80 15 65 C 5 85 20 85 25 70 C 20 60 25 30 20 20 Z" fill="#7E57C2" />
                      <path d="M 20 20 C -5 -10 -25 -15 -30 -5 C -35 5 -30 15 -20 20 C -35 25 -30 35 -15 40 C -25 50 -15 60 -5 55 C -15 70 0 75 10 65 C 5 75 15 75 20 65 C 15 55 20 30 20 20 Z" fill="#9575CD" />
                      <path d="M 20 20 C 5 0 -15 -5 -20 5 C -25 15 -20 25 -10 30 C -20 35 -15 45 -5 50 C -10 60 5 65 15 55 C 10 65 20 65 25 55 C 20 45 20 30 20 20 Z" fill="#EDE7F6" />
                      <path d="M 20 20 C 5 5 -5 0 -10 5" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M 12 28 C 0 25 -5 20 -5 20" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M 15 40 C 5 40 0 35 0 35" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </g>
                    <g transform="translate(85, 30) scale(1.6) scale(-1, 1) rotate(-20) translate(-8, -10)">
                      <path d="M 20 20 C -10 -15 -35 -20 -40 -10 C -45 0 -40 10 -30 15 C -45 20 -40 30 -25 35 C -35 45 -25 55 -15 50 C -25 65 -10 70 0 60 C -10 80 5 80 15 65 C 5 85 20 85 25 70 C 20 60 25 30 20 20 Z" fill="#7E57C2" />
                      <path d="M 20 20 C -5 -10 -25 -15 -30 -5 C -35 5 -30 15 -20 20 C -35 25 -30 35 -15 40 C -25 50 -15 60 -5 55 C -15 70 0 75 10 65 C 5 75 15 75 20 65 C 15 55 20 30 20 20 Z" fill="#9575CD" />
                      <path d="M 20 20 C 5 0 -15 -5 -20 5 C -25 15 -20 25 -10 30 C -20 35 -15 45 -5 50 C -10 60 5 65 15 55 C 10 65 20 65 25 55 C 20 45 20 30 20 20 Z" fill="#EDE7F6" />
                      <path d="M 20 20 C 5 5 -5 0 -10 5" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M 12 28 C 0 25 -5 20 -5 20" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path d="M 15 40 C 5 40 0 35 0 35" stroke="#FFF" strokeWidth="2" fill="none" strokeLinecap="round" />
                    </g>
                  </motion.g>
                )}

                <defs>
                  <clipPath id="bodyClip">
                    <path d="M 36 38 C 18 55 22 88 35 92 C 45 95 55 95 65 92 C 78 88 82 55 64 38 Z" />
                  </clipPath>
                  <clipPath id="headClip">
                    <ellipse cx="50" cy="35" rx="38" ry="28" />
                  </clipPath>
                </defs>
                {equippedBody === 'mochila' && (
                  <g transform="translate(50, 60)">
                    <path d="M -38 -15 Q -45 5 -35 25 L 35 25 Q 45 5 38 -15 C 30 -30 -30 -30 -38 -15 Z" fill="#b71c1c" />
                    <path d="M -35 -15 Q -40 5 -32 22 L 32 22 Q 40 5 35 -15 C 28 -28 -28 -28 -35 -15 Z" fill="#e53935" />
                    <path d="M -10 -22 C -10 -35 10 -35 10 -22" fill="none" stroke="#212121" strokeWidth="4" />
                  </g>
                )}

                <path d="M 36 38 C 18 55 22 88 35 92 C 45 95 55 95 65 92 C 78 88 82 55 64 38 Z" fill={colors.body} />
                {colors.belly && colors.belly !== colors.body && (
                  <path d="M 40 50 C 30 65 32 85 42 88 C 48 90 52 90 58 88 C 68 85 70 65 60 50 C 55 42 45 42 40 50 Z" fill={colors.belly} />
                )}
                {colors.stripeColor && (
                  <g clipPath="url(#bodyClip)">
                    <g transform="translate(0, 0)">
                       <path d="M 5 60 Q 15 65 25 60 M 5 75 Q 20 80 30 70 M 95 60 Q 85 65 75 60 M 95 75 Q 80 80 70 70" fill="none" stroke={colors.stripeColor} strokeWidth="5" strokeLinecap="round" opacity="0.8" />
                    </g>
                  </g>
                )}
                {equippedBody && !['terno', 'cachecol', 'capa_heroi', 'asas_dragao', 'asas_anjo', 'capa_invisibilidade', 'colete_aventura', 'moletom', 'vestido_princesa', 'armadura', 'colete_salva'].includes(equippedBody) && (
                   <text x="50" y="65" fontSize="40" textAnchor="middle" dominantBaseline="middle">
                      {ACCESSORIES_CATALOG.find(a => a.id === equippedBody)?.emoji}
                   </text>
                )}
                {equippedBody === 'terno' && (
                  <g>
                    <path d="M 36 38 C 18 55 22 88 35 92 C 45 95 55 95 65 92 C 78 88 82 55 64 38 Z" fill="#1A365D" />
                    <path d="M 50 35 L 25 40 L 32 50 Z" fill="#FFFFFF" stroke="#ECEFF1" strokeWidth="1" />
                    <path d="M 50 35 L 75 40 L 68 50 Z" fill="#FFFFFF" stroke="#ECEFF1" strokeWidth="1" />
                    <path d="M 45 42 L 55 42 L 58 75 L 50 82 L 42 75 Z" fill="#FFFFFF" />
                    <path d="M 45 35 L 55 35 L 53 42 L 47 42 Z" fill="#81D4FA" stroke="#0288D1" strokeWidth="0.5" />
                    <clipPath id="tieClip">
                      <path d="M 45 42 L 55 42 L 58 75 L 50 82 L 42 75 Z" />
                    </clipPath>
                    <g clipPath="url(#tieClip)">
                       <rect x="0" y="0" width="100" height="100" fill="#FFFFFF" />
                       {[30, 40, 50, 60, 70, 80].map((y, i) => (
                         <line key={`ts${i}`} x1="30" y1={y} x2="70" y2={y + 15} stroke="#0288D1" strokeWidth="3" />
                       ))}
                    </g>
                    <path d="M 47 35 L 53 35 L 51 42 L 49 42 Z" fill="#0288D1" />
                  </g>
                )}
                {equippedBody === 'cachecol' && (
                  <g transform="translate(50, 43)">
                    <rect x="-20" y="0" width="40" height="9" rx="4" fill="#E65100" />
                    <rect x="8" y="7" width="9" height="18" rx="2" fill="#E65100" />
                    <rect x="8" y="21" width="9" height="4" fill="#FFB300" />
                  </g>
                )}
                {equippedBody === 'capa_heroi' && (
                  <path d="M 38 43 Q 50 51 62 43" fill="none" stroke="#FFC107" strokeWidth="3" opacity="0.8" />
                )}
                {equippedBody === 'colete_aventura' && (
                  <g>
                    <path d="M 30 40 L 40 45 L 60 45 L 70 40 L 75 70 L 65 85 L 50 85 L 35 85 L 25 70 Z" fill="#8D6E63" />
                    <rect x="30" y="60" width="12" height="12" rx="2" fill="#5D4037" />
                    <rect x="58" y="60" width="12" height="12" rx="2" fill="#5D4037" />
                  </g>
                )}
                {equippedBody === 'moletom' && (
                  <g>
                    <path d="M 20 40 C 5 60 10 95 35 90 L 65 90 C 90 95 95 60 80 40 C 60 48 40 48 20 40 Z" fill="#9d623d" />
                    <clipPath id="sweaterClip">
                      <path d="M 20 40 C 5 60 10 95 35 90 L 65 90 C 90 95 95 60 80 40 C 60 48 40 48 20 40 Z" />
                    </clipPath>
                    
                    <g clipPath="url(#sweaterClip)">
                       <rect x="0" y="45" width="100" height="15" fill="#e8dcca" />
                       <rect x="0" y="70" width="100" height="15" fill="#e8dcca" />
                    </g>
                    <path d="M 25 35 C 40 45 60 45 75 35 C 70 30 30 30 25 35 Z" fill="#e8dcca" stroke="#d5c0a3" strokeWidth="1" />
                    {[30, 40, 50, 60, 70].map((x, i) => (
                      <line key={`cb${i}`} x1={x} y1={33} x2={x} y2={40} stroke="#c1ac92" strokeWidth="1.5" />
                    ))}
                     <path d="M 32 87 Q 50 92 68 87" fill="none" stroke="#e8dcca" strokeWidth="6" strokeLinecap="round" />
                  </g>
                )}
                {equippedBody === 'vestido_princesa' && (
                  <g>
                    <path d="M 35 40 Q 50 45 65 40 L 85 95 L 15 95 Z" fill="#F48FB1" />
                    <path d="M 15 95 Q 50 100 85 95" fill="none" stroke="#FCE4EC" strokeWidth="5" />
                  </g>
                )}
                {equippedBody === 'armadura' && (
                  <g>
                    <path d="M 30 40 C 30 40 50 45 70 40 C 75 60 65 85 50 90 C 35 85 25 60 30 40 Z" fill="#90A4AE" />
                    <path d="M 28 55 Q 50 65 72 55 M 30 70 Q 50 80 70 70 M 35 80 Q 50 88 65 80" fill="none" stroke="#607D8B" strokeWidth="2" />
                    <ellipse cx="25" cy="45" rx="10" ry="12" fill="#78909C" stroke="#546E7A" strokeWidth="2" transform="rotate(-15 25 45)" />
                    <ellipse cx="75" cy="45" rx="10" ry="12" fill="#78909C" stroke="#546E7A" strokeWidth="2" transform="rotate(15 75 45)" />
                    <circle cx="50" cy="50" r="5" fill="#FFC107" stroke="#FF8F00" strokeWidth="1" />
                  </g>
                )}
                {equippedBody === 'colete_salva' && (
                  <g>
                    <path d="M 25 40 C 15 55 20 85 30 90 C 40 92 50 92 50 85 C 50 92 60 92 70 90 C 80 85 85 55 75 40 C 60 45 40 45 25 40 Z" fill="#FF5722" />
                    <rect x="35" y="45" width="6" height="35" fill="#FFF" />
                    <rect x="59" y="45" width="6" height="35" fill="#FFF" />
                  </g>
                )}
                {equippedBody === 'capa_invisibilidade' && (
                  <path d="M 25 40 C 15 55 20 85 30 90 L 70 90 C 80 85 85 55 75 40 C 60 45 40 45 25 40 Z" fill="url(#invisGradient)" opacity="0.6" />
                )}
                {dirtiness >= 50 && (
                  <g opacity="0.4">
                    <circle cx="42" cy="70" r="4" fill="#8B4513" />
                    <circle cx="58" cy="74" r="3.5" fill="#8B4513" />
                    <circle cx="48" cy="80" r="3" fill="#8B4513" />
                  </g>
                )}
                <g fill={equippedBody === 'terno' ? '#1A365D' : ((colors as any).pointColor || colors.primary)} stroke={equippedBody === 'terno' ? '#0B1B33' : 'rgba(0,0,0,0.08)'} strokeWidth="1.5">
                  <ellipse cx="28" cy="65" rx="6.5" ry="4.5" transform="rotate(25 28 65)" />
                  <ellipse cx="72" cy="65" rx="6.5" ry="4.5" transform="rotate(-25 72 65)" />
                </g>
                {equippedBody === 'mochila' && (
                  <g>
                    <path d="M 28 40 Q 20 60 25 80" fill="none" stroke="#212121" strokeWidth="4" />
                    <path d="M 72 40 Q 80 60 75 80" fill="none" stroke="#212121" strokeWidth="4" />
                  </g>
                )}
                <g fill={((colors as any).pointColor || colors.primary)} stroke="rgba(0,0,0,0.05)" strokeWidth="1.5">
                  <ellipse cx="35" cy="91" rx="6.5" ry="4" transform="rotate(-15 35 91)" />
                  <ellipse cx="65" cy="91" rx="6.5" ry="4" transform="rotate(15 65 91)" />
                </g>
                <motion.g
                  animate={energy < 30 ? { y: [0, 2, 0], rotate: [0, 1, 0] } : { y: [0, -1, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  {colors.roundEars ? (
                    <g>
                      <circle cx="20" cy="15" r="10" fill={((colors as any).pointColor || colors.primary)} />
                      <circle cx="80" cy="15" r="10" fill={((colors as any).pointColor || colors.primary)} />
                    </g>
                  ) : (
                    <g>
                      <path d="M 25 22 L 12 2 L 40 12 Z" fill={colors.primary === '#EF8228' && colors.belly === '#FFFFFF' ? '#EF8228' : ((colors as any).pointColor || colors.primary)} />
                      <path d="M 75 22 L 88 2 L 60 12 Z" fill={colors.primary === '#EF8228' && colors.belly === '#FFFFFF' ? '#1A1A1A' : ((colors as any).pointColor || colors.primary)} />
                      <path d="M 25 18 L 18 6 L 35 12 Z" fill={colors.earInner} />
                      <path d="M 75 18 L 82 6 L 65 12 Z" fill={colors.earInner} />
                      {(colors as any).fluff && (
                        <g opacity="0.8">
                          <path d="M 12 2 C 15 -5 20 -2 22 5 Z" fill="url(#goldFluff)" />
                          <path d="M 88 2 C 85 -5 80 -2 78 5 Z" fill="url(#goldFluff)" />
                        </g>
                      )}
                    </g>
                  )}
                  {equippedHead === 'capacete_astro' && (
                    <g transform="translate(50, 34)">
                       <ellipse cx="0" cy="30" rx="43" ry="7" fill="#B0BEC5" />
                       <ellipse cx="0" cy="27" rx="43" ry="7" fill="#CFD8DC" stroke="#90A4AE" strokeWidth="1" />
                    </g>
                  )}
                  {(colors as any).fluff && (
                    <g opacity="0.8">
                       <ellipse cx="50" cy="35" rx="42" ry="32" fill="url(#goldFluff)" filter="blur(2px)" />
                       <path d="M 12 35 Q 0 45 20 55 Z" fill="url(#goldFluff)" />
                       <path d="M 88 35 Q 100 45 80 55 Z" fill="url(#goldFluff)" />
                       <path d="M 45 10 Q 50 -5 55 10 Z" fill="url(#goldFluff)" />
                    </g>
                  )}
                  <ellipse cx="50" cy="35" rx="38" ry="28" fill={colors.headColor || colors.secondary} />
                  
                  {colors.stripeColor && (
                    <g clipPath="url(#headClip)">
                      <g opacity="0.8">
                          <path d="M 42 7 L 46 22 L 44 22 Z M 49 7 L 51 7 L 51 24 L 49 24 Z M 58 7 L 54 22 L 56 22 Z" fill={colors.stripeColor} />
                          <path d="M 10 30 L 25 32 Z M 8 40 L 22 38 Z M 90 30 L 75 32 Z M 92 40 L 78 38 Z" stroke={colors.stripeColor} strokeWidth="2.5" strokeLinecap="round" />
                      </g>
                    </g>
                  )}
                  {(colors as any).faceMask && (
                    <g clipPath="url(#headClip)">
                      <ellipse cx="50" cy="40" rx="25" ry="22" fill={(colors as any).faceMask} opacity="0.9" />
                      <ellipse cx="50" cy="35" rx="35" ry="30" fill={(colors as any).faceMask} opacity="0.3" />
                      <ellipse cx="50" cy="42" rx="15" ry="12" fill="#1A1110" />
                    </g>
                  )}
                  {colors.muzzleColor && (
                    <path d="M 15 38 C 15 55 35 60 50 60 C 65 60 85 55 85 38 C 75 42 60 40 50 35 C 40 40 25 42 15 38 Z" fill={colors.muzzleColor} />
                  )}
                  {colors.hasWhiskers && (
                    <g>
                      <path d="M 22 40 L 5 36 M 22 44 L 3 43 M 24 48 L 7 50" stroke={((colors as any).faceMask ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)")} strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M 78 40 L 95 36 M 78 44 L 97 43 M 76 48 L 93 50" stroke={((colors as any).faceMask ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.5)")} strokeWidth="1.5" strokeLinecap="round" />
                    </g>
                  )}
                  {colors.eyePatch ? (
                    <g>
                      <ellipse cx="30" cy="33" rx="14" ry="16" fill={colors.primary === '#EF8228' ? '#EF8228' : '#000'} transform="rotate(-15 30 33)" />
                      <ellipse cx="70" cy="33" rx="14" ry="16" fill="#1A1A1A" transform="rotate(15 70 33)" />
                      <motion.g animate={energy < 30 ? { scaleY: 0.2 } : { scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}>
                        { (colors as any).eyeColor && <ellipse cx="30" cy="33" rx="14" ry="16" fill={(colors as any).eyeColor} transform="rotate(-15 30 33)" opacity="0.6"/>}
                        { (colors as any).eyeColor && <ellipse cx="70" cy="33" rx="14" ry="16" fill={(colors as any).eyeColor} transform="rotate(15 70 33)" opacity="0.6"/>}
                        <circle cx="32" cy="30" r="4.5" fill="#FFF" />
                        <circle cx="68" cy="30" r="4.5" fill="#FFF" />
                        <circle cx="28" cy="38" r="2" fill="#FFF" />
                        <circle cx="72" cy="38" r="2" fill="#FFF" />
                      </motion.g>
                    </g>
                  ) : (
                    <motion.g animate={energy < 30 ? { scaleY: 0.2 } : { scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.95, 1] }}>
                      <ellipse cx="30" cy="34" rx="10" ry="11" fill="#111" />
                      <ellipse cx="70" cy="34" rx="10" ry="11" fill="#111" />
                      {(colors as any).eyeColor && (
                        <g>
                          <ellipse cx="30" cy="34" rx="10" ry="11" fill={(colors as any).eyeColor} />
                          <ellipse cx="70" cy="34" rx="10" ry="11" fill={(colors as any).eyeColor} />
                          <ellipse cx="30" cy="34" rx="6" ry="8" fill="#111" />
                          <ellipse cx="70" cy="34" rx="6" ry="8" fill="#111" />
                        </g>
                      )}
                      <circle cx="32" cy="31" r="3.5" fill="#FFF" />
                      <circle cx="68" cy="31" r="3.5" fill="#FFF" />
                      <circle cx="27" cy="38" r="1.5" fill="#FFF" />
                      <circle cx="73" cy="38" r="1.5" fill="#FFF" />
                    </motion.g>
                  )}

                  {equippedFacial && !['oculos', 'oculos_leitura', 'oculos_coracao', 'monoculo', 'mascara_carnaval', 'bigode', 'oculos_3d', 'venda_pirata', 'pintura_guerreiro', 'oculos_nerd'].includes(equippedFacial) && (
                     <text x="50" y="38" fontSize="24" textAnchor="middle" dominantBaseline="middle">
                        {ACCESSORIES_CATALOG.find(a => a.id === equippedFacial)?.emoji}
                     </text>
                  )}
                  {colors.eyePatch ? (
                    <path d="M 46 43 L 54 43 C 54 46 51 47 50 47 C 49 47 46 46 46 43 Z" fill={colors.nose} />
                  ) : (
                    <ellipse cx="50" cy="45" rx="3.5" ry="2" fill={colors.nose} />
                  )}
                  {happiness < 30 || isSick ? (
                    <path d="M 46 50 Q 50 47 54 50" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  ) : energy < 30 ? (
                    <path d="M 47 48 L 53 48" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
                  ) : colors.eyePatch ? (
                    <path d="M 50 47 L 50 50 M 50 50 Q 47 53 44 51 M 50 50 Q 53 53 56 51" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M 50 47 L 50 49 M 50 49 Q 47 52 44 50 M 50 49 Q 53 52 56 50" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  <ellipse cx="22" cy="46" rx="5" ry="3" fill="#FFC0CB" fillOpacity="0.6" transform="rotate(-15 22 46)" />
                  <ellipse cx="78" cy="46" rx="5" ry="3" fill="#FFC0CB" fillOpacity="0.6" transform="rotate(15 78 46)" />
                  {equippedFacial === 'oculos' && (
                    <g transform="translate(50, 34)">
                      <rect x="-40" y="-14" width="32" height="28" rx="6" fill="#111" />
                      <rect x="8" y="-14" width="32" height="28" rx="6" fill="#111" />
                      <path d="M-8,-2 L8,-2" stroke="#111" strokeWidth="3" />
                      <path d="M-40,-6 L-48,-8" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M40,-6 L48,-8" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M-34,-8 L-14,-8 M-34,-4 L-22,-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                      <path d="M14,-8 L34,-8 M14,-4 L26,-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                    </g>
                  )}
                  {equippedFacial === 'oculos_leitura' && (
                    <g transform="translate(50, 34)">
                      <rect x="-38" y="-12" width="28" height="24" rx="8" fill="none" stroke="#555" strokeWidth="3" />
                      <rect x="10" y="-12" width="28" height="24" rx="8" fill="none" stroke="#555" strokeWidth="3" />
                      <path d="M-10,-1 L10,-1" stroke="#555" strokeWidth="2" />
                      <path d="M-38,-2 Q-48,15 -35,30" stroke="#FFD700" strokeWidth="1" fill="none" />
                      <path d="M38,-2 Q48,15 35,30" stroke="#FFD700" strokeWidth="1" fill="none" />
                      <path d="M-32,-6 L-16,-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                      <path d="M16,-6 L32,-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                    </g>
                  )}
                  {equippedFacial === 'oculos_coracao' && (
                    <g transform="translate(50, 32)">
                      <path d="M-10,0 L10,0" stroke="#111" strokeWidth="2.5" />
                      <g transform="translate(-20, 2) scale(1.6)">
                        <path d="M0,4 C0,4 -10,-3 -10,-8 C-10,-12 -4,-12 0,-8 C4,-12 10,-12 10,-8 C10,-3 0,4 0,4 Z" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M0,4 C0,4 -10,-3 -10,-8 C-10,-12 -4,-12 0,-8 C4,-12 10,-12 10,-8 C10,-3 0,4 0,4 Z" fill="#F48FB1" opacity="0.8" />
                        <path d="M-6,-8 Q-4,-10 -2,-9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                      </g>
                      <g transform="translate(20, 2) scale(1.6)">
                        <path d="M0,4 C0,4 -10,-3 -10,-8 C-10,-12 -4,-12 0,-8 C4,-12 10,-12 10,-8 C10,-3 0,4 0,4 Z" fill="none" stroke="#E91E63" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M0,4 C0,4 -10,-3 -10,-8 C-10,-12 -4,-12 0,-8 C4,-12 10,-12 10,-8 C10,-3 0,4 0,4 Z" fill="#F48FB1" opacity="0.8" />
                        <path d="M-6,-8 Q-4,-10 -2,-9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
                      </g>
                    </g>
                  )}

                  {equippedFacial === 'monoculo' && (
                    <g transform="translate(50, 34)">
                      <circle cx="20" cy="-3" r="10" fill="none" stroke="#FFD700" strokeWidth="2" />
                      <path d="M 28 -3 Q 38 15 28 30" fill="none" stroke="#FFD700" strokeWidth="1" />
                      <path d="M 14 -5 L 26 -5" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                    </g>
                  )}
                  {equippedFacial === 'mascara_carnaval' && (
                    <g transform="translate(50, 34)">
                      <path d="M -35 -10 C -20 -18 0 -8 0 0 C 0 -8 20 -18 35 -10 C 45 2 25 10 0 4 C -25 10 -45 2 -35 -10 Z" fill="#9C27B0" />
                      <ellipse cx="-20" cy="-2" rx="8" ry="4" fill="#111" />
                      <ellipse cx="20" cy="-2" rx="8" ry="4" fill="#111" />
                      <circle cx="-30" cy="-8" r="1.5" fill="#FFEB3B" />
                      <circle cx="30" cy="-8" r="1.5" fill="#FFEB3B" />
                    </g>
                  )}
                  {equippedFacial === 'bigode' && (
                    <g transform="translate(50, 48)">
                      <path d="M -15 0 C -5 -8 5 -8 15 0 C 22 5 18 10 12 8 C 5 5 0 8 -5 8 C -10 5 -20 10 -15 0 Z" fill="#111" />
                    </g>
                  )}
                  {equippedFacial === 'oculos_3d' && (
                    <g transform="translate(50, 34)">
                      <rect x="-35" y="-12" width="28" height="20" rx="2" fill="#03A9F4" />
                      <rect x="-35" y="-12" width="28" height="20" rx="2" fill="none" stroke="#FFF" strokeWidth="3" />
                      <rect x="7" y="-12" width="28" height="20" rx="2" fill="#F44336" />
                      <rect x="7" y="-12" width="28" height="20" rx="2" fill="none" stroke="#FFF" strokeWidth="3" />
                      <path d="M -7 -2 L 7 -2" stroke="#FFF" strokeWidth="4" />
                    </g>
                  )}
                  {equippedFacial === 'venda_pirata' && (
                    <g transform="translate(50, 34)">
                      <path d="M -40 -12 L 40 8" stroke="#111" strokeWidth="2" />
                      <ellipse cx="-20" cy="-2" rx="12" ry="14" fill="#111" />
                    </g>
                  )}
                  {equippedFacial === 'pintura_guerreiro' && (
                    <g transform="translate(50, 42)">
                      <path d="M -30 0 L -15 5 M -32 4 L -17 9" stroke="#E53935" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 30 0 L 15 5 M 32 4 L 17 9" stroke="#E53935" strokeWidth="3" strokeLinecap="round" />
                    </g>
                  )}
                  {equippedFacial === 'oculos_nerd' && (
                    <g transform="translate(50, 34)">
                      <rect x="-34" y="-10" width="24" height="20" rx="2" fill="none" stroke="#111" strokeWidth="3" />
                      <rect x="10" y="-10" width="24" height="20" rx="2" fill="none" stroke="#111" strokeWidth="3" />
                      <path d="M -10 -1 L 10 -1" stroke="#111" strokeWidth="4" />
                      <rect x="-4" y="-3" width="8" height="6" fill="#FFF" />
                    </g>
                  )}
                  {equippedHead === 'chapeu' && (
                    <g transform="translate(50, 5)">
                       <rect x="-18" y="-20" width="36" height="20" fill="#222" rx="2" />
                       <rect x="-30" y="-2" width="60" height="5" fill="#111" rx="2.5" />
                       <rect x="-18" y="-6" width="36" height="4" fill="#D32F2F" />
                       <rect x="8" y="-12" width="4" height="10" fill="#FFC107" rx="1" />
                    </g>
                  )}
                  {equippedHead === 'laco' && (
                    <g transform="translate(73, 10) rotate(15) scale(1.2)">
                      <path d="M-10,-6 C-18,-12 -18,12 -10,6 L0,0 Z" fill="#D32F2F" />
                      <path d="M10,-6 C18,-12 18,12 10,6 L0,0 Z" fill="#D32F2F" />
                      <circle cx="0" cy="0" r="3.5" fill="#B71C1C" />
                    </g>
                  )}
                  {equippedHead === 'coroa' && (
                    <g transform="translate(50, 8) scale(1.2)">
                      <path d="M-14,2 L-16,-8 L-5,-3 L0,-10 L5,-3 L16,-8 L14,2 Z" fill="#FFD700" />
                      <circle cx="-16" cy="-10" r="1.5" fill="#FF5252" />
                      <circle cx="0" cy="-12" r="1.5" fill="#448AFF" />
                      <circle cx="16" cy="-10" r="1.5" fill="#FF5252" />
                    </g>
                  )}
                  {equippedHead === 'grad' && (
                    <g transform="translate(50, 5) scale(1.2)">
                      <polygon points="0,-12 25,-4 0,4 -25,-4" fill="#2C3E50" />
                      <rect x="-12" y="-2" width="24" height="8" fill="#34495E" rx="1" />
                      <path d="M15,0 L15,14" stroke="#F1C40F" strokeWidth="1.5" />
                      <circle cx="15" cy="14" r="1.5" fill="#F1C40F" />
                    </g>
                  )}
                  {equippedHead === 'bone' && (
                    <g transform="translate(50, 8)">
                      <path d="M-20,0 C-20,-18 20,-18 20,0 Z" fill="#E74C3C" />
                      <path d="M-22,0 L28,0 C32,0 32,4 28,4 L-22,4 C-25,4 -25,0 -22,0 Z" fill="#C0392B" />
                      <circle cx="0" cy="-11" r="3" fill="#C0392B" />
                    </g>
                  )}
                  {equippedHead === 'coroa_real' && (
                    <g transform="translate(50, 5) scale(1.15)">
                      <path d="M-15,-2 C-15,-20 15,-20 15,-2 Z" fill="#b91c1c" />
                      <path d="M-18,2 L-20,-12 C-10,-4 0,-18 0,-18 C0,-18 10,-4 20,-12 L18,2 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="0.5" />
                      <ellipse cx="0" cy="2" rx="19" ry="3" fill="#dc2626" />
                      <path d="M0,-21 L0,-17 M-2,-19 L2,-19" stroke="#fbbf24" strokeWidth="1.5" />
                      <circle cx="-20" cy="-13" r="2" fill="#e2e8f0" />
                      <circle cx="20" cy="-13" r="2" fill="#e2e8f0" />
                    </g>
                  )}
                  {equippedHead === 'boina' && (
                    <g transform="translate(50, 5) rotate(-10)">
                       <ellipse cx="0" cy="0" rx="22" ry="10" fill="#E53935" />
                       <rect x="-2" y="-14" width="4" height="6" fill="#B71C1C" rx="2" />
                    </g>
                  )}
                  {equippedHead === 'chapeu_palha' && (
                    <g transform="translate(50, 8)">
                       <ellipse cx="0" cy="0" rx="35" ry="8" fill="#FFF59D" />
                       <path d="M -20 0 L -15 -15 Q 0 -20 15 -15 L 20 0 Z" fill="#FFF59D" />
                       <path d="M -18 -3 Q 0 -6 18 -3" fill="none" stroke="#D32F2F" strokeWidth="4" />
                    </g>
                  )}
                  {equippedHead === 'capacete_astro' && (
                    <g transform="translate(50, 34)">
                       <ellipse cx="0" cy="-2" rx="43" ry="34" fill="rgba(255,255,255,0.25)" stroke="#FFF" strokeWidth="2" />
                       <path d="M -36 27 A 36 4 0 0 0 36 27" fill="none" stroke="#ECEFF1" strokeWidth="2" opacity="0.8" />
                       <ellipse cx="-18" cy="-15" rx="12" ry="6" fill="#FFF" opacity="0.5" transform="rotate(-30 -18 -15)" />
                       <path d="M 32 -5 A 35 25 0 0 1 36 12" fill="none" stroke="#FFF" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
                    </g>
                  )}
                  {equippedHead === 'coroa_louros' && (
                    <g transform="translate(50, 15)">
                      <path d="M -32 5 Q 0 -15 32 5" fill="none" stroke="#D4AF37" strokeWidth="2" />
                      {[-28, -20, -12, -4].map((x, i) => (
                        <g key={`l${i}`} transform={`translate(${x}, ${i * 1.5 - 5}) rotate(${x})`}>
                           <path d="M 0 0 Q -5 -8 0 -12 Q 5 -8 0 0" fill="#F3E5AB" stroke="#D4AF37" strokeWidth="0.5" />
                        </g>
                      ))}
                      {[28, 20, 12, 4].map((x, i) => (
                        <g key={`r${i}`} transform={`translate(${x}, ${i * 1.5 - 5}) rotate(${x})`}>
                           <path d="M 0 0 Q -5 -8 0 -12 Q 5 -8 0 0" fill="#F3E5AB" stroke="#D4AF37" strokeWidth="0.5" />
                        </g>
                      ))}
                      <path d="M 0 -7 Q -4 -16 0 -20 Q 4 -16 0 -7" fill="#F3E5AB" stroke="#D4AF37" strokeWidth="0.5" />
                    </g>
                  )}
                  {equippedHead === 'tiara_flores' && (
                    <g transform="translate(50, 10)">
                       <ellipse cx="0" cy="0" rx="28" ry="10" fill="none" stroke="#689F38" strokeWidth="3" />
                       {[-20, -10, 0, 10, 20].map((x, i) => (
                          <circle key={"tf"+i} cx={x} cy={Math.abs(x)/4 - 10} r="4" fill={['#F06292', '#BA68C8', '#FFF176'][i%3]} />
                       ))}
                    </g>
                  )}
                  {equippedHead === 'orelhas_coelho' && (
                    <g transform="translate(50, 5)">
                       <ellipse cx="-15" cy="-25" rx="10" ry="30" fill="#FFF" transform="rotate(-15 -15 -25)" />
                       <ellipse cx="-15" cy="-22" rx="5" ry="20" fill="#F48FB1" transform="rotate(-15 -15 -25)" />
                       
                       <ellipse cx="15" cy="-25" rx="10" ry="30" fill="#FFF" transform="rotate(15 15 -25)" />
                       <ellipse cx="15" cy="-22" rx="5" ry="20" fill="#F48FB1" transform="rotate(15 15 -25)" />
                    </g>
                  )}
                  {equippedHead === 'chapeu_bruxa' && (
                    <g transform="translate(50, 8)">
                       <ellipse cx="0" cy="0" rx="35" ry="8" fill="#212121" />
                       <path d="M -20 0 L 0 -40 L 20 0 Z" fill="#212121" />
                       <path d="M -15 -5 Q 0 -8 15 -5" fill="none" stroke="#673AB7" strokeWidth="5" />
                       <rect x="-4" y="-8" width="8" height="6" fill="none" stroke="#FFC107" strokeWidth="2" />
                    </g>
                  )}
                  {equippedHead === 'faixa_ninja' && (
                    <g transform="translate(50, 10)">
                       <path d="M -35 -2 C -20 -8 20 -8 35 -2 L 35 12 C 20 6 -20 6 -35 12 Z" fill="#2E2E30" />
                       <g transform="translate(-32, 5)">
                         <path d="M 0 0 C -15 15 -25 35 -20 40 C -15 25 -5 15 2 2 Z" fill="#2E2E30" />
                         <path d="M 1 3 C -10 20 -15 45 -8 50 C -5 35 2 20 3 5 Z" fill="#1C1C1D" />
                       </g>
                       <g transform="translate(0, 5)">
                         <path d="M -18 -6 L 18 -6 C 20 -6 22 -4 22 -1 L 22 1 C 22 4 20 6 18 6 L -18 6 C -20 6 -22 4 -22 1 L -22 -1 C -22 -4 -20 -6 -18 -6 Z" fill="#78909c" />
                         <path d="M -17 -5 L 17 -5 C 19 -5 21 -3 21 -1 L 21 0 C 21 2 19 4 17 4 L -17 4 C -19 4 -21 2 -21 0 L -21 -1 C -21 -3 -19 -5 -17 -5 Z" fill="#cfd8dc" />
                         <path d="M -17 -5 L 17 -5 L 15 -2 L -15 -2 Z" fill="#ffffff" opacity="0.6" />
                         <circle cx="-16" cy="-2" r="0.8" fill="#546e7a" />
                         <circle cx="-16" cy="1" r="0.8" fill="#546e7a" />
                         <circle cx="16" cy="-2" r="0.8" fill="#546e7a" />
                         <circle cx="16" cy="1" r="0.8" fill="#546e7a" />
                         <path d="M -6 1 C -6 -3 -2 -5 2 -5 C 5 -5 8 -2 8 1 L 6 1 C 6 -1 4 -3 2 -3 C -1 -3 -3 -1 -3 1 C -3 3 -2 4 0 4 C 2 4 4 2 4 0 L 2 0 C 1 1 0 1 0 0 Z M -6 1 L -8 3 M -3 1 C -3 -3 -2 -5 2 -5" fill="none" stroke="#263238" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                       </g>
                    </g>
                  )}
                  {equippedHead === 'coroa_louros' && (
                    <g transform="translate(50, 15)">
                       <path d="M -25 5 Q 0 -15 25 5" fill="none" stroke="#689F38" strokeWidth="3" />
                       {[-20, -10, 0, 10, 20].map((x, i) => (
                           <path key={"cl"+i} d={`M ${x} ${Math.abs(x)/4 - 10} Q ${x-5} ${Math.abs(x)/4-15} ${x+5} ${Math.abs(x)/4-15} Z`} fill="#8BC34A" />
                       ))}
                    </g>
                  )}
                  {equippedHead === 'gorro_natal' && (
                    <g transform="translate(50, 7)">
                       <path d="M -20 0 Q -5 -40 10 -40 C 20 -40 35 -20 40 -10 Q 25 -15 15 -25 Q 5 -20 20 0 Z" fill="#D32F2F" />
                       <rect x="-24" y="-3" width="48" height="8" rx="4" fill="#FFF" />
                       <circle cx="40" cy="-10" r="7" fill="#FFF" />
                    </g>
                  )}
                </motion.g>
                {isSabio && (
                  <motion.ellipse 
                    cx="50" cy="2" rx="20" ry="5" 
                    fill="none" stroke="#FFD700" strokeWidth="2" 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    opacity="0.8"
                  />
                )}
              </motion.g>
            </svg>
          </motion.div>
        </>
      )}
    </div>
  );
}

export function PetView({ pet, xp, studyTimeSeconds, isActive, mode, onInteract }: PetViewProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(pet.name);
  const [message, setMessage] = useState("");
  const [isBathingMode, setIsBathingMode] = useState(false);

  const studyHours = studyTimeSeconds / 3600;
  
  const currentStage = useMemo(() => {
    return [...STAGES].reverse().find(s => studyHours >= s.minHours) || STAGES[0];
  }, [studyHours]);

  const isInspired = pet.happiness >= 80 && !pet.isSick;
  useEffect(() => {
    if (!pet.audioEnabled || !isActive || mode !== 'focus' || pet.happiness < 70 || pet.isDead) return;

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      
      const bufferSize = 4096;
      const node = ctx.createScriptProcessor(bufferSize, 1, 1);
      let lastOut = 0;
      
      node.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const out = (lastOut + (0.02 * white)) / 1.02;
          lastOut = out;
          output[i] = out * 0.05 * (Math.sin(ctx.currentTime * 15) * 0.5 + 0.5);
        }
      };

      node.connect(ctx.destination);
      return () => {
        node.disconnect();
        ctx.close();
      };
    } catch (e) {
      console.warn("AudioContext not supported or blocked", e);
    }
  }, [pet.audioEnabled, isActive, mode, pet.happiness, pet.isDead]);

  const [messageCycleCount, setMessageCycleCount] = useState(0);
  const [achievementFilter, setAchievementFilter] = useState('all');
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCycleCount(c => c + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const getPetMessage = useCallback(() => {
    if (pet.isDead) return "Zzz... 👻";
    const lastEntry = pet.diary?.[0];
    if (lastEntry) {
      const entryAge = Date.now() - new Date(lastEntry.timestamp).getTime();
      if (entryAge < 15000) { // React for 15 seconds
        if (lastEntry.text.includes("alimentado")) return "Hmmm, delícia! Obrigado! 🍗";
        if (lastEntry.text.includes("Brincamos")) return "HEHEHEHHEHE! 😊";
        if (lastEntry.text.includes("EVOLUÇÃO")) return "Olha só! Eu cresci! Estou mais sábio! 🌱";
        if (lastEntry.text.includes("META SEMANAL")) return "Você bateu a meta da semana! Incrível! 🌟";
      }
    }
    const validMessages: string[] = [];
    if (pet.isSick) validMessages.push("Não estou me sentindo bem... 🤒");
    if (pet.dirtiness >= 50) validMessages.push("Estou me sentindo um porquinho... 🧼");
    if (pet.hunger < 20) validMessages.push("Estou com tanta fome... 😿");
    if (pet.happiness < 20) validMessages.push("Estou tão coitadinho hoje... Vamos brincar?");
    if (pet.energy < 20) validMessages.push("Estou exausto... Preciso de um descanso.");
    if ([0, 6].includes(new Date().getDay())) {
      validMessages.push("Hoje é dia de descanso! Vamos relaxar um pouco? 😊");
      validMessages.push("Minhas energias estão voltando! ☀️");
      validMessages.push("Aproveite o fim de semana para recarregar as pilhas! 🔋");
    }
    if (isInspired) validMessages.push("Estou super animado! Meow!");
    if (pet.happiness > 80) validMessages.push("Você é a melhor dona do mundo! 😸");
    const stageMsgs = MESSAGES_BY_STAGE[currentStage.id] || MESSAGES_BY_STAGE.filhote;
    validMessages.push(stageMsgs[Math.floor(Date.now() / 60000) % stageMsgs.length]);
    validMessages.push(stageMsgs[(Math.floor(Date.now() / 60000) + 1) % stageMsgs.length]);
    const cycleIndex = messageCycleCount % validMessages.length;
    return validMessages[cycleIndex];
  }, [pet, isInspired, currentStage.id, messageCycleCount]);

  useEffect(() => {
    setMessage(getPetMessage());
  }, [getPetMessage]);

  const handleRename = () => {
    if (newName.trim()) {
      onInteract('rename', newName.trim());
      setIsEditingName(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Card className="rounded-bento border-border-main bg-card-bg overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center p-8">
            <div className="absolute inset-0 bg-gradient-to-b from-accent-red/5 to-transparent pointer-events-none" />
            {isInspired && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-64 h-64 bg-yellow-500/20 blur-[100px] rounded-full"
              />
            )}
            <div className="absolute top-8 left-8 right-8 flex justify-between items-start z-30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <Input 
                        value={newName} 
                        onChange={(e) => setNewName(e.target.value)}
                        className="h-8 w-32 bg-black/40 border-border-main text-sm"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleRename} className="h-8 bg-accent-red text-white">OK</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <h2 className="text-2xl font-serif italic text-text-primary">{pet.name}</h2>
                      <button onClick={() => setIsEditingName(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 className="w-4 h-4 text-text-secondary" />
                      </button>
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="bg-accent-red/10 text-accent-red border-accent-red/20 text-[10px] uppercase tracking-widest">
                  Gato {currentStage.name} • {Math.floor(studyHours)}h estudadas
                </Badge>
                {([0, 6].includes(new Date().getDay())) && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-400/20 text-[10px] uppercase tracking-widest ml-2">
                    ☀️ Modo Descanso
                  </Badge>
                )}
              </div>

              {isInspired && (
                <Badge className="bg-yellow-500 text-black font-bold flex gap-1 animate-pulse">
                  <Star className="w-3 h-3 fill-current" /> MODO INSPIRADO (+20% XP)
                </Badge>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                key={message}
                className="absolute top-24 right-4 bg-white text-black px-5 py-3 rounded-2xl rounded-br-none font-bold text-xs shadow-xl flex items-center gap-2 z-40 max-w-[180px]"
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent-red flex-shrink-0" />
                {message}
              </motion.div>
            </AnimatePresence>
            <div className="relative mt-12">
              <PetAvatar 
                stage={currentStage.id} 
                accessories={pet.accessories ?? { owned: [], equipped: { facial: null, head: null, body: null, skin: null } }}
                isInspired={isInspired} 
                hunger={pet.hunger}
                energy={pet.energy}
                happiness={pet.happiness}
                xp={xp}
                isSick={pet.isSick}
                dirtiness={pet.dirtiness}
                isDead={pet.isDead}
                isBathing={isBathingMode}
                onRub={() => onInteract('rub_clean')}
              />
            </div>
            {isBathingMode && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 bg-blue-500/20 backdrop-blur-[2px] z-[45] flex items-center justify-center pointer-events-none"
              >
                <div className="text-white text-xl font-bold bg-blue-600/80 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
                  <Sparkles className="w-6 h-6" /> ESFREGA O GATINHO! ✨
                </div>
                <Button 
                  onClick={() => setIsBathingMode(false)}
                  className="absolute bottom-4 right-4 bg-white text-blue-600 hover:bg-white/90 pointer-events-auto"
                >
                  Terminar Banho
                </Button>
              </motion.div>
            )}
            {pet.isDead && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <Skull className="w-16 h-16 text-white mb-2" />
                <div className="space-y-2">
                  <h3 className="text-3xl font-serif italic text-white">Óh Não! {pet.name} se foi...</h3>
                  <p className="text-white/70 text-sm max-w-sm">
                    A falta de cuidados básicos levou seu companheiro de estudos. 
                    Reviva-o para continuar sua jornada, mas lembre-se: cuidar dele faz parte da sua rotina!
                  </p>
                </div>
                <Button 
                   onClick={() => onInteract('revive')}
                   className="bg-accent-red hover:bg-accent-red/90 text-white font-bold px-8 h-12 rounded-xl flex gap-2"
                >
                  <RefreshCw className="w-5 h-5" /> REANIMAR PET (500 XP)
                </Button>
                <div className="text-[10px] text-white/50 uppercase tracking-widest">
                  Se não tiver XP, o pet voltará ao nível filhote
                </div>
              </div>
            )}
            <div className="w-full max-w-2xl px-4 md:px-8 mt-10 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-8 relative z-10">
              <div className="space-y-1.5 md:space-y-3">
                <div className="flex items-center justify-between text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Utensils className="w-2.5 h-2.5 md:w-3 md:h-3 text-orange-500" /> Fome
                  </div>
                  <span>{Math.round(pet.hunger)}%</span>
                </div>
                <div className="h-2 md:h-2.5 w-full bg-white/10 rounded-full overflow-hidden shrink-0">
                  <motion.div animate={{ width: `${pet.hunger}%` }} className="h-full bg-orange-500" />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-3">
                <div className="flex items-center justify-between text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Heart className="w-2.5 h-2.5 md:w-3 md:h-3 text-accent-red" /> Felicidade
                  </div>
                  <span>{Math.round(pet.happiness)}%</span>
                </div>
                <div className="h-2 md:h-2.5 w-full bg-white/10 rounded-full overflow-hidden shrink-0">
                  <motion.div animate={{ width: `${pet.happiness}%` }} className="h-full bg-accent-red" />
                </div>
              </div>

              <div className="space-y-1.5 md:space-y-3">
                <div className="flex items-center justify-between text-[8px] md:text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                  <div className="flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 md:w-3 md:h-3 text-yellow-500" /> Energia
                  </div>
                  <span>{Math.round(pet.energy)}%</span>
                </div>
                <div className="h-2 md:h-2.5 w-full bg-white/10 rounded-full overflow-hidden shrink-0">
                  <motion.div animate={{ width: `${pet.energy}%` }} className="h-full bg-yellow-500" />
                </div>
              </div>
              <div className="md:col-span-3 grid grid-cols-2 gap-2 md:gap-4 mt-1 md:mt-2 border-t border-white/5 pt-3 md:pt-4">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between px-2.5 py-2 bg-white/5 rounded-xl border border-white/5 min-w-0 gap-1">
                  <div className="flex items-center gap-1 md:gap-2 truncate">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-400 shrink-0" />
                    <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-text-secondary truncate">Sujeira</span>
                  </div>
                  <span className={`text-[9px] md:text-xs font-bold shrink-0 ${pet.dirtiness > 50 ? 'text-orange-400' : 'text-text-primary'}`}>{Math.round(pet.dirtiness)}%</span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center justify-between px-2.5 py-2 bg-white/5 rounded-xl border border-white/5 min-w-0 gap-1">
                  <div className="flex items-center gap-1 md:gap-2 truncate">
                    <Stethoscope className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-400 shrink-0" />
                    <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-text-secondary truncate">Saúde</span>
                  </div>
                  <span className={`text-[9px] md:text-xs font-bold shrink-0 ${pet.isSick ? 'text-red-400' : 'text-emerald-400'}`}>
                    {pet.isSick ? 'Doente' : 'Saudável'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Evolution Preview */}
          {(() => {
            const nextStage = STAGES.find(s => s.minHours > studyHours);
            if (!nextStage) return null;
            const currentIdx = STAGES.findIndex(s => s.id === currentStage.id);
            const prevMinHours = currentIdx > 0 ? STAGES[currentIdx].minHours : 0;
            const hoursNeeded = nextStage.minHours - prevMinHours;
            const hoursDone = studyHours - prevMinHours;
            const pct = Math.min(100, (hoursDone / hoursNeeded) * 100);
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 rounded-xl border border-border-main p-4 flex items-center gap-4"
              >
                <div className="text-3xl">{nextStage.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-text-primary">Próximo: {nextStage.name}</span>
                    <span className="text-[10px] text-text-secondary">Faltam {Math.ceil(nextStage.minHours - studyHours)}h</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${pct}%` }} className="h-full bg-accent-red" />
                  </div>
                </div>
              </motion.div>
            );
          })()}

          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 md:gap-3">
            <Button 
              onClick={() => onInteract('feed')} 
              disabled={xp < 20}
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Utensils className="w-4 h-4 md:w-5 md:h-5 text-orange-500 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Alimentar</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">20 XP</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('play')} 
              disabled={xp < 15}
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Gamepad2 className="w-4 h-4 md:w-5 md:h-5 text-accent-red group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Brincar</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">15 XP</div>
              </div>
            </Button>

            <Button 
              onClick={() => {
                onInteract('bath');
                setIsBathingMode(true);
              }} 
              disabled={xp < 15 || isBathingMode}
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Bath className="w-4 h-4 md:w-5 md:h-5 text-blue-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Banho</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">15 XP</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('medicine')} 
              disabled={xp < 30 || !pet.isSick}
              className={`h-14 md:h-20 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 group transition-all touch-target ${pet.isSick ? 'bg-accent-red/20 border-accent-red animate-pulse' : 'bg-card-bg border-border'}`}
            >
              <Stethoscope className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Remédio</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">30 XP</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('toggle_audio')} 
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              {pet.audioEnabled ? <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-400 shrink-0" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-text-secondary shrink-0" />}
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Ronronar</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest whitespace-nowrap">{pet.audioEnabled ? 'ON' : 'OFF'}</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('sleep')} 
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Moon className="w-4 h-4 md:w-5 md:h-5 text-indigo-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Dormir</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">Grátis</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('afagar')} 
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Heart className="w-4 h-4 md:w-5 md:h-5 text-pink-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Afagar</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">+5 Humor</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('coffee')} 
              disabled={xp < 10}
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Coffee className="w-4 h-4 md:w-5 md:h-5 text-yellow-600 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Café</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">10 XP</div>
              </div>
            </Button>

            <Button 
              onClick={() => onInteract('brush')} 
              disabled={xp < 5}
              className="h-14 md:h-20 rounded-xl md:rounded-2xl bg-card-bg border border-border hover:bg-white/5 flex flex-col items-center justify-center gap-1 group transition-all touch-target"
            >
              <Scissors className="w-4 h-4 md:w-5 md:h-5 text-purple-400 group-hover:scale-110 transition-transform shrink-0" />
              <div className="text-center">
                <div className="text-[9px] md:text-[11px] font-bold text-text-primary">Escovar</div>
                <div className="text-[7px] md:text-[8px] text-text-secondary uppercase tracking-widest">5 XP</div>
              </div>
            </Button>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-bento border-border-main bg-card-bg h-full flex flex-col overflow-hidden">
            <Tabs defaultValue="shop" className="flex flex-col h-full">
              <TabsList className="bg-black/20 p-1 rounded-none border-b border-border-main">
                <TabsTrigger value="shop" className="flex-1 gap-2 text-xs py-3"><ShoppingBag className="w-3.5 h-3.5" /> Loja</TabsTrigger>
                <TabsTrigger value="diary" className="flex-1 gap-2 text-xs py-3"><History className="w-3.5 h-3.5" /> Diário</TabsTrigger>
                <TabsTrigger value="badges" className="flex-1 gap-2 text-xs py-3"><Trophy className="w-3.5 h-3.5" /> Conquistas</TabsTrigger>
              </TabsList>

              <div className="p-6 flex-1 overflow-hidden">
                <TabsContent value="shop" className="mt-0 h-full flex flex-col gap-4 outline-none">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Seu XP: <span className="text-accent-red">{xp}</span></span>
                  </div>
                  <ScrollArea className="flex-1 pr-4">
                    <div className="space-y-6">
                      {(['head', 'facial', 'body', 'skin'] as AccessoryCategory[]).map(cat => {
                        const items = ACCESSORIES_CATALOG.filter(a => a.category === cat);
                        if (items.length === 0) return null;
                        
                        const catTitle = { head: 'Cabeça', facial: 'Facial', body: 'Corpo', skin: 'Visual Base' }[cat];
                        return (
                          <div key={cat} className="space-y-3">
                            <h4 className="text-[10px] uppercase font-bold text-text-secondary border-b border-white/5 pb-1">{catTitle}</h4>
                            <div className="grid grid-cols-2 gap-3">
                              {items.map(acc => {
                                const isOwned = (pet.accessories?.owned ?? []).includes(acc.id);
                                const isActive = pet.accessories?.equipped?.[cat] === acc.id;
                                const isLocked = acc.exclusive && !isOwned;
                                
                                return (
                                  <Button 
                                    key={acc.id}
                                    onClick={() => {
                                      if (isLocked) return;
                                      if (isOwned) {
                                        onInteract('equip_accessory', acc.id);
                                      } else {
                                        onInteract('buy_accessory', acc.id);
                                      }
                                    }}
                                    disabled={(!isOwned && xp < acc.cost) || isLocked}
                                    className={`flex-col h-auto py-4 rounded-xl border transition-all relative ${
                                      isActive ? 'bg-accent-red border-accent-red text-white' : 'bg-white/5 border-border-main hover:border-accent-red/50'
                                    }`}
                                  >
                                    <span className={`text-3xl mb-2 ${isLocked ? 'opacity-50 grayscale' : ''}`}>{acc.emoji}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-tighter text-center">{acc.name}</span>
                                    {isLocked ? (
                                      <span className="text-[9px] mt-1 text-purple-400 font-bold flex items-center justify-center gap-1">
                                        <Lock className="w-3 h-3" /> Baú Raro
                                      </span>
                                    ) : !isOwned ? (
                                      <span className="text-[9px] mt-1 text-accent-red font-bold">{acc.cost} XP</span>
                                    ) : (
                                      <span className="text-[9px] mt-1 text-text-secondary">{isActive ? 'Equipado' : 'Equipar'}</span>
                                    )}
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="diary" className="mt-0 h-full outline-none">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest">Histórico Recente</h3>
                    {(pet.diary?.length ?? 0) > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          onInteract('clear_diary');
                        }}
                        className="text-[10px] text-accent-red hover:text-accent-red hover:bg-accent-red/10 h-7 px-2"
                      >
                        Limpar Diário
                      </Button>
                    )}
                  </div>
                  <ScrollArea className="h-[360px] pr-4">
                    <div className="space-y-4">
                      {(pet.diary?.length ?? 0) === 0 ? (
                        <p className="text-center text-text-secondary text-sm italic py-8">Nenhuma entrada no diário ainda...</p>
                      ) : (
                        (pet.diary ?? []).map((entry, i) => (
                          <div key={i} className="relative pl-6 pb-4 border-l border-border-main last:pb-0">
                            <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-accent-red" />
                            <div className="space-y-1">
                              <p className="text-xs text-text-primary font-medium leading-relaxed">{entry.text}</p>
                              <p className="text-[9px] text-text-secondary uppercase tracking-widest">
                                {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true, locale: ptBR })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="badges" className="mt-0 h-full outline-none">
                  <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none pb-1">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setAchievementFilter(key)}
                        className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                          achievementFilter === key
                            ? 'bg-accent-red text-white'
                            : 'bg-white/5 text-text-secondary hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <ScrollArea className="h-[310px] pr-4">
                    <div className="grid grid-cols-1 gap-3">
                      {ACHIEVEMENTS
                        .filter(a => achievementFilter === 'all' || a.category === achievementFilter)
                        .map(badge => {
                          const isUnlocked = (pet.achievements ?? []).includes(badge.id);
                          return (
                            <div key={badge.id} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${isUnlocked ? 'bg-accent-red/10 border-accent-red/30' : 'bg-white/5 border-border-main opacity-50'}`}>
                              <div className={`p-2 rounded-lg ${isUnlocked ? 'bg-accent-red text-white' : 'bg-white/10 text-text-secondary'}`}>
                                <badge.icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-text-primary">{badge.name}</p>
                                <p className="text-[10px] text-text-secondary">{badge.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
