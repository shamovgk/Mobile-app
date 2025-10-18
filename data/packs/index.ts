/**
 * Экспорт метаданных и паков
 */

import type { PackMeta } from '@/lib/types';
import packEnv1 from './pack-env-1.json';
import packFood1 from './pack-food-1.json';
import packTech1 from './pack-tech-1.json';

// Экспорт метаданных для списка паков
export const packsMeta: PackMeta[] = [
  {
    id: 'pack-food-1',
    title: 'Еда - базовый уровень',
    lang: 'en',
    cefr: 'A1',
    lexemeCount: 14,
    category: 'food',
    levelsCount: 8,
  },
  {
    id: 'pack-tech-1',
    title: 'Технологии - базовый уровень',
    lang: 'en',
    cefr: 'A2',
    lexemeCount: 17,
    category: 'technology',
    levelsCount: 5,
  },
  {
    id: 'pack-env-1',
    title: 'Окружающая среда - базовый уровень',
    lang: 'en',
    cefr: 'B1',
    lexemeCount: 20,
    category: 'environment',
    levelsCount: 4,
  },
];

// Экспорт полных паков (БЕЗ приведения типа)
export const packs: Record<string, any> = {
  'pack-food-1': packFood1,
  'pack-tech-1': packTech1,
  'pack-env-1': packEnv1,
};
