/**
 * Корневой компонент навигации
 * 
 * Настраивает стек навигации для всего приложения
 * с поддержкой жестов для улучшения UX
 */

import { Stack } from 'expo-router';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerTitleAlign: 'center',
          gestureEnabled: true,
        }}
      >
        {/* Главный экран со списком паков */}
        <Stack.Screen name="index" options={{ title: 'Word Rush' }} />
        
        {/* Детали пака — информация и старт игры */}
        <Stack.Screen name="pack/[packId]" options={{ title: 'Пак слов' }} />
        
        {/* Игровой экран — жесты отключены во время игры */}
        <Stack.Screen
          name="run"
          options={{
            title: 'Игра',
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
        
        {/* Экран результатов с итогами сессии */}
        <Stack.Screen name="result" options={{ title: 'Результат' }} />
        
        {/* Словарь для повторения слов */}
        <Stack.Screen name="dictionary" options={{ title: 'Словарь' }} />
        
        {/* Настройки приложения */}
        <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
