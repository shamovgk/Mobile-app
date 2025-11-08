import { useQuery } from '@tanstack/react-query';
import { contentApi } from '../api/services/content.service';

export const usePacks = () => {
  return useQuery({
    queryKey: ['packs'],
    queryFn: () => contentApi.getPacks(),
  });
};

export const usePack = (packId: string | null) => {
  return useQuery({
    queryKey: ['pack', packId],
    queryFn: () => contentApi.getPack(packId!),
    enabled: !!packId,
  });
};

export const useLevel = (levelId: string | null) => {
  return useQuery({
    queryKey: ['level', levelId],
    queryFn: () => contentApi.getLevel(levelId!),
    enabled: !!levelId,
  });
};
