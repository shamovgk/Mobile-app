/**
 * Модуль загрузки контента
 */

import { packs as rawPacks } from '@/data/packs';
import type { Lexeme, LexemeData, Pack } from './types';

/**
 * Преобразует JSON лексему в полную лексему с дефолтными значениями
 */
function enrichLexeme(data: LexemeData): Lexeme {
  return {
    ...data,
    mastery: 0,
    recentMistakes: [],
  };
}

/**
 * Получает пак по ID с обогащёнными лексемами
 */
export function getPackById(id: string): Pack | undefined {
  const rawPack = rawPacks[id];
  if (!rawPack) return undefined;

  return {
    ...rawPack,
    lexemes: rawPack.lexemes.map(enrichLexeme),
  };
}

/**
 * Получает все паки
 */
export function getAllPacks(): Pack[] {
  return Object.values(rawPacks).map((rawPack: any) => ({
    ...rawPack,
    lexemes: rawPack.lexemes.map(enrichLexeme),
  }));
}
