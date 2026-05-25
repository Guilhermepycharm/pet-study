import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { ACHIEVEMENTS, type AchievementContext } from '../data/achievements';

export function useAchievements(
  ctx: AchievementContext,
  unlockedIds: string[],
  onUnlock: (ids: string[]) => void,
  onMessage: (msg: string) => void
) {
  const prevIdsRef = useRef(unlockedIds);
  const onUnlockRef = useRef(onUnlock);
  const onMessageRef = useRef(onMessage);

  onUnlockRef.current = onUnlock;
  onMessageRef.current = onMessage;

  useEffect(() => {
    const prevSet = new Set(prevIdsRef.current);
    const unlockedSet = new Set(unlockedIds);
    const newlyUnlocked: string[] = [];

    for (const achievement of ACHIEVEMENTS) {
      if (prevSet.has(achievement.id) || unlockedSet.has(achievement.id)) continue;
      if (achievement.check(ctx)) {
        newlyUnlocked.push(achievement.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      onUnlockRef.current(newlyUnlocked);
      for (const id of newlyUnlocked) {
        const definition = ACHIEVEMENTS.find(a => a.id === id);
        if (definition) {
          onMessageRef.current(`Conquista desbloqueada: ${definition.name}!`);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        }
      }
    }

    prevIdsRef.current = unlockedIds;
  }, [ctx, unlockedIds]);
}
