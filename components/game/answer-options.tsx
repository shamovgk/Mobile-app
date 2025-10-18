/**
 * Варианты ответа для типов meaning и form
 */

import type { HighlightState, SessionOption } from '@/lib/types';
import { Pressable, Text, View } from 'react-native';

interface AnswerOptionsProps {
  options: SessionOption[];
  highlight: HighlightState | null;
  onAnswer: (index: number) => void;
}

export function AnswerOptions({ options, highlight, onAnswer }: AnswerOptionsProps) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', gap: 12 }}>
      {options.map((opt, i) => {
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
              onPress={() => onAnswer(i)}
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '600',
                  textAlign: 'center',
                  color: '#000',
                }}
              >
                {opt.id}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
