import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SessionSlot, SessionOption } from '@/lib/types';

interface MeaningQuestionProps {
  slot: SessionSlot;
  onAnswer: (isCorrect: boolean) => void;
}

interface HighlightState {
  index: number;
  correct: boolean;
}

export function MeaningQuestion({ slot, onAnswer }: MeaningQuestionProps) {
  const [highlight, setHighlight] = useState<HighlightState | null>(null);

  const handleAnswerSelect = (index: number) => {
    if (highlight) return;

    const isCorrect = slot.options[index].isCorrect;
    setHighlight({ index, correct: isCorrect });

    setTimeout(() => {
      onAnswer(isCorrect);
      setHighlight(null);
    }, 800);
  };

  return (
    <View style={{ flex: 1, gap: 24, justifyContent: 'space-between' }}>
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
            🔤 Выберите перевод
          </Text>
        </View>

        <Text style={{
          fontSize: 32,
          fontWeight: '700',
          color: '#000',
          textAlign: 'center',
        }}>
          {slot.prompt}
        </Text>

        {slot.context && (
          <View style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            backgroundColor: '#e3f2fd',
            borderWidth: 2,
            borderColor: '#2196f3',
          }}>
            <Text style={{
              fontSize: 14,
              color: '#1565c0',
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              "{slot.context}"
            </Text>
          </View>
        )}
      </View>

      {/* Answer Options */}
      <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
        {slot.options.map((opt, i) => {
          let bgColor = '#FFFFFF';
          if (highlight && highlight.index === i) {
            bgColor = highlight.correct ? '#27ae60' : '#eb5757';
          }

          return (
            <View
              key={`${i}-${opt.id}`}
              style={{
                flex: 1,
                borderWidth: 2,
                borderColor: '#333',
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: bgColor,
              }}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => handleAnswerSelect(i)}
                disabled={!!highlight}
                style={{
                  width: '100%',
                  height: '100%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                }}
              >
                <Text style={{
                  fontSize: 20,
                  fontWeight: '600',
                  textAlign: 'center',
                  color: '#000',
                }}>
                  {opt.id}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
