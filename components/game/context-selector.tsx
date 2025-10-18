/**
 * Компонент выбора правильной формы слова в контексте
 */

import { Pressable, Text, View } from 'react-native';

interface ContextSelectorProps {
  words: string[];
  selectedWord: string;
  onWordSelect: (word: string) => void;
  onSubmit: () => void;
}

export function ContextSelector({
  words,
  selectedWord,
  onWordSelect,
  onSubmit,
}: ContextSelectorProps) {
  return (
    <View style={{ flex: 1, gap: 16 }}>
      {/* Выбранное слово */}
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
            fontSize: 24,
            fontWeight: '700',
            color: '#000',
            textAlign: 'center',
          }}
        >
          {selectedWord || '?'}
        </Text>
      </View>

      {/* Варианты слов */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {words.map((word, i) => (
          <Pressable
            key={i}
            onPress={() => onWordSelect(word)}
            style={{
              flex: 1,
              padding: 20,
              borderRadius: 12,
              backgroundColor: selectedWord === word ? '#2196f3' : '#fff',
              borderWidth: 2,
              borderColor: '#333',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '600',
                color: selectedWord === word ? '#fff' : '#000',
              }}
            >
              {word}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Кнопка проверки */}
      <Pressable
        onPress={onSubmit}
        disabled={selectedWord.length === 0}
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: selectedWord.length > 0 ? '#4caf50' : '#ccc',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
          ✓ Проверить
        </Text>
      </Pressable>
    </View>
  );
}
