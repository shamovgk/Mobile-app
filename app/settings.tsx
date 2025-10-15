/**
 * Экран настроек с контрастными цветами
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';

const SETTINGS_SOUND_KEY = 'settings:sound';
const SETTINGS_HAPTICS_KEY = 'settings:haptics';

export default function SettingsScreen() {
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(true);

  useEffect(() => {
    (async () => {
      const savedSound = await AsyncStorage.getItem(SETTINGS_SOUND_KEY);
      const savedHaptics = await AsyncStorage.getItem(SETTINGS_HAPTICS_KEY);

      if (savedSound !== null) setSound(savedSound === 'true');
      if (savedHaptics !== null) setHaptics(savedHaptics === 'true');
    })();
  }, []);

  const toggleSound = async (value: boolean) => {
    setSound(value);
    await AsyncStorage.setItem(SETTINGS_SOUND_KEY, String(value));
  };

  const toggleHaptics = async (value: boolean) => {
    setHaptics(value);
    await AsyncStorage.setItem(SETTINGS_HAPTICS_KEY, String(value));
  };

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ThemedText type="title">Настройки</ThemedText>

      {/* Описание */}
      <View
        style={{
          padding: 12,
          borderRadius: 12,
          backgroundColor: '#e3f2fd',
          borderWidth: 1,
          borderColor: '#2196f3',
        }}
      >
        <Text style={{ fontSize: 14, color: '#1565c0' }}>
          ℹ️ Управляйте звуковыми эффектами и вибрацией во время игры
        </Text>
      </View>

      {/* Настройки */}
      <View
        style={{
          padding: 16,
          borderRadius: 12,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ddd',
          gap: 16,
        }}
      >
        {/* Звук */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Звуковые эффекты</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Звуки при правильных и неправильных ответах
            </Text>
          </View>
          <Switch value={sound} onValueChange={toggleSound} />
        </View>

        {/* Разделитель */}
        <View style={{ height: 1, backgroundColor: '#e0e0e0' }} />

        {/* Вибрация */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Тактильная обратная связь</Text>
            <Text style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
              Вибрация при взаимодействии с игрой
            </Text>
          </View>
          <Switch value={haptics} onValueChange={toggleHaptics} />
        </View>
      </View>

      {/* Информация о версии */}
      <View style={{ marginTop: 'auto', alignItems: 'center', paddingVertical: 16 }}>
        <Text style={{ fontSize: 12, color: '#666' }}>Word Rush v1.0.0</Text>
        <Text style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
          Настройки сохраняются автоматически
        </Text>
      </View>
    </ThemedView>
  );
}
