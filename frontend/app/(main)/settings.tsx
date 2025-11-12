import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Назад</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Настройки</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Аккаунт</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Имя пользователя</Text>
            <Text style={styles.infoValue}>{user?.displayName || 'Гость'}</Text>
          </View>

          {user?.email && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email}</Text>
            </View>
          )}

          {user?.isGuest && (
            <View style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ Вы вошли как гость. Ваш прогресс не сохраняется.
              </Text>
              <TouchableOpacity style={styles.linkButton}>
                <Text style={styles.linkButtonText}>Создать аккаунт</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Game Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Игра</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Звуки</Text>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={soundEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Вибрация</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={vibrationEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Уведомления</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E0E0E0', true: '#4A90E2' }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>О приложении</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Версия приложения</Text>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Политика конфиденциальности</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>Условия использования</Text>
            <Text style={styles.menuItemArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    paddingVertical: 8,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#2C3E50',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  menuItemValue: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  menuItemArrow: {
    fontSize: 18,
    color: '#7F8C8D',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
