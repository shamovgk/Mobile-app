import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../lib/stores/auth.store';

export function useRefreshData() {
  const queryClient = useQueryClient();
  const { refreshUserProfile } = useAuthStore();

  const refreshAll = async () => {
    try {
      // Refresh profile
      await refreshUserProfile();
      
      // Invalidate all queries
      await queryClient.invalidateQueries();
      
      console.log('✅ All data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh data:', error);
    }
  };

  return { refreshAll };
}
