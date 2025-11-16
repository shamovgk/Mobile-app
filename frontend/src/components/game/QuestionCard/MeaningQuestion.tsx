import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';

interface MeaningQuestionProps {
  prompt: string;
  options: string[];
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const MeaningQuestion: React.FC<MeaningQuestionProps> = ({
  prompt,
  options,
  correctAnswer,
  onAnswer,
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (option: string) => {
    if (isAnswered || disabled) return;

    setSelectedOption(option);
    setIsAnswered(true);
    
    const isCorrect = option === correctAnswer;
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1000);
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) return styles.option;
    
    if (option === correctAnswer) {
      return [styles.option, styles.optionCorrect];
    }
    
    if (option === selectedOption && option !== correctAnswer) {
      return [styles.option, styles.optionWrong];
    }
    
    return [styles.option, styles.optionDisabled];
  };

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Что означает это слово?</Text>
        <Text style={styles.prompt}>{prompt}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(option)}
            onPress={() => handleSelect(option)}
            disabled={isAnswered || disabled}
            activeOpacity={0.8}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
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
    fontSize: typography.fontSize.xxxl,
    color: colors.text.primary,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: spacing.md,
  },
  option: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.background.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCorrect: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  optionWrong: {
    backgroundColor: colors.error.light,
    borderColor: colors.error.main,
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionText: {
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
});
