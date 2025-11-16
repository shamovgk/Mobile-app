// frontend/src/screens/packs/PackDetailsScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '@/theme';
import { LevelCard } from '@/components/packs/LevelCard/LevelCard';
import { PackHeader } from '@/components/packs/PackHeader/PackHeader';
import { usePack } from '@/hooks/useContentFetch';
import { Button } from '@/components/ui/Button/Button';
import type { RootStackParamList } from '@/navigation/types';

type PackDetailsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PackDetails'>;
type PackDetailsScreenRouteProp = RouteProp<RootStackParamList, 'PackDetails'>;

export const PackDetailsScreen: React.FC = () => {
  const navigation = useNavigation<PackDetailsScreenNavigationProp>();
  const route = useRoute<PackDetailsScreenRouteProp>();
  const { packId } = route.params;
  const { data: pack, isLoading } = usePack(packId);

  const handleLevelPress = (levelId: string) => {
    navigation.navigate('LevelStart', { levelId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={handleBack}>
          ← Назад
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <PackHeader
          title={pack?.title || ''}
          description={pack?.description || ''}
          imageUrl={pack?.imageUrl}
          progress={(pack?.completedLevels / pack?.totalLevels) * 100}
          totalLevels={pack?.totalLevels || 0}
          completedLevels={pack?.completedLevels || 0}
        />

        <View style={styles.levelsContainer}>
          <Text style={styles.levelsTitle}>Уровни</Text>
          
          <View style={styles.levelsList}>
            {pack?.levels?.map((level: any, index: number) => {
              const previousLevel = index > 0 ? pack.levels[index - 1] : null;
              const isLocked = previousLevel && !previousLevel.isCompleted;
              
              return (
                <LevelCard
                  key={level.id}
                  levelNumber={level.levelNumber}
                  stars={level.stars || 0}
                  maxStars={3}
                  isLocked={isLocked}
                  isCompleted={level.isCompleted}
                  isCurrent={!level.isCompleted && !isLocked}
                  mode={level.mode}
                  onPress={() => handleLevelPress(level.id)}
                />
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xl,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  levelsContainer: {
    padding: spacing.lg,
  },
  levelsTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  levelsList: {
    alignItems: 'center',
  },
});
