// frontend/src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/lib/stores/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { GameScreen } from '@/screens/game/GameScreen';
import { LevelStartScreen } from '@/screens/game/LevelStartScreen';
import { ResultScreen } from '@/screens/game/ResultScreen';
import { PackDetailsScreen } from '@/screens/packs/PackDetailsScreen';
import { StatisticsScreen } from '@/screens/profile/StatisticsScreen';
import { SettingsScreen } from '@/screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Auth" component={AuthNavigator} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen 
            name="PackDetails" 
            component={PackDetailsScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen 
            name="LevelStart" 
            component={LevelStartScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen 
            name="Game" 
            component={GameScreen}
            options={{ 
              animation: 'fade',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Result" 
            component={ResultScreen}
            options={{ 
              animation: 'slide_from_bottom',
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="Statistics" 
            component={StatisticsScreen}
          />
          <Stack.Screen 
            name="Settings" 
            component={SettingsScreen}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};
