import type { Pack } from '@/lib/types';
import { Text, View } from 'react-native';

interface PackHeaderProps {
  pack: Pack;
  masteredCount: number;
  totalWords: number;
  completedLevels: number;
  totalLevels: number;
}

export function PackHeader({
  pack,
  masteredCount,
  totalWords,
  completedLevels,
  totalLevels,
}: PackHeaderProps) {
  const wordsProgress = totalWords > 0 ? (masteredCount / totalWords) * 100 : 0;
  const levelsProgress = totalLevels > 0 ? (completedLevels / totalLevels) * 100 : 0;
  const isPackCompleted = levelsProgress === 100;

  return (
    <View style={{ gap: 16 }}>
      {/* Заголовок */}
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#000' }} numberOfLines={2}>
          {pack.title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
          <Text style={{ fontSize: 14, color: '#666' }}>CEFR: {pack.cefr}</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>•</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>{pack.lexemes.length} слов</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>•</Text>
          <Text style={{ fontSize: 14, color: '#666' }}>{pack.levels.length} уровней</Text>
        </View>
      </View>

      {/* Прогресс слов */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }}>Изучено слов</Text>
          <Text style={{ fontSize: 14, color: '#000' }}>
            {masteredCount}/{totalWords}
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              width: `${wordsProgress}%`,
              backgroundColor: '#4caf50',
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Прогресс уровней */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#000' }} numberOfLines={1}>Пройдено уровней (3★)</Text>
          <Text style={{ fontSize: 14, color: '#000' }}>
            {completedLevels}/{totalLevels}
          </Text>
        </View>
        <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
          <View
            style={{
              height: '100%',
              width: `${levelsProgress}%`,
              backgroundColor: isPackCompleted ? '#FFD700' : '#2196f3',
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Значок завершения пака */}
      {isPackCompleted && (
        <View
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#fffbea',
            borderWidth: 2,
            borderColor: '#FFD700',
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 32 }}>🏆</Text>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#000', marginTop: 8 }}>
            Пак завершён!
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 4, textAlign: 'center' }}>
            Все уровни пройдены на 3 звезды
          </Text>
        </View>
      )}
    </View>
  );
}
