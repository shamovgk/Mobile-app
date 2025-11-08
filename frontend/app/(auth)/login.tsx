import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, loginAsGuest } = useAuthStore();

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Поля формы
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  // Обработчик входа
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/'); // Переход на главный экран
    } catch (error: any) {
      Alert.alert('Ошибка входа', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик регистрации
  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть не менее 6 символов');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, displayName);
      router.replace('/'); // Переход на главный экран
    } catch (error: any) {
      Alert.alert('Ошибка регистрации', error.response?.data?.message || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик гостевого входа
  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      await loginAsGuest();
      router.replace('/'); // Переход на главный экран
    } catch (error: any) {
      Alert.alert('Ошибка', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Заголовок */}
        <Text style={styles.title}>Word Rush</Text>
        <Text style={styles.subtitle}>
          {isRegisterMode ? 'Создайте аккаунт' : 'Войдите в аккаунт'}
        </Text>

        {/* Форма */}
        <View style={styles.form}>
          {/* Имя (только при регистрации) */}
          {isRegisterMode && (
            <TextInput
              style={styles.input}
              placeholder="Имя"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          )}

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Пароль */}
          <TextInput
            style={styles.input}
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          {/* Кнопка входа/регистрации */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={isRegisterMode ? handleRegister : handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Переключатель режима */}
          <TouchableOpacity
            onPress={() => setIsRegisterMode(!isRegisterMode)}
            disabled={isLoading}
          >
            <Text style={styles.switchText}>
              {isRegisterMode
                ? 'Уже есть аккаунт? Войти'
                : 'Нет аккаунта? Зарегистрироваться'}
            </Text>
          </TouchableOpacity>

          {/* Разделитель */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Кнопка гостевого входа */}
          <TouchableOpacity
            style={[styles.button, styles.guestButton]}
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#4A90E2" />
            ) : (
              <Text style={styles.guestButtonText}>Войти как гость</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7F8C8D',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
  },
  guestButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    color: '#4A90E2',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#7F8C8D',
    fontSize: 14,
  },
});
