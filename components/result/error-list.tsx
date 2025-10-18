/**
 * Список ошибок с примерами
 */

import type { Pack } from '@/lib/types';
import { Text, View } from 'react-native';

interface ErrorItem {
  lexemeId: string;
  base: string;
  translation: string;
  example: string;
  attempts: number;
}

interface ErrorListProps {
  errors: ErrorItem[];
  pack: Pack;
}

export function ErrorList({ errors }: ErrorListProps) {
  if (errors.length === 0) {
    return (
      <View
        style={{
          padding: 32,
          borderRadius: 12,
          backgroundColor: '#f0f8ff',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 56 }}>🎯</Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>Безупречно!</Text>
        <Text style={{ fontSize: 14, color: '#666' }}>Ни одной ошибки</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {errors.map((item) => (
        <View
          key={item.lexemeId}
          style={{
            padding: 16,
            borderRadius: 12,
            borderWidth: 2,
            borderLeftWidth: 6,
            borderLeftColor: '#f44336',
            borderColor: '#ffcdd2',
            backgroundColor: '#fff',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#000' }}>
            {String(item.base)}
          </Text>

          <Text style={{ fontSize: 16, color: '#000' }}>{item.translation}</Text>

          {!!item.example && (
            <View
              style={{
                padding: 8,
                borderRadius: 8,
                backgroundColor: '#f5f5f5',
                borderLeftWidth: 3,
                borderLeftColor: '#2196f3',
              }}
            >
              <Text style={{ fontSize: 13, fontStyle: 'italic', color: '#666' }}>
                {item.example}
              </Text>
            </View>
          )}

          {item.attempts > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontSize: 12, color: '#f44336', fontWeight: '600' }}>
                ❌ Попыток: {item.attempts}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
