import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SessionSlot } from '@/lib/types';

interface ContextQuestionProps {
  slot: SessionSlot;
  onAnswer: (isCorrect: boolean) => void;
}

export function ContextQuestion({ slot, onAnswer }: ContextQuestionProps) {
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const wordOptions = slot.options.map(opt => opt.id);

  const handleSubmit = () => {
    if (isAnswered || !selectedWord) return;

    const correct = slot.options.find(opt => opt.isCorrect)?.id === selectedWord;
    setIsCorrect(correct);
    setIsAnswered(true);

    setTimeout(() => {
      onAnswer(correct);
      setSelectedWord('');
      setIsAnswered(false);
    }, 800);
  };

  return (
    <View style={{ flex: 1, gap: 16, justifyContent: 'space-between' }}>
      {/* Question Card */}
      <View style={{
        padding: 20,
        borderRadius: 16,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        gap: 12,
      }}>
        <View style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          backgroundColor: '#f5f5f5',
        }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#666', textAlign: 'center' }}>
            💡 Выберите правильную форму
          </Text>
        </View>

        <Text style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#000',
          textAlign: 'center',
        }}>
          {slot.prompt}
        </Text>
      </View>

      {/* Word Selector */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {wordOptions.map((word, i) => (
          <Pressable
            key={i}
            onPress={() => !isAnswered && setSelectedWord(word)}
            disabled={isAnswered}
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
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: selectedWord === word ? '#fff' : '#000',
            }}>
              {word}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={selectedWord.length === 0 || isAnswered}
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: selectedWord.length > 0 && !isAnswered ? '#4caf50' : '#ccc',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
          ✓ Проверить
        </Text>
      </Pressable>

      {/* Feedback */}
      {isAnswered && (
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
          color: isCorrect ? '#4caf50' : '#f44336',
        }}>
          {isCorrect ? '✓ Правильно!' : `✗ Ответ: ${slot.options.find(opt => opt.isCorrect)?.id}`}
        </Text>
      )}
    </View>
  );
}
