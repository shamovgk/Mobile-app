import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './navigation/RootNavigator';
import { colors } from './theme';
import { useAuthStore } from './lib/stores/auth.store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

export default function App() {
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    // Restore auth state from storage
    const loadAuthState = async () => {
      try {
        const userStr = await AsyncStorage.getItem('user');
        const accessToken = await AsyncStorage.getItem('accessToken');
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (userStr && accessToken && refreshToken) {
          const user = JSON.parse(userStr);
          setAuth(user, accessToken, refreshToken);
        }
      } catch (error) {
        console.error('Failed to load auth state:', error);
        logout();
      }
    };

    loadAuthState();
  }, []);

  // Persist auth state to storage
  useEffect(() => {
    const subscription = useAuthStore.subscribe(
      (state) => {
        const authData = {
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
        };

        // Persist to AsyncStorage
        (async () => {
          try {
            if (authData.user && authData.accessToken && authData.refreshToken) {
              await AsyncStorage.setItem('user', JSON.stringify(authData.user));
              await AsyncStorage.setItem('accessToken', authData.accessToken);
              await AsyncStorage.setItem('refreshToken', authData.refreshToken);
            } else {
              await AsyncStorage.multiRemove(['user', 'accessToken', 'refreshToken']);
            }
          } catch (error) {
            console.error('Failed to persist auth state:', error);
          }
        })();
      }
    );

    return () => subscription();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={colors.primary.main}
          />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
