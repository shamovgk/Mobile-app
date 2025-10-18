import type { LevelProgress, PackLevel } from '@/lib/types';
import { getDifficultyEmoji, getQuestionTypeEmoji } from '@/utils';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

interface LevelCardProps {
  level: PackLevel;
  progress: LevelProgress;
  isUnlocked: boolean;
  packId: string;
}

export function LevelCard({ level, progress, isUnlocked, packId }: LevelCardProps) {
  const levelStr = encodeURIComponent(JSON.stringify(level.config));
  const isCompleted = progress.stars === 3;
  const isLivesMode = level.gameMode === 'lives';

  // Определяем цвета на основе режима
  const modeColor = isLivesMode ? '#FF5252' : '#2196F3';
  const modeColorLight = isLivesMode ? '#FFEBEE' : '#E3F2FD';
  const modeName = isLivesMode ? 'На жизни' : 'На время';

  // Определяем уровень сложности
  const getDifficultyInfo = () => {
    if (level.distractorMode === 'easy') return { text: 'Легко', color: '#4CAF50' };
    if (level.distractorMode === 'hard') return { text: 'Сложно', color: '#FF5252' };
    return { text: 'Средне', color: '#FF9800' };
  };
  const difficulty = getDifficultyInfo();

  const content = (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 2,
        borderColor: isCompleted ? '#FFD700' : isUnlocked ? modeColor : '#999',
        backgroundColor: isCompleted ? '#FFFBEA' : isUnlocked ? '#FFFFFF' : '#F5F5F5',
        opacity: isUnlocked ? 1 : 0.7,
        overflow: 'hidden',
      }}
    >
      {/* Цветная полоска сверху */}
      <View
        style={{
          height: 6,
          backgroundColor: isCompleted ? '#FFD700' : modeColor,
        }}
      />

      <View style={{ padding: 16, gap: 14 }}>
        {/* Заголовок с режимом */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Режим игры */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: modeColorLight,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontSize: 14 }}>{isLivesMode ? '❤️' : '⏱️'}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: modeColor }}>
                {modeName}
              </Text>
            </View>

            {/* Звёзды */}
            {isUnlocked && progress.attempts > 0 && (
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {Array.from({ length: 3 }, (_, i) => (
                  <Text key={i} style={{ fontSize: 22, color: i < progress.stars ? '#FFD700' : '#E0E0E0' }}>
                    ★
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Название уровня */}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isUnlocked ? '#000' : '#999',
              lineHeight: 24,
            }}
            numberOfLines={2}
          >
            {level.title}
          </Text>

          {/* Описание */}
          <Text
            style={{
              fontSize: 13,
              color: isUnlocked ? '#666' : '#999',
              lineHeight: 18,
            }}
            numberOfLines={2}
          >
            {level.description}
          </Text>
        </View>

        {/* Сложность */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: `${difficulty.color}15`,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 14 }}>{getDifficultyEmoji(level.distractorMode)}</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: difficulty.color }}>
            Сложность: {difficulty.text}
          </Text>
        </View>

        {/* Параметры уровня */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            flexWrap: 'wrap',
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
          }}
        >
          {/* Время/Жизни */}
          {isLivesMode ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#FFF3E0',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>❤️</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#E65100' }}>
                {level.config.lives} жизней
              </Text>
            </View>
          ) : (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: '#E3F2FD',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 16 }}>⏱️</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#1565C0' }}>
                {level.config.durationSec} секунд
              </Text>
            </View>
          )}

          {/* Варианты ответов */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#F3E5F5',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>🎯</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#6A1B9A' }}>
              {level.config.lanes} варианта
            </Text>
          </View>

          {/* Типы вопросов */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: '#E8F5E9',
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              flex: 1,
              minWidth: 120,
            }}
          >
            <Text style={{ fontSize: 16 }}>{getQuestionTypeEmoji(level.config.allowedTypes)}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#2E7D32' }} numberOfLines={1}>
              {level.config.allowedTypes.map(t => {
                if (t === 'meaning') return 'Перевод';
                if (t === 'form') return 'Формы';
                if (t === 'anagram') return 'Анаграммы';
                if (t === 'context') return 'Контекст';
                return t;
              }).join(', ')}
            </Text>
          </View>
        </View>

        {/* Статистика попыток */}
        {isUnlocked && progress.attempts > 0 && (
          <View
            style={{
              backgroundColor: '#F5F5F5',
              padding: 10,
              borderRadius: 8,
              gap: 4,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
              📊 Ваша статистика
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <Text style={{ fontSize: 12, color: '#333' }}>
                Попыток: <Text style={{ fontWeight: '600' }}>{progress.attempts}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: '#333' }}>
                Рекорд: <Text style={{ fontWeight: '600' }}>{progress.bestScore}</Text>
              </Text>
              <Text style={{ fontSize: 12, color: '#333' }}>
                Точность: <Text style={{ fontWeight: '600' }}>{Math.round(progress.bestAccuracy * 100)}%</Text>
              </Text>
            </View>
          </View>
        )}

        {/* Индикатор блокировки */}
        {!isUnlocked && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: '#FFF3E0',
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 20 }}>🔒</Text>
            <Text style={{ fontSize: 12, color: '#E65100', flex: 1, lineHeight: 16 }} numberOfLines={2}>
              Требуется <Text style={{ fontWeight: '700' }}>{level.unlockRequirement.minStars}★</Text> на предыдущем уровне
            </Text>
          </View>
        )}

        {/* Кнопка "Начать" для разблокированных уровней */}
        {isUnlocked && (
          <View
            style={{
              backgroundColor: modeColor,
              paddingVertical: 12,
              borderRadius: 10,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFF' }}>
              {progress.attempts > 0 ? '🎮 Играть снова' : '▶️ Начать уровень'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (!isUnlocked) {
    return content;
  }

  return (
    <Link
      href={{
        pathname: '/game/run',
        params: {
          packId,
          levelId: level.id,
          level: levelStr,
          seed: `${packId}-${level.id}-${Date.now()}`,
          mode: 'normal',
          distractorMode: level.distractorMode,
        },
      }}
      asChild
    >
      <Pressable>{content}</Pressable>
    </Link>
  );
}
