// frontend/src/screens/game/GameScreen.tsx
import React, { useReducer, useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '@/theme';
import { GameHUD } from '@/components/game/GameHUD/GameHUD';
import { MeaningQuestion } from '@/components/game/QuestionCard/MeaningQuestion';
import { FormQuestion } from '@/components/game/QuestionCard/FormQuestion';
import { ContextQuestion } from '@/components/game/QuestionCard/ContextQuestion';
import { AnagramQuestion } from '@/components/game/QuestionCard/AnagramQuestion';
import { useLevel } from '@/hooks/useContentFetch';
import { gameReducer, initialGameState } from '@/lib/reducers/gameReducer';
import { useTimer } from '@/hooks/useTimer';
import type { RootStackParamList } from '@/navigation/types';

type GameScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Game'>;
type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

export const GameScreen: React.FC = () => {
  const navigation = useNavigation<GameScreenNavigationProp>();
  const route = useRoute<GameScreenRouteProp>();
  const { levelId } = route.params;
  const { data: levelData, isLoading } = useLevel(levelId);
  
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialGameState,
    lives: levelData?.lives || 3,
  });

  const [startTime] = useState(Date.now());
  const { timeLeft, startTimer, pauseTimer } = useTimer(levelData?.timeLimit || 0);

  const calculateStars = (isWin: boolean): number => {
    if (!isWin) return 0;
    
    const totalQuestions = levelData?.questions?.length || 1;
    const accuracy = state.correctAnswers / totalQuestions;
    
    if (accuracy >= 0.9) return 3;
    if (accuracy >= 0.7) return 2;
    return 1;
  };

  const handleGameEnd = (isWin: boolean) => {
    pauseTimer();
    const duration = Math.floor((Date.now() - startTime) / 1000);
    const stars = calculateStars(isWin);

    navigation.reset({
      index: 1,
      routes: [
        { name: 'Main' },
        {
          name: 'Result',
          params: {
            levelId,
            score: state.score,
            stars,
            correctAnswers: state.correctAnswers,
            wrongAnswers: state.wrongAnswers,
            duration,
            isWin,
          },
        },
      ],
    });
  };

  useEffect(() => {
    if (levelData?.timeLimit) {
      startTimer();
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      pauseTimer();
      // Show pause modal
      return true;
    });

    return () => {
      backHandler.remove();
      pauseTimer();
    };
  }, [levelData]);

  useEffect(() => {
    if (timeLeft === 0 && levelData?.timeLimit) {
      handleGameEnd(false);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (state.lives === 0) {
      handleGameEnd(false);
    }
  }, [state.lives]);

  useEffect(() => {
    if (state.currentQuestionIndex >= (levelData?.questions?.length || 0)) {
      handleGameEnd(true);
    }
  }, [state.currentQuestionIndex]);

  const handleAnswer = (isCorrect: boolean, lexemeId: string) => {
    dispatch({ type: 'ANSWER', payload: { lexemeId, isCorrect } });

    if (!isCorrect && levelData?.lives) {
      dispatch({ type: 'LOSE_LIFE' });
    }

    setTimeout(() => {
      dispatch({ type: 'NEXT_QUESTION' });
    }, 1500);
  };

  const renderQuestion = () => {
    if (!levelData?.questions) return null;

    const question = levelData.questions[state.currentQuestionIndex];
    if (!question) return null;

    const commonProps = {
      onAnswer: (isCorrect: boolean) => handleAnswer(isCorrect, question.lexemeId),
      disabled: state.gameStatus !== 'playing',
    };

    switch (question.type) {
      case 'meaning':
        return (
          <MeaningQuestion
            prompt={question.prompt}
            options={question.options || []}
            correctAnswer={question.correctAnswer}
            {...commonProps}
          />
        );
      
      case 'form':
        return (
          <FormQuestion
            prompt={question.prompt}
            options={question.options || []}
            correctAnswer={question.correctAnswer}
            {...commonProps}
          />
        );
      
      case 'context':
        return (
          <ContextQuestion
            prompt={question.prompt}
            context={question.context || ''}
            correctAnswer={question.correctAnswer}
            {...commonProps}
          />
        );
      
      case 'anagram':
        return (
          <AnagramQuestion
            prompt={question.prompt}
            correctAnswer={question.correctAnswer}
            {...commonProps}
          />
        );
      
      default:
        return null;
    }
  };

  if (isLoading || !levelData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <GameHUD
        score={state.score}
        lives={state.lives}
        maxLives={levelData.lives || 3}
        timeLeft={timeLeft}
        totalTime={levelData.timeLimit || undefined}
        combo={state.combo}
        questionNumber={state.currentQuestionIndex + 1}
        totalQuestions={levelData.questions.length}
      />

      <View style={styles.questionContainer}>
        {renderQuestion()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionContainer: {
    flex: 1,
  },
});
