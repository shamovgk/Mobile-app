import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { LetterTile } from '../LetterTile/LetterTile';

interface AnagramQuestionProps {
  prompt: string;
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const AnagramQuestion: React.FC<AnagramQuestionProps> = ({
  prompt,
  correctAnswer,
  onAnswer,
  disabled = false,
}) => {
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);

  useEffect(() => {
    const letters = correctAnswer.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    setShuffledLetters(shuffled);
    setAvailableLetters(shuffled);
  }, [correctAnswer]);

  useEffect(() => {
    if (selectedLetters.length === correctAnswer.length) {
      const userAnswer = selectedLetters.join('');
      const isCorrect = userAnswer === correctAnswer;
      
      setTimeout(() => {
        onAnswer(isCorrect);
      }, 500);
    }
  }, [selectedLetters, correctAnswer, onAnswer]);

  const handleSelectLetter = (index: number) => {
    if (disabled) return;
    
    const letter = availableLetters[index];
    setSelectedLetters([...selectedLetters, letter]);
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
  };

  const handleRemoveLetter = (index: number) => {
    if (disabled) return;
    
    const letter = selectedLetters[index];
    setAvailableLetters([...availableLetters, letter]);
    setSelectedLetters(selectedLetters.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Составьте слово</Text>
        <Text style={styles.prompt}>{prompt}</Text>
      </View>

      <View style={styles.answerContainer}>
        <View style={styles.answerRow}>
          {Array.from({ length: correctAnswer.length }).map((_, index) => (
            <LetterTile
              key={index}
              letter={selectedLetters[index] || ''}
              onPress={() => selectedLetters[index] && handleRemoveLetter(index)}
              isEmpty={!selectedLetters[index]}
              variant="selected"
            />
          ))}
        </View>
      </View>

      <View style={styles.lettersContainer}>
        <View style={styles.lettersRow}>
          {availableLetters.map((letter, index) => (
            <LetterTile
              key={index}
              letter={letter}
              onPress={() => handleSelectLetter(index)}
              variant="available"
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  promptContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  promptLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  prompt: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  answerContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  lettersContainer: {
    alignItems: 'center',
  },
  lettersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
