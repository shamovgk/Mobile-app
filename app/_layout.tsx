import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
        gestureEnabled: true, // по умолчанию жесты включены
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Словарный Раннер' }} />
      <Stack.Screen name="pack/[packId]" options={{ title: 'Пак слов' }} />
      <Stack.Screen
        name="run"
        options={{
          title: 'Игра',
          gestureEnabled: false,      // <<< запрещаем iOS свайп назад
          headerBackVisible: false,   // <<< скрываем стрелку «назад»
        }}
      />
      <Stack.Screen name="result" options={{ title: 'Результат' }} />
      <Stack.Screen name="dictionary" options={{ title: 'Словарь' }} />
      <Stack.Screen name="settings" options={{ title: 'Настройки' }} />
    </Stack>
  );
}
