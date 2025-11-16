// frontend/src/screens/home/HomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing } from '@/theme';
import { PackCard } from '@/components/packs/PackCard/PackCard';
import { ProfileHeader } from '@/components/profile/ProfileHeader/ProfileHeader';
import { StreakDisplay } from '@/components/profile/StreakDisplay/StreakDisplay';
import { usePacks } from '@/hooks/useContentFetch';
import { useAuthStore } from '@/lib/stores/auth.store';
import type { RootStackParamList } from '@/navigation/types';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { data: packs, isLoading, refetch } = usePacks();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handlePackPress = (packId: string) => {
    navigation.navigate('PackDetails', { packId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <ProfileHeader
          displayName={user?.displayName || 'Гость'}
          avatar={user?.avatar || null}
          level={user?.profile?.level || 1}
          xp={user?.profile?.totalXp || 0}
        />

        <StreakDisplay
          streak={user?.profile?.streak || 0}
          lastPlayedAt={user?.profile?.lastPlayedAt || null}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Выберите пак</Text>
          
          {isLoading ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Загрузка...</Text>
            </View>
          ) : (
            packs?.map((pack: any) => (
              <PackCard
                key={pack.id}
                id={pack.id}
                title={pack.title}
                description={pack.description}
                imageUrl={pack.imageUrl}
                progress={(pack.completedLevels / pack.totalLevels) * 100}
                totalLevels={pack.totalLevels}
                completedLevels={pack.completedLevels}
                isLocked={pack.isLocked}
                onPress={() => handlePackPress(pack.id)}
              />
            ))
          )}
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
  content: {
    paddingBottom: spacing.xl,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loading: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
});
