import { useState, useEffect } from 'react';
import { format, parseISO, addHours, differenceInHours } from 'date-fns';
import { useLocalStorage } from './useLocalStorage';
import { PetState, PetAction, PetDiaryEntry } from '../types';
import { ACCESSORIES_CATALOG } from '../data/accessories';

const DEFAULT_PET: PetState = {
  name: "Mimi",
  hunger: 100,
  happiness: 100,
  energy: 100,
  accessories: {
    owned: [],
    equipped: { facial: null, head: null, body: null, skin: null }
  },
  chestTracker: {
    lastOpenedStreak: 0,
    obtainedExclusives: []
  },
  achievements: [],
  diary: [{ timestamp: new Date().toISOString(), text: "Bem-vindo ao seu novo lar! Miau!" }],
  lastUpdate: new Date().toISOString(),
  isSick: false,
  dirtiness: 0,
  isDead: false,
  deathTimestamp: null,
  audioEnabled: false,
  usedPromoCodes: {}
};

function migratePetState(raw: unknown): PetState {
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PET };
  const p = raw as Record<string, unknown>;
  return {
    name: typeof p.name === 'string' ? p.name : DEFAULT_PET.name,
    hunger: typeof p.hunger === 'number' ? p.hunger : DEFAULT_PET.hunger,
    happiness: typeof p.happiness === 'number' ? p.happiness : DEFAULT_PET.happiness,
    energy: typeof p.energy === 'number' ? p.energy : DEFAULT_PET.energy,
    accessories: p.accessories && typeof p.accessories === 'object'
      ? {
          owned: Array.isArray((p.accessories as Record<string, unknown>).owned)
            ? ((p.accessories as Record<string, unknown>).owned as string[])
            : [],
          equipped: (p.accessories as Record<string, unknown>).equipped && typeof (p.accessories as Record<string, unknown>).equipped === 'object'
            ? { ...DEFAULT_PET.accessories.equipped, ...((p.accessories as Record<string, unknown>).equipped as Record<string, string | null>) }
            : { ...DEFAULT_PET.accessories.equipped }
        }
      : { ...DEFAULT_PET.accessories },
    chestTracker: p.chestTracker && typeof p.chestTracker === 'object'
      ? {
          lastOpenedStreak: typeof (p.chestTracker as Record<string, unknown>).lastOpenedStreak === 'number'
            ? (p.chestTracker as Record<string, unknown>).lastOpenedStreak as number
            : 0,
          obtainedExclusives: Array.isArray((p.chestTracker as Record<string, unknown>).obtainedExclusives)
            ? (p.chestTracker as Record<string, unknown>).obtainedExclusives as string[]
            : []
        }
      : { ...DEFAULT_PET.chestTracker },
    achievements: Array.isArray(p.achievements) ? p.achievements as string[] : [],
    diary: Array.isArray(p.diary) ? p.diary as PetDiaryEntry[] : [...DEFAULT_PET.diary],
    lastUpdate: typeof p.lastUpdate === 'string' ? p.lastUpdate : new Date().toISOString(),
    isSick: typeof p.isSick === 'boolean' ? p.isSick : false,
    dirtiness: typeof p.dirtiness === 'number' ? p.dirtiness : 0,
    isDead: typeof p.isDead === 'boolean' ? p.isDead : false,
    deathTimestamp: typeof p.deathTimestamp === 'string' || p.deathTimestamp === null ? p.deathTimestamp as string | null : null,
    audioEnabled: typeof p.audioEnabled === 'boolean' ? p.audioEnabled : false,
    usedPromoCodes: p.usedPromoCodes && typeof p.usedPromoCodes === 'object'
      ? p.usedPromoCodes as Record<string, string>
      : {}
  };
}

export function usePetState(xp: number, setXp: (val: number | ((prev: number) => number)) => void) {
  const [pet, setPet] = useLocalStorage<PetState>('enem-pet', DEFAULT_PET, migratePetState);

  // Simulation on load
  useEffect(() => {
    setPet(prev => {
      let parsed = { ...prev };
      const lastUpdate = parseISO(parsed.lastUpdate || new Date().toISOString());
      const now = new Date();
      const totalHours = differenceInHours(now, lastUpdate);

      if (totalHours > 0 && !parsed.isDead) {
        let currentHunger = parsed.hunger;
        let currentEnergy = parsed.energy;
        let currentHappiness = parsed.happiness;
        let currentDirtiness = parsed.dirtiness;
        let currentIsSick = parsed.isSick;

        const maxHours = Math.min(totalHours, 720);
        let tempDate = lastUpdate;

        for (let i = 0; i < maxHours; i++) {
          tempDate = addHours(tempDate, 1);
          const dayOfWeek = tempDate.getDay();
          const isRest = dayOfWeek === 0 || dayOfWeek === 6;

          if (!currentIsSick) {
            let sickChance = 0.02;
            if (currentHunger < 30) sickChance += 0.10;
            if (currentHappiness < 30) sickChance += 0.10;
            if (currentEnergy < 20) sickChance += 0.15;
            if (currentDirtiness >= 30) sickChance += 0.10;
            if (Math.random() < Math.min(0.50, sickChance)) currentIsSick = true;
          }

          if (isRest) {
            currentHunger -= 0.5;
            currentEnergy += 1;
            currentHappiness -= 0.2;
            currentDirtiness += 1;
          } else {
            currentHunger -= 5;
            currentEnergy -= 3;
            currentHappiness -= 2;
            currentDirtiness += 5;
          }

          if (currentIsSick) currentHappiness -= 4;
          if (currentDirtiness >= 30) currentHappiness -= 1;

          currentHunger = Math.max(0, currentHunger);
          currentEnergy = Math.min(100, Math.max(0, currentEnergy));
          currentHappiness = Math.max(0, currentHappiness);
          currentDirtiness = Math.min(100, Math.max(0, currentDirtiness));

          if (currentHunger === 0 && currentEnergy === 0 && currentHappiness === 0) {
            return {
              ...parsed,
              hunger: 0, energy: 0, happiness: 0,
              isDead: true,
              deathTimestamp: tempDate.toISOString(),
              lastUpdate: now.toISOString()
            };
          }
        }

        return {
          ...parsed,
          hunger: currentHunger,
          energy: currentEnergy,
          happiness: currentHappiness,
          dirtiness: currentDirtiness,
          isSick: currentIsSick,
          lastUpdate: now.toISOString()
        };
      }
      return parsed;
    });
  }, []);

  const interactWithPet = (action: PetAction, payload?: string | number) => {
    const now = new Date().toISOString();
    
    setPet(prev => {
      if (prev.isDead && action !== 'revive') return prev;

      let next = { ...prev, lastUpdate: now };
      let diaryText = "";

      switch (action) {
        case 'revive':
          const cost = 500;
          if (xp >= cost) setXp(x => x - cost);
          next = { ...next, hunger: 50, happiness: 50, energy: 50, isDead: false, deathTimestamp: null };
          diaryText = xp >= cost ? "Fui revivido! Obrigado por não desistir de mim! ❤️" : "Renasci das cinzas! Vamos recomeçar? ✨";
          break;
        case 'rename':
          if (payload) {
            next.name = payload as string;
            diaryText = `Mudei meu nome para ${payload}!`;
          }
          break;
        case 'afagar':
          next.happiness = Math.min(100, prev.happiness + 5);
          diaryText = "Purrrr... Que carinho gostoso! ❤️";
          break;
        case 'feed':
          if (xp < 20) return prev;
          setXp(x => x - 20);
          next.hunger = Math.min(100, prev.hunger + 40);
          next.happiness = Math.min(100, prev.happiness + 10);
          diaryText = "Fui alimentado! Delícia! 🍗";
          break;
        case 'play':
          if (xp < 15) return prev;
          setXp(x => x - 15);
          next.energy = Math.max(0, prev.energy - 25);
          next.happiness = Math.min(100, prev.happiness + 20);
          diaryText = "Brincamos muito! Estou feliz! 😊";
          break;
        case 'clean':
          if (xp < 10) return prev;
          setXp(x => x - 10);
          next.happiness = Math.min(100, prev.happiness + 12);
          next.dirtiness = Math.max(0, prev.dirtiness - 15);
          diaryText = "Tudo limpinho agora! ✨";
          break;
        case 'rub_clean':
          next.dirtiness = Math.max(0, prev.dirtiness - 2);
          if (next.dirtiness === 0 && prev.dirtiness > 0) diaryText = "Pet limpinho! ✨";
          break;
        case 'bath':
          if (xp < 15) return prev;
          setXp(x => x - 15);
          diaryText = "Hora do banho! Me esfrega! 🧼";
          break;
        case 'medicine':
          if (xp < 30) return prev;
          setXp(x => x - 30);
          next.isSick = false;
          next.happiness = Math.min(100, prev.happiness + 20);
          diaryText = "Tomei o remédio e já me sinto melhor! 💊✨";
          break;
        case 'toggle_audio':
          next.audioEnabled = !prev.audioEnabled;
          break;
        case 'sleep':
          next.energy = Math.min(100, prev.energy + 40);
          next.hunger = Math.max(0, prev.hunger - 15);
          diaryText = "Zzz... Que soneca boa! Recuperei minhas energias! 😴💤";
          break;
        case 'coffee':
          if (xp < 10) return prev;
          setXp(x => x - 10);
          next.energy = Math.min(100, prev.energy + 25);
          next.happiness = Math.min(100, prev.happiness + 5);
          diaryText = "Cafézinho pra dar aquele gás nos estudos! ☕⚡";
          break;
        case 'brush':
          if (xp < 5) return prev;
          setXp(x => x - 5);
          next.happiness = Math.min(100, prev.happiness + 8);
          diaryText = "Dentes escovados! Sorriso brilhante! 🦷🪥";
          break;
        case 'buy_accessory':
          const acc = ACCESSORIES_CATALOG.find(a => a.id === payload);
          if (acc && xp >= acc.cost && !prev.accessories.owned.includes(acc.id) && !acc.exclusive) {
            setXp(x => x - acc.cost);
            next.accessories = {
              ...prev.accessories,
              owned: [...prev.accessories.owned, acc.id],
              equipped: { ...prev.accessories.equipped, [acc.category]: acc.id }
            };
            diaryText = `Comprei um acessório novo: ${acc.name}! 🎁`;
          }
          break;
        case 'equip_accessory':
          const target = ACCESSORIES_CATALOG.find(a => a.id === payload);
          if (target) {
             next.accessories = {
               ...prev.accessories,
               equipped: {
                 ...prev.accessories.equipped,
                 [target.category]: prev.accessories.equipped[target.category as keyof typeof prev.accessories.equipped] === payload ? null : payload as any
               }
             };
          }
          break;
        case 'open_chest':
          const availableExclusives = ACCESSORIES_CATALOG.filter(a => a.exclusive && !prev.accessories.owned.includes(a.id));
          let reward: any = null;
          if (availableExclusives.length > 0) {
            reward = availableExclusives[Math.floor(Math.random() * availableExclusives.length)];
            next.accessories = {
              ...prev.accessories,
              owned: [...prev.accessories.owned, reward.id]
            };
            diaryText = `📦 Baú aberto! Você ganhou: ${reward.name} ${reward.emoji || ''}!`;
          } else {
            setXp(x => x + 500);
            diaryText = `📦 Baú aberto! Você já tem tudo, tome +500 XP!`;
          }
          break;
        case 'clear_diary':
          next.diary = [];
          break;
      }

      if (diaryText) {
        next.diary = [{ timestamp: now, text: diaryText }, ...prev.diary].slice(0, 50);
      }
      return next;
    });
  };

  return {
    pet,
    setPet,
    interactWithPet
  };
}
