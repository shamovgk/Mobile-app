/**
 * Отображение звёзд и их значения
 */

import { Text, View } from 'react-native';

interface StarsDisplayProps {
  stars: 0 | 1 | 2 | 3;
  nextLevelUnlocked?: boolean;
  nextLevelTitle?: string;
  gameMode: 'lives' | 'time';
}

export function StarsDisplay({ stars, nextLevelUnlocked, nextLevelTitle, gameMode }: StarsDisplayProps) {
  // Разные сообщения для разных режимов
  const getSuccessMessage = () => {
    if (gameMode === 'lives') {
      if (stars === 3) return '🎉 Идеально! Прошли без потерь!';
      if (stars === 2) return '✨ Отлично! Потеряли только 1 жизнь!';
      if (stars === 1) return '💪 Хорошо! Можно лучше!';
      return '😔 Потеряли все жизни. Попробуйте ещё раз!';
    } else {
      if (stars === 3) return '🎉 Идеально! 100% точность!';
      if (stars === 2) return '✨ Отлично! Более 85% точности!';
      if (stars === 1) return '💪 Хорошо! Более 70% точности!';
      return '😔 Менее 70% точности. Попробуйте ещё раз!';
    }
  };

  const getHintMessage = () => {
    if (gameMode === 'lives') {
      if (stars === 2) return 'Попробуйте не делать ошибок для 3 звёзд!';
      if (stars === 1) return 'Старайтесь делать меньше ошибок!';
      if (stars === 0) return 'Не забывайте, что у вас ограниченное количество жизней!';
    } else {
      if (stars === 2) return 'Стремитесь к 100% для 3 звёзд!';
      if (stars === 1) return 'Улучшайте точность для большего количества звёзд!';
      if (stars === 0) return 'Помните - ошибки замораживают вас!';
    }
    return '';
  };

  return (
    <View
      style={{
        padding: 20,
        borderRadius: 12,
        backgroundColor: stars === 3 ? '#fffbea' : stars >= 1 ? '#f0f8ff' : '#fff',
        borderWidth: 2,
        borderColor: stars === 3 ? '#FFD700' : stars === 2 ? '#C0C0C0' : stars === 1 ? '#CD7F32' : '#ddd',
        gap: 12,
      }}
    >
      {/* Звёзды */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
        {Array.from({ length: 3 }, (_, i) => (
          <Text key={i} style={{ fontSize: 48, color: i < stars ? '#FFD700' : '#ddd' }}>
            ★
          </Text>
        ))}
      </View>

      {/* Основное сообщение */}
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#000' }}>
          {getSuccessMessage()}
        </Text>
        
        {getHintMessage() && (
          <Text style={{ fontSize: 13, textAlign: 'center', color: '#666' }}>
            {getHintMessage()}
          </Text>
        )}
      </View>

      {/* Уведомление о разблокировке */}
      {nextLevelUnlocked && nextLevelTitle && (
        <View
          style={{
            padding: 12,
            borderRadius: 8,
            backgroundColor: '#e8f5e9',
            borderWidth: 1,
            borderColor: '#4caf50',
            marginTop: 8,
          }}
        >
          <Text style={{ fontWeight: '600', textAlign: 'center', color: '#2e7d32' }}>
            🎉 Следующий уровень разблокирован!
          </Text>
          <Text style={{ fontSize: 12, marginTop: 4, textAlign: 'center', color: '#2e7d32' }}>
            {nextLevelTitle}
          </Text>
        </View>
      )}
    </View>
  );
}
