import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/auth.store';

/**
 * Хук для обновления всех данных пользователя
 */
export function useRefreshData() {
  const queryClient = useQueryClient();
  const { refreshUserProfile } = useAuthStore();

  /**
   * Обновить все данные пользователя
   */
  const refreshAll = async () => {
    try {
      // 1. Обновить профиль пользователя (из auth.store)
      await refreshUserProfile();

      // 2. Инвалидировать все кэшированные queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['userProgress'] }),
        queryClient.invalidateQueries({ queryKey: ['dictionary'] }),
        queryClient.invalidateQueries({ queryKey: ['packs'] }),
        queryClient.invalidateQueries({ queryKey: ['achievements'] }),
      ]);

      console.log('✅ All data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
      throw error;
    }
  };

  /**
   * Обновить только прогресс пользователя
   */
  const refreshProgress = async () => {
    await queryClient.invalidateQueries({ queryKey: ['userProgress'] });
  };

  /**
   * Обновить только словарь
   */
  const refreshDictionary = async () => {
    await queryClient.invalidateQueries({ queryKey: ['dictionary'] });
  };

  /**
   * Обновить только достижения
   */
  const refreshAchievements = async () => {
    await queryClient.invalidateQueries({ queryKey: ['achievements'] });
  };

  return {
    refreshAll,
    refreshProgress,
    refreshDictionary,
    refreshAchievements,
  };
}
