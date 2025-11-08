import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ActivityIndicator, View } from 'react-native';

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isLoading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(main)');
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="(auth)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(main)" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryProvider>
      <RootLayoutContent />
    </QueryProvider>
  );
}
