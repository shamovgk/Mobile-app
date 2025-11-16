import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '@/theme';
import { Button } from '@/components/ui/Button/Button';

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button variant="ghost" onPress={() => navigation.goBack()}>
          ← Назад
        </Button>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>⚙️ Настройки</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Звук и уведомления</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Звуковые эффекты</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: colors.text.disabled, true: colors.success.main }}
              thumbColor={colors.background.paper}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push-уведомления</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.text.disabled, true: colors.success.main }}
              thumbColor={colors.background.paper}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          <Text style={styles.aboutText}>Word Rush v1.0.0</Text>
          <Text style={styles.aboutText}>© 2025 Word Rush Team</Text>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.background.default,
  },
  settingLabel: {
    fontFamily: typography.fontFamily.medium,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  aboutText: {
    fontFamily: typography.fontFamily.regular,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
});
