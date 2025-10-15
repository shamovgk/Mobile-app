/**
 * Компонент анимации конфетти для празднования успехов
 * 
 * Используется при получении 3 звёзд или завершении пака
 */

import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiProps {
  count?: number;
  duration?: number;
}

interface ConfettiPiece {
  startX: number; // ← Изменено: сохраняем начальное значение
  x: Animated.Value;
  y: Animated.Value;
  rotation: Animated.Value;
  color: string;
  size: number;
}

const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];

export function Confetti({ count = 50, duration = 3000 }: ConfettiProps) {
  const confettiPieces = useRef<ConfettiPiece[]>([]);

  useEffect(() => {
    const startX = Array.from({ length: count }, () => Math.random() * SCREEN_WIDTH);

    confettiPieces.current = startX.map((sx) => ({
      startX: sx, // ← Сохраняем как число
      x: new Animated.Value(sx),
      y: new Animated.Value(-50),
      rotation: new Animated.Value(0),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
    }));

    // Запуск анимации
    Animated.parallel(
      confettiPieces.current.map((piece) => {
        const delay = Math.random() * 300;
        const fallDuration = duration - delay;

        return Animated.parallel([
          // Падение вниз
          Animated.timing(piece.y, {
            toValue: SCREEN_HEIGHT + 100,
            duration: fallDuration,
            delay,
            useNativeDriver: true,
          }),
          // Движение по горизонтали
          Animated.timing(piece.x, {
            toValue: piece.startX + (Math.random() - 0.5) * 200, // ← Исправлено
            duration: fallDuration,
            delay,
            useNativeDriver: true,
          }),
          // Вращение
          Animated.loop(
            Animated.timing(piece.rotation, {
              toValue: 360,
              duration: 1000 + Math.random() * 1000,
              useNativeDriver: true,
            })
          ),
        ]);
      })
    ).start();
  }, [count, duration]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {confettiPieces.current.map((piece, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: piece.size / 2,
            transform: [
              { translateX: piece.x },
              { translateY: piece.y },
              {
                rotate: piece.rotation.interpolate({
                  inputRange: [0, 360],
                  outputRange: ['0deg', '360deg'],
                }),
              },
            ],
          }}
        />
      ))}
    </View>
  );
}
