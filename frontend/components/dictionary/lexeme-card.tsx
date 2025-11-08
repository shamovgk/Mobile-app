/**
 * Карточка слова в словаре
 */

import { Text, View } from 'react-native';
import { MasteryIndicator } from './mastery-indicator';

interface LexemeCardProps {
  base: string;
  translation: string;
  mastery: number;
  recentMistakes: string[];
}

export function LexemeCard({ base, translation, mastery, recentMistakes }: LexemeCardProps) {
  return (
    <View
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: mastery >= 4 ? '#4caf50' : '#ddd',
        gap: 10,
      }}
    >
      {/* Слово и индикатор мастерства */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#000' }}>
            {base}
          </Text>
          <Text style={{ fontSize: 16, color: '#000', marginTop: 4 }}>
            {translation}
          </Text>
        </View>
        <MasteryIndicator mastery={mastery} />
      </View>

      {/* Недавние ошибки */}
      {recentMistakes.length > 0 && (
        <View
          style={{
            padding: 8,
            borderRadius: 8,
            backgroundColor: '#ffebee',
            borderLeftWidth: 3,
            borderLeftColor: '#f44336',
          }}
        >
          <Text style={{ fontSize: 12, color: '#c62828' }}>
            ❌ Недавних ошибок: {recentMistakes.length}
          </Text>
        </View>
      )}

      {/* Бейдж "Мастер" */}
      {mastery >= 5 && (
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            backgroundColor: '#e3f2fd',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '600', color: '#1565c0' }}>
            ⭐ МАСТЕР
          </Text>
        </View>
      )}
    </View>
  );
}
