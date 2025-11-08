// app/(main)/_layout.tsx
import { Stack } from 'expo-router';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Word Rush' }} 
      />
      <Stack.Screen 
        name="pack/[packId]" 
        options={{ title: 'Уровни' }} 
      />
      <Stack.Screen 
        name="game/[levelId]" 
        options={{ title: 'Игра' }} 
      />
      <Stack.Screen 
        name="result" 
        options={{ title: 'Результаты' }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ title: 'Профиль' }} 
      />
    </Stack>
  );
}
