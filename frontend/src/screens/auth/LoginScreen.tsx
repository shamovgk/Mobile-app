import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { authApi } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/lib/stores/auth.store';
import { Toast } from '@/components/ui/Toast/Toast';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setAuth } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

const handleLogin = async () => {
  if (!email || !password) {
    setError('Заполните все поля');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    const response = await authApi.login({ email, password });
    setAuth(response.user, response.accessToken, response.refreshToken);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Ошибка входа');
  } finally {
    setIsLoading(false);
  }
};

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.loginAsGuest();
      setAuth(response.user, response.accessToken, response.refreshToken);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register' as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logo}>⚡</Text>
            <Text style={styles.title}>Word Rush</Text>
            <Text style={styles.subtitle}>Учи слова играючи</Text>
          </View>

          <View style={styles.form}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              placeholder="Пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {error && (
              <Text style={styles.error}>{error}</Text>
            )}

            <Button
              variant="primary"
              size="large"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
            >
              Войти
            </Button>

            <Button
              variant="outline"
              size="large"
              onPress={handleRegister}
              disabled={isLoading}
              fullWidth
            >
              Зарегистрироваться
            </Button>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>или</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              variant="ghost"
              size="large"
              onPress={handleGuestLogin}
              disabled={isLoading}
              fullWidth
            >
              Войти как гость
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary.main,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxxl,
    color: colors.accent.main,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.inverse,
    opacity: 0.8,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.error.light,
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary.light,
  },
  dividerText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.sm,
    color: colors.text.inverse,
    opacity: 0.6,
    marginHorizontal: spacing.md,
  },
});
