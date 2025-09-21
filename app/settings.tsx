import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState } from 'react';
import { Switch, View } from 'react-native';

export default function SettingsScreen() {
  const [sound, setSound] = useState(true);
  const [haptics, setHaptics] = useState(false);

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ThemedText type="title">Настройки</ThemedText>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText>Звук</ThemedText>
        <Switch value={sound} onValueChange={setSound} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <ThemedText>Вибро</ThemedText>
        <Switch value={haptics} onValueChange={setHaptics} />
      </View>

      <ThemedText>Изменения применяются к будущим сессиям.</ThemedText>
    </ThemedView>
  );
}
