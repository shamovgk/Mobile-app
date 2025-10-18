/**
 * Хук для управления таймером игры
 */

import { useEffect, useRef, useState } from 'react';

export function useGameTimer(durationSec: number, isPaused: boolean, onComplete: () => void) {
  const [timeLeft, setTimeLeft] = useState(durationSec);
  
  const startRef = useRef<number>(Date.now());
  const pausedAccumRef = useRef<number>(0);
  const pauseStartRef = useRef<number | null>(null);

  const durationMs = durationSec * 1000;

  // Обработка паузы
  useEffect(() => {
    const now = Date.now();
    if (isPaused) {
      if (pauseStartRef.current === null) pauseStartRef.current = now;
    } else {
      if (pauseStartRef.current !== null) {
        pausedAccumRef.current += now - pauseStartRef.current;
        pauseStartRef.current = null;
      }
    }
  }, [isPaused]);

  // Главный цикл таймера
  useEffect(() => {
    if (isPaused) return;

    let raf = 0;
    const loop = () => {
      const now = Date.now();
      const pausedNow = pausedAccumRef.current + (pauseStartRef.current ? now - pauseStartRef.current : 0);
      const elapsed = now - startRef.current - pausedNow;
      const leftSec = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setTimeLeft(leftSec);

      if (elapsed >= durationMs) {
        onComplete();
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPaused, durationMs, onComplete]);

  const getRemainingSeconds = () => {
    const now = Date.now();
    const pausedNow = pausedAccumRef.current + (pauseStartRef.current ? now - pauseStartRef.current : 0);
    const elapsed = now - startRef.current - pausedNow;
    return Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
  };

  return { timeLeft, getRemainingSeconds };
}
