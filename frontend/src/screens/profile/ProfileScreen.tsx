import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { useAuthStore } from '@/lib/stores/auth.store';
import { ProfileHeader } from '@/components/profile/ProfileHeader/ProfileHeader';
import { StatsCard } from '@/components/profile/StatsCard/StatsCard';
import { Button } from '@/components/ui/Button/Button';
import type { RootStackParamList } from '@/navigation/types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Auth' }],
    });
  };

  const handleStatistics = () => {
    navigation.navigate('Statistics');
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader
          displayName={user?.displayName || 'Гость'}
          avatar={user?.avatar || null}
          level={user?.profile?.level || 1}
          xp={user?.profile?.totalXp || 0}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Статистика</Text>
          
          <View style={styles.statsGrid}>
            <StatsCard
              icon="🎯"
              label="Всего очков"
              value={user?.profile?.totalXp || 0}
            />
            <StatsCard
              icon="📚"
              label="Слов изучено"
              value={user?.profile?.wordsLearned || 0}
            />
            <StatsCard
              icon="⭐"
              label="Уровней пройдено"
              value={user?.profile?.levelsCompleted || 0}
            />
            <StatsCard
              icon="🔥"
              label="Серия дней"
              value={user?.profile?.streak || 0}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Настройки</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={handleStatistics}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={styles.menuText}>Подробная статистика</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleSettings}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={styles.menuText}>Настройки</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <Button
            variant="outline"
            size="large"
            onPress={handleLogout}
            fullWidth
          >
            Выйти
          </Button>
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
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.paper,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  menuIcon: {
    fontSize: typography.fontSize.xxl,
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  menuArrow: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
  },
  actions: {
    padding: spacing.lg,
  },
});
