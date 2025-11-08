/**
 * Статистика прогресса в словаре
 */

import { Text, View } from 'react-native';

interface DictionaryStatsProps {
  masteredCount: number;
  learningCount: number;
  notStartedCount: number;
}

export function DictionaryStats({
  masteredCount,
  learningCount,
  notStartedCount,
}: DictionaryStatsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#f5f5f5',
      }}
    >
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#4caf50' }}>
          {masteredCount}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>Мастер</Text>
      </View>
      
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ff9800' }}>
          {learningCount}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>Изучаю</Text>
      </View>
      
      <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#9e9e9e' }}>
          {notStartedCount}
        </Text>
        <Text style={{ fontSize: 12, color: '#666' }}>Не начато</Text>
      </View>
    </View>
  );
}
