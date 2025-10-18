/**
 * Кнопки действий после завершения уровня
 */

import { Pressable, Text, View } from 'react-native';

interface ActionButtonsProps {
  onNextLevel?: () => void;
  onRetryErrors?: () => void;
  onRetryLevel: () => void;
  onBackToPack: () => void;
  nextLevelAvailable: boolean;
  errorsCount: number;
}

export function ActionButtons({
  onNextLevel,
  onRetryErrors,
  onRetryLevel,
  onBackToPack,
  nextLevelAvailable,
  errorsCount,
}: ActionButtonsProps) {
  return (
    <View style={{ gap: 10, marginTop: 8 }}>
      {/* Следующий уровень */}
      {nextLevelAvailable && onNextLevel && (
        <Pressable
          accessibilityRole="button"
          onPress={onNextLevel}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#4caf50',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 20 }}>▶️</Text>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
            Следующий уровень
          </Text>
        </Pressable>
      )}

      {/* Повторить ошибки */}
      {errorsCount > 0 && onRetryErrors && (
        <Pressable
          accessibilityRole="button"
          onPress={onRetryErrors}
          style={{
            padding: 16,
            borderRadius: 12,
            backgroundColor: '#ff9800',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            🔁 Повторить ошибки ({errorsCount})
          </Text>
        </Pressable>
      )}

      {/* Повторить уровень */}
      <Pressable
        accessibilityRole="button"
        onPress={onRetryLevel}
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#2196f3',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
          🔄 Повторить уровень
        </Text>
      </Pressable>

      {/* Назад к уровням */}
      <Pressable
        accessibilityRole="button"
        onPress={onBackToPack}
        style={{
          padding: 16,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: '#2196f3',
          backgroundColor: '#fff',
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 16, color: '#2196f3', fontWeight: '600' }}>
          ← Назад к уровням
        </Text>
      </Pressable>
    </View>
  );
}
