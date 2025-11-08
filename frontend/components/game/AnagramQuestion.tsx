import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SessionSlot } from '@/lib/types';

interface AnagramQuestionProps {
  slot: SessionSlot;
  onAnswer: (isCorrect: boolean) => void;
}

export function AnagramQuestion({ slot, onAnswer }: AnagramQuestionProps) {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const letters = slot.letters || [];
  const correctAnswer = slot.options.find(opt => opt.isCorrect)?.id.toLowerCase() || '';

  const handleLetterPress = (letter: string, index: number) => {
    setUserAnswer(prev => prev + letter);
    setUsedIndices(prev => new Set([...prev, index]));
  };

  const handleDelete = () => {
    if (userAnswer.length === 0) return;
    
    const lastLetter = userAnswer[userAnswer.length - 1];
    const newAnswer = userAnswer.slice(0, -1);
    setUserAnswer(newAnswer);

    for (let i = letters.length - 1; i >= 0; i--) {
      if (letters[i].toLowerCase() === lastLetter.toLowerCase() && usedIndices.has(i)) {
        const newUsed = new Set(usedIndices);
        newUsed.delete(i);
        setUsedIndices(newUsed);
        break;
      }
    }
  };

  const handleClear = () => {
    setUserAnswer('');
    setUsedIndices(new Set());
  };

  const handleSubmit = () => {
    if (isAnswered || !userAnswer) return;

    const correct = userAnswer.toLowerCase() === correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    setTimeout(() => {
      onAnswer(correct);
      setUserAnswer('');
      setUsedIndices(new Set());
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
            🔀 Соберите слово из букв
          </Text>
        </View>

        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: '#000',
          textAlign: 'center',
        }}>
          {slot.prompt}
        </Text>
      </View>

      {/* Input Field */}
      <View style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#2196f3',
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '700',
          color: '#000',
          textAlign: 'center',
          letterSpacing: 2,
        }}>
          {userAnswer || '___'}
        </Text>
      </View>

      {/* Letters to Select */}
      <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
      }}>
        {letters.map((letter, i) => {
          const isUsed = usedIndices.has(i);
          
          return (
            <Pressable
              key={i}
              onPress={() => !isUsed && !isAnswered && handleLetterPress(letter, i)}
              disabled={isUsed || isAnswered}
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
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: isUsed ? '#9e9e9e' : '#000',
              }}>
                {letter.toUpperCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Control Buttons */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Pressable
          onPress={handleDelete}
          disabled={userAnswer.length === 0 || isAnswered}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            backgroundColor: userAnswer.length > 0 && !isAnswered ? '#ff9800' : '#ccc',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            ← Удалить
          </Text>
        </Pressable>

        <Pressable
          onPress={handleClear}
          disabled={userAnswer.length === 0 || isAnswered}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 12,
            backgroundColor: userAnswer.length > 0 && !isAnswered ? '#f44336' : '#ccc',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            ✕ Очистить
          </Text>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={userAnswer.length === 0 || isAnswered}
          style={{
            flex: 2,
            padding: 16,
            borderRadius: 12,
            backgroundColor: userAnswer.length > 0 && !isAnswered ? '#4caf50' : '#ccc',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
            ✓ Проверить
          </Text>
        </Pressable>
      </View>

      {/* Feedback */}
      {isAnswered && (
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
          color: isCorrect ? '#4caf50' : '#f44336',
        }}>
          {isCorrect ? '✓ Правильно!' : `✗ Ответ: ${correctAnswer}`}
        </Text>
      )}
    </View>
  );
}
