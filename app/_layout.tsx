import { Stack } from 'expo-router';
import 'react-native-gesture-handler'; // важно: ранний сайд-эффект
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
        <Stack.Screen name="index" options={{ title: 'Word Rush' }} />
        <Stack.Screen name="pack/[packId]" options={{ title: 'Пак слов' }} />
        <Stack.Screen
          name="run"
          options={{
            title: 'Игра',
            gestureEnabled: false,
            headerBackVisible: false,
          }}
        />
        <Stack.Screen name="result" options={{ title: 'Результат' }} />
        <Stack.Screen name="dictionary" options={{ title: 'Словарь' }} />
        <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
