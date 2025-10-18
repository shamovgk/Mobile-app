/**
 * HUD игровой сессии (очки, жизни, таймер, пауза)
 */

import { Pressable, Text, View } from 'react-native';

interface GameHudProps {
  score: number;
  lives: number;
  timeLeft: number | null;
  onPause: () => void;
  gameMode: 'lives' | 'time';
}

export function GameHud({ score, lives, timeLeft, onPause, gameMode }: GameHudProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
        Очки: {score}
      </Text>
      
      {gameMode === 'lives' && (
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
          ❤️ {lives}
        </Text>
      )}
      
      {gameMode === 'time' && timeLeft !== null && (
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
          ⏱️ {timeLeft}s
        </Text>
      )}
      
      <Pressable
        accessibilityRole="button"
        onPress={onPause}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: '#333',
        }}
      >
        <Text style={{ fontSize: 18, color: '#fff' }}>⏸</Text>
      </Pressable>
    </View>
  );
}
