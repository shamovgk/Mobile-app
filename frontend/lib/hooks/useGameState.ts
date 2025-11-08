/**
 * Хук для управления состоянием игры (ПОЛНОСТЬЮ ИСПРАВЛЕН)
 */

import { applyAnswer, defaultScore } from '@/lib/game/engine/scoring';
import type { Answer, ScoreState } from '@/lib/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useGameState(initialLives: number) {
  const [scoreState, setScoreState] = useState<ScoreState>(defaultScore);
  const scoreRef = useRef(scoreState);
  
  const [livesLeft, setLivesLeft] = useState(initialLives);
  const livesRef = useRef(initialLives); // ДОБАВЛЕНО: ref для жизней
  
  const [slotIdx, setSlotIdx] = useState(0);
  const slotIdxRef = useRef(0);
  
  const sessionActiveRef = useRef(true);
  const answersRef = useRef<Answer[]>([]);

  // Синхронизация refs
  useEffect(() => {
    scoreRef.current = scoreState;
  }, [scoreState]);

  useEffect(() => {
    livesRef.current = livesLeft;
  }, [livesLeft]);

  const recordAnswer = useCallback((lexemeId: string, isCorrect: boolean) => {
  const existingIndex = answersRef.current.findIndex(a => a.lexemeId === lexemeId);
  
  if (existingIndex >= 0) {
    answersRef.current[existingIndex].attempts += 1;
    if (!isCorrect) {
      answersRef.current[existingIndex].isCorrect = false;
    }
  } else {
    answersRef.current.push({
      lexemeId,
      isCorrect,
      attempts: 1,
      usedHint: false,
      timeToAnswerMs: 0,
    });
  }

  // ДОБАВЬ ЛОГ ЖИЗНЕЙ
  if (!isCorrect) {
    const newLives = livesRef.current - 1;
    console.log(`💔 Потеряна жизнь: ${livesRef.current} → ${newLives}`);
    setLivesLeft(newLives);
    livesRef.current = newLives;
  }

  setScoreState(st => {
    const newState = applyAnswer(st, isCorrect, lexemeId);
    scoreRef.current = newState;
    return newState;
  });
}, []);


  const nextSlot = useCallback(() => {
    setSlotIdx(prev => {
      const next = prev + 1;
      slotIdxRef.current = next;
      return next;
    });
  }, []);

  return {
    scoreState,
    scoreRef,
    livesLeft,
    livesRef,
    slotIdx,
    slotIdxRef,
    sessionActiveRef,
    answersRef,
    recordAnswer,
    nextSlot,
  };
}
