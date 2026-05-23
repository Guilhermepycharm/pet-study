// --- SETTINGS & CORE ---
export interface Settings {
  startDate: string;
  examDate: string;
  focusDate: string;
  delayedMode: boolean;
}

export interface CompletedTopics {
  [topicKey: string]: string; // moduleId__index -> doneDateIso
}

export interface ReviewsDone {
  [reviewKey: string]: string; // moduleId__index__stageKey -> doneDateIso
}

export interface TopicNotes {
  [topicKey: string]: string; // moduleId__index -> note text
}

export interface ImportantDate {
  id: string;
  name: string;
  date: string; // ISO date "2026-11-02"
  color?: string;
}

export const REVIEW_STAGES = [
  { key: 'r1', label: 'R1 (24h)', days: 1 },
  { key: 'r2', label: 'R2 (7d)', days: 7 },
  { key: 'r3', label: 'R3 (21d)', days: 21 },
  { key: 'r4', label: 'R4 (45d)', days: 45 }
];

// --- PET ---
export interface PetDiaryEntry {
  timestamp: string;
  text: string;
}

export interface PetState {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  accessories: {
    owned: string[];
    equipped: {
      facial: string | null;
      head: string | null;
      body: string | null;
      skin: string | null;
    };
  };
  chestTracker: {
    lastOpenedStreak: number;
    obtainedExclusives: string[];
  };
  achievements: string[];
  diary: PetDiaryEntry[];
  lastUpdate: string;
  isSick: boolean;
  dirtiness: number;
  isDead: boolean;
  deathTimestamp: string | null;
  audioEnabled: boolean;
  usedPromoCodes?: { [code: string]: string };
}

export type PetAction =
  | 'feed'
  | 'play'
  | 'clean'
  | 'bath'
  | 'brush'
  | 'sleep'
  | 'coffee'
  | 'medicine'
  | 'revive'
  | 'rub_clean'
  | 'toggle_audio'
  | 'buy_accessory'
  | 'equip_accessory'
  | 'rename'
  | 'debug_set_stats'
  | 'clear_diary'
  | 'open_chest'
  | 'afagar';

// --- MISSIONS ---
export type DailyMissionType =
  | 'study_time'
  | 'complete_topics'
  | 'complete_module'
  | 'reviews'
  | 'feed_pet'
  | 'play_pet'
  | 'bath_pet'
  | 'cure_pet'
  | 'afagar';

export type WeeklyMissionType = 'study_hours' | 'complete_modules' | 'happy_pet_days';

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface WeeklyMission {
  id: string;
  type: WeeklyMissionType;
  description: string;
  progress: number;
  target: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
}

export interface MissionState {
  daily: DailyMission[];
  bonus: DailyMission | null;
  weekly: WeeklyMission[];
  lastGenerated: string;
  lastDailyGenerated: string;
  lastWeeklyGenerated: string;
  streak: number;
  lastStreakDate: string;
}

export interface WeeklyGoal {
  targetHours: number;
  currentHours: number;
  lastWeekReset: string;
  claimed: boolean;
}

// --- FLASHCARDS (ANKI STYLE) ---
export type FlashcardEase = 'again' | 'hard' | 'good' | 'easy';

export interface Flashcard {
  id: string;
  moduleId: string;
  front: string;
  back: string;
  createdAt: string;
  
  // Algoritmo SM-2
  interval: number; // dias
  repetition: number;
  efactor: number;
  dueDate: string; // ISO date string
}

export interface FlashcardState {
  cards: Flashcard[];
}

// --- CALENDAR & STATS ---
export interface CalendarDay {
  date: string;
  isOff: boolean;
  dayType: 'rest' | 'review' | 'study';
  plannedModuleIds: string[];
  isSprint: boolean;
  isPast: boolean;
}

export interface SubjectStats {
  subject: string;
  total: number;
  done: number;
  pct: number;
}

export interface GlobalStats {
  totalModules: number;
  completedModules: number;
  totalTopics: number;
  completedTopicsCount: number;
  pct: number;
  daysToExam: number;
  subjectProgress: SubjectStats[];
}
