import { LevelCard, PackHeader } from '@/components/pack';
import { Container, Text } from '@/components/ui';
import { COLORS } from '@/constants/design-system';
import { usePackProgress } from '@/hooks/usePackProgress';
import { getPackById } from '@/lib/content';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PackScreen() {
  const { packId } = useLocalSearchParams<{ packId: string }>();
  const pack = getPackById(packId!)!;
  const insets = useSafeAreaInsets();
  
  const { levelProgressMap, packSummary, isUnlocked } = usePackProgress(pack);

  return (
    <>
      <Stack.Screen
        options={{
          title: pack.title,
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: COLORS.white,
          headerTitleAlign: 'center',
          headerRight: () => (
            <Link href={{ pathname: '/dictionary', params: { packId: pack.id } }} asChild>
              <Pressable style={{ padding: 8, marginRight: 4 }}>
                <Text style={{ fontSize: 22 }}>📖</Text>
              </Pressable>
            </Link>
          ),
        }}
      />

      <Container>
        <FlatList
          data={pack.levels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ 
            gap: 12,
            paddingBottom: insets.bottom + 16,
          }}
          ListHeaderComponent={
            <PackHeader
              pack={pack}
              masteredCount={packSummary.mastered}
              totalWords={packSummary.total}
              completedLevels={packSummary.completedLevels}
              totalLevels={packSummary.totalLevels}
            />
          }
          ListHeaderComponentStyle={{ marginBottom: 16 }}
          renderItem={({ item }) => (
            <LevelCard
              level={item}
              progress={levelProgressMap[item.id] || {
                levelId: item.id,
                stars: 0,
                bestScore: 0,
                bestAccuracy: 0,
                completed: false,
                attempts: 0,
              }}
              isUnlocked={isUnlocked(item.id)}
              packId={pack.id}
            />
          )}
        />
      </Container>
    </>
  );
}
