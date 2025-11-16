export interface GameState {
  currentQuestionIndex: number;
  score: number;
  lives: number;
  correctAnswers: number;
  wrongAnswers: number;
  combo: number;
  gameStatus: 'playing' | 'paused' | 'completed' | 'failed';
}

export type GameAction =
  | { type: 'NEXT_QUESTION' }
  | { type: 'ANSWER'; payload: { lexemeId: string; isCorrect: boolean } }
  | { type: 'LOSE_LIFE' }
  | { type: 'COMPLETE_GAME' }
  | { type: 'FAIL_GAME' }
  | { type: 'RESET' };

export const initialGameState: GameState = {
  currentQuestionIndex: 0,
  score: 0,
  lives: 3,
  correctAnswers: 0,
  wrongAnswers: 0,
  combo: 0,
  gameStatus: 'playing',
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEXT_QUESTION':
      return { ...state, currentQuestionIndex: state.currentQuestionIndex + 1 };

    case 'ANSWER':
      return {
        ...state,
        score: action.payload.isCorrect ? state.score + 10 + (state.combo * 2) : state.score,
        correctAnswers: action.payload.isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
        wrongAnswers: !action.payload.isCorrect ? state.wrongAnswers + 1 : state.wrongAnswers,
        combo: action.payload.isCorrect ? state.combo + 1 : 0,
      };

    case 'LOSE_LIFE':
      const newLives = state.lives - 1;
      return {
        ...state,
        lives: newLives,
        gameStatus: newLives === 0 ? 'failed' : state.gameStatus,
      };

    case 'COMPLETE_GAME':
      return { ...state, gameStatus: 'completed' };

    case 'FAIL_GAME':
      return { ...state, gameStatus: 'failed' };

    case 'RESET':
      return initialGameState;

    default:
      return state;
  }
}
