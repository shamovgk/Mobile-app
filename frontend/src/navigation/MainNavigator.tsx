// frontend/src/navigation/MainNavigator.tsx
import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { LeaderboardScreen } from '@/screens/leaderboard/LeaderboardScreen';
import { DictionaryScreen } from '@/screens/dictionary/DictionaryScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { colors } from '@/theme';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: colors.background.paper,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.accent.main,
        tabBarInactiveTintColor: colors.text.secondary,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          tabBarLabel: 'Главная',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>
        }} 
      />
      <Tab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen} 
        options={{ 
          tabBarLabel: 'Рейтинг',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏆</Text>
        }} 
      />
      <Tab.Screen 
        name="Dictionary" 
        component={DictionaryScreen} 
        options={{ 
          tabBarLabel: 'Словарь',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📚</Text>
        }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          tabBarLabel: 'Профиль',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>
        }} 
      />
    </Tab.Navigator>
  );
};
