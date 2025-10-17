import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: true,
      }}
    >
      {/* Главная - без header */}
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Настройки - модальное окно */}
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'Настройки',
          presentation: 'modal',
          headerBackTitle: 'Закрыть',
        }} 
      />
      
      {/* Пак с уровнями */}
      <Stack.Screen 
        name="pack/[packId]" 
        options={{ 
          title: 'Уровни',
          headerBackTitle: 'Главная',
          animation: 'slide_from_right',
        }} 
      />
      
      {/* Словарь */}
      <Stack.Screen 
        name="dictionary" 
        options={{ 
          title: 'Словарь',
          headerBackTitle: 'Назад',
          animation: 'slide_from_right',
        }} 
      />
      
      {/* Игра - без header, без жестов */}
      <Stack.Screen 
        name="run" 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
          animation: 'fade',
        }} 
      />
      
      {/* Результаты - без кнопки назад, без жестов */}
      <Stack.Screen 
        name="result" 
        options={{ 
          title: 'Результаты',
          headerBackVisible: false,
          gestureEnabled: false,
          headerLeft: () => null,
          animation: 'slide_from_bottom',
        }} 
      />
    </Stack>
  );
}
