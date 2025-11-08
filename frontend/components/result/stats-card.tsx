/**
 * Карточка со статистикой игры (с утилитами)
 */

import { formatDuration, formatPercent } from '@/utils';
import { Text, View } from 'react-native';

interface StatsCardProps {
  score: number;
  accuracy: number;
  duration: number;
  timeBonus?: number;
  gameMode: 'lives' | 'time';
}

export function StatsCard({ score, accuracy, duration, timeBonus, gameMode }: StatsCardProps) {
  return (
    <View
      style={{
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        gap: 8,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>📊 Статистика</Text>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, color: '#000' }}>Очки</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>{score}</Text>
      </View>
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 14, color: '#000' }}>Точность</Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>{formatPercent(accuracy)}</Text>
      </View>
      
      {gameMode === 'time' && duration > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: '#000' }}>⏱️ Длительность</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>{formatDuration(duration)}</Text>
        </View>
      )}
      
      {gameMode === 'time' && timeBonus && timeBonus > 0 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, color: '#000' }}>⚡ Бонус за время</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#4caf50' }}>+{timeBonus}</Text>
        </View>
      )}

      {gameMode === 'lives' && (
        <View
          style={{
            marginTop: 8,
            padding: 8,
            backgroundColor: '#FFF3E0',
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: '#E65100', textAlign: 'center' }}>
            💡 В режиме "На жизни" нет ограничения по времени
          </Text>
        </View>
      )}
    </View>
  );
}
