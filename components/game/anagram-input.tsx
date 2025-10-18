/**
 * Компонент для ввода анаграммы
 */

import { Pressable, Text, View } from 'react-native';

interface AnagramInputProps {
  letters: string[];
  userAnswer: string;
  usedIndices: Set<number>;
  onLetterPress: (letter: string, index: number) => void;
  onDelete: () => void;
  onClear: () => void;
  onSubmit: () => void;
}

export function AnagramInput({
  letters,
  userAnswer,
  usedIndices,
  onLetterPress,
  onDelete,
  onClear,
  onSubmit,
}: AnagramInputProps) {
  return (
    <View style={{ flex: 1, gap: 16 }}>
      {/* Поле ввода */}
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: '#2196f3',
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: '700',
            color: '#000',
            textAlign: 'center',
            letterSpacing: 2,
          }}
        >
          {userAnswer || '___'}
        </Text>
      </View>

      {/* Буквы для выбора */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 8,
          justifyContent: 'center',
        }}
      >
        {letters.map((letter, i) => {
          const isUsed = usedIndices.has(i);
          
          return (
            <Pressable
              key={i}
              onPress={() => !isUsed && onLetterPress(letter, i)}
              disabled={isUsed}
              style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                backgroundColor: isUsed ? '#e0e0e0' : '#fff',
                borderWidth: 2,
                borderColor: isUsed ? '#9e9e9e' : '#333',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isUsed ? 0.4 : 1,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: isUsed ? '#9e9e9e' : '#000',
                }}
              >
                {letter.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Кнопки управления */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={onDelete}
          disabled={userAnswer.length === 0}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            backgroundColor: userAnswer.length > 0 ? '#ff9800' : '#ccc',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            ← Удалить
          </Text>
        </Pressable>

        <Pressable
          onPress={onClear}
          disabled={userAnswer.length === 0}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            backgroundColor: userAnswer.length > 0 ? '#f44336' : '#ccc',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            ✕ Очистить
          </Text>
        </Pressable>

        <Pressable
          onPress={onSubmit}
          disabled={userAnswer.length === 0}
          style={{
            flex: 2,
            padding: 16,
            borderRadius: 12,
            backgroundColor: userAnswer.length > 0 ? '#4caf50' : '#ccc',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            ✓ Проверить
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
