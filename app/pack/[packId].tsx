import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { packsMeta } from '@/data/packs';
import type { LevelConfig } from '@/lib/types';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

export default function PackDetailsScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const router = useRouter();
  const pack = packsMeta.find(p => p.id === packId) ?? packsMeta[0];

  const recommendedLevel: LevelConfig = {
    durationSec: 60,
    forkEverySec: 2.5,
    lanes: 2,
    allowedTypes: ['meaning'],
    lives: 3,
  };

  const levelStr = encodeURIComponent(JSON.stringify(recommendedLevel));

  return (
    <ThemedView style={{ flex: 1, gap: 16, padding: 16 }}>
      <ThemedText type="title">{pack.title}</ThemedText>
      <ThemedText>CEFR: {pack.cefr}</ThemedText>
      <ThemedText>Слов в паке: {pack.lexemeCount}</ThemedText>

      <View style={{
        padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', gap: 6,
      }}>
        <ThemedText type="defaultSemiBold">Рекомендуемые параметры</ThemedText>
        <ThemedText>Длительность: {recommendedLevel.durationSec}s</ThemedText>
        <ThemedText>Развилка каждые: {recommendedLevel.forkEverySec}s</ThemedText>
        <ThemedText>Дорожки: {recommendedLevel.lanes}</ThemedText>
        <ThemedText>Жизни: {recommendedLevel.lives}</ThemedText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({
            pathname: '/run',
            params: {
              packId: pack.id,
              level: levelStr,
              seed: `${pack.id}-seed-demo`,
              mode: 'normal',
            },
          })
        }
        style={{
          padding: 16, borderRadius: 12, backgroundColor: '#2f80ed', alignItems: 'center',
        }}
      >
        <ThemedText style={{ color: 'white' }}>Играть</ThemedText>
      </Pressable>

      <Link href="/dictionary" asChild>
        <Pressable
          style={{
            padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ccc', alignItems: 'center',
          }}
        >
          <ThemedText>Словарь пака</ThemedText>
        </Pressable>
      </Link>
    </ThemedView>
  );
}
