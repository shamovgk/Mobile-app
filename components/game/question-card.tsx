/**
 * Карточка с вопросом
 */

import type { QuestionType } from '@/lib/types';
import { Text, View } from 'react-native';

interface QuestionCardProps {
  type: QuestionType;
  prompt: string;
  hint?: string;
}

const QUESTION_LABELS: Record<QuestionType, string> = {
  meaning: '🔤 Выберите перевод',
  form: '📝 Правильное написание',
  anagram: '🔀 Соберите слово из букв',
  context: '💡 Выберите правильную форму',
};

export function QuestionCard({ type, prompt, hint }: QuestionCardProps) {
  const isContext = type === 'context';
  
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        gap: 12,
      }}
    >
      {/* Заголовок типа вопроса */}
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: '#f5f5f5',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center' }}>
          {QUESTION_LABELS[type]}
        </Text>
      </View>

      {/* Основной текст вопроса */}
      <Text
        style={{
          fontSize: isContext ? 18 : 32,
          fontWeight: '700',
          color: '#000',
          textAlign: 'center',
        }}
      >
        {prompt}
      </Text>

      {/* Подсказка (например, перемешанные буквы для анаграммы) */}
      {hint && (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: '#e3f2fd',
            borderWidth: 2,
            borderColor: '#2196f3',
          }}
        >
          <Text
            style={{
              fontSize: 28,
              color: '#1565c0',
              textAlign: 'center',
              letterSpacing: 4,
              fontWeight: '700',
            }}
          >
            {hint}
          </Text>
        </View>
      )}
    </View>
  );
}
