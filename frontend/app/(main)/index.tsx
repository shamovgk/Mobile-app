import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { contentApi } from '@/lib/api/services/content.service';
import { useAuthStore } from '@/lib/stores/auth.store';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const { data: packs, isLoading, error } = useQuery({
    queryKey: ['packs'],
    queryFn: contentApi.getPacks,
  });

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error || !packs) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Ошибка загрузки</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Profile & Settings */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Word Rush</Text>
          
          <View style={styles.headerIcons}>
            {/* Settings Icon */}
            <TouchableOpacity 
              onPress={() => router.push('/(main)/settings')}
              style={styles.iconButton}
            >
              <Text style={styles.iconText}>⚙️</Text>
            </TouchableOpacity>

            {/* Profile Icon */}
            <TouchableOpacity 
              onPress={() => router.push('/(main)/profile')}
              style={styles.iconButton}
            >
              <View style={styles.profileIcon}>
                <Text style={styles.profileIconText}>
                  {user?.displayName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Dictionary Button */}
        <TouchableOpacity 
          onPress={() => router.push('/(main)/dictionary')} 
          style={styles.dictionaryButton}
        >
          <Text style={styles.dictionaryButtonText}>📖 Словарь</Text>
        </TouchableOpacity>
      </View>

      {/* Pack List */}
      <FlatList
        data={packs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.packCard}
            onPress={() => router.push(`/(main)/pack/${item.id}`)}
          >
            <View style={styles.packIcon}>
              <Text style={styles.packIconText}>{item.icon || '📚'}</Text>
            </View>
            
            <View style={styles.packInfo}>
              <Text style={styles.packTitle}>{item.title}</Text>
              <Text style={styles.packDescription}>{item.description}</Text>
              <Text style={styles.packMeta}>
                {item.levelsCount} уровней • {item.difficulty}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dictionaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  dictionaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  packCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  packIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  packIconText: {
    fontSize: 32,
  },
  packInfo: {
    flex: 1,
  },
  packTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  packDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  packMeta: {
    fontSize: 12,
    color: '#95A5A6',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
});
