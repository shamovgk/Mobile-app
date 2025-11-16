import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from '@/components/ui/Button/Button';

interface ContextQuestionProps {
  prompt: string;
  context: string;
  correctAnswer: string;
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export const ContextQuestion: React.FC<ContextQuestionProps> = ({
  prompt,
  context,
  correctAnswer,
  onAnswer,
  disabled = false,
}) => {
  const [userInput, setUserInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSubmit = () => {
    if (!userInput.trim() || isAnswered || disabled) return;

    setIsAnswered(true);
    const isCorrect = userInput.trim().toLowerCase() === correctAnswer.toLowerCase();
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1000);
  };

  const getInputStyle = () => {
    if (!isAnswered) return styles.input;
    
    const isCorrect = userInput.trim().toLowerCase() === correctAnswer.toLowerCase();
    return [styles.input, isCorrect ? styles.inputCorrect : styles.inputWrong];
  };

  return (
    <View style={styles.container}>
      <View style={styles.promptContainer}>
        <Text style={styles.promptLabel}>Заполните пропуск</Text>
        <Text style={styles.context}>{prompt}</Text>
      </View>

      <View style={styles.answerContainer}>
        <TextInput
          style={getInputStyle()}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Введите слово"
          placeholderTextColor={colors.text.secondary}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isAnswered && !disabled}
          onSubmitEditing={handleSubmit}
        />
        
        <Button
          variant="primary"
          onPress={handleSubmit}
          disabled={!userInput.trim() || isAnswered || disabled}
          fullWidth
        >
          Проверить
        </Button>
      </View>

      {isAnswered && userInput.trim().toLowerCase() !== correctAnswer.toLowerCase() && (
        <View style={styles.correctAnswerContainer}>
          <Text style={styles.correctAnswerLabel}>Правильный ответ:</Text>
          <Text style={styles.correctAnswer}>{correctAnswer}</Text>
        </View>
      )}
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
  context: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: typography.fontSize.lg * 1.5,
  },
  answerContainer: {
    gap: spacing.md,
  },
  input: {
    backgroundColor: colors.background.paper,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.background.default,
    fontFamily: typography.fontFamily.semiBold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    textAlign: 'center',
  },
  inputCorrect: {
    backgroundColor: colors.success.light,
    borderColor: colors.success.main,
  },
  inputWrong: {
    backgroundColor: colors.error.light,
    borderColor: colors.error.main,
  },
  correctAnswerContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.info.light,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  correctAnswerLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  correctAnswer: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.primary.main,
  },
});
