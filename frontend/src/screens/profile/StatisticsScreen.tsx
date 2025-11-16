import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from '@/components/ui/Button/Button';
import { useAuthStore } from '@/lib/stores/auth.store';

export const StatisticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={() => navigation.goBack()}>
          ← Назад
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>📊 Статистика</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Общая статистика</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Всего очков</Text>
            <Text style={styles.statValue}>{user?.profile?.totalXp || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Уровень</Text>
            <Text style={styles.statValue}>{user?.profile?.level || 1}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Серия дней</Text>
            <Text style={styles.statValue}>{user?.profile?.streak || 0} 🔥</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Слов изучено</Text>
            <Text style={styles.statValue}>{user?.profile?.wordsLearned || 0}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Уровней пройдено</Text>
            <Text style={styles.statValue}>{user?.profile?.levelsCompleted || 0}</Text>
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
    padding: spacing.lg,
  },
  title: {
    fontFamily: typography.fontFamily.black,
    fontSize: typography.fontSize.xxxl,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  section: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.default,
  },
  statLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  statValue: {
    fontFamily: typography.fontFamily.bold,
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
});
