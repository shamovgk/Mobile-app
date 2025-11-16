import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScoreDisplay } from './ScoreDisplay';
import { LivesDisplay } from './LivesDisplay';
import { TimerDisplay } from './TimerDisplay';
import { ComboDisplay } from './ComboDisplay';
import { colors, spacing } from '@/theme';

interface GameHUDProps {
  score: number;
  lives: number;
  maxLives: number;
  timeLeft?: number;
  totalTime?: number;
  combo: number;
  questionNumber: number;
  totalQuestions: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  lives,
  maxLives,
  timeLeft,
  totalTime,
  combo,
  questionNumber,
  totalQuestions,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <LivesDisplay current={lives} max={maxLives} />
        <ScoreDisplay score={score} />
        {timeLeft !== undefined && totalTime && (
          <TimerDisplay timeLeft={timeLeft} totalTime={totalTime} />
        )}
      </View>
      
      {combo > 1 && (
        <View style={styles.comboRow}>
          <ComboDisplay combo={combo} />
        </View>
      )}
      
      <View style={styles.progressRow}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(questionNumber / totalQuestions) * 100}%` }
            ]} 
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background.dark,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  comboRow: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressRow: {
    marginTop: spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.primary.light,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent.main,
  },
});
