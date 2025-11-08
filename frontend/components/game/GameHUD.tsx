import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface GameHUDProps {
  score: number;
  lives: number;
  currentQuestion: number;
  totalQuestions: number;
  combo: number;
  onPause: () => void;
}

export function GameHUD({
  score,
  lives,
  currentQuestion,
  totalQuestions,
  combo,
  onPause,
}: GameHUDProps) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 8,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      marginBottom: 24,
    }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#2C3E50' }}>
        ❤️ {lives}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: '600', color: '#2C3E50' }}>
        {currentQuestion}/{totalQuestions}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: '600', color: '#2C3E50' }}>
        ⭐ {Math.floor(score)}
      </Text>

      {combo >= 3 && (
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#E74C3C' }}>
          🔥 x{combo}
        </Text>
      )}

      <Pressable
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
