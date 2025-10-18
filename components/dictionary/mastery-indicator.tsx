/**
 * Индикатор мастерства слова (с константами)
 */

import { MASTERY_COLORS, MASTERY_LABELS, MASTERY_MAX } from '@/utils';
import { Text, View } from 'react-native';

interface MasteryIndicatorProps {
  mastery: number;
}

function getMasteryLabel(mastery: number): string {
  if (mastery === 0) return MASTERY_LABELS[0];
  if (mastery < 1.5) return MASTERY_LABELS[1];
  if (mastery < 2.5) return MASTERY_LABELS[2];
  if (mastery < 3.5) return MASTERY_LABELS[3];
  if (mastery < 4.5) return MASTERY_LABELS[4];
  return MASTERY_LABELS[5];
}

function getMasteryColor(mastery: number): string {
  if (mastery === 0) return MASTERY_COLORS.NONE;
  if (mastery < 1.5) return MASTERY_COLORS.BEGINNER;
  if (mastery < 2.5) return MASTERY_COLORS.LEARNING;
  if (mastery < 3.5) return MASTERY_COLORS.KNOWS;
  if (mastery < 4.5) return MASTERY_COLORS.CONFIDENT;
  return MASTERY_COLORS.MASTER;
}

export function MasteryIndicator({ mastery }: MasteryIndicatorProps) {
  const percentage = (mastery / MASTERY_MAX) * 100;
  
  return (
    <View style={{ gap: 4, minWidth: 100 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1, height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
          <View
            style={{
              width: `${percentage}%`,
              height: '100%',
              backgroundColor: getMasteryColor(mastery),
              borderRadius: 4,
            }}
          />
        </View>
        <Text style={{ fontSize: 12, fontWeight: '600', color: getMasteryColor(mastery), minWidth: 30 }}>
          {mastery.toFixed(1)}
        </Text>
      </View>
      <Text style={{ fontSize: 10, color: '#666' }}>
        {getMasteryLabel(mastery)}
      </Text>
    </View>
  );
}
