// frontend/src/lib/hooks/useContentFetch.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contentApi } from '../lib/api/services/content.service';
import { logger } from '../lib/utils/logger';

export const usePacks = () => {
  return useQuery({
    queryKey: ['packs'],
    queryFn: async () => {
      try {
        logger.log('Fetching packs...');
        const result = await contentApi.getPacks();
        logger.log('Packs fetched:', result);
        return result;
      } catch (error) {
        logger.error('Error fetching packs:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const usePack = (packId: string | null) => {
  return useQuery({
    queryKey: ['pack', packId],
    queryFn: async () => {
      try {
        logger.log('Fetching pack:', packId);
        const result = await contentApi.getPack(packId!);
        logger.log('Pack fetched:', result);
        return result;
      } catch (error) {
        logger.error('Error fetching pack:', error);
        throw error;
      }
    },
    enabled: !!packId,
    staleTime: 1000 * 60 * 10,
  });
};

export const useLevel = (levelId: string | null) => {
  return useQuery({
    queryKey: ['level', levelId],
    queryFn: async () => {
      try {
        logger.log('Generating level:', levelId);
        const result = await contentApi.generateLevel(levelId!);
        logger.log('Level generated:', result);
        return result;
      } catch (error) {
        logger.error('Error generating level:', error);
        throw error;
      }
    },
    enabled: !!levelId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
};

export const usePrefetchNextLevel = () => {
  const queryClient = useQueryClient();

  return async (packId: string, currentLevelNumber: number) => {
    try {
      const pack = await queryClient.fetchQuery({
        queryKey: ['pack', packId],
        queryFn: () => contentApi.getPack(packId),
      });

      const nextLevel = pack.levels.find(
        (level: any) => level.levelNumber === currentLevelNumber + 1
      );

      if (nextLevel) {
        await queryClient.prefetchQuery({
          queryKey: ['level', nextLevel.id],
          queryFn: () => contentApi.generateLevel(nextLevel.id),
          staleTime: 1000 * 60 * 5,
        });
        logger.log(`Prefetched level ${nextLevel.levelNumber}`);
      }
    } catch (error) {
      logger.error('Failed to prefetch next level:', error);
    }
  };
};
