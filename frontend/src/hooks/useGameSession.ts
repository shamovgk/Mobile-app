import { useReducer, useEffect, useState } from 'react';
import { gameReducer, initialGameState, GameState } from '@/lib/reducers/gameReducer';
import { LevelData } from '@/lib/types';

export const useGameSession = (levelData: LevelData | null) => {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialGameState,
    lives: levelData?.lives || 3,
  });

  const [startTime] = useState(Date.now());
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const handleAnswer = (lexemeId: string, isCorrect: boolean) => {
    if (answeredQuestions.has(lexemeId)) return;

    dispatch({ type: 'ANSWER', payload: { lexemeId, isCorrect } });
    setAnsweredQuestions((prev) => new Set(prev).add(lexemeId));

    if (!isCorrect && levelData?.lives) {
      dispatch({ type: 'LOSE_LIFE' });
    }
  };

  const nextQuestion = () => {
    dispatch({ type: 'NEXT_QUESTION' });
  };

  const completeGame = () => {
    dispatch({ type: 'COMPLETE_GAME' });
  };

  const failGame = () => {
    dispatch({ type: 'FAIL_GAME' });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET' });
    setAnsweredQuestions(new Set());
  };

  const getGameDuration = () => {
    return Math.floor((Date.now() - startTime) / 1000);
  };

  const isGameOver = () => {
    return state.gameStatus === 'completed' || state.gameStatus === 'failed';
  };

  return {
    state,
    handleAnswer,
    nextQuestion,
    completeGame,
    failGame,
    resetGame,
    getGameDuration,
    isGameOver,
  };
};
