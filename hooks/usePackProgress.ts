/**
 * Хук для загрузки прогресса пака
 */

import { getLevelProgress, getPackProgressSummary, isLevelUnlocked } from '@/lib/storage';
import type { LevelProgress, Pack } from '@/lib/types';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

export function usePackProgress(pack: Pack) {
  const [levelProgressMap, setLevelProgressMap] = useState<Record<string, LevelProgress>>({});
  const [packSummary, setPackSummary] = useState({
    mastered: 0,
    total: 0,
    completedLevels: 0,
    totalLevels: 0,
  });

  const loadProgress = useCallback(async () => {
    // Загрузка прогресса уровней
    const progressMap: Record<string, LevelProgress> = {};
    for (const level of pack.levels) {
      progressMap[level.id] = await getLevelProgress(pack.id, level.id);
    }
    setLevelProgressMap(progressMap);

    // Загрузка сводки пака
    const summary = await getPackProgressSummary(pack);
    setPackSummary(summary);
  }, [pack]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const isUnlocked = (levelId: string): boolean => {
    const level = pack.levels.find(l => l.id === levelId);
    if (!level) return false;
    return isLevelUnlocked(pack, level, levelProgressMap);
  };

  return {
    levelProgressMap,
    packSummary,
    isUnlocked,
    refresh: loadProgress,
  };
}
