/**
 * Модуль для работы с контентом (пакеты слов)
 */

import packEnv1 from '@/assets/content/pack-env-1.json';
import packFood1 from '@/assets/content/pack-food-1.json';
import packTech1 from '@/assets/content/pack-tech-1.json';
import type { Pack, PackMeta } from './types';

const packs: Pack[] = [
  packFood1 as unknown as Pack,
  packTech1 as unknown as Pack,
  packEnv1 as unknown as Pack,
];

export function getPacks(): Pack[] {
  return packs;
}

export function getPackById(id: string): Pack | undefined {
  return packs.find((p) => p.id === id);
}

export function getPacksMeta(): PackMeta[] {
  return packs.map((p) => ({
    id: p.id,
    title: p.title,
    lang: p.lang,
    cefr: p.cefr,
    lexemeCount: p.lexemes.length,
    category: p.category,
    levelsCount: p.levels.length, // Добавлено
  }));
}

export function getPacksByCategory(category: string): Pack[] {
  return packs.filter((pack) => pack.category === category);
}
