import packBasic1 from '@/assets/content/pack-basic-1.json';
import packCore50 from '@/assets/content/pack-core-50.json';
import type { Pack, PackMeta } from './types';

const packs: Pack[] = [
  packBasic1 as unknown as Pack,
  packCore50 as unknown as Pack,
];

export function getPacks(): Pack[] {
  return packs;
}

export function getPackById(id: string): Pack | undefined {
  return packs.find(p => p.id === id);
}

export function getPacksMeta(): PackMeta[] {
  return packs.map(p => ({
    id: p.id,
    title: p.title,
    lang: p.lang,
    cefr: p.cefr,
    lexemeCount: p.lexemes.length,
  }));
}
